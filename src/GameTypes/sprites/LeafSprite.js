/**
 * @typedef {Object} PIXI.Point
 * @typedef {Object} PIXI.Texture
 * @typedef {Object} PIXI.SimpleRope
 * @typedef {import('src/GameTypes/gameSingletons/AppTypes').BranchOptions} BranchOptions
 */

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<{[key:String] : PIXI.Texture}>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const {themeDescriptors, defaultInterpolationStepCount, branchletAnimationSteps, curveTypes} = require('src/GameTypes/gameSingletons/gameConstants');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const Sprite = require('src/GameTypes/sprites/Sprite');
const BranchletSprite = require('src/GameTypes/sprites/BranchletSprite');
const TargetPositionTween = require('src/GameTypes/tweens/TargetPositionTween');

const {Bezier} = require('src/GameTypes/splines/Bezier');

const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');


/**
 * @constructor LeafSprite
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionEnd
 * @param {PIXI.Texture} texture
 * @param {BranchOptions} options
 */
const LeafSprite = function(positionStart, positionEnd, texture, options) {
	Sprite.call(this);
	this.currentStep = 1;
	this.path = Array();
	this.positionStart = positionStart;
	this.positionEnd = positionEnd;
	this.options = Object.assign({}, options);
	this.effectiveStepCount = this.stepCount;
	
	this.refPositions = this.getRefPositions();
	this.positions = Array();
	
	// Handle animated or preBuilt display
	if (options.animated) {
		this.getPath = this.getInitialStatePath;
	}
	else {
		this.getPath = this.getPreBuiltPath;
		this.getNextStepForPath = this.noOp
	}
	
	this.getPath();
	this.branchletSpawnPoints = this.getBranchletSpawnPoints();
	
	this.spriteObj = this.getSprite(texture);
}
LeafSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
LeafSprite.prototype.objectType = 'LeafSprite';
/**
 * @static {Number} stepCount
 */
LeafSprite.prototype.stepCount = defaultInterpolationStepCount;

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * @return {PIXI.SimpleRope}
 */
LeafSprite.prototype.getSprite = function(texture) {
	// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
	return new PIXI.SimpleRope(texture, this.path);
}

/**
 * @method getNextStepForPath
 * @param {Number} duration
 * @return void
 */
LeafSprite.prototype.getNextStepForPath = function(duration = 1) {
	this.movingUpdatePath(duration);
	this.currentStep++;
}

/**
 * @method getPreBuiltPath
 * @return void
 */
LeafSprite.prototype.getPreBuiltPath = function() {
	const spline = new Bezier(this.refPositions);
	const lut = spline.getLUT(this.stepCount);
	
	for (let i = 0, l = this.stepCount; i <= l; i++) {
		// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
		this.path.push(new PIXI.Point(lut[i].x, lut[i].y));
		this.positions.push(new CoreTypes.Point(lut[i].x, lut[i].y));
	}
}

/**
 * @method getInitialStatePath
 * @return void
 */
LeafSprite.prototype.getInitialStatePath = function() {
	const spline = new Bezier(this.refPositions);
	const lut = spline.getLUT(this.stepCount);
	
	for (let i = 0, l = this.stepCount; i <= l; i++) {
		// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
		this.path.push(new PIXI.Point(this.refPositions[0].x, this.refPositions[0].y));
		this.positions.push(new CoreTypes.Point(lut[i].x, lut[i].y));
	}
}

/**
 * @method movingUpdatePath
 * @param {Number} duration
 */
LeafSprite.prototype.movingUpdatePath = function(duration) {
	const maxDurationForBranchlets = Math.max(this.options.maxDurationForBranchlets, duration);
	let branchletStepIndex = 0;
	
	if ((branchletStepIndex = this.options.branchletStepIndicesforLeaves.indexOf(this.currentStep)) !== -1)
		this.addNewBranchlet(branchletStepIndex, maxDurationForBranchlets);
	
	this.updateAtCurrentStep(duration);
}



/**
 * @method updateAtCurrentStep
 * @param {Number} duration
 * @return void
 */
LeafSprite.prototype.updateAtCurrentStep = function(duration) {
	for (let i = this.currentStep + 1, l = this.stepCount; i <= l; i++) {
		this.path[i].x = this.positions[this.currentStep + 1].x.value;
		this.path[i].y = this.positions[this.currentStep + 1].y.value;

//		GameLoop().pushTween(
//			new TargetPositionTween(
//				this.path[i],
//				new CoreTypes.Transform(
//					this.positions[this.currentStep].x.value,
//					this.positions[this.currentStep].y.value
//				),
//				duration
//			)
//		);
	}
}

/**
 * @method getRefPositions
 * @return Array<CoreTypes.Simple3DPoint>
 */
LeafSprite.prototype.getRefPositions = function() {
	const xOffset = (this.positionEnd.x.value - this.positionStart.x.value) / 4,
		verticalOffset = (this.positionStart.y.value - this.positionEnd.y.value) / 4;
	if (this.options.curveType === curveTypes.singleQuad) {
		return [
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + xOffset,
				this.positionEnd.y.value + verticalOffset
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + xOffset * 2,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
	}
	else {
		return [
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + xOffset,
				this.positionEnd.y.value + verticalOffset
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + xOffset * 2,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
	}
}

/**
 * @method getBranchletSpawnPoints
 * @return Array<CoreTypes.Point>
 */
LeafSprite.prototype.getBranchletSpawnPoints = function() {
	const hypot = BranchletSprite.prototype.defaultDimensions.x.value;
	let pointList = Array(),
		randomAngle = 0,
		x = 0,
		y = 0;
	
	/** @function cb @param {Number} branchletIndex */
	const cb = function(branchletIndex) {
		randomAngle = this.getRandomBranchletAngle();
		x = Math.cos(randomAngle) * hypot;
		y = Math.sin(randomAngle) * hypot;
		pointList.push(
			[
				new CoreTypes.Point(
					this.positions[branchletIndex].x.value,
					this.positions[branchletIndex].y.value
				),
				new CoreTypes.Point(
					this.positions[branchletIndex].x.value + x / 2,
					this.positions[branchletIndex].y.value + y / 2
				),
				new CoreTypes.Point(
					this.positions[branchletIndex].x.value + x,
					this.positions[branchletIndex].y.value + y
				)
			]
		)
	}
	this.options.branchletStepIndicesforLeaves.forEach(cb, this);
	
	return pointList;
}

/**
 * @method addNewBranchlet
 * @param {Number} branchletStepIndex
 * @param {Number} maxDurationForBranchlets
 */
LeafSprite.prototype.addNewBranchlet = function(branchletStepIndex, maxDurationForBranchlets) {
	const branchletSprite = new BranchletSprite(
		this.branchletSpawnPoints[branchletStepIndex][0],
		this.branchletSpawnPoints[branchletStepIndex][1],
		this.branchletSpawnPoints[branchletStepIndex][2],
		loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + this.branchLetNameConstant + this.getRandomBranchlet(3)],
		false
	);
	GameLoop().addSpriteToScene(
		branchletSprite
	);
	GameLoop().pushTween(
		new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, this.spriteCallbackName, maxDurationForBranchlets, branchletAnimationSteps, 0)
	);
}

/**
 * @method getRandomBranchletAngle
 */
LeafSprite.prototype.getRandomBranchletAngle = function() {
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	const angle = Math.atan2((this.positionEnd.y.value - this.positionStart.y.value), (this.positionEnd.x.value - this.positionStart.x.value));
	
	return angle - (Math.random() * (Math.PI / 4) * Math.ceil(Math.random() * 3 - 1.999));
}

/**
 * @method getRandomLeaf
 * @param {Number} count
 */
LeafSprite.prototype.getRandomBranchlet = function(count) {
	return Math.abs(Math.floor(Math.random() * count - .0001)).toString();
}

/**
 * @static {CoreTypes.Dimension} defaultSpaceShipDimensions
 */
LeafSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	377,
	144
);

/**
 * @static {String} spriteCallbackName
 */
LeafSprite.prototype.spriteCallbackName = 'getNextStepForPath';


/**
 * @static {String} branchLetNameConstant
 */
LeafSprite.prototype.branchLetNameConstant = 'branchlet0';

/**
 * @static @method noOp
 */
LeafSprite.prototype.noOp = function() {}




module.exports = LeafSprite;