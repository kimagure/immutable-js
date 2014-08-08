/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Map"
/* global Sequence, Map */
/* exported Record */


class Record extends Sequence {

  constructor(defaultValues, name) {
    var RecordType = function(values) {
      this._map = Map(values);
    };
    defaultValues = Sequence(defaultValues);
    RecordType.prototype = Object.create(Record.prototype);
    RecordType.prototype.constructor = RecordType;
    RecordType.prototype._name = name;
    RecordType.prototype._defaultValues = defaultValues;

    var keys = Object.keys(defaultValues);
    RecordType.prototype.length = keys.length;
    if (Object.defineProperty) {
      defaultValues.forEach((_, key) => {
        Object.defineProperty(RecordType.prototype, key, {
          get: function() {
            return this.get(key);
          },
          set: function(value) {
            if (!this.__ownerID) {
              throw new Error('Cannot set on an immutable record.');
            }
            this.set(key, value);
          }
        });
      });
    }

    return RecordType;
  }

  toString() {
    return this.__toString((this._name || 'Record') + ' {', '}');
  }

  // @pragma Access

  has(k) {
    return this._defaultValues.has(k);
  }

  get(k, undefinedValue) {
    if (undefinedValue !== undefined && !this.has(k)) {
      return undefinedValue;
    }
    return this._map.get(k, this._defaultValues.get(k));
  }

  // @pragma Modification

  clear() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    return this._empty();
  }

  set(k, v) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return this._make(newMap);
  }

  remove(k) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.remove(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return this._make(newMap);
  }

  // @pragma Mutability

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this._make(newMap, ownerID);
  }

  // @pragma Iteration

  __iterate(fn, reverse) {
    var record = this;
    return this._defaultValues.map((_, k) => record.get(k)).__iterate(fn, reverse);
  }

  _empty() {
    var Record = Object.getPrototypeOf(this).constructor;
    return Record._empty || (Record._empty = this._make(Map.empty()));
  }

  _make(map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(this));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }
}

Record.prototype.__deepEqual = Map.prototype.__deepEqual;
Record.prototype.merge = Map.prototype.merge;
Record.prototype.mergeWith = Map.prototype.mergeWith;
Record.prototype.mergeDeep = Map.prototype.mergeDeep;
Record.prototype.mergeDeepWith = Map.prototype.mergeDeepWith;
Record.prototype.update = Map.prototype.update;
Record.prototype.updateIn = Map.prototype.updateIn;
Record.prototype.withMutations = Map.prototype.withMutations;
Record.prototype.asMutable = Map.prototype.asMutable;
Record.prototype.asImmutable = Map.prototype.asImmutable;
