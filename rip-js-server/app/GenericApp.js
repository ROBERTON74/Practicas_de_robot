/**
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
// Componentes:
//   - Transport: HttpServer, WebSocketServer
//   - RIP Implementation:  ArduinoRIPServer, DummyServer, HILRemoteServer, SFArduinoRIPServer

var BoardInterface = require('../board/BoardInterface');

var App = {
  init: function(conf) {
    this.conf = conf;
    if(conf.server != undefined) {
      console.log('[LOG] Loading configuration...')
      this.setTransport(conf.server.transport);
      this.setRIP(conf.server);
      this.setBoard(conf.board);
      this.webserver.setRPCServer(this.rip);
    }
  },

  setTransport: function(transport) {
    try {
      var server = require('../transport/' + transport);
      console.log('[LOG] Transport: ' + transport);
    } catch(error) {
      console.log('[WARNING] Cannot set transport. Using WebSocketTransport.');
      var server = require('../transport/WebSocketServer');
    }
    this.webserver = new server();
  },
  
  setRIP: function(conf) {
    try {
      this.rip = require('../rip/' + conf.rip);
      this.rip.setInfo(conf.info);
      console.log('[LOG] RIP Implementation: ' + conf.rip);
    } catch(error) {
      console.log('[WARNING] Cannot set RIP implementation. Using DummyServer.');
      this.rip = require('../rip/DummyServer');
    }
  },

  setBoard: function(board) {
    try {
      console.log('[LOG] Connecting to: ' + board.name);
      console.log('[DEBUG] Loading file: ../board/' + board.require);
      this.Boards = require('../board/' + board.require);
      console.log("[DEBUG] " + this.Boards[board.name]);
      this.boardInterface = new BoardInterface(this.Boards[board.name]);
      console.log('[LOG] Connected to: ' + board.name);
    } catch(error) {
      console.log('[ERROR] Cannot set Board implementation. Using TestBoard.');
      this.Boards = require('../board/Boards');
      this.boardInterface = new BoardInterface(this.Boards.TestBoard);
    }
    this.bindVariables(board.variables);
    this.rip.setHardwareInterface(this.boardInterface);
  },

  bindVariables: function(variables) {
    for(var i=0; i<variables.length; i++) {
      var variable = variables[i];
      this.boardInterface.addVariable(variable['name'], variable['pin']);
      switch(variable['type']) {
        case 'in':
          this.boardInterface.setReadable(variable['name']);
          break;
        case 'in_out':
          this.boardInterface.setReadableWritable(variable['name']);
          break;
        case 'out':
          this.boardInterface.setWritable(variable['name']);
          break;
      }
    }
  },

  _start: function() {
    this.webserver.start();
    console.log('[LOG] Starting server.')
  },
  
  start: function() {
    this._start();
  },
}

module.exports = App;
