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
	var missedSteps = 0, currentIterationFrameCount = this.interval * this.weights[this.currentIteration];
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
	
	if (this.currentPartialStep < currentIterationFrameCount) {	//  
		return;
	}
	else {
//		console.log('currentIteration', this.currentIteration);
		this.debugDuration += this.interval * this.weights[this.currentIteration];

		this.currentPartialStep =  Math.round(this.currentPartialStep - currentIterationFrameCount); // Math.floor();	// anticipate accumulating error if we reset the partialStep on a long frame

		// In a situation of very low perfs, we could be in an "always overflowed" currentPartialStep
		// but triggering only one iteration each time we're called => the overflow shall accumulate, potentially hugely
		// Allow triggering more than one iteration when we've crossed more than one partial step
		// => this ensures the total tween has the right duration
		let nextIterationFrameCount = 0;
		for(let i = this.currentIteration + 1, l = this.iterationCount; i < l; i++) {
			nextIterationFrameCount = this.interval * this.weights[i];
			if (this.currentPartialStep >= nextIterationFrameCount) {
				this.currentPartialStep = Math.round(this.currentPartialStep - nextIterationFrameCount);
				console.log('dropped step');
				missedSteps++;
			}
			else
				break;
		}

		
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
	
	for(let i = 0, l = missedSteps; i < l; i++) {
		// @ts-ignore : TS doesn't understand anything to prototypal inheritance
		this.target[this.cbName].call(this.target, Math.max(2, currentIterationFrameCount));	//  
		this.currentIteration++;
		if (this.currentIteration === this.iterationCount - 1) {
			this.ended = true;
		}
		currentIterationFrameCount = this.interval * this.weights[this.currentIteration];
	}
	
	// @ts-ignore : TS doesn't understand anything to prototypal inheritance
	return this.target[this.cbName].call(this.target, Math.max(2, currentIterationFrameCount));	//  
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