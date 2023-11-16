/**
 * @typedef {Object} PIXI.Sprite
 */
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedPropFadeOneShotCallbackTween
 * @param {() => Void} cb
 * @param {Number} interval
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} scopedPropName
 * @param {PIXI.Sprite} fadedTarget
 * @param {String} affectedProp
 * @param {Number} offset
 * @param {Number} transformInterval
 */
const DelayedPropFadeOneShotCallbackTween = function(target, cbName, delay, argsAsArray = [], scope = null, scopedPropName = '', fadedTarget, affectedProp, offset, transformDuration) {
	DelayedTween.call(this, target, undefined, undefined, undefined, delay);
	this.cbName = cbName;
	this.argsAsArray = argsAsArray || new Array();
	this.scope = scope;
	this.scopedPropName = scopedPropName;
	this.fadedTarget = fadedTarget;
	this.affectedProp = affectedProp;
	this.offset = offset;
	this.transformDuration = transformDuration;
	this.callbackCalled = false;
	this.currentFrame = 0;
}
DelayedPropFadeOneShotCallbackTween.prototype = Object.create(DelayedTween);
DelayedPropFadeOneShotCallbackTween.prototype.objectType = 'DelayedPropFadeOneShotCallbackTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedPropFadeOneShotCallbackTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	let offset = 0;
	this.lastStepTimestamp = timestamp;
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp)
		return;
	
	if (!this.callbackCalled) {
		if (this.scope) {
			this.callbackCalled = true;
			// @ts-ignore cause we can't explicitly declare the type of "scope"
			return this.target[this.cbName](this.scope[this.scopedPropName]);
		}
		else if (this.argsAsArray.length) {
			this.callbackCalled = true;
	//		console.log(this.argsAsArray);
	//		setTimeout(this.target[this.cbName].bind(this.target, this.argsAsArray[0]), 64);
			return this.target[this.cbName].apply(this.target, this.argsAsArray);
		}
		else {
			this.callbackCalled = true;
	//		setTimeout(this.target[this.cbName].bind(this.target), 64);
			return this.target[this.cbName]();
		}
	}
	
	// @ts-ignore baseFrameDuration is inherited
	stepCount *= frameDuration / this.baseFrameDuration;
	
	// @ts-ignore currentFrame is inherited
	this.currentFrame += stepCount;
	
	// @ts-ignore transformDuration is inherited
	if (this.currentFrame >= this.transformDuration) {
		this.ended = true;
		// prevent overflow
		this.fadedTarget[this.affectedProp] = this.offset;
	}
	else {
		// @ts-ignore transformInterval is inherited
		offset = this.offset * stepCount / this.transformDuration;
		// @ts-ignore target is inherited
		this.fadedTarget[this.affectedProp] = (new CoreTypes.Coord(this.fadedTarget[this.affectedProp]))[this.type](offset);
	}
}

/**
 * @method testOutOfScreen
 */
DelayedPropFadeOneShotCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}





module.exports = DelayedPropFadeOneShotCallbackTween;