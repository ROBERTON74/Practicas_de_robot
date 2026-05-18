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
function Variable(name) {
  this.name = name;
  this.pin = undefined;
  this.value = 0;
  this.minimum = -Infinity;
  this.maximum = Infinity;
  this.readable = false;
  this.writable = false;
}

Variable.prototype.setValue = function(value) {
  if(this.inRange(value)) {
    this.value = value;
  }
}

Variable.prototype.inRange = function(value) {
  if(value >= this.minimum && value <= this.maximum) {
    return true;
  } else {
    return false;
  }
}

Variable.prototype.setRange = function(minimum, maximum) {
  this.minimum = minimum;
  this.maximum = maximum;
}

Variable.prototype.getValue = function() {
  return this.value;
}

Variable.prototype.getName = function() {
  return this.name;
}

Variable.prototype.setPin = function(pin) {
  this.pin = pin;
}

Variable.prototype.getPin = function() {
  return this.pin;
}

Variable.prototype.setReadable = function(readable) {
  this.readable = readable;
}

Variable.prototype.setWritable = function(writable) {
  this.writable = writable;
}

Variable.prototype.isReadable = function() {
  return this.readable;
}

Variable.prototype.isWritable = function() {
  return this.writable;
}

module.exports = Variable;
