# node-oo

Port of John Resig's lightweight OO model to Nodejs extended by common OO features.


## Installation

node-oo is hosted at [npmjs](https://www.npmjs.org/package/node-oo). Install it via:

```
npm install node-oo
```


## Examples

#### Simple Inheritance

```javascript
var Class = require("node-oo");

var Cat = Class._extend({

  // constructor
  init: function(color) {
    this.color = color;
  },

  // instance method
  meow: function() {
    console.log("An abstract cat cannot meow!");
  },
  
  // instance method
  getColor: function() {
    return this.color;
  }

});

var GrumpyCat = Cat._extend({

  // constructor
  init: function() {
    this._super("greyish");
  },

  // instance method
  meow: function() {
    console.log("Nah, not in the mood.");
  }

});

var cat = new Cat("black");
cat.meow(); // "An abstract cat cannot meow!"

var grumpy = new GrumpyCat();
grumpy.meow(); // "Nah, not in the mood."
grumpy.getColor(); // "greyish", same as grumpy.color

```


#### Class members

```javascript
var Class = require("node-oo");

var Cat = Class._extend({

  // constructor
  init: function(color) {
    this.color = color;
  },

  // instance method
  meow: function() {
    console.log("An abstract cat cannot meow!");
  }

}, {
  family: "Felidae",
  
  getFamily: function() {
  	console.log(this.family);
  }
});

Cat.getFamily()); // "Felidae", same as Cat.family

```


#### Options

- ``exposeClassMembers`` (``boolean``, default: ``false``): If set tot ``true``, class members become accessible within the scope of instance methods.


#### Converting Prototyped Classes

You can convert classed that are based on prototypes into node-oo classes.

```javascript
// example using nodejs

var Class        = require("node-oo");
var EventEmitter = require("events").EventEmitter;

var Emitter = Class._convert(EventEmitter);

var emitter = new Emitter();
emitter.on("topic", function() { ... });
emitter.emit("topic", ...);
});

```

The instance of the (original) prototyped classes is stored as ``__ClassProto`` in each instance.


## API

#### Classes

Classes have the following attributes:

- ``_extend`` (``function(instanceMembers, classMembers, options)``): Derives a new class with ``instanceMembers`` and ``classMembers`` ([example](#simple-inheritance)).
- ``_extends`` (``function(Class)``): Returns ``true`` (``false``) if ``Class`` is (is not) **a** super class.
- ``_superClass`` (``Class``): The super class (not available for the base ``Class``).
- ``_subClasses`` (``array``): An array containing all (**directly inheriting**) sub classes.
- ``_classMembers`` (``object``): All class members stored by their keys. **Please note** that all class members can be accessed directly ([example](#class-members)).


The base ``Class`` has additional attributes that are not propagated to derived classes:

- ``_convert`` (``Function(cls, options)``): - Converts a prototype based class ``cls`` into a node-oo class ([example](#converting-prototyped-classes)).


#### Instances

All instances have the following attributes:

- ``_class`` (``Class``): The class of this instance

Within instance methods, the *super* method is always referenced as ``_super``. 

If the option ``exposeClassMembers`` is ``true``, each instance can directly access class members **within instance methods**. You can use the ``_class`` attribute outside of instance methods or if ``exposeClassMembers`` is ``false``.





## Development

- Source hosted at [GitHub](https://github.com/riga/node-oo)
- npm module hosted at [npmjs](https://www.npmjs.org/package/node-oo)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/riga/node-oo/issues)


## Authors

Marcel R. ([riga](https://github.com/riga))


