 /**
 * @typedef {Object} PIXI.Point
 * @typedef {import('src/GameTypes/sprites/Sprite')} Sprite
 */

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes'); 



/**
 * @constructor Tween
 * @param {CoreTypes.Dimension} windowSize
 * @param {Sprite | PIXI.Point} target
 * @param {CoreTypes.TweenTypes} type			// UNION{add, mult, div}
 * @param {CoreTypes.Transform} transform
 * @param {Number} speed
 * @param {Boolean} oneShot
 */
const Tween = function(windowSize, target, type, transform, speed, oneShot) {
	this.windowSize = windowSize;
//	console.log(target);
	this.target = target;
	this.type = type;
	this.oneShot = oneShot;
	this.ended = false;
	
	this.baseFrameDuration = 1000 / 60;
	this.transform = transform;
	this.duration = 0;
	this.shouldLoop = false;
	this.speed = speed || 1; 										// px.s-1
	this.currentStep = 0;
	this.lastStepTimestamp = 0;
	// collisionTestsRegister is a partial copy of the global collisionTest list
	// it's used to clean the collision tests when a foeSpaceShip goes out of the screen
	this.collisionTestsRegister = new Array();
}
//Tween.prototype = {};
Tween.prototype.objectType = 'Tween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
Tween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	stepCount *= frameDuration / this.baseFrameDuration;
	this.currentStep++;
	// @ts-ignore x is inherited
	this.target.x  = (new CoreTypes.Coord(this.target.x))[this.type](this.transform.x.value * stepCount * this.speed);
	// @ts-ignore y is inherited
	this.target.y  = (new CoreTypes.Coord(this.target.y))[this.type](this.transform.y.value * stepCount * this.speed);
	this.lastStepTimestamp = timestamp;
}

/**
 * @method testOutOfScreen
 */
Tween.prototype.testOutOfScreen = function() {
	if (this.target.objectType.match(/bgLayer/) || this.target.objectType.match(/flame/))
		return false;
	
	if (!this.target.enteredScreen && this.target.y - this.target.height / 2 > 0) {
		this.target.enteredScreen = true;
	}
	else if (!this.target.enteredScreen)
		return;
	
	if (this.target.objectType !== 'MainSpaceShip'
		&& this.target.enteredScreen
		&& (this.target.y + this.target.height / 2 < 0
			|| this.target.y - this.target.height > this.windowSize.y.value		// HACK we want to be sure something is far before removing it
			|| this.target.x + this.target.width / 2 < 0
			|| this.target.x - this.target.width / 2 > this.windowSize.x.value)
		) {
		return true;
	}
	else if (this.target.y + this.target.height < 0
			|| this.target.y > this.windowSize.y.value
			|| this.target.x + this.target.width < 0
			|| this.target.x > this.windowSize.x.value
		) {
		return true;
	}
		
	return false;
}

Tween.prototype.handleBoundaries = function() {
	
}









module.exports = Tween;