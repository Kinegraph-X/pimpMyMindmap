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

const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');


/**
 * @constructor LeafSprite
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionEnd
 * @param {PIXI.Texture} texture
 * //@param {Boolean} isReversed
 */
const LeafSprite = function(positionStart, positionEnd, texture) {
	Sprite.call(this);
	this.maxSteps = 2;
	this.stepCount = 3;
	this.currentStep = 0;
	this.path = [];
	this.positionStart = positionStart;
	this.positionEnd = positionEnd;
	this.positions = this.getPositions();
	this.branchletSpawnPoints = this.getBranchletSpawnPoints();
	this.durationForBranchlets = 8;
	
	this.spriteObj = this.getSprite(texture);
}
LeafSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
LeafSprite.prototype.objectType = 'LeafSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * //@param {Boolean} isReversed
 * @return {PIXI.SimpleRope}
 */
LeafSprite.prototype.getSprite = function(texture) {
	this.getPath();
	this.currentStep++;
	
	const sprite = new PIXI.SimpleRope(texture, this.path);
	
	return sprite;
}

LeafSprite.prototype.getNextStepForPath = function(duration = 1) {
	this.movingUpdatePath(duration);
	this.currentStep++;
}

LeafSprite.prototype.getPath = function() {
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
}

LeafSprite.prototype.movingUpdatePath = function(duration) {
	let branchletSprite,
		spriteCallbackName = 'getNextStepForPath',
		branchletAnimationSteps = 2;
	this.durationForBranchlets = Math.max(this.durationForBranchlets, duration);
	
	switch(this.currentStep) {
		case 0 :
			// can't be called on step 0
			break;
		case 1 :
			// Branchlet
			branchletSprite = new BranchletSprite(
				this.branchletSpawnPoints[0][0],
				this.branchletSpawnPoints[0][1],
				this.branchletSpawnPoints[0][2],
				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
				false
			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
			GameLoop().pushTween(
				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
			);
			// Branchlet 2
			branchletSprite = new BranchletSprite(
				this.branchletSpawnPoints[1][0],
				this.branchletSpawnPoints[1][1],
				this.branchletSpawnPoints[1][2],
				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
				false
			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
			GameLoop().pushTween(
				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
			);
			
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[1],
					new CoreTypes.Transform(
						this.positions[1].x.value,
						this.positions[1].y.value
					),
					duration
				)
			);
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[2],
					new CoreTypes.Transform(
						this.positions[1].x.value,
						this.positions[1].y.value
					),
					duration
				)
			);
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[3],
					new CoreTypes.Transform(
						this.positions[1].x.value,
						this.positions[1].y.value
					),
					duration
				)
			);
			break;
		case 2 :
			// Branchlet 3
			branchletSprite = new BranchletSprite(
				this.branchletSpawnPoints[2][0],
				this.branchletSpawnPoints[2][1],
				this.branchletSpawnPoints[2][2],
				loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'branchlet0' + this.getRandomBranchlet(3)],
				false
			);
//			GameLoop().addSpriteToScene(
//				branchletSprite
//			);
			GameLoop().pushTween(
				new DelayedCooledDownWeightedRecurringCallbackTween(branchletSprite, spriteCallbackName, this.durationForBranchlets, branchletAnimationSteps, 0)
			);
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[2],
					new CoreTypes.Transform(
						this.positions[2].x.value,
						this.positions[2].y.value
					),
					duration
				)
			);
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[3],
					new CoreTypes.Transform(
						this.positions[2].x.value,
						this.positions[2].y.value
					),
					duration
				)
			);
			break;
		case 3 :
			GameLoop().pushTween(
				new TargetPositionTween(
					this.path[3],
					new CoreTypes.Transform(
						this.positions[3].x.value,
						this.positions[3].y.value
					),
					duration
				)
			);
			break;
		default : break;
	}
}

/**
 * @method getPositions
 * @return Array<CoreTypes.Point>
 */
LeafSprite.prototype.getPositions = function() {
	const xOffset = (this.positionEnd.x.value - this.positionStart.x.value) / 4,
		verticalOffset = (this.positionStart.y.value - this.positionEnd.y.value) / 4;
	return [
		new CoreTypes.Point(
			this.positionStart.x.value,
			this.positionStart.y.value
		),
		new CoreTypes.Point(
			this.positionStart.x.value + xOffset,
			this.positionEnd.y.value + verticalOffset
		),
		new CoreTypes.Point(
			this.positionStart.x.value + xOffset * 2,
			this.positionEnd.y.value
		),
		new CoreTypes.Point(
			this.positionEnd.x.value,
			this.positionEnd.y.value
		)
	];
}

/**
 * @method getBranchletSpawnPoints
 * @return Array<CoreTypes.Point>
 */
LeafSprite.prototype.getBranchletSpawnPoints = function() {
	const hypot = BranchletSprite.prototype.defaultDimensions.x.value,
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
			this.positions[0].x.value + (this.positions[1].x.value - this.positions[0].x.value) / 7,
			this.positions[0].y.value + (this.positions[1].y.value - this.positions[0].y.value) / 7
		),
		secondBranchLengthPoint = new CoreTypes.Point(
			this.positions[0].x.value + (this.positions[1].x.value - this.positions[0].x.value) * .31,
			this.positions[0].y.value + (this.positions[1].y.value - this.positions[0].y.value) * .31
		),
		thirdBranchLengthPoint = new CoreTypes.Point(
			this.positions[0].x.value + (this.positions[1].x.value - this.positions[0].x.value) * .84,
			this.positions[0].y.value + (this.positions[1].y.value - this.positions[0].y.value) * .84
		);;
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
				thirdBranchLengthPoint.x.value,
				thirdBranchLengthPoint.y.value
			),
			new CoreTypes.Point(
				thirdBranchLengthPoint.x.value + x3 / 2,
				thirdBranchLengthPoint.y.value + y3 / 2
			),
			new CoreTypes.Point(
				thirdBranchLengthPoint.x.value + x3,
				thirdBranchLengthPoint.y.value + y3
			)
		]
	];
}

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




module.exports = LeafSprite;