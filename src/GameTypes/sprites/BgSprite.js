/**
 * @typedef {Object} PIXI.Texture
 */

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
///** @type {Array<Object>} */
//let loadedAssets = null;
//AssetsLoader.then(function(loadedBundles) {
//	loadedAssets = loadedBundles;
//});


const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const Sprite = require('src/GameTypes/sprites/Sprite');



/**
 * @constructor BgSprite
 * @param {PIXI.Texture} texture
 */
const BgSprite = function(texture) {
	
	Sprite.call(this);
	this.spriteObj = this.getSprite(texture);
	
	this.x = 0;
	this.y = 0;
	this.width = this.defaultDimensions.x.value;
	this.height = this.defaultDimensions.y.value;
}
BgSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
BgSprite.prototype.objectType = 'BgSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * //@return {PIXI.Sprite}
 */
BgSprite.prototype.getSprite = function(texture) {
	// @ts-ignore
	const sprite = PIXI.Sprite.from(texture);
//	sprite.cursor = 'pointer';
//	sprite.interactive = true;
	return sprite;
}

/**
 * @method centerOnCanvas
 * @param {CoreTypes.Point} canvasDimensions
*/
BgSprite.prototype.centerOnCanvas = function(canvasDimensions) {
	let zoomFactor = 1, centeringOffsetX = 0, centeringOffsetY = 0;
		
		if (canvasDimensions.x.value / canvasDimensions.y.value >  this.defaultDimensions.x.value / this.defaultDimensions.y.value) {
			zoomFactor = canvasDimensions.x.value / this.defaultDimensions.x.value;
			centeringOffsetY = (canvasDimensions.y.value - this.defaultDimensions.y.value * zoomFactor) / 2;
		}
		else {
			zoomFactor = canvasDimensions.y.value / this.defaultDimensions.y.value;
			centeringOffsetX = (canvasDimensions.x.value - this.defaultDimensions.x.value * zoomFactor) / 2;
		}
		
		this.scaleX = zoomFactor;
		this.scaleY = zoomFactor;
		this.x += centeringOffsetX;
		this.y += centeringOffsetY;
}

/**
 * @static {CoreTypes.Dimension} defaultDimensions
 */
BgSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	1024,
	1024
);




module.exports = BgSprite;