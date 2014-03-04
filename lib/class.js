/*!
 * node-oo module v0.0.3
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

var extend = require("node.extend");

var classInitializing = false;

// empty Class implementation
var Class = function(){};

var defaultOpts = {
  // expose class members (of the "_class" object) within the instance scope
  // during each function call to have python-like access to classmethods
  // note: exposed members are read-only, if you want to change class members,
  //       use the "_class" object
  exposeClassMembers: false
};

// extend
Class._extend = function(instanceProps, classProps, opts) {

  instanceProps = instanceProps || {};
  classProps = classProps || {};
  opts = extend({}, defaultOpts, opts);

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
  SubClass._classMembers = {};
  var addMember = function(name, member) {
    var isFn = typeof(member) == "function";
    SubClass[name] = !isFn ? member : (function(fn) {
      return function() {
        var callee = this instanceof Class ? SubClass : this;
        return fn.apply(callee, arguments);
      };
    })(member);
    SubClass._classMembers[name] = SubClass[name];
  };
  if (this._classMembers)
    for (var name in this._classMembers)
      addMember(name, this._classMembers[name]);
  for (var name in classProps)
    addMember(name, classProps[name]);

  // propagate instance props
  for (var name in instanceProps) {
    var newFn = typeof(instanceProps[name]) == "function";
    prototype[name] = !newFn ? instanceProps[name] : (function(name, fn) {
        return function() {
          // add a super method that points to the prototype's method
          var tmpSuper = this._super;
          this._super = _super[name];

          var tmpMembers = [];
          if (opts.exposeClassMembers && this._class._classMembers) {
            for (var _name in this._class._classMembers) {
              if (this[_name] !== undefined)
                continue;
              tmpMembers.push(_name);
              var member = this._class._classMembers[_name];
              var isFn = typeof(member) == "function";
              this[_name] = !isFn ? member : function() {
                return member.apply(this._class, arguments);
              }.bind(this);
            }
          }

          var ret = fn.apply(this, arguments);

          tmpMembers.forEach(function(_name) {
            delete this[_name];
          }.bind(this));

          this._super = tmpSuper;

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


module.exports = Class;
