/**
 * @typedef {Object} PIXI.Texture
 */



const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const Sprite = require('src/GameTypes/sprites/Sprite');

//const {bossDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');


/**
 * @constructor RootSprite
 * @param {CoreTypes.Point} position
 * @param {PIXI.Texture} texture
 */
const RootSprite = function(position, texture) {
	Sprite.call(this);
	
	this.spriteObj = this.getSprite(texture);
	
	this.x = position.x.value;
	this.y = position.y.value;
	this.width = this.defaultDimensions.x.value;
	this.height = this.defaultDimensions.y.value;
}
RootSprite.prototype = Object.create(Sprite.prototype);
/**
 * @static {String} objectType
 */
RootSprite.prototype.objectType = 'RootSprite'; 

/**
 * @method getSprite
 * @param {PIXI.Texture} texture
 * //@return {PIXI.Sprite}
 */
RootSprite.prototype.getSprite = function(texture) {
	// @ts-ignore
	const sprite = PIXI.Sprite.from(texture);
	sprite.anchor.set(0, 0.5);
	
	return sprite;
}


/**
 * @static {CoreTypes.Dimension} defaultSpaceShipDimensions
 */
RootSprite.prototype.defaultDimensions = new CoreTypes.Dimension(
	205,
	195
);




module.exports = RootSprite;