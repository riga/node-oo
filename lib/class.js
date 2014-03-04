/*!
 * node-oo module v0.0.1
 * https://github.com/riga/node-oo
 *
 * Marcel Rieger, 2014
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/GPL-3.0
 *
 * Port of John Resig's excellent Class model approach.
 */

// empty Class implementation
var Class = module.exports = function(){};

// extend
Class._extend = function(properties) {

  var initializing = false;

  // dummy constructor
  var Class = function() {
    // All construction is actually done in the init method
    if (!initializing && this.init)
      this.init.apply(this, arguments);
  };

  var _super = this.prototype;
  Class._superClass = this;

  // each class has a list "subClasses" that stores
  // all classes that inherit from this class
  this._subClasses = this._subClasses || [];
  this._subClasses.push(Class);

  // create an instance, do not call init
  initializing = true;
  var prototype = new this();
  initializing = false;

  // inherits returns true if the class itself extended "target"
  // in any hierarchy, e.g. any class inherits "Class" itself
  Class._extends = function(target) {
    if (target == this._superClass)
      return true;
    else if (this == Class)
      return false;
    else
      return this._superClass._extends(target);
  };

  // copy the properties over onto the new prototype
  for (var name in properties) {
    // check if we're overwriting an existing function
    var newFn = typeof(properties[name]) == "function";
    newFn &= typeof(_super[name]) == "function";
    prototype[name] = !newFn ? properties[name] : (function(name, fn) {
        return function() {
          // add a super method that points to the prototype's method
          var tmp = this._super;
          this._super = _super[name];

          // actual call
          var ret = fn.apply(this, arguments);

          this._super = tmp;

          return ret;
        };
      })(name, properties[name]);
  }

  // populate our constructed prototype object
  Class.prototype = prototype;

  // enforce the constructor to be what we expect
  Class.prototype.constructor = Class;

  // And make this class extendable
  Class._extend = arguments.callee;

  return Class;
};
