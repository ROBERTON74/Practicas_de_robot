#pragma once

double sat(double value, double min, double max) {
  if(value < min) {
    return min;
  }

  if(value > max) {
    return max;
  }
  return value;
}

class Buffer {
  private:
    static const int size = 5;
    double buffer[size];
    int read = size - 1;
    int write = 0;

  public:
    void put(double value);
    double remove();
};

class Controller {
  protected:
    double sp = 0.0;

  public:
    virtual double update(double y);
    void setpoint(double sp);
};

class PID : public Controller {
  private:
    double period = 100.0;
    double c = 1.0/100.0;
    double kp = 0.6 * c;
    double ki = 0.002 * c;
    double kd = 0.5* c;
    double u0 = 0.75;
    double e_prev = 0.0;
    double I = 0.0;
    double I_prev = 0.0;

  public:
    double update(double y);
    void setKp(double kp);
    void setKi(double ki);
    void setKd(double kd);
};

class Component {
  protected:
    int pin = A0;
  public:
    void setPin(int pin);
};

class Sensor : public Component {
  private:
    int points = 0;
    double y_cum = 0;
    double y_last = 0;
  public:
    void update();
    double mean();
    double read();
    double lookup(double voltage);
};

class Actuator : public Component {
  private:
    double min = 0.5;
    double max = 1.0;
  public:
    double write(double value);
    void setRange(double min, double max);
    void setMin(double min);
    void setMax(double max);
};


