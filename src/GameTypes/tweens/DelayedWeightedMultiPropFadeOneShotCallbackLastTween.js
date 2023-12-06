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
 * @constructor DelayedWeightedMultiPropFadeOneShotCallbackLastTween
 * @param {BranchSprite|LeafSprite|BranchletSprite} target
 * @param {String} cbName
 * @param {Number} delay
 * @param {Array<Object>} argsAsArray
 * @param {Object|null} scope
 * @param {String} scopedPropName
 * @param {PIXI.Sprite} fadedTarget
 * @param {String[]} affectedProps
 * @param {Number[]} offsets
 * @param {Number} transformDuration
 * @param {String} easingFunctionName
 */
const DelayedWeightedMultiPropFadeOneShotCallbackLastTween = function(target, cbName, delay, argsAsArray = [], scope = null, scopedPropName = '', fadedTarget, affectedProps = [], offsets, transformDuration, easingFunctionName) {
	DelayedTween.call(this, target, undefined, undefined, undefined, delay);
	this.cbName = cbName;
	this.argsAsArray = argsAsArray || new Array();
	this.scope = scope;
	this.scopedPropName = scopedPropName;
	this.fadedTarget = fadedTarget;
	this.affectedProps = affectedProps;
	this.offsets = offsets;
	this.transformDuration = transformDuration;
	this.callbackCalled = false;
	this.currentFrame = 0;
	this.weights = Array();
	this.easingFunctionName = easingFunctionName;
	this.getWeightsFromEasingFunction(easingFunctionName);
	this.originalValues= {};
	this.affectedProps.forEach(function(propName) {
		if (propName === 'scale')
			this.originalValues[propName] = this.fadedTarget[propName].x;
		else
			this.originalValues[propName] = this.fadedTarget[propName];
	}, this);
}
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype = Object.create(DelayedTween);
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.objectType = 'DelayedWeightedMultiPropFadeOneShotCallbackLastTween';

/**
 * @method nextStep
 * @param {Number} stepCount
 * @param {Number} frameDuration
 * @param {Number} timestamp
 * @return Void
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.nextStep = function(stepCount, frameDuration, timestamp) {
	let offset = 0,
		currentWeight = 0;
	this.lastStepTimestamp = timestamp;
	// @ts-ignore inherited property
	if (timestamp < GameState().rootTimestamp + this.offsetFromRootTimestamp)
		return;
	
	// @ts-ignore baseFrameDuration is inherited
	stepCount *= frameDuration / this.baseFrameDuration;
	
	for(let i = 0; i < stepCount; i++) {
		currentWeight += this.weights[Math.round(this.currentFrame) + i];
	}
	currentWeight = currentWeight / stepCount;
	
	// @ts-ignore currentFrame is inherited
	this.currentFrame += stepCount;
	
	// @ts-ignore transformDuration is inherited
	if (this.currentFrame >= this.transformDuration) {
		this.ended = true;
		if (this.easingFunctionName === 'easeOutStaticElastic') {
			// force end of animation
			this.affectedProps.forEach(function(propName, key) {
				// @ts-ignore transformInterval is inherited
				offset = this.offsets[key];
				if (propName === 'scale') {
					// @ts-ignore PIXI
					this.fadedTarget[propName].set(this.originalValues[propName]);
				}
				else
					// @ts-ignore PIXI
					this.fadedTarget[propName] = this.originalValues[propName];
			}, this);
		}
		else {
			// prevent overflow
			this.affectedProps.forEach(function(propName, key) {
				// @ts-ignore transformInterval is inherited
				offset = this.offsets[key];
				if (propName === 'scale') {
					// @ts-ignore PIXI
					this.fadedTarget[propName].set(this.originalValues[propName] * offset);
				}
				else
					// @ts-ignore PIXI
					this.fadedTarget[propName] = (new CoreTypes.Coord(this.originalValues[propName]))[this.type](offset);
			}, this);
		}
		
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
	else {
		this.affectedProps.forEach(function(propName, key) {
			// @ts-ignore transformInterval is inherited
			offset = this.offsets[key] * currentWeight;
			
			if (propName === 'scale') {
				this.fadedTarget[propName].set(this.originalValues[propName] * currentWeight);
			}
			else
				// @ts-ignore PIXI
				this.fadedTarget[propName] = (new CoreTypes.Coord(this.originalValues[propName]))[this.type](offset);
		}, this);
	}
}

/**
 * @method testOutOfScreen
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.testOutOfScreen = function() {
	return false;
}

/**
 * @method getWeightsFromEasingFunction
 * @param {String} easingFunction
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.getWeightsFromEasingFunction = function(easingFunction) {
	// @ts-ignore Why aren't prop names strings ?
	return this[easingFunction]();
}

/**
 * @method easeOutElastic
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.easeOutElastic = function() {
	let frameIdx = 0; // * this.transformDuration
	for (let i = 0; i <= 1;  i +=  1 / this.transformDuration) {
		this.weights[frameIdx] = Math.pow(1 - i, 2) * Math.sin(i * 5 * Math.PI - Math.PI / 2) + 1;
		frameIdx++;
	}
}

/**
 * @method easeOutElastic
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.easeOutStaticElastic = function() {
	let frameIdx = 0; // * this.transformDuration
	for (let i = 0; i <= 1;  i +=  1 / this.transformDuration) {
		this.weights[frameIdx] = Math.pow(1 - i, 2) * Math.sin(i * 5 * Math.PI);
		frameIdx++;
	}
}

/**
 * @method easeOutCosOvershoot
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.easeOutCosOvershoot = function() {
	let frameIdx = 0; // * this.transformDuration
	for (let i = 0; i <= 1;  i +=  1 / this.transformDuration) {
		this.weights[frameIdx] = (Math.pow(-i, 2) * Math.cos(i * 1.99 * Math.PI) + 2) * Math.pow(i, 2) * (3 - 2 * i) * i;
		frameIdx++;
	}
}

/**
 * @method easeOutCosOvershoot
 */
DelayedWeightedMultiPropFadeOneShotCallbackLastTween.prototype.linear = function() {
	let frameIdx = 0; // * this.transformDuration
	for (let i = 0; i <= 1;  i +=  1 / this.transformDuration) {
		this.weights[frameIdx] = i;
		frameIdx++;
	}
}





module.exports = DelayedWeightedMultiPropFadeOneShotCallbackLastTween;