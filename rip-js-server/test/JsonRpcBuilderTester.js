/**
 * JSON-RPC Builder Tester
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
var JsonRpcBuilder = require('../jsonrpc/JsonRpcBuilder');

var JsonRpcBuilderTester = {
	testRequest: function() {
		try {
			this.doRequest();
			console.log('Test Request..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doRequest: function() {
		var expected = { 
			jsonrpc: '2.0',
			method: 'testMethod',
			params: ['testParam'],
			id: 'test_id'
		}
		var request = JsonRpcBuilder.request('testMethod', ['testParam'], "test_id");

		this.assert(JSON.stringify(expected) == JSON.stringify(request), 'Test Request Error: request not valid');
	},

	assert: function(value, message) {
		if(value != true) {
			throw message;
		}
	},

	testResponse: function() {
		try {
			this.doResponse();
			console.log('Test Response..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doResponse: function() {
		var expected = { 
			jsonrpc: '2.0',
			result: 12.43,
			id: 'test_response'
		}
		var response = JsonRpcBuilder.response(12.43, 'test_response');

		this.assert(JSON.stringify(expected) == JSON.stringify(response), 'Test Response Error: response not valid');
	},

	testResponseWithError: function() {
		try {
			this.doResponseWithError();
			console.log('Test ResponseWithError..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doResponseWithError: function() {
		var expected = { 
			jsonrpc: '2.0',
			error: 'Test Error',
			id: 'test_error'
		}
		var response = JsonRpcBuilder.responseWithError('Test Error', 'test_error');

		this.assert(JSON.stringify(expected) == JSON.stringify(response), 'Test ResponseWithError Error: response not valid');
	},

	testParseResponse: function() {
		try {
			this.doParseResponse();
			console.log('Test ParseResponse..... OK');
		} catch(error) {
			console.log(error);
		}
	},

	doParseResponse: function() {
		var response = '{ "jsonrpc": "2.0", "result": "12.43",	"id": "test_parse" }';
		var expected = 12.43;
		var result = JsonRpcBuilder.parseResponse(response);

		this.assert(expected == result, 'Test ParseResponse Error: response not valid');
	}
}

JsonRpcBuilderTester.testRequest();
JsonRpcBuilderTester.testResponse();
JsonRpcBuilderTester.testResponseWithError();
JsonRpcBuilderTester.testParseResponse();
