/**
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
 * @constructor BranchSprite
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionEnd
 * @param {PIXI.Texture} texture
 * @param {BranchOptions} options
 */
const BranchSprite = function(positionStart, positionEnd, texture, options) {
	Sprite.call(this);
	this.currentStep = 0;
	this.path = Array();
	this.positionStart = positionStart;
	this.positionEnd = positionEnd;
	this.totalDistance = 0;
	this.options = Object.assign({}, options);
	
	this.minDistanceForAnimation = this.defaultMinDistanceForAnimation;
	if (this.options.curveType === curveTypes.doubleQuad)
		this.effectiveStepCount = defaultInterpolationStepCount * 2 + 1;
	else
		this.effectiveStepCount = defaultInterpolationStepCount + 1;
	this.animationTriggersCount = this.effectiveStepCount;		// we update to position[24] on step 23 (=> don't call me on step 24) 
	
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
	
	this.distances = Array();
	this.averageWeights = Array();
	this.measureDistances();
	
	this.spriteObj = this.getSprite(texture);
}
BranchSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
BranchSprite.prototype.objectType = 'BranchSprite';
/**
 * @static {Number} stepCount
 */
BranchSprite.prototype.stepCount = defaultInterpolationStepCount;

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * @return {PIXI.SimpleRope}
 */
BranchSprite.prototype.getSprite = function(texture) {
	// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
	return new PIXI.SimpleRope(texture, this.path);
}

/**
 * @method getNextStepForPath
 * @param {Number} duration
 * @param {Boolean} droppedFrameCatchup
 * @return void
 */
BranchSprite.prototype.getNextStepForPath = function(duration = 1, droppedFrameCatchup) {
	this.movingUpdatePath(duration, droppedFrameCatchup);
	this.currentStep++;
}

/**
 * @method getPreBuiltPath
 * @return void
 */
BranchSprite.prototype.getPreBuiltPath = function() {
	
	if (this.options.curveType === curveTypes.doubleQuad) {
		const stepCount = this.stepCount;
		const spline1 = new Bezier(this.refPositions.slice(0, 4));
		const lut1 = spline1.getLUT(stepCount);
		for (let i = 0, l = stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut1[i].x, lut1[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(lut1[i].x, lut1[i].y));
		}
		
		const spline2 = new Bezier(this.refPositions.slice(3));
		const lut2 = spline2.getLUT(stepCount);
		for (let i = 1, l = stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut2[i].x, lut2[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(lut2[i].x, lut2[i].y));
		}
	}
	else {
		const spline = new Bezier(this.refPositions);
		const lut = spline.getLUT(this.stepCount);
		
		for (let i = 0, l = this.stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut[i].x, lut[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(lut[i].x, lut[i].y));
		}
	}
}

/**
 * @method getInitialStatePath
 * @return void
 */
BranchSprite.prototype.getInitialStatePath = function() {
	if (this.options.curveType === curveTypes.doubleQuad) {
		const stepCount = this.stepCount;
		const spline1 = new Bezier(this.refPositions.slice(0, 4));
		const lut1 = spline1.getLUT(stepCount);
		for (let i = 0, l = stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut1[i].x, lut1[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(this.refPositions[0].x, this.refPositions[0].y));
		}
		
		const spline2 = new Bezier(this.refPositions.slice(3));
		const lut2 = spline2.getLUT(stepCount);
		for (let i = 1, l = stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut2[i].x, lut2[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(this.refPositions[0].x, this.refPositions[0].y));
		}
	}
	else {	
		const spline = new Bezier(this.refPositions);
		const lut = spline.getLUT(this.stepCount);
		
		for (let i = 0, l = this.stepCount; i <= l; i++) {
			this.positions.push(new CoreTypes.Point(lut[i].x, lut[i].y));
			// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
			this.path.push(new PIXI.Point(this.refPositions[0].x, this.refPositions[0].y));
		}
	}
}

/**
 * @method movingUpdatePath
 * @param {Number} duration
 * @param {Boolean} droppedFrameCatchup
 * @return void
 */
BranchSprite.prototype.movingUpdatePath = function(duration, droppedFrameCatchup) {
	let branchletStepIndex = 0;
	const maxDurationForBranchlets = Math.max(this.options.maxDurationForBranchlets, duration);
	
	if ((branchletStepIndex = this.options.branchletStepIndicesforBranches.indexOf(this.currentStep)) !== -1)
		this.addNewBranchlet(branchletStepIndex, maxDurationForBranchlets);
	this.updateAtCurrentStep(duration, droppedFrameCatchup);
}

/**
 * @method updateAtCurrentStep
 * @param {Number} duration
 * @param {Boolean} droppedFrameCatchup
 * @return void
 */
BranchSprite.prototype.updateAtCurrentStep = function(duration, droppedFrameCatchup) {
	if (!droppedFrameCatchup && this.currentStep < this.effectiveStepCount - 1 && this.distances[this.currentStep] > this.minDistanceForAnimation) {
		for (let i = this.currentStep + 1, l = this.effectiveStepCount; i < l; i++) {
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[i],
					new CoreTypes.Transform(
						this.positions[this.currentStep + 1].x.value,
						this.positions[this.currentStep + 1].y.value
					),
					duration
				)
			);
		}
	}
	else if (this.currentStep > 0 && this.distances[this.currentStep - 1] <= this.minDistanceForAnimation) {
		for (let i = this.currentStep, l = this.effectiveStepCount; i < l; i++) {
			this.path[i].x = this.positions[this.currentStep].x.value;
			this.path[i].y = this.positions[this.currentStep].y.value;
		}
	}
}

/**
 * @method getPositions
 * @param {Boolean} isReversed
 * @return Array<CoreTypes.Point>
 */
/**
 * @method getRefPositions
 * @return Array<CoreTypes.Simple3DPoint>
 */
BranchSprite.prototype.getRefPositions = function() {
	const isHorizontal = Math.round(this.positionEnd.y.value - this.positionStart.y.value) === 0,
		middleHorizontalOffset = (this.positionEnd.x.value - this.positionStart.x.value) / 2,
		quarterOfMidHorizontalOffset = isHorizontal								// quarter is quarter of the half-distance
			? middleHorizontalOffset / 4
			: 0,
		horizontalOffset = !isHorizontal
			? middleHorizontalOffset
			: 0;
	let verticalOffset = Math.round((this.positionEnd.y.value - this.positionStart.y.value) / 2) + 1,	// + 1 => avoid dividing by zero
		verticalControlOffset = Math.abs(this.positionEnd.y.value - this.positionStart.y.value) > Math.abs(horizontalOffset) * 3 
			? (verticalOffset / Math.abs(verticalOffset)) * Math.abs(horizontalOffset)
			: verticalOffset;
	
	
	if (this.options.curveType === curveTypes.doubleQuad)
		return [
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + horizontalOffset + quarterOfMidHorizontalOffset,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + middleHorizontalOffset - quarterOfMidHorizontalOffset,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value - middleHorizontalOffset,
				this.positionEnd.y.value - verticalControlOffset
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value - middleHorizontalOffset + quarterOfMidHorizontalOffset,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value - horizontalOffset - quarterOfMidHorizontalOffset,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
	else
		return [
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionStart.x.value + horizontalOffset,
				this.positionStart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value - horizontalOffset,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
}

/**
 * @method getBranchletSpawnPoints
 * @return Array<CoreTypes.Point>
 */
BranchSprite.prototype.getBranchletSpawnPoints = function() {
	const hypot = BranchletSprite.prototype.defaultDimensions.x.value;
	let pointList = Array(),
		randomAngle = 0,
		x = 0,
		y = 0;
	
	this.options.branchletStepIndicesforBranches.forEach(function(branchletIndex) {
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
	}, this);
	
	return pointList;
}

/**
 * @method addNewBranchlet
 * @param {Number} branchletStepIndex
 * @param {Number} maxDurationForBranchlets
 */
BranchSprite.prototype.addNewBranchlet = function(branchletStepIndex, maxDurationForBranchlets) {
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

BranchSprite.prototype.getRandomBranchletAngle = function() {
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	const angle = Math.atan2((this.positionEnd.y.value - this.positionStart.y.value), (this.positionEnd.x.value - this.positionStart.x.value));
	
	return !this.options.isReversed
		? angle - (Math.random() * (Math.PI / 4) * Math.ceil(Math.random() * 3 - 1.999))
		: angle + (Math.random() * (Math.PI / 4) * Math.ceil(Math.random() * 3 - 1.999));
}

/**
 * @method getRandomLeaf
 * @param {Number} count
 */
BranchSprite.prototype.getRandomBranchlet = function(count) {
	return Math.abs(Math.floor(Math.random() * count - .0001)).toString();
}

/**
 * @method measureDistances
 * LATE-INITIALISATION of BranchSprite.prototype.averageWeights
 */
BranchSprite.prototype.measureDistances = function() {
	let lastPosition = new CoreTypes.Point(0, 0),
		distance = 0;
	
	this.positions.forEach(function(position) {
		if (lastPosition.x.value === 0 && lastPosition.y.value === 0) {
			lastPosition = position;
			return;
		}
		distance = Math.hypot(position.x.value - lastPosition.x.value, position.y.value - lastPosition.y.value);
		this.totalDistance += distance;
		this.distances.push(distance);
		lastPosition = position;
	}, this);
	
	this.averageWeights.push(0);
	this.distances.forEach(function(distance) {
		this.averageWeights.push((distance / this.totalDistance) * this.effectiveStepCount);
	}, this);
}

/**
 * @method updateGrownBranchCoordinates
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionEnd
 */
BranchSprite.prototype.updateGrownBranchCoordinates = function(positionStart, positionEnd) {
	this.positionStart = positionStart;
	this.positionEnd = positionEnd;
	this.refPositions = this.getRefPositions();
	this.updatePath();
}

/**
 * @method updatePath
 * @return void
 */
BranchSprite.prototype.updatePath = function() {
	if (this.options.curveType === curveTypes.doubleQuad) {
		const stepCount = this.stepCount;
		const spline1 = new Bezier(this.refPositions.slice(0, 4));
		const lut1 = spline1.getLUT(stepCount);
		for (let i = 0, l = stepCount; i <= l; i++) {
			this.path[i].x = lut1[i].x
			this.path[i].y = lut1[i].y
		}
		
		const spline2 = new Bezier(this.refPositions.slice(3));
		const lut2 = spline2.getLUT(stepCount);
		let cursor = stepCount;
		for (let i = 1, l = stepCount; i <= l; i++) {
			cursor++;
			this.path[cursor].x = lut2[i].x
			this.path[cursor].y = lut2[i].y;
		}
		
	}
	else {
		const spline = new Bezier(this.refPositions);
		const lut = spline.getLUT(this.stepCount);
		
		for (let i = 0, l = this.stepCount; i <= l; i++) {
			this.path[i].x = lut[i].x
			this.path[i].y = lut[i].y
		}
	}
}

/**
 * @static @method updateAverageWeights
 */
BranchSprite.prototype.updateAverageWeights = function() {
	this.averageWeights.length = 0;
	this.measureDistances();
}

/**
 * @static @method isBigBranch
 */
BranchSprite.prototype.isBigBranch = function() {
	this.minDistanceForAnimation = this.defaultMinDistanceForBigAnimation;
}

BranchSprite.prototype.plotPath = function() {
	let id;
	this.path.forEach(function(point, key) {
		id = new PIXI.Text(key, {fontSize : 8});
		id.x = point.x;
		id.y = point.y;
		GameLoop().stage.addChild(id);
	}, this);
}





/**
 * @static {CoreTypes.Dimension} defaultSpaceShipDimensions
 */
BranchSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	99,
	32
);

/**
 * @static {String} spriteCallbackName
 */
BranchSprite.prototype.spriteCallbackName = 'getNextStepForPath';


/**
 * @static {String} branchLetNameConstant
 */
BranchSprite.prototype.branchLetNameConstant = 'branchlet0';

/**
 * @static {Number} defaultMinDistanceForAnimation
 */
BranchSprite.prototype.defaultMinDistanceForAnimation = 15;

/**
 * @static {Number} defaultMinDistanceForBigAnimation
 */
BranchSprite.prototype.defaultMinDistanceForBigAnimation = 200;

/**
 * @static @method noOp
 */
BranchSprite.prototype.noOp = function() {}




module.exports = BranchSprite;