#include <TimerOne.h>
#include <ArduinoJson.h>
#include "logger.h"
#include "control.h"

const String t1 = "{\"timestamp\":";
const String t2 = ", \"ball_height\":";
const String t3 = ", \"fan_control\":";
const String t4 = "}"; 

void sendData(const struct Measurement& point) {
    char height_d[16], voltage_d[16];
    dtostrf(point.height, 5, 2, height_d);
    dtostrf(point.fan, 5, 2, voltage_d);
    Serial.print(t1 + point.timestamp);
    Serial.print(t2 + height_d);
    Serial.print(t3 + voltage_d);
    Serial.println(t4);
}

void Logger::put(const Measurement *point) {
  noInterrupts();
    buffer[buffer_write] = *point;
    buffer_write = (buffer_write + 1) % buffer_size;
  interrupts();
}

bool Logger::get(Measurement& point) {
  noInterrupts();
    bool empty = (buffer_read == buffer_write);
    if(!empty) {
      point = buffer[buffer_read];
      buffer_read = (buffer_read + 1) % buffer_size;
    }
  interrupts();
  return !empty;
}

void Logger::log(unsigned long timestamp, double height, double voltage) {
  Measurement point;
  point.timestamp = timestamp;
  point.height = height;
  point.fan = voltage;
  put(&point);
}

// -- Buffer --
void Buffer::put(double value) {
  noInterrupts();
  buffer[write] = value;
  int next = (write + 1) % size;
  if(write == read) {
    read = next; 
  }
  write = next;
  interrupts();
}

double Buffer::remove() {
  double value = 0;
  noInterrupts();
  value = buffer[read];
  int next = (read + 1) % size;
  if(next != write) {
    read = next;
  }
  interrupts();
  return value;
}

// -- Controller --
void Controller::setpoint(double sp) {
  this->sp = sp;
}

/*// -- PID Controller --*/
/*double PID::update(double y) {*/
/*  double e = sp - y;*/
/*  // PID*/
/*  double P = kp*e;*/
/*  I_prev = I;*/
/*  I += (ki*e)/(period/1000.0);*/
/*  double D = kd*(e - e_prev)/(period/1000.0);*/
/*  double v = u0 + P + I + D;*/
/*  // Conditional integration*/
/*  double u = sat(v, 0.0, 1.0);*/
/*  if((u - v) * e < 0.0) {*/
/*    I = I_prev;*/
/*  }*/
/*  e_prev = e;*/
/*  return u;*/
/*}*/

void PID::setKp(double kp) {
  this->kp = kp;
}

void PID::setKi(double ki) {
  this->ki = ki;
}

void PID::setKd(double kd) {
  this->kd = kd;
}

// -- Component --
void Component::setPin(int pin) {
  this->pin = pin;
}

// -- Sensor --
double Sensor::read() {
  int sensorReading = analogRead(pin);
  double voltage = sensorReading * 5.0 / 1024.0;
  return voltage;
}

void Sensor::update() {
  points ++;
  int sensorReading = analogRead(pin);
  double voltage = sensorReading * 5.0 / 1024.0;
  if(!isnan(voltage)) {
    y_last = voltage;
    y_cum += y_last;
  }
}

double Sensor::mean() {
  if(points == 0) {
    return 0.0;
  }
  double value = y_cum / points;
  y_cum = 0;
  points = 0;
  return value;
}

double Sensor::lookup(double voltage) {
  static const double c = 1.0;
  static const double v[] = {c*2.3, c*1.65, c*1.58, c*1.47, c*1.27, c*1.08, c*1.0, c*0.95};
  static const double v_min = c*v[7], v_max = c*v[0];
  double v_sat = sat(voltage, v_min, v_max);
  int i = 0;
  while(v_sat < v[i] && i<7) {
    i++;
  };
  if(i == 0) {
    return 0;
  } 
  double offset = (v_sat - v[i-1])/ (v[i] - v[i-1]);
  return 5*(i-1 + offset);
}

// -- Actuator --
double Actuator::write(double value) {
  double u = sat(value, min, max);
  analogWrite(pin, 255*u);
  return u;
}

void Actuator::setRange(double min, double max) {
  if(max < min) {
    return;
  }
  this->setMin(min);
  this->setMax(max);
}

void Actuator::setMin(double min) {
  if(min > this->max) {
    return;
  }
  this->min = (min >= 0) && (min <= 1) ? min : this->min;
}

void Actuator::setMax(double max) {
  if(max < this->min) {
    return;
  }
  this->max = (max >= 0) && (max <= 1) ? max : this->max;
}

// -- Main --
// Sensor
const int pirPin = A0;
const uint16_t period = 10000;
uint8_t oversampling = 100000 / period;
uint8_t iter = 0;
Sensor sensor;
// Fan
const int fanPin = 3;
Actuator fan;
// Serial
String inputString = "";
boolean stringComplete = false;
// Data log
Logger logger;
// Control
const uint8_t AUTO = 0;
const uint8_t MANUAL = 1;
uint8_t mode = AUTO;
PID pid;
Buffer buffer;

// Control Loop
void tic() {
  sensor.update();
  if((++iter) == oversampling) {
    iter = 0;
    double u = 0;
    double y_mean = sensor.mean();
    if(mode == AUTO) {
      u = pid.update(sensor.lookup(y_mean));//y_mean);
    } else if(mode == MANUAL) {
      u = buffer.remove();
    }
    double actual_u = fan.write(u);
    logger.log(millis(), sensor.lookup(y_mean), actual_u);
  }
}

void setup() {
  pinMode(fanPin, OUTPUT);
  Serial.begin(9600);

  inputString.reserve(200);
  sensor.setPin(pirPin);
  fan.setPin(fanPin);
  fan.setRange(0.5, 1.0);
  pid.setpoint(25);

  Timer1.initialize(period);
  Timer1.attachInterrupt(tic);
}

int angle2duty(double angle) {
  return 30 + (angle / 180) * 90;
}

void loop() {
  Measurement point;
  if(logger.get(point)) {
    sendData(point);
  }

  if(stringComplete) {
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(inputString);
    if(root.containsKey("servo")) {
      int duty = (int)root["servo"];
      Timer1.pwm(9, angle2duty(duty));
    }
    if(root.containsKey("mode")) {
      if(strcmp(root["mode"], "manual") == 0) {
        mode = MANUAL;
      }
      if(strcmp(root["mode"], "auto") == 0) {
        mode = AUTO;        
      } 
    }
    if(root.containsKey("setpoint")) {
      pid.setpoint((double)root["setpoint"]);
    }
    if(root.containsKey("kp")) {
      pid.setKp((double)root["kp"] / 100.0);
    }
    if(root.containsKey("ki")) {
      pid.setKi((double)root["ki"] / 100.0);
    }
    if(root.containsKey("kd")) {
      pid.setKd((double)root["kd"] / 100.0);
    }
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read(); 
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    } 
  }
}