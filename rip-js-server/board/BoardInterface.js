/**
 * HIL Remote Protocol - Boards Interface definition
 * author: Jesús Chacón <jcsombria@gmail.com>
 *
 * Copyright (C) 2014 Jesús Chacón
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Variable = require('./Variable');

function BoardInterface(board) {
  this.vars = {};
  this.board = board;
}

BoardInterface.prototype.getReading = function(variable) {
  if(this.hasVariable(variable)) {
      return this.vars[variable].getValue();
  }
}

BoardInterface.prototype.read = function(variable) {
  if(this.hasVariable(variable)) {
    var pin = this.vars[variable].getPin();
    if(pin != undefined) {
      var value = this.board.read(pin);
      this.vars[variable].setValue(value);
      return value;
    } else {
      return this.vars[variable].getValue();
    }
  }
  return 0;
};

BoardInterface.prototype.write = function(variable, value) {
  if(this.hasVariable(variable)) {
    var pin = this.vars[variable].getPin();
    if(pin != undefined) {
      this.board.write(pin, value);
    } else {
      this.vars[variable].setValue(value);
    }
  }
};

BoardInterface.prototype.addVariable = function(name, pin) {
  var variable = new Variable(name);
  this.vars[name] = variable;
  if(this.board.hasPin(pin)) {
    variable.setPin(pin);
    var range = this.board.pinRange(pin);
    variable.setRange(range['min'], range['max']);
  } else {
    variable.setRange(-Infinity, +Infinity);
  }
};

BoardInterface.prototype.removeVariable = function(variable) {
  this.vars[variable] = undefined;
};

BoardInterface.prototype.hasVariable = function(variable) {
  if(this.vars[variable]) {
    return true;
  } else {
    return false;
  }
};

BoardInterface.prototype.setReadable = function(variable) {
  if(this.hasVariable(variable)) {
    this.vars[variable].setReadable(true);
    this.vars[variable].setWritable(false);
    var pin = this.vars[variable].getPin();
    if(this.board.isInputOutput(pin)) {
      this.board.setInputMode(pin);
    };
  }
}

BoardInterface.prototype.setWritable = function(variable) {
  if(this.hasVariable(variable)) {
    this.vars[variable].setReadable(false);
    this.vars[variable].setWritable(true);
    var pin = this.vars[variable].getPin();
    if(this.board.isInputOutput(pin)) {
      this.board.setOutputMode(pin);
    };
  }
}

BoardInterface.prototype.setReadableWritable = function(variable) {
  if(this.hasVariable(variable)) {
    this.vars[variable].setReadable(true);
    this.vars[variable].setWritable(true);
    var pin = this.vars[variable].getPin();
    if(this.board.isInputOutput(pin)) {
      this.board.setOutputMode(pin);
    };
  }
}

BoardInterface.prototype.getReadableVariables = function() {
  var listOfInputVariables = [];
  for(variable in this.vars) {
    if(this.vars[variable].isReadable()) {
      listOfInputVariables.push(variable);
    }    
  }
  return listOfInputVariables;
}

BoardInterface.prototype.getWritableVariables = function() {
  var listOfOutputVariables = [];
  for(variable in this.vars) {
    if(this.vars[variable].isWritable()) {
      listOfOutputVariables.push(variable);
    }    
  }
  return listOfOutputVariables;
}

BoardInterface.prototype.addListener = function(listener) {
  this.board.addListener(listener);
}

BoardInterface.prototype.connect = function(callback) {
  this.board.connect(callback);
}

BoardInterface.prototype.disconnect = function(callback) {
  this.board.disconnect(callback);
}

module.exports = BoardInterface;
