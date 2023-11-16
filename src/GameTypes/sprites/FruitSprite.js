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
 * @constructor FruitSprite
 * @param {CoreTypes.Point} position
 * @param {CoreTypes.Point} dimensions
 * @param {PIXI.Texture} texture
 */
const FruitSprite = function(position, dimensions, texture) {
	
	Sprite.call(this);
	this.spriteObj = this.getSprite(texture);
	
	this.x = position.x.value;
	this.y = position.y.value;
	this.width = dimensions.x.value;
	this.height = dimensions.x.value * this.defaultDimensions.y.value / this.defaultDimensions.x.value;
}
FruitSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
FruitSprite.prototype.objectType = 'FruitSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * //@return {PIXI.Sprite}
 */
FruitSprite.prototype.getSprite = function(texture) {
	// @ts-ignore
	const sprite = PIXI.Sprite.from(texture);
	sprite.anchor.set(0, .5);
	return sprite;
}



/**
 * @static {CoreTypes.Dimension} defaultDimensions
 */
FruitSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	880,
	868
);




module.exports = FruitSprite;