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
var cp = require('child_process');
var spawnSync = cp.spawnSync;
var fs = require('fs');

var JsonRpcServer = require('../jsonrpc/JsonRpcServer');
var ArduinoRIPServer = new JsonRpcServer();

ArduinoRIPServer.init = function(info) {
	this.setInfo(info);

	this.on('connect', { 
		'purpose': 'To establish a connection with the lab.',
		'params': {},
	}, ArduinoRIPServer.connect.bind(this));
	this.on('info', {
		'purpose': 'To get server metadata',
		'params': {},
	}, ArduinoRIPServer.info.bind(this));
	this.on('set', {
		'purpose': 'To write a server variable',
		'params': {
			'variables': '[string]',
			'values': '[]',
		},
	}, ArduinoRIPServer.set.bind(this));
	this.on('get', {
		'purpose': 'To read a server variable',
		'params': {
			'variables': '[string]',
		},
	}, ArduinoRIPServer.get.bind(this));
	this.on('disconnect', {
		'purpose': 'To finish the connection with the lab.',
		'params': {},
	}, ArduinoRIPServer.disconnect.bind(this));
	this.on('load', {
		'purpose': 'To upload arduino code',
		'params': {
			'code': 'string',
		},
	}, ArduinoRIPServer.load.bind(this));
}

ArduinoRIPServer.setHardwareInterface = function(hardwareInterface) {
  this.hardwareInterface = hardwareInterface;
}

ArduinoRIPServer.setInfo = function(info) {
	this.info = {
		name: 'RIP Server',
		description: 'RIP Server implementation in Node.js',
	},
	this.info = info;
}

ArduinoRIPServer.connect = function() {
	return { 'session-id': 'AirLevitator'};
}

ArduinoRIPServer.info = function() {
	return {
		info: {
			name: 'Air Levitator System Lab',
	  		description: 'Air Levitator System Lab',
		},
		methods: this.getMethods(),
  	readable: this.hardwareInterface.getReadableVariables(),
		writable: this.hardwareInterface.getWritableVariables(),
	};
}

ArduinoRIPServer.get = function(variables) {
	result = [];
	for (var i=0; i<variables.length; i++) {
		var value = this.hardwareInterface.read(variables[i])
		result.push(value);
	}
	return result;
}

ArduinoRIPServer.set = function(variables, values) {
	for(var i=0; i<variables.length; i++) {
		this.hardwareInterface.write(variables[i], values[i]);
	}
}


ArduinoRIPServer.load = function(controller) {
	this.hardwareInterface.disconnect(function() {
		this._generate(controller, function() {
			this._upload();
			this.hardwareInterface.connect();
		}.bind(this));
	}.bind(this));
}

ArduinoRIPServer._upload = function() {
	try {
		const result = spawnSync('make', ['upload', '-C','tmp'], {
			stdio: 'inherit',
		});
		console.log('controller uploaded');
	} catch(error) {
		console.log(error);
	}
}

ArduinoRIPServer._generate = function(controller, callback) {
	var code = 'double PID::update(double y) {\n' + controller + '}';
	var input = fs.createReadStream(process.env.PWD + '/arduino_code/levitador.ino');
	var output = fs.createWriteStream(process.env.PWD + '/tmp/levitador.ino');
	input.pipe(output);
	output.on('close', function() {
		fs.appendFileSync(process.env.PWD +'/tmp/levitador.ino', code);
		if(callback != undefined) {
			callback();
		}
	});
}

ArduinoRIPServer._build = function() {
	try {
		const result = spawnSync('make', ['-C','tmp'], {
			cwd: process.env.PWD,
			stdio: 'inherit',
		});
	} catch(error) {
		console.log(error);
	}	
}

ArduinoRIPServer.disconnect = function() {
	return 'disconnect';
}

ArduinoRIPServer.init();
module.exports = ArduinoRIPServer;
