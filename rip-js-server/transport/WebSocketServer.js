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

var io = require('socket.io')();
 
function WebSocketTransport() {
  this.rpcserver = {};
}

WebSocketTransport.prototype.setRPCServer = function(rpcserver) {
  this.rpcserver = rpcserver;
}

WebSocketTransport.prototype.start = function() {
	var rpcserver = this.rpcserver;
	io.on('connection', function(client) {
		rpcserver.transport = client;

		client.on('open', function() {
			console.log('Server: connection opened');
		});

		client.on('close', function(code, message) {
			console.log('Server: connection closed with code: ' + code + ', ' + message);
		});
  
		client.on('message', function(data, flags) {
			try {
				var result = rpcserver.parse(data);
				var response = JSON.stringify(result);
				console.log(data);
				console.log(response);
			} catch(error) {
				console.log('Server: '+error);
			}
			client.send(response);
		});

		client.on('error', function(error) {
			console.log('Server: error ' + error);
		});
	});

	io.listen(2055);
}

module.exports = WebSocketTransport;
//  var notify = function() {
//    console.log('Server: message sent {"t":10}');
// 	  ws.send('{"t":10}');
//  }
