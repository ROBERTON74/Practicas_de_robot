var five = require('johnny-five')
var Boards = require('./Boards');
var SerialPort = require('serialport');

function Arduino() {
  this.name = "Arduino UNO Board - Standard Firmata";
  this.hwio = {
    'A0': { name:'A0', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'A1': { name:'A1', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, curren_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'A2': { name:'A2', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'A3': { name:'A3', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'A4': { name:'A4', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'A5': { name:'A5', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN, type: five.Pin.INPUT },
    'D0': { name:'0', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D1': { name:'1', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D2': { name:'2', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D3': { name:'3', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D4': { name:'4', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D5': { name:'5', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D6': { name:'6', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D7': { name:'7', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D8': { name:'8', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D9': { name:'9', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D10': { name:'10', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D11': { name:'11', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.PWM },
    'D12': { name:'12', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
    'D13': { name:'13', range: {min:0.0, max:5.0}, dir:Boards.ioDir.IN_OUT, current_dir:Boards.ioDir.OUT, type: five.Pin.OUTPUT },
  }
}

Arduino.prototype = Boards.GenericBoard.prototype;

Arduino.prototype.connect = function(onConnect) {
  this.board = new five.Board({
    repl: false,
  });
  var that = this;
  this.board.on('ready', function() {
    for(i = 0; i<6; i++) {
      var pin = 'A' + i;
      this.analogRead(i, that._onRead(pin));
    }
    onConnect();
  });
}

Arduino.prototype._onRead = function(pin) {
  return function(voltage) {
    this.hwio[pin].value = voltage;
  }.bind(this);
}

Arduino.prototype.read = function(pin) {
  if(this.hwio[pin] != undefined) {
    return this.hwio[pin].value;
  }
  return undefined;
};

Arduino.prototype.write = function(pin, value) {
  if(this.hwio[pin] != undefined) {
    if(this.hwio[pin].type == five.Pin.PWM) {
      this.board.analogWrite(this.hwio[pin].name, value);
    }
    if(this.hwio[pin].type == five.Pin.OUTPUT) {
      this.board.digitalWrite(this.hwio[pin].name, value);
    }
  }
};

Arduino.prototype.setInputMode = function(pin) {
  if(this.hasPin(pin)) {
    this.board.pinMode(this.hwio[pin].name, this.hwio[pin].type);   
  }
}

Arduino.prototype.setOutputMode = function(pin) {
  if(this.hasPin(pin)) {
    this.board.pinMode(this.hwio[pin].name, this.hwio[pin].type);   
  }
}

module.exports.StandardFirmataArduino = new Arduino();
