# Extnd

Extend is based off Jon Resig's [Simple JavaScript Inhertitance](http://ejohn.org/blog/simple-javascript-inheritance/)  blog post with the added support for multiple inheritance and AMD & CommonJS loaders. It is also lint-free and removes a superfluous check which breaks Closure Compiler. This inheritence system has been tested on large production apps for desktop and mobile.

It is recommended you import `extnd.js` using a CommonJS or AMD loader. Otherwise `Class` will be added to `window` and you could have name collisions.

Usage
=====

For your `constructor` method use `init` instead.

```javascript
var Animal = Class.extnd({
	init: function (name) {
		this.name = name;
	},

	getName: function () {
		return this.name;
	}
});
```

And to inherit:

```javascript
var Bird = Animal.extnd({
	init: function () {
		this._super.apply(this, arguments);
		console.log('Animal says my name is', this.getName());
	}
});
```
	
Note in the example above we call the parent method with `this._super`. This reference is dynamic in a way that supports multiple inheritance. You can of course call it in any way you would call a normal method:

```javascript
this._super([arg1[, arg2[, ...]]);
this._super.call(thisArg[, arg1[, arg2[, ...]]);
this._super.apply(thisArg, [argsArray]);
```

You can string extensions together (multiple inheritance):

```javascript
var HummingBird = Animal.extnd(Bird).extnd({
	flapsVeryFast: true,
	carefulWithThisObject: {
		flapCount: 0
	},

	fastFlapping: function () {
		// wow, much flapping
		this.carefulWithThisObject.flapCount++;
	}
});
```

It is worth noting that `flapsVeryFast` and `carefulWithThisObject` variable exists in the class-scope. `flapsVeryFast` is a primitive and so it will be copied to all instances. However `carefulWithThisObject` is an Object and it will be shared, therefore making a `flapCount` incrementor here a bad idea as all instances will increment it. To create variables in instance-scope create them inside a Function e.g. `this.carefulWithThisObject = ...`

## License

Released under the MIT license (see LICENSE for jargon).

## Credits

[Michal Kot](https://github.com/michalkot) for his multiple inheritance idea
