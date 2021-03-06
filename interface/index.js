//----------------------------------------------------------------------
//
// This source file is part of the Meta:Magical project.
//
// Copyright (C) 2016 Quildreen Motta.
// Licensed under the MIT licence.
//
// See LICENCE for licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

// Meta:Magical has a central WeakMap that maps objects to their
// meta-data, where meta-data is simply a plain JavaScript object
// with a particular set of properties. The set of properties itself
// is open-ended, but meta-magical itself only understands some of
// them by default.
var metadata = new WeakMap();

// For convenience to those who don't want to import Meta:Magical
// in their projects, and as a way of alleviating the problems with
// a global WeakMap in a Node module, Meta:Magical also allows
// meta-data to be defined directly in the object, through the
// global Symbol `@@meta:magical`.
//
// If an object exposes an object in this symbol, the meta-data in
// the WeakMap will still be checked first. Note that in the
// end all meta-data is merged, which makes it possible for one
// to attach meta-data after-the-fact, without changing the
// properties of an object.
var metaSymbol = Symbol.for('@@meta:magical');


// -- Dependencies -----------------------------------------------------
var assertObject = require('./assertions').assertObject;


// -- Aliases ----------------------------------------------------------
var hasOwnProperty = Object.prototype.hasOwnProperty;


// -- Operations -------------------------------------------------------
//
// The interface module exposes two operations:
//
//   * `get(object)`, returns an object containing all meta-data for
//     the given `object`.
//   * `set(object, key, value)`, updates the meta-data for the given
//     object, in the most appropriate place.


function get(object) {
  assertObject(object);

  var data = {};
  if (hasOwnProperty.call(object, metaSymbol)) {
    Object.assign(data, object[metaSymbol] || {});
  }
  Object.assign(data, metadata.get(object) || {});
  return data;
}
get[metaSymbol] = {
  name          : 'get',
  signature     : 'get(object)',
  type          : '(Object) -> { String -> Any }',
  belongsTo     : exports,
  documentation : 'Retrieves all meta-data associated with `object`.'
};


function set(object, key, value) {
  assertObject(object);

  var meta = metadata.get(object) || {};
  meta[key] = value;
  metadata.set(object, meta);

  return object;
}
set[metaSymbol] = {
  name          : 'set',
  signature     : 'set(object, key, value)',
  type          : '(Object, String, Any) -> Object',
  belongsTo     : exports,
  documentation : 'Updates the meta-data for `object`, '
                + 'by associating a new `value` with `key`.'
};


function update(object, newMeta) {
  assertObject(object);

  var meta = metadata.get(object) || {};
  Object.assign(meta, newMeta);
  metadata.set(object, meta);

  return object;
}
update[metaSymbol] = {
  name          : 'update',
  signature     : 'update(object, meta)',
  type          : '(Object, { String -> Any }) -> Object',
  belongsTo     : exports,
  documentation : 'Updates the meta-data for `object` by merging '
                + 'the values provided by `meta`.'
};

metaSymbol[metaSymbol] = {
  name          : '@@meta:magical',
  type          : 'Symbol',
  belongsTo     : exports,
  documentation : 'A special symbol for attaching meta-data to objects.'
};


// -- Exports ----------------------------------------------------------
exports.get    = get;
exports.set    = set;
exports.update = update;
exports.symbol = metaSymbol;

exports[metaSymbol] = {
  module    : 'metamagical/interface',
  name      : 'module metamagical/interface',
  stability : 'stable',
  authors   : ['Quildreen Motta'],
  licence   : 'MIT',
  platforms : ['ECMAScript 2015'],
  documentation: `
This module defines a way of attaching meta-data to an object,
and a way of retrieving meta-data from an object. Things building
on top of this meta-data are expected to import this module.
  `
};
