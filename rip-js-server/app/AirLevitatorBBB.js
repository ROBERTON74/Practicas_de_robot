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

var conf = {
  server: {
    rip: 'HILRemoteServer',
    transport: 'HttpServer',
    info: {
      name: 'Air Levitator System',
      description: 'Air Levitator System Lab - BeagleBone Black',
    },
  },
  board: {
    require: 'BeagleBoneBlackBoard',
    name: 'BeagleBoneBlack',
    variables: [
      { 'name': 'ball_height', 'pin': 'P9_36', 'type': 'in' },
      { 'name': 'fan_control', 'pin': 'P9_14', 'type': 'out' },
      { 'name': 'servo_control', 'pin': 'P9_22', 'type': 'out' },
      { 'name': 'setpoint', 'type': 'in_out' },
      { 'name': 'kp', 'type': 'in_out' },
      { 'name': 'ki', 'type': 'in_out' },
      { 'name': 'kd', 'type': 'in_out' },
    ],
  },
}

var App = require('./GenericApp');
App.init(conf);
App.start();
