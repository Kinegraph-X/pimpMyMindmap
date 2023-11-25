/**
 * @typedef {import('src/GameTypes/Sprites/BranchSprite')} BranchSprite
 * @typedef {import('src/GameTypes/Sprites/LeafSprite')} LeafSprite
 * @typedef {import('src/GameTypes/Sprites/BranchletSprite')} BranchletSprite
 */
const GameState = require('src/GameTypes/gameSingletons/GameState');
const {curveTypes} = require('src/GameTypes/gameSingletons/gameConstants');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedCooledDownWeightedRecurringCallbackTween
 * @param {BranchSprite|LeafSprite|BranchletSprite} target
 * @param {String} cbName
 * @param {Number} interval
 * @param {Number} iterationCount
 * @param {Number} offsetFromRootTimestamp
 */
const DelayedCooledDownWeightedRecurringCallbackTween = function(target, cbName, interval, iterationCount, offsetFromRootTimestamp) {
	DelayedTween.call(this, target, undefined, undefined, undefined, offsetFromRootTimestamp);
	this.cbName = cbName;
	this.interval = interval;
	this.iterationCount = iterationCount;
	this.currentIteration = 0;
	this.weights = Array();
	
	this.debugDuration = 0;
	this.debugStarted = false;
	this.debugStartTime = 0;
	
	this.weights.push(0);
	// @ts-ignore : TS doesn't understand anything to prototypal inheritance
	if (this.target.options.curveType === curveTypes.quadCurve) {
		const halfCurve = Math.floor(iterationCount / 2);
		for (let i = 1, l = halfCurve; i < l; i++) {
			this.weights.push(1.9);
		}
		for (let i = halfCurve, l = iterationCount; i < l; i++) {
			this.weights.push(.1);
		}
	}
	else {
		for (let i = 1, l = iterationCount; i <= l; i++) {
			this.weights.push(1);
		}
	}
		
	// Initialized on a completed step, to trigger the cb on the first call to nextStep
	this.currentPartialStep = 1;
}
DelayedCooledDownWeightedRecurringCallbackTween.prototype = Object.create(DelayedTween);
DelayedCooledDownWeightedRecurringCallbackTween.prototype.objectType = 'DelayedCooledDownWeightedRecurringCallbackTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedCooledDownWeightedRecurringCallbackTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	this.lastStepTimestamp = timestamp;
	// @ts-ignore : TS doesn't understand anything to prototypal inheritance
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp) {
		return;
	}
	
//	if (!this.debugStarted) {
//		this.debugStartTime = (timestamp - GameState().rootTimestamp) / this.baseFrameDuration;
//		console.log('started', this.debugStartTime);
//		this.debugStarted = true;
//	}
	
	// @ts-ignore : TS doesn't understand anything to prototypal inheritance
	stepCount *= frameDuration / this.baseFrameDuration;
	this.currentPartialStep += stepCount;
	
	if (this.currentPartialStep < this.interval * this.weights[this.currentIteration]) {	//  
		return;
	}
	else {
//		this.debugDuration += this.interval * this.weights[this.currentIteration];

		this.currentPartialStep =  Math.round(this.currentPartialStep - this.interval * this.weights[this.currentIteration]); // Math.floor();	// anticipate accumulating error if we reset the partialStep on a long frame
//		console.log(this.currentPartialStep)
		this.currentIteration++;
		if (this.currentIteration === this.iterationCount - 1) {
//			if (this.target.objectType === 'BranchSprite') {
//				console.log(this.offsetFromRootTimestamp / this.baseFrameDuration, this.debugDuration + this.currentPartialStep - this.interval * this.weights[this.currentIteration], (timestamp - GameState().rootTimestamp) / this.baseFrameDuration - this.debugStartTime);
//			}
			this.ended = true;
//			return;
		}
	}
	// @ts-ignore : TS doesn't understand anything to prototypal inheritance
	return this.target[this.cbName].call(this.target, Math.max(2, this.interval * this.weights[this.currentIteration]));	//  
}

/**
 * @method testOutOfScreen
 */
DelayedCooledDownWeightedRecurringCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}

/**
 * @method updateAverageWeights
 * @param {Array<Number>} refWeights
 */
DelayedCooledDownWeightedRecurringCallbackTween.prototype.updateWeights = function(refWeights) {
	refWeights.forEach(function(weight, key) {
		this.weights[key] = weight;
	}, this)
}





module.exports = DelayedCooledDownWeightedRecurringCallbackTween;