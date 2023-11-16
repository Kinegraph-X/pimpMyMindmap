/**
 * @typedef {Object} PIXI.Texture
 * @typedef {Object} PIXI.SimpleRope
 */



const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const Sprite = require('src/GameTypes/sprites/Sprite');
const TargetPositionTween = require('src/GameTypes/tweens/TargetPositionTween');


/**
 * @constructor BranchletSprite
 * @param {CoreTypes.Point} positionStart
 * @param {CoreTypes.Point} positionMid
 * @param {CoreTypes.Point} positionEnd
 * @param {PIXI.Texture} texture
 * @param {Boolean} isReversed
 */
const BranchletSprite = function(positionStart, positionMid, positionEnd, texture, isReversed = false) {
	Sprite.call(this);
	this.currentStep = 0;
	this.path = [];
	this.positionStart = positionStart;
	this.positionMid = positionMid;
	this.positionEnd = positionEnd;
	this.positions = this.getPositions(isReversed);
	
//	if (isReversed) {
//		this.positions.forEach(function(position) {
//			console.log(position.x.value, position.y.value)
//		});
//	}
	
	this.spriteObj = this.getSprite(texture);
}
BranchletSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
BranchletSprite.prototype.objectType = 'BranchletSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * @return {PIXI.SimpleRope}
 */
BranchletSprite.prototype.getSprite = function(texture) {
	this.getPath();
	this.currentStep++;
	
	const sprite = new PIXI.SimpleRope(texture, this.path);
	
	return sprite;
}

/**
 * @method getNextStepForPath
 * @param {Number} duration
 * @return void
 */
BranchletSprite.prototype.getNextStepForPath = function(duration = 1) {
	this.movingUpdatePath(duration);
	this.currentStep++;
}

/**
 * @method getPath
 * @return void
 */
BranchletSprite.prototype.getPath = function() {
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
	this.path.push(new PIXI.Point(this.positions[0].x.value, this.positions[0].y.value));
}

/**
 * @method movingUpdatePath
 * @param {Number} duration
 * @return void
 */
BranchletSprite.prototype.movingUpdatePath = function(duration) {
	switch(this.currentStep) {
		case 0 :
			// can't be called on step 0
			break;
		case 1 :
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
			break;
		case 2 :
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
		default : break;
	}
}

/**
 * @method getPositions
 * @param {Boolean} isReversed
 * @return Array<CoreTypes.Point>
 */
BranchletSprite.prototype.getPositions = function(isReversed) {
//	const seededOffset = Math.random() * 4 + 16;
	
//	if (!isReversed)
		return [
			new CoreTypes.Point(
				this.positionStart.x.value,
				this.positionStart.y.value
			),
			new CoreTypes.Point(
				this.positionMid.x.value,
				this.positionMid.y.value
			),
			new CoreTypes.Point(
				this.positionEnd.x.value,
				this.positionEnd.y.value
			)
		];
//	else
//		return [
//			new CoreTypes.Point(
//				this.positionStart.x.value,
//				this.positionStart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionStart.x.value - horizontalOffset1,
//				this.positionStart.y.value
//			),
//			new CoreTypes.Point(
//				this.positionStart.x.value - horizontalOffset2,
//				this.positionStart.y.value - verticalOffset
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
}

/**
 * @static {CoreTypes.Dimension} defaultSpaceShipDimensions
 */
BranchletSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	105,
	142
);




module.exports = BranchletSprite;