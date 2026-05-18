/**
 * JSON-RPC Server Tester
 * author: Jesús Chacón <jcsombria@gmail.com>
 *
 * Copyright (C) 2013 Jesús Chacón
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

// WebSocket servidor
//
//var WebSocket = require('ws');
//var ws = new WebSocket('ws://localhost:2055');

//ws.on('open', function () {
//  var connect = {"jsonrpc":"2.0", "method":"connect", "id":"1111"};
//  var open = {"jsonrpc":"2.0", "method":"open", "id":"2222"};
//  var run = {"jsonrpc":"2.0", "method":"run", "id":"3333"};
//  var get = {"jsonrpc":"2.0", "method":"get", "params":["motor1_speed","motor2_speed"], "id":"4444"};
//  var set = {"jsonrpc":"2.0", "method":"set", "params":{"variable1":5*Math.random()}, "id":"5555"};  
//  var stop = {"jsonrpc":"2.0", "method":"stop", "id":"6666"};
//  var close = {"jsonrpc":"2.0", "method":"close", "id":"7777"};
//  var disconnect = {"jsonrpc":"2.0", "method":"disconnect", "id":"8888"};


////  ws.send(JSON.stringify(run));
////  ws.send(JSON.stringify(connect));
////  ws.send(JSON.stringify(open));
////  ws.send(JSON.stringify(set));
////  ws.send(JSON.stringify(close));
////  ws.send(JSON.stringify(disconnect));
//  ws.send(JSON.stringify(get));

//  var setTs = function set(transport) {
//    return function() {
//      transport.send('{"jsonrpc":"2.0", "method":"set", "params":{"motor2_control":'+Math.random()+'}, "id":"5555"}');
//    };
//  };

//  setInterval(setTs(ws), 2000);
//});

//ws.on('message', function(data, flags) {
//  var readings = JSON.parse(data);
//  console.log(readings);
////  console.log('motor1: '+readings.motor1_speed+', motor2: '+readings.motor2_speed);
//});

var socket = require('socket.io-client')('http://localhost:2055');

socket.on('connect', function(){
	console.log('connect');
	socket.send('{"jsonrpc":"2.0", "method":"connect", "id":1}');
	socket.send('{"jsonrpc":"2.0", "method":"info", "id":1}');
});

socket.on('message', function(data){
	console.log(data);
});

socket.on('disconnect', function(){
	console.log('disconnect');
});


