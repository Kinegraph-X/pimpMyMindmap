/**
 * @typedef {import('src/GameTypes/Sprites/BranchSprite')} BranchSprite
 * @typedef {import('src/GameTypes/Sprites/LeafSprite')} LeafSprite
 * @typedef {import('src/GameTypes/Sprites/BranchletSprite')} BranchletSprite
 */
/**
 * @typedef {Object} PIXI.Sprite
 */
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const DelayedTween = require('src/GameTypes/tweens/DelayedTween');


/**
 * @constructor DelayedWeightedPropFadeOneShotCallbackTween
 * @param {BranchSprite|LeafSprite|BranchletSprite} target
 * @param {String} cbName
 * @param {Number} delay
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} scopedPropName
 * @param {PIXI.Sprite} fadedTarget
 * @param {String} affectedProp
 * @param {Number} offset
 * @param {Number} transformDuration
 */
const DelayedWeightedPropFadeOneShotCallbackTween = function(target, cbName, delay, argsAsArray = [], scope = null, scopedPropName = '', fadedTarget, affectedProp, offset, transformDuration) {
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
	this.weights = Array();
}
DelayedWeightedPropFadeOneShotCallbackTween.prototype = Object.create(DelayedTween);
DelayedWeightedPropFadeOneShotCallbackTween.prototype.objectType = 'DelayedWeightedPropFadeOneShotCallbackTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedWeightedPropFadeOneShotCallbackTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	let offset = 0;
	this.lastStepTimestamp = timestamp;
	// @ts-ignore inherited property
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
			// @ts-ignore inherited property
			return this.target[this.cbName].apply(this.target, this.argsAsArray);
		}
		else {
			this.callbackCalled = true;
			// @ts-ignore inherited property
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
		// @ts-ignore PIXI
		this.fadedTarget[this.affectedProp] = this.offset;
	}
	else {
		// @ts-ignore transformInterval is inherited
		offset = this.offset * stepCount / this.transformDuration;
		// @ts-ignore PIXI
		this.fadedTarget[this.affectedProp] = (new CoreTypes.Coord(this.fadedTarget[this.affectedProp]))[this.type](offset);
	}
}

/**
 * @method testOutOfScreen
 */
DelayedWeightedPropFadeOneShotCallbackTween.prototype.testOutOfScreen = function() {
	return false;
}





module.exports = DelayedWeightedPropFadeOneShotCallbackTween;