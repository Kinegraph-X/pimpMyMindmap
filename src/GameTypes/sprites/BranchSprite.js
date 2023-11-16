/**
 * @typedef {Object} PIXI.Texture
 * @typedef {Object} PIXI.SimpleRope
 */

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const Sprite = require('src/GameTypes/sprites/Sprite');
const BranchletSprite = require('src/GameTypes/sprites/BranchletSprite');
const TargetPositionTween = require('src/GameTypes/tweens/TargetPositionTween');

const CubicSpline = require('src/GameTypes/splines/CubicSpline');
const {Bezier} = require('src/GameTypes/splines/Bezier');

const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');


/**
 * @constructor BranchSprite
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionEnd
 * @param {PIXI.Texture} texture
 * @param {Boolean} isReversed
 */
const BranchSprite = function(positionStart, positionEnd, texture, options) {
	Sprite.call(this);
	this.currentStep = 1;
	this.subInterval = 8;
	this.path = [];
	this.positionstart = positionStart;
	this.positionEnd = positionEnd;
	this.options = {
		isReversed : options.isReversed,
		animated : options.animated
	};
	this.refPositions = this.getPositions();
	this.positions = [];
	this.branchletSpawnPoints = this.getBranchletSpawnPoints();
	this.durationForBranchlets = 8;
	
	// Handle animated or preBuilt display
	if (options.animated) {
//		this.getPath = this.getPreBuiltPath;
		this.getPath = this.getInitialStatePath;
	}
	else {
		this.getPath = this.getPreBuiltPath;
		this.getNextStepForPath = this.noOp
	}

	this.getPath();
	this.spriteObj = this.getSprite(texture);
}
BranchSprite.prototype = Object.create(Sprite.prototype);
BranchSprite.prototype.stepCount = 12;
/**
 * @static {String} objectType
 */
BranchSprite.prototype.objectType = 'BranchSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * @return {PIXI.SimpleRope}
 */
BranchSprite.prototype.getSprite = function(texture) {
	return new PIXI.SimpleRope(texture, this.path);
}

/**
 * @method getNextStepForPath
 * @param {Number} duration
 * @return void
 */
BranchSprite.prototype.getNextStepForPath = function(duration = 1) {
	this.movingUpdatePath(duration);
	this.currentStep++;
}

/**
 * @method getPreBuiltPath
 * @return void
 */
BranchSprite.prototype.getPreBuiltPath = function() {
	const spline = new Bezier(this.refPositions);
	const lut = spline.getLUT(this.stepCount);
	
	for (let i = 0, l = this.stepCount; i <= l; i++) {
		this.path.push(new PIXI.Point(lut[i].x, lut[i].y));
	}
}

/**
 * @method getInitialStatePath
 * @return void
 */
BranchSprite.prototype.getInitialStatePath = function() {	
	const spline = new Bezier(this.refPositions);
	const lut = spline.getLUT(this.stepCount);
	
	for (let i = 0, l = this.stepCount; i <= l; i++) {
		this.path.push(new PIXI.Point(this.refPositions[0].x, this.refPositions[0].y));
		this.positions.push(new CoreTypes.Point(lut[i].x, lut[i].y));
	}
}

/**
 * @method movingUpdatePath
 * @param {Number} duration
 * @return void
 */
BranchSprite.prototype.movingUpdatePath = function(duration) {
	let branchletSprite,
		spriteCallbackName = 'getNextStepForPath',
		branchletAnimationSteps = 2;
	this.durationForBranchlets = Math.max(this.durationForBranchlets, duration);
	
	switch(this.currentStep) {
		case 0 :
			// can't be called on step 0
			break;
//		case 1 :
//			this.updateAllPointsToCurrentStepPosition();
//			this.updateAtCurrentStep(duration);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[5],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			break;
//		case 2 :
			// Branchlet
//			branchletSprite = new BranchletSprite(
//				this.branchletSpawnPoints[0][0],
//				this.branchletSpawnPoints[0][1],
//				this.branchletSpawnPoints[0][2],
//				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
//				this.isReversed
//			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
//			GameLoop().pushTween(
//				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
//			);
			
//			this.updateAllPointsToCurrentStepPosition();
//			this.updateAtCurrentStep(duration);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[3],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[4],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[5],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			break;
//		case 3 :
			// Branchlet
//			branchletSprite = new BranchletSprite(
//				this.branchletSpawnPoints[2][0],
//				this.branchletSpawnPoints[2][1],
//				this.branchletSpawnPoints[2][2],
//				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
//				this.isReversed
//			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
//			GameLoop().pushTween(
//				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
//			);
			// Branchlet 2
//			branchletSprite = new BranchletSprite(
//				this.branchletSpawnPoints[1][0],
//				this.branchletSpawnPoints[1][1],
//				this.branchletSpawnPoints[1][2],
//				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
//				this.isReversed
//			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
//			GameLoop().pushTween(
//				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
//			);
			
//			this.updateAllPointsToCurrentStepPosition();
//			this.updateAtCurrentStep(duration);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[4],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[5],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			break;
//		case 4 :
//			
//			this.updateAllPointsToCurrentStepPosition();
//			this.updateAtCurrentStep(duration);
//			GameLoop().pushTween(
//				new TargetPositionTween(
//					this.path[5],
//					new CoreTypes.Transform(
//						this.refPositions[this.currentStep + 1].x.value,
//						this.refPositions[this.currentStep + 1].y.value
//					),
//					duration
//				)
//			);
//			break;
		default : 
//			this.updateAllPointsToCurrentStepPosition();
			this.updateAtCurrentStep(duration);
			break;
	}
}

/**
 * @method updateAtCurrentStep
 * @param {Number} duration
 * @return void
 */
BranchSprite.prototype.updateAtCurrentStep = function(duration) {
	for (let i = this.currentStep, l = this.stepCount; i <= l; i++) {
//		console.log(this.UID, this.positions[this.currentStep].x.value, this.positions[this.currentStep].y.value);
		
		this.path[i].x = this.positions[this.currentStep].x.value;
		this.path[i].y = this.positions[this.currentStep].y.value;

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
 * @method movingUpdatePath
 * @param {Number} duration
 * @return void
 */
BranchSprite.prototype.updateAllPointsToCurrentStepPosition = function() {
	for (let i = this.currentStep, l = this.positions.length; i < l; i++) {
		this.path[i].x = this.positions[this.currentStep].x.value;
		this.path[i].y = this.positions[this.currentStep].y.value;
	}
}

/**
 * @method getPositions
 * @param {Boolean} isReversed
 * @return Array<CoreTypes.Point>
 */
/**
 * @method getPositions
 * @return Array<CoreTypes.Point>
 */
BranchSprite.prototype.getPositions = function() {
	const seededOffset = Math.random() * 4 + 16;
	const horizontalOffset1 = (this.positionEnd.x.value - this.positionstart.x.value) / 2,
		horizontalOffset2 = 29,
		verticalOffset = (this.positionEnd.y.value - this.positionstart.y.value) / 4;
	if (!this.options.isReversed)
		return [
			new CoreTypes.Simple3DPoint(
				this.positionstart.x.value,
				this.positionstart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionstart.x.value + horizontalOffset1,
				this.positionstart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value - horizontalOffset1,
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
				this.positionstart.x.value,
				this.positionstart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionstart.x.value - horizontalOffset1,
				this.positionstart.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionstart.x.value - horizontalOffset2,
				this.positionstart.y.value - verticalOffset
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value + horizontalOffset2,
				this.positionEnd.y.value + verticalOffset
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value + horizontalOffset1,
				this.positionEnd.y.value
			),
			new CoreTypes.Simple3DPoint(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
}
//BranchSprite.prototype.getPositions = function(isReversed) {
//	const seededOffset = Math.random() * 4 + 16;
//	const horizontalOffset1 = 12,
//		horizontalOffset2 = 29,
//		verticalOffset = (this.positionstart.y.value - this.positionEnd.y.value) / seededOffset;
//	if (!isReversed)
//		return [
//			new CoreTypes.Point(
//				this.positionstart.x.value,
//				this.positionstart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionstart.x.value + horizontalOffset1,
//				this.positionstart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionstart.x.value + horizontalOffset2,
//				this.positionstart.y.value - verticalOffset
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value - horizontalOffset2,
//				this.positionEnd.y.value + verticalOffset
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value - horizontalOffset1,
//				this.positionEnd.y.value
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value,
//				this.positionEnd.y.value
//			)
//		];
//	else
//		return [
//			new CoreTypes.Point(
//				this.positionstart.x.value,
//				this.positionstart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionstart.x.value - horizontalOffset1,
//				this.positionstart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionstart.x.value - horizontalOffset2,
//				this.positionstart.y.value - verticalOffset
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value + horizontalOffset2,
//				this.positionEnd.y.value + verticalOffset
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value + horizontalOffset1,
//				this.positionEnd.y.value
//			),
//			new CoreTypes.Point(
//				this.positionEnd.x.value,
//				this.positionEnd.y.value
//			)
//		];
//}

/**
 * @method getBranchletSpawnPoints
 * @return Array<CoreTypes.Point>
 */
BranchSprite.prototype.getBranchletSpawnPoints = function() {
	const hypot = BranchletSprite.prototype.defaultDimensions.y.value,
		randomAngle1 = this.getRandomBranchletAngle(),
		randomAngle2 = this.getRandomBranchletAngle(),
		randomAngle3 = this.getRandomBranchletAngle(),
		x1 = Math.cos(randomAngle1) * hypot,
		y1 = Math.sin(randomAngle1) * hypot,
		x2 = Math.cos(randomAngle2) * hypot,
		y2 = Math.sin(randomAngle2) * hypot,
		x3 = Math.cos(randomAngle3) * hypot,
		y3 = Math.sin(randomAngle3) * hypot,
		firstBranchLengthPoint = new CoreTypes.Point(
			this.refPositions[2].x + (this.refPositions[3].x - this.refPositions[2].x) / 7,
			this.refPositions[2].y + (this.refPositions[3].y - this.refPositions[2].y) / 7
		),
		secondBranchLengthPoint = new CoreTypes.Point(
			this.refPositions[3].x - ((this.refPositions[3].x - this.refPositions[2].x) * .38 * (Math.random() / 4 + 1)),
			this.refPositions[3].y - ((this.refPositions[3].y - this.refPositions[2].y) * .38 * (Math.random() / 4 + 1))
		);
	return [
		[
			new CoreTypes.Point(
				firstBranchLengthPoint.x.value,
				firstBranchLengthPoint.y.value
			),
			new CoreTypes.Point(
				firstBranchLengthPoint.x.value + x1 / 2,
				firstBranchLengthPoint.y.value + y1 / 2
			),
			new CoreTypes.Point(
				firstBranchLengthPoint.x.value + x1,
				firstBranchLengthPoint.y.value + y1
			)
		],
		[
			new CoreTypes.Point(
				secondBranchLengthPoint.x.value,
				secondBranchLengthPoint.y.value
			),
			new CoreTypes.Point(
				secondBranchLengthPoint.x.value + x2 / 2,
				secondBranchLengthPoint.y.value + y2 / 2
			),
			new CoreTypes.Point(
				secondBranchLengthPoint.x.value + x2,
				secondBranchLengthPoint.y.value + y2
			)
		],
		[
			new CoreTypes.Point(
				this.refPositions[3].x,
				this.refPositions[3].y
			),
			new CoreTypes.Point(
				this.refPositions[3].x + x3 / 2,
				this.refPositions[3].y + y3 / 2
			),
			new CoreTypes.Point(
				this.refPositions[3].x + x3,
				this.refPositions[3].y + y3
			)
		]
	];
}

BranchSprite.prototype.offsetPositionsAfterScale = function(marginTop) {
	this.refPositions.forEach(function(position) {
		position.y -= marginTop;
	});
	this.path.length = 0;
	this.getPath();
}

BranchSprite.prototype.getRandomBranchletAngle = function() {
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	Math.random();
	const angle = Math.atan2((this.positionEnd.y.value - this.positionstart.y.value), (this.positionEnd.x.value - this.positionstart.x.value));
	
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
 * @static {CoreTypes.Dimension} defaultSpaceShipDimensions
 */
BranchSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	99,
	32
);

/**
 * @static @method noOp
 */
BranchSprite.prototype.noOp = function() {}




module.exports = BranchSprite;