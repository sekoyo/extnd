// Initially http://ejohn.org/blog/simple-javascript-inheritance/
(function() {
	'use strict';

	// Throw error if trying to call a super that doesn't exist.
	var unImplementedSuper = function(method) {
		throw 'Super does not implement this method: ' + method;
	};

	// Used to test if the method has a super.
	var superTest = /\b_super\b/;

	// Used to mark a function so it can be unwrapped.
	var REF = '__extndmrk__';
 
	// The base Class implementation (does nothing)
	this.Class = function(){};

	// Create a new Class that inherits from this class
	Class.extnd = function (protoProps) {
		var parent = this,
			child,
			prop,
			_super = parent.prototype;
		// Allow class inheritance.
		if (typeof protoProps === 'function' && '__super__' in protoProps) {
			// Copy parent's prototype.
			var mixin = {}, attr;
			for (attr in protoProps.prototype) {
				if (attr !== 'constructor' &&
					protoProps.prototype.hasOwnProperty(attr)) {
					mixin[attr] = protoProps.prototype[attr];
				}
			}
			protoProps = mixin;
		}

		// The constructor calls the init method - all construction logic happens
		// in this method.
		child = function() {
			if (this.init) {
				this.init.apply(this, arguments);
			}
		};

		// Extend `extnd` and `__super__` into child.
		for (prop in parent) {
			child[prop] = parent[prop];
		}

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();
		child.prototype.__unwrappedSuper__ = {};

		// Add prototype properties (instance properties) to the subclass, if supplied.
		if (protoProps) {
			// Extend parent prototypes into child.
			for (prop in protoProps) {
				child.prototype[prop] = protoProps[prop];
			}

			// A function wrapper which assigns this._super for the duration of the call,
			// then marks the function so it can be unwrapped and re-wrapped for the next
			// call which allows for proper multiple inheritance.
			var functionWrapper = function (name, fn) {
				var func = function class_super() {
					var tmp = this._super;

					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name] || unImplementedSuper(name);

					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret;
					try {
						ret = fn.apply(this, arguments);
					} finally {
						this._super = tmp;
					}
					return ret;
				};
				func[REF] = true;
				return func;
			};

			// Copy the properties over onto the new prototype
			for (var name in protoProps) {
				// Check if we're overwriting an existing function
				if (typeof protoProps[name] === 'function' &&  superTest.test(protoProps[name])) {
					var fun = child.prototype[name];
					if (fun[REF]) {
						protoProps[name] = child.prototype.__unwrappedSuper__[name];
					}

					child.prototype.__unwrappedSuper__[name] = protoProps[name];
					child.prototype[name] = functionWrapper(name, protoProps[name]);
				}
			}
		}

		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;

		return child;
	};

	// Expose.
	if (typeof module !== 'undefined' && module.exports) {
		// CommonJS / Node.js
		module.exports = Class;
	} else if (typeof define !== 'undefined' && define.amd) {
		// AMD / RequireJS
		define(function() {
			return Class;
		});
	} else if (typeof window !== 'undefined') {
		// Browser
		window.Class = Class;
	}

}).call(this);