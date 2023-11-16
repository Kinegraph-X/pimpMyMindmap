
const GameState = require('src/GameTypes/gameSingletons/GameState');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedCooledDownWeightedRecurringCallbackTween
 * @param {() => Void} cb
 * @param {Number} interval
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} propName
 */
const DelayedCooledDownWeightedRecurringCallbackTween = function(target, cbName, interval, iterationCount, offsetFromRootTimestamp) {
	DelayedTween.call(this, target, undefined, undefined, undefined, offsetFromRootTimestamp);
	this.cbName = cbName;
	this.interval = interval;
	this.iterationCount = iterationCount;
	this.currentIteration = 0;
	this.weights = [];
	
	// TODO: get rid of these hard-coded weights, find a loop to give a heavier weight to the central points
	if (iterationCount === 2)
		this.weights = [0, 2/3, 4/3];
	else if (iterationCount === 3)
		this.weights = [0, 4/3, 2/3, 3/3];
	else if (iterationCount === 4)
		this.weights = [0, 1/3, 20/6, 1/6, 1/6];
	else {
		this.weights.push(0);
		for (let i = 0, l = iterationCount; i < l; i++) {
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
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp) {
		return;
	}
	
	stepCount *= frameDuration / this.baseFrameDuration;
	this.currentPartialStep += stepCount;
	
	if (this.currentPartialStep < this.interval * this.weights[this.currentIteration]) {
		return;
	}
	else {
		if (this.currentIteration >= this.iterationCount - 1) {
			this.ended = true;
		}
		this.currentPartialStep = 0;
		this.currentIteration++;
	}
	
	return this.target[this.cbName].call(this.target, Math.max(2, this.interval * this.weights[this.currentIteration]));
}

/**
 * @method testOutOfScreen
 */
DelayedCooledDownWeightedRecurringCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}





module.exports = DelayedCooledDownWeightedRecurringCallbackTween;