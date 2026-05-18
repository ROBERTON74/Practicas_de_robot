/**
 * HIL Remote Protocol - BoardInterfaceTester
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
BoardInterface = require('./BoardInterface');

var BoardInterfaceTester = {
	makeBoardInterface: function() {
		return new BoardInterface();
	},

	testAddVariable: function() {
		try {
			this.doAddVariable();
			console.log('TestAddVariable..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doAddVariable: function() {
		var boardInterface = this.makeBoardInterface();
		boardInterface.addVariable('input1', 'P9_10');
		this.assert(boardInterface.hasVariable('input1'), 'TestAddVariable Error: variable not defined');
	},

	testRemoveVariable: function() {
		try {
			this.doRemoveVariable();
			console.log('TestRemoveVariable..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doRemoveVariable: function() {
		var boardInterfaceWithVariable = this.makeBoardInterfaceWithVariable('input1');
	
		var before = boardInterfaceWithVariable.hasVariable('input1');
		boardInterfaceWithVariable.removeVariable('input1');
		var after = boardInterfaceWithVariable.hasVariable('input1');

		this.assert(before, 'TestRemoveVariable Error: variable not defined before');
		this.assert(!after, 'TestRemoveVariable Error: variable defined after');
	},

	assert: function(value, message) {
		if(value != true) {
			throw message;
		}
	},

	testSetAndGetValue: function() {
		try {
			this.doSetAndGetValue();
			console.log('TestSetAndGetValue... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doSetAndGetValue: function() {
		var boardInterfaceWithVariable = this.makeBoardInterfaceWithVariable('input1');

		var valueSet = 10;
		boardInterfaceWithVariable.setValue('input1', valueSet);
		var valueGet = boardInterfaceWithVariable.getValue('input1');
		var difference = valueSet - valueGet;

		this.assert(boardInterfaceWithVariable.hasVariable('input1'), 'TestSetAndGetValue.. Error: Variable not defined');
		this.assert(difference == 0, 'TestSetAndGetValue.. Error: Set and Get Value not working');
	},

	makeBoardInterfaceWithVariable: function(variable) {
		var boardInterface = new BoardInterface();
		boardInterface.addVariable(variable, 'P9_10');
		return boardInterface;
	},

	testBindVariableToPin: function() {
		try {
			this.doBindVariableToPin();
			console.log('TestBindVariableToPin... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doBindVariableToPin: function() {
		var boardInterfaceWithVariable = this.makeBoardInterfaceWithVariable('input1');

		boardInterfaceWithVariable.bindVariableToPin('input', 'P9_13');
	}
}

BoardInterfaceTester.testAddVariable();
BoardInterfaceTester.testRemoveVariable();
BoardInterfaceTester.testSetAndGetValue();
BoardInterfaceTester.testBindVariableToPin();
