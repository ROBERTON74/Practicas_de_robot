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
var Variable = require('Variable');

VariableTester = {
	testSetAndGetValueInRange: function() {
		try {
			this.doSetAndGetValueInRange();
			console.log('TestSetAndGetValueInRange..... OK');
		} catch(error) {
			console.log(error);
		}
	},
	
	doSetAndGetValueInRange: function() {
		var variable = this.makeVariable('input');
		var valueSet = 2;
		variable.setValue(valueSet);
		valueGet = variable.getValue();
		var difference = valueGet - valueSet;

		this.assert(variable.inRange(valueSet), 'TestSetAndGetValueInRange.. Error: Variable out of range');
		this.assert(difference == 0, 'TestSetAndGetValueInRange.. Error: difference between get and set value');
	},

	testSetAndGetValueOutOfRange: function() {
		try {
			this.doSetAndGetValueOutOfRange();
			console.log('TestSetAndGetValueOutofRange.. OK');
		} catch(error) {
			console.log(error);
		}
	},

	doSetAndGetValueOutOfRange: function() {
		var variable = this.makeVariable('input');

		variable.setRange(3, 5);
		var valueSet = -2;
		variable.setValue(valueSet);
		valueGet = variable.getValue();
		var difference = valueGet - valueSet;

		this.assert(!variable.inRange(valueSet), 'TestSetAndGetValueInRange.. Error: Variable in range');
		this.assert(difference != 0, 'TestSetAndGetValueInRange.. Error: no difference between get and set value');
		
	},

	assert: function(value, message) {
		if(value != true) {
			throw message;
		}
	},

	makeVariable: function(variable) {
		return new Variable(variable);
	}
}

VariableTester.testSetAndGetValueInRange();
VariableTester.testSetAndGetValueOutOfRange();
