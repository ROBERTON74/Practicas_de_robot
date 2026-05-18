/**
 * JSON-RPC Server & HIL Remote Protocol - Dummy Server
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

var JsonRpcServer = require('../jsonrpc/JsonRpcServer');
var DummyServer = new JsonRpcServer();

DummyServer.setInfo = function(info) {
  this.labInfo = info;
}

DummyServer.init = function(info) {
  this.labInfo = info;

  this.on('connect', {
    'purpose': 'To establish a connection with the lab.',
    'params': {},
  }, DummyServer.connect.bind(this));
  this.on('info', {
    'purpose': 'To get server metadata',
    'params': {},
  }, DummyServer.info.bind(this));
  this.on('set', { 
    'purpose': 'To write a server variable',
    'params': {
      'variables': '[string]',
      'values': '[]',
    },  
  }, DummyServer.set.bind(this));
  this.on('get', {
    'purpose': 'To read a server variable',
    'params': {
      'variables': '[string]',
    },
  }, DummyServer.get.bind(this));
  this.on('disconnect', {
    'purpose': 'To finish the connection with the lab.',
    'params': {},
  }, DummyServer.disconnect.bind(this));
}

DummyServer.setHardwareInterface = function(hardwareInterface) {
  this.hardwareInterface = hardwareInterface;
}

DummyServer.connect = function() {
  return {
    'session-id': UUID(),
  };
};

function UUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

DummyServer.info = function() {
  return {
    info: this.labInfo,
    methods: this.getMethods(),
    readable: this.hardwareInterface.getReadableVariables(),
    writable: this.hardwareInterface.getWritableVariables(),
  };
}

DummyServer.get = function(variables) {
  var result = [];
  for (i=0; i<variables.length; i++) {
    result[i] = this.hardwareInterface.read(variables[i]);
  }
  return result;
}

DummyServer.set = function(variables, values) {
  var result = [];
  for (i=0; i<variables.length; i++) {
    var variable = variables[i];
    var value = values[i];
    this.hardwareInterface.write(variable, value);
  }
  return result;
}

DummyServer.disconnect = function() {
  return {
    disconnect:'not implemented',
  };
}

DummyServer.init();
module.exports = DummyServer;
