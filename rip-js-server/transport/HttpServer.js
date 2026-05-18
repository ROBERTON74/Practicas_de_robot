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

var http = require('http');

process.env.PORT = 2055;
process.env.IP = 'localhost';

function HttpServer() {
  this.rpcserver = {};
}

HttpServer.prototype.setRPCServer = function(rpcserver) {
  this.rpcserver = rpcserver;
}

HttpServer.prototype.start = function() {
  var server = http.createServer(this._onRequest.bind(this));
  server.listen(process.env.PORT, function() {
    console.log('Server listening on ' + process.env.IP + ':'+ process.env.PORT);
  });  
}
    
HttpServer.prototype._onRequest = function(request, response) {
  var headers = {
    'Content-Type': 'application/json', 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  }
  var body = '';
    request.on('data', function (chunk) {
    body += chunk;
  })

  request.on('end', function () {
    if(this.rpcserver != undefined) {
      response.writeHead(200, headers);
      var content = JSON.stringify(this.rpcserver.parse(body));
      console.log('request:\n\t' + body);
      console.log('response:\n\t' + content);
      response.write(content);
      response.end();
    }
  }.bind(this));
}

module.exports = HttpServer;
