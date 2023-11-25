 /**
 * @typedef {import('src/GameTypes/sprites/Sprite')} Sprite
 */

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const {windowSize} = require('src/GameTypes/grids/gridManager');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const Tween = require('src/GameTypes/tweens/Tween');


/**
 * @constructor DelayedTween
 * @param {Sprite} target
 * @param {CoreTypes.TweenTypes} type
 * @param {CoreTypes.Transform} transform
 * @param {Number} speed
 * @param {Boolean} oneShot
 */
const DelayedTween = function(target, type = CoreTypes.TweenTypes.add, transform = new CoreTypes.Point(), speed = 1, offsetFromRootTimestamp) {
	Tween.call(this, windowSize, target, type, transform, speed, false);
//	console.log(this);
	this.offsetFromRootTimestamp = offsetFromRootTimestamp * this.baseFrameDuration;
}
DelayedTween.prototype = Object.create(Tween.prototype);

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	
	if (timestamp < GameState().rootTimestamp + this.this.offsetFromRootTimestamp)
		return;
	
//	// @ts-ignore baseFrameDuration is inherited
//	stepCount *= frameDuration / this.baseFrameDuration;
//	// @ts-ignore currentStep is inherited
//	this.currentStep++;
//	// @ts-ignore target is inherited
//	this.target.tilePositionX  = (new CoreTypes.Coord(this.target.tilePositionX))[this.type](this.transform.x.value * stepCount * this.speed);
//	// @ts-ignore target is inherited
//	this.target.tilePositionY  = (new CoreTypes.Coord(this.target.tilePositionY))[this.type](this.transform.y.value * stepCount * this.speed);
//	
//	this.lastStepTimestamp = timestamp;
}













module.exports = DelayedTween;