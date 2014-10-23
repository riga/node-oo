/*!
 * node-oo module v1.1.0
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

(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    console.log("AMD");
    define(factory);
  } else if (typeof exports === "object") {
    // CommonJS
    if (typeof module === "object" && typeof module.exports === "object") {
      // nodejs
      module.exports = factory();
    } else {
      exports = factory();
    }
  } else if (window) {
    // Browser globals
    window.Class = factory();
  } else if (console && console.error) {
    // error
    console.error("Cannot determine loader");
  }

})(function() {

  var isFn = function(fn) {
    return fn instanceof Function;
  };

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
    classProps    = classProps || {};

    var _opts = {};
    Object.keys(defaultOpts).forEach(function(key) {
      if (opts instanceof Object && opts[key] !== undefined) {
        _opts[key] = opts[key];
      } else {
        _opts[key] = defaultOpts[key];
      }
    });
    opts = _opts;

    // sub class dummy constructor
    var SubClass = function() {
      this._class = SubClass;
      // all construction is actually done in the init method
      if (!classInitializing && this.init) {
        return this.init.apply(this, arguments);
      }
      return this;
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
    // in any hierarchy, e.g. every class inherits "Class" itself
    SubClass._extends = function(target) {
      if (target == this._superClass) {
        return true;
      } else if (this._superClass == Class) {
        return false;
      } else {
        return this._superClass._extends(target);
      }
    };

    // propagate class props
    SubClass._classMembers = {};
    var addMember = function(name, member) {
      SubClass[name] = !isFn(member) ? member : (function(fn) {
        return function() {
          var callee = this instanceof Class ? SubClass : this;
          return fn.apply(callee, arguments);
        };
      })(member);
      SubClass._classMembers[name] = SubClass[name];
    };

    if (this._classMembers) {
      for (var name in this._classMembers) {
        addMember(name, this._classMembers[name]);
      }
    }

    for (var name in classProps) {
      addMember(name, classProps[name]);
    }

    // propagate instance props
    for (var name in instanceProps) {
      var _isFn = isFn(instanceProps[name]);
      prototype[name] = !_isFn ? instanceProps[name] : (function(name, fn) {
          return function() {
            // add a super method that points to the prototype's method
            var tmpSuper = this._super;
            this._super = _super[name];

            var tmpMembers = [];
            if (opts.exposeClassMembers && this._class._classMembers) {
              for (var _name in this._class._classMembers) {
                if (this[_name] !== undefined) {
                  continue;
                }
                tmpMembers.push(_name);
                var member = this._class._classMembers[_name];
                this[_name] = !isFn(member) ? member : function() {
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

    // make this class extendable
    SubClass._extend = arguments.callee;

    return SubClass;
  };


  // returns an instance of a class with a list of constructor arguments
  // (this is like "apply" for constructors)
  Class._construct = function(cls, args) {
    var Class = function() {
      return cls.apply(this, args || []);
    };
    Class.prototype = cls.prototype;
    return new Class();
  };


  // converts arbitrary protoype-style classes to our Class definition
  Class._convert = function(cls, name, opts) {

    // create properties, starting with the init function required by Class
    var instanceProps = {
      init: function() {
        var args = Array.prototype.slice.call(arguments);
        // simply create an instance of our target class
        this[name] = Class._construct(cls, args);
      }
    };

    // create wrappers for all members and bind them
    Object.keys(cls.prototype).forEach(function(member) {
      if (member == "init") {
        return;
      }
      instanceProps[member] = function() {
        return this[name][member].apply(this[name], arguments);
      };
    });

    // finally, create and return our new class
    return Class._extend(instanceProps, {}, opts);
  };

  return Class;
});
