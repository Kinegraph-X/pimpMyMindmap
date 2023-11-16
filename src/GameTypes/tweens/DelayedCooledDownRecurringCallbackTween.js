
const GameState = require('src/GameTypes/gameSingletons/GameState');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedCooledDownRecurringCallbackTween
 * @param {() => Void} cb
 * @param {Number} interval
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} propName
 */
const DelayedCooledDownRecurringCallbackTween = function(target, cbName, interval, iterationCount, argsAsArray = [], scope = null, propName = '', offsetFromRootTimestamp) {
	DelayedTween.call(this, target, undefined, undefined, undefined, offsetFromRootTimestamp);
	this.cbName = cbName;
	this.argsAsArray = argsAsArray || new Array();
	this.scope = scope;
	this.propName = propName;
	this.interval = interval;
	this.iterationCount = iterationCount;
	this.currentIteration = 0;
	
	this.currentPartialStep = this.interval;
}
DelayedCooledDownRecurringCallbackTween.prototype = Object.create(DelayedTween);
DelayedCooledDownRecurringCallbackTween.prototype.objectType = 'DelayedCooledDownRecurringCallbackTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedCooledDownRecurringCallbackTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
//	console.log(timestamp, GameState().rootTimestamp + this.offsetFromRootTimestamp);
	this.lastStepTimestamp = timestamp;
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp) {
		return;
	}
	
	stepCount *= frameDuration / this.baseFrameDuration;
	this.currentPartialStep += stepCount;
	
//	console.log(stepCount, this.currentPartialStep);
	if (this.currentPartialStep < this.interval) {
		return;
	}
	else {
		if (this.currentIteration >= this.iterationCount - 1) {
			this.ended = true;
		}
		this.currentPartialStep = 0;
		this.currentIteration++;
	}
	
	
	if (this.scope)
		// @ts-ignore cause we can't explicitly declare the type of "scope"
		return this.target[this.cbName](this.scope[this.propName]);
	else if (this.argsAsArray.length) {
//		console.log(this.argsAsArray);
//		setTimeout(this.target[this.cbName].bind(this.target, this.argsAsArray[0]), 64);
		return this.target[this.cbName].apply(this.target, this.argsAsArray);
	}
	else {
//		setTimeout(this.target[this.cbName].bind(this.target), 64);
		return this.target[this.cbName]();
	}
}

/**
 * @method testOutOfScreen
 */
DelayedCooledDownRecurringCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}





module.exports = DelayedCooledDownRecurringCallbackTween;