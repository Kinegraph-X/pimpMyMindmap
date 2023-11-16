
const GameState = require('src/GameTypes/gameSingletons/GameState');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedOneShotCallbackTween
 * @param {() => Void} cb
 * @param {Number} interval
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} propName
 */
const DelayedOneShotCallbackTween = function(target, cbName, delay, argsAsArray = [], scope = null, propName = '') {
	DelayedTween.call(this, target, undefined, undefined, undefined, delay);
	this.cbName = cbName;
	this.argsAsArray = argsAsArray || new Array();
	this.scope = scope;
	this.propName = propName;
}
DelayedOneShotCallbackTween.prototype = Object.create(DelayedTween);
DelayedOneShotCallbackTween.prototype.objectType = 'DelayedOneShotCallbackTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedOneShotCallbackTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp)
		return;
	
	this.ended = true;
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
DelayedOneShotCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}





module.exports = DelayedOneShotCallbackTween;