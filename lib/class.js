/*!
 * node-oo module v0.0.2
 * https://github.com/riga/node-oo
 *
 * Marcel Rieger, 2014
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/GPL-3.0
 *
 * Port of John Resig's lightweight OO model to Nodejs
 * extended by common OO features.
 */

var classInitializing = false;

// empty Class implementation
var Class = module.exports = function(){};

// extend
Class._extend = function(instanceProps, classProps) {

  instanceProps = instanceProps || {};
  classProps = classProps || {};

  // sub class dummy constructor
  var SubClass = function() {
    this._class = SubClass;
    // all construction is actually done in the init method
    if (!classInitializing && this.init)
      this.init.apply(this, arguments);
  };

  var _super = this.prototype;
  SubClass._superClass = this;

  // each class has a list "subClasses" that stores
  // all classes that inherit from this class
  this._subClasses = this._subClasses || [];
  this._subClasses.push(SubClass);

  // create an instance, prevent init call
  classInitializing = true;
  var prototype = new this();
  classInitializing = false;

  // _extends returns true if the class itself extended "target"
  // in any hierarchy, e.g. any class inherits "Class" itself
  SubClass._extends = function(target) {
    if (target == this._superClass)
      return true;
    else if (this._superClass == Class)
      return false;
    else
      return this._superClass._extends(target);
  };

  // propagate class props
  if (Object.keys(classProps).length)
    SubClass._classMembers = classProps;
  if (this._classMembers)
    for (var name in this._classMembers) {
      var member = this._classMembers[name];
      var isFn = typeof(member) == "function";
      SubClass[name] = !isFn ? member : member.bind(SubClass);
    }
  for (var name in classProps) {
    var isFn = typeof(classProps[name]) == "function";
    SubClass[name] = !isFn ? classProps[name] : classProps[name].bind(SubClass);
  }

  // propagate instance props
  for (var name in instanceProps) {
    var newFn = typeof(instanceProps[name]) == "function";
    newFn &= typeof(_super[name]) == "function";
    prototype[name] = !newFn ? instanceProps[name] : (function(name, fn) {
        return function() {
          // add a super method that points to the prototype's method
          var tmp = this._super;
          this._super = _super[name];

          var ret = fn.apply(this, arguments);

          this._super = tmp;

          return ret;
        };
      })(name, instanceProps[name]);
  }

  // populate our constructed prototype object
  SubClass.prototype = prototype;

  // enforce the constructor to be what we expect
  SubClass.prototype.constructor = SubClass;

  // And make this class extendable
  SubClass._extend = arguments.callee;

  return SubClass;
};
