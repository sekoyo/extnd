# Extnd

Extend is based off Jon Resig's [Simple JavaScript Inhertitance](http://ejohn.org/blog/simple-javascript-inheritance/)  blog post with the added support for multiple inheritance and AMD & NodeJS loaders. It is also lint-free and removes a superfluous check which breaks Closure Compiler. This inheritence system has been tested on large production apps for desktop and mobile.

It is recommended you import `extnd.js` using a CJS or AMD loader. Otherwise `Class` will be added to `window` and you could have name collisions.

## Usages

For your `constructor` method use `init` instead.

	var Animal = Class.extnd({
		init: function(name) {
			this.name = name;
		},

		getName: function() {
			return this.name;
		}
	});

And to inherit:

	var Bird = Animal.extnd({
		init: function() {
			this._super.apply(this, arguments);
			console.log('Animal says my name is', this.getName());
		}
	});

You can string extensions together (multiple inheritance):

	var HummingBird = Animal.extnd(Bird).extnd({
		flapsVeryFast: true,
		carefulWithThisObject: {
			flapCount: 0
		},

		fastFlapping: function() {
			// wow, much flapping
			this.carefulWithThisObject.flapCount++;
		}
	});

It is worth noting that `flapsVeryFast` and `carefulWithThisObject` variable exists in the class-scope. `flapsVeryFast` is a primitive and so it will be copied to all instances. However `carefulWithThisObject` is an Object and it will be shared, therefore making a `flapCount` incrementor here a bad idea as all instances will increment it. To create variables in instance-scope create them inside a Function e.g. `this.carefulWithThisObject = ...`

# License

Released under the MIT license (see LICENSE for jargon).
