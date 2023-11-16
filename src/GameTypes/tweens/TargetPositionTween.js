 /**
 * @typedef {Object} PIXI.Point
 * @typedef {import('src/GameTypes/sprites/Sprite')} Sprite
 */

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const {windowSize} = require('src/GameTypes/grids/gridManager');
const Tween = require('src/GameTypes/tweens/Tween');



/**
 * @constructor TargetPositionTween
 * @param {PIXI.Point} target
 * @param {CoreTypes.Transform} targetPosition
 */
const TargetPositionTween = function(target, targetPosition, duration) {
	Tween.call(this, windowSize, target, CoreTypes.TweenTypes.add, new CoreTypes.Point(), false);
	this.currentFrame = 0;
	this.targetPosition = targetPosition;
	this.duration = duration;
	this.initialPosition = new CoreTypes.Point(this.target.x, this.target.y);
	this.positionOffset = new CoreTypes.Point(this.targetPosition.x.value - this.target.x, this.targetPosition.y.value - this.target.y);
}
TargetPositionTween.prototype = Object.create(Tween.prototype);
TargetPositionTween.prototype.objectType = 'TargetPositionTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
TargetPositionTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	stepCount *= frameDuration / this.baseFrameDuration;
	this.currentFrame += stepCount;

	if (this.currentFrame > this.duration) {
//		console.log(this.target);
		this.target.x = this.targetPosition.x.value;
		this.target.y = this.targetPosition.y.value;
		this.ended = true;
		return;
	}
	
	// @ts-ignore x is inherited
	this.target.x  = (new CoreTypes.Coord(this.initialPosition.x.value))[this.type](this.positionOffset.x.value * this.currentFrame / this.duration);
	// @ts-ignore y is inherited
	this.target.y  = (new CoreTypes.Coord(this.initialPosition.y.value))[this.type](this.positionOffset.y.value * this.currentFrame / this.duration);
	this.lastStepTimestamp = timestamp;
}

/**
 * @method testOutOfScreen
 */
TargetPositionTween.prototype.testOutOfScreen = function() {

}

TargetPositionTween.prototype.handleBoundaries = function() {
	
}









module.exports = TargetPositionTween;