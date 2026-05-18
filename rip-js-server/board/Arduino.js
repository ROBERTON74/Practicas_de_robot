var Boards = require('./Boards');
var SerialPort = require('serialport');

function Arduino() {
  this.listeners = [];
  this.name = "Arduino Board";
  this.hwio = {
//    'ball_height': {	name:'DGND', range: {min:0.0, max:1.8},	dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN },
//    'A0': {	name:'DGND', range: {min:0.0, max:1.8},	dir:Boards.ioDir.IN, current_dir:Boards.ioDir.IN },
//    'fan_control': {	name:'DGND', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'servo': {	name:'VDD_5V', range: {min:5.0, max:5.0},	dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'setpoint': {	name:'DGND', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'params': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'kp': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'ki': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'kd': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'u': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'mode': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'fan_min': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
//    'fan_max': {	name:'', range: {min:0.0, max:1.8}, dir:Boards.ioDir.OUT, current_dir:Boards.ioDir.OUT },
  }
  this.connect();
  this.setDatalogger(require('../logger/DataLogger'));
}

Arduino.prototype = Boards.GenericBoard.prototype;

Arduino.prototype.addListener = function(listener) {
  this.listeners.push(listener);
}

Arduino.prototype.setDatalogger = function(datalogger) {
  this.datalogger = datalogger;
}

Arduino.prototype.connect = function(onConnect) {
  this.portConf = {
    baudrate: 9600,
  };
  this.serialPort = new SerialPort("/dev/ttyUSB0", this.portConf);
  this.serialPort.on("open", this._onConnect.bind(this));
}

Arduino.prototype._onConnect = function() {
  console.log('System...OK');
  this.startTime = Date.now();
  this.parser = new SerialPort.parsers.Readline();
  this.serialPort.pipe(this.parser);
  this.parser.on('data', this._onData.bind(this));
  if(this.userOnConnect != undefined) {
    this.userOnConnect();
  }
}

Arduino.prototype._onData = function(data) {
  try {
    this.lastRead = JSON.parse(data);
    this.lastRead.timestamp += this.startTime;
    for(var listener in this.listeners) {
      listener(data);
    }
    if(this.datalogger != undefined) {
      this.datalogger.log(this.lastRead);
    }
  } catch(error) {
    console.log(error);
  }
} 

Arduino.prototype.disconnect = function(onDisconnect) {
  this.serialPort.close(onDisconnect);
}

Arduino.prototype.read = function(input) {
  if(this.lastRead != undefined) {
    return this.lastRead[input];
  }
  return undefined;
};

Arduino.prototype.write = function(variable, value) {
  var toWrite = {};
  toWrite[variable] = value;
  if(this.serialPort.isOpen()) {
    this.serialPort.write(JSON.stringify(toWrite)+'\n');
  }
};

module.exports.Arduino = new Arduino();
