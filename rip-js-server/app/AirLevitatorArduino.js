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
    rip: 'ArduinoRIPServer',
    transport: 'HttpServer',
    info: {
      name: 'Air Levitator System Lab',
      description: 'Air Levitator System Lab - Arduino',
    },
  },
  board: {
    require: 'Arduino',
    name: 'Arduino',
    variables: [
      { 'name': 'ball_height', 'pin': 'ball_height', 'type': 'in' },
      { 'name': 'fan_control', 'pin': 'fan_control', 'type': 'out' },
      { 'name': 'servo', 'pin': 'servo', 'type': 'out' },
      { 'name': 'setpoint', 'pin': 'setpoint', 'type': 'in_out' },
      { 'name': 'kp', 'pin':'kp', 'type': 'in_out' },
      { 'name': 'ki', 'pin':'ki', 'type': 'in_out' },
      { 'name': 'kd', 'pin':'kd', 'type': 'in_out' },
      { 'name': 'u', 'pin':'u', 'type': 'in_out' },
      { 'name': 'mode', 'pin':'mode', 'type': 'in_out' },
      { 'name': 'fan_min', 'pin':'fan_min', 'type': 'in_out' },
      { 'name': 'fan_max', 'pin':'fan_max', 'type': 'in_out' },
    ],
  },
}

var App = require('./GenericApp');
App.init(conf);
App.start();
