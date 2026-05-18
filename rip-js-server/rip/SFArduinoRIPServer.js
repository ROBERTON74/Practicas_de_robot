/**
 * JSON-RPC Server & HIL Remote Protocol - BeagleBone Implementation
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
var ArduinoRipServer = new JsonRpcServer();

ArduinoRipServer.init = function() {
  this.on('connect', { 
    'purpose': 'To establish a connection with the lab.',
    'params': {},
  }, ArduinoRipServer.connect.bind(this));
  this.on('info', {
    'purpose': 'To get server metadata',
    'params': {},
  }, ArduinoRipServer.info.bind(this));
  this.on('set', {
    'purpose': 'To write a server variable',
    'params': {
      'variables': '[string]',
      'values': '[]',
    },  
  }, ArduinoRipServer.set.bind(this));
  this.on('get', {
    'purpose': 'To read a server variable',
    'params': {
      'variables': '[string]',
    },
  }, ArduinoRipServer.get.bind(this));
	this.on('disconnect', {
    'purpose': 'To finish the connection with the lab.',
    'params': {},
	}, ArduinoRipServer.disconnect.bind(this));
}

ArduinoRipServer.setHardwareInterface = function(hardwareInterface) {
  this.hardwareInterface = hardwareInterface;
}

ArduinoRipServer.connect = function() {
  return { 'session-id': 'Arduino'};
}

ArduinoRipServer.info = function() {
	return {
	  info: {
  	  name: 'RIP - Arduino Standard Firmata',
  	  description: 'RIP interface to access Arduino Standard Firmata',
	  },
	  methods: this.getMethods(),
		readable: this.hardwareInterface.getReadableVariables(),
		writable: this.hardwareInterface.getWritableVariables(),
	};
}
	
ArduinoRipServer.get = function(variables) {
	result = [];
	for (var i=0; i<variables.length; i++) {
		var value = this.hardwareInterface.read(variables[i]);
		result.push(value);
	}
	return result;
}

ArduinoRipServer.set = function(variables, values) {
	for(var i=0; i<variables.length; i++) {
		this.hardwareInterface.write(variables[i], values[i]);
	}
}


ArduinoRipServer.disconnect = function() {
	return 'disconnect';
}

ArduinoRipServer.init();
module.exports = ArduinoRipServer;
