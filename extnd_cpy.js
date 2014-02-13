// Initially http://ejohn.org/blog/simple-javascript-inheritance/
(function() {
	'use strict';

	// Used to determine if values are of the language type Object
	var objectTypes = {
		'function': true,
		'object': true
	};

	// Used as a reference to the global object.
	var root = (objectTypes[typeof window] && window) || this;

	// Detect free variable `exports`.
	var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

	// Detect free variable `module`.
	var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

	// Detect free variable `global` from Node.js or Browserified code and use it as `root`.
	var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
	if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
		root = freeGlobal;
	}

	// Detect the popular CommonJS extension `module.exports`.
	var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

	// Throw error if trying to call a super that doesn't exist.
	var unImplementedSuper = function(method) {
		throw 'Super does not implement this method: ' + method;
	};

	// Used to test if the method has a super.
	var superTest = /\b_super\b/;

	var REF = '__extndmrk__';

	var extnd = function(protoProps, staticProps) {
		var parent = this,
			child,
			_super = parent.prototype;
		// Allow class inheritance
		if (typeof protoProps === 'function' && '__super__' in protoProps) {
			// Copy parents prototype
			var mixin = {}, attr;
			for (attr in protoProps.prototype) {
				if (attr !== 'constructor' &&
					protoProps.prototype.hasOwnProperty(attr)) {
					mixin[attr] = protoProps.prototype[attr];
				}
			}
			protoProps = mixin;
		}

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;
		child.prototype.__unwrappedSuper__ = {};

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) {
			_.extend(child.prototype, protoProps);

			// Copy the properties over onto the new prototype
			for (var name in protoProps) {
				// Check if we're overwriting an existing function
				if (typeof protoProps[name] == 'function' &&  superTest.test(protoProps[name])) {
					var fun = child.prototype[name];
					if (fun[REF]) {
						protoProps[name] = child.prototype.__unwrappedSuper__[name];
					}

					child.prototype.__unwrappedSuper__[name] = protoProps[name];
					child.prototype[name] = (function(name, fn) {
						var func = function backbone_super() {
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
					})(name, protoProps[name]);
				}
			}
		}

		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;

		return child;
	};

	// Export (borrowed from lodash).
	// Some AMD build optimizers like r.js check for condition patterns like the following:
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		// Expose Lo-Dash to the global object even when an AMD loader is present in
		// case Lo-Dash is loaded with a RequireJS shim config.
		// See http://requirejs.org/docs/api.html#config-shim
		root.extnd = extnd;

		// Define as an anonymous module so, through path mapping, it can be
		// referenced as the "underscore" module
		define(function() {
			return extnd;
		});
	}
	// Check for `exports` after `define` in case a build optimizer adds an `exports` object
	else if (freeExports && freeModule) {
		// In Node.js or RingoJS
		if (moduleExports) {
			(freeModule.exports = extnd).extnd = extnd;
		}
		// In Narwhal or Rhino -require
		else {
			freeExports.extnd = extnd;
		}
	}
	else {
		// In a browser or Rhino
		root.extnd = extnd;
	}

}).call(this);
