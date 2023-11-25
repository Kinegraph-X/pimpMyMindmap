const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const {levels, mainSpaceShipLifePoints, lootSpritesTextures, maxLootsByType, objectTypes, plasmaBlastDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const {windowSize, cellSize, gridCoords, getFoeCell} = require('src/GameTypes/grids/gridManager');

const Player = require('src/GameTypes/gameSingletons/Player');
let GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');

const Sprite = require('src/GameTypes/sprites/Sprite');
const Tween = require('src/GameTypes/tweens/Tween');

/** 
 * @constructor GameObjectFactory
*/
const GameObjectFactory = function() {

}
//GameObjectFactory.prototype = {};

/**
 * @method newObject
 * @param {String} objectType
 * @param {boolean} [addToScene = true] addToScene
 * @param {Array<Number|String|Boolean>} [metadata = new Array()] metadata
 * @param {Sprite} [refToSprite = null] refToSprite
 * @return Void
 */
GameObjectFactory.prototype.newObject = function(objectType, addToScene, metadata, refToSprite) {
	switch (objectType) {
		case objectTypes.background:
			this.createBg();
			break;
		default:
			console.error('Attempting to create a game object with a name that has not been defined: ' + objectType)
	}
}


/**
 * @method createBg
 * @return Void
 */
GameObjectFactory.prototype.createBg = function() {
	const bgZoom = 1.8;
	const worldMapBack = new TilingSprite(
		new CoreTypes.Dimension(GameLoop().windowSize.x.value, GameLoop().windowSize.y.value),
		// @ts-ignore loadedAssets.prop unknown
		loadedAssets[0].bgBack,
		bgZoom,
		null
	);
	// @ts-ignore name is a convenience prop to bypass outOfScreen
	worldMapBack.name = 'bgLayer';
	
	const worldMapBackTween = new TileTween(GameLoop().windowSize, worldMapBack, CoreTypes.TweenTypes.add, new CoreTypes.Point(0, 25), .1, false);
	
	GameLoop().addAnimatedSpriteToScene(worldMapBack, worldMapBackTween);
}


/**
 * @method getBlastColor
 * @param {Number} foeType
 */
GameObjectFactory.prototype.getBlastColor = function(foeType) {
	return foeType % 2 === 0 ? 'Orange' : 'Green';
}

/**
 * @method getRandomFoe
 * @param {Number} count
 */
GameObjectFactory.prototype.getRandomFoe = function(count) {
	return Math.floor(Math.random() * count).toString();
}

/**
 * @method getRandomExplosionOffset
 * Helper mthod
 * @param {Number} shipDimension
 * @return Void
 */
GameObjectFactory.prototype.getRandomExplosionOffset = function(shipDimension) {
	return Math.round((Math.random() - .5) * shipDimension / 2);
}

/**
 * @method getRandomLootType
 * @return {'0'|'1'|'2'|'3'}
 */
GameObjectFactory.prototype.getRandomLootType = function () {
	// @ts-ignore TS doesn't understand the algo
	return (Math.floor(Math.random() * 1.9)).toString(); // shall be Math.floor(Math.random() * lootTypesCount)
}




// @ts-ignore singleton pattern
var gameObjectsFactory;

/**
 *
 */
module.exports = function() {
	// @ts-ignore singleton pattern
	if (typeof gameObjectsFactory !== 'undefined')
		// @ts-ignore singleton pattern
		return gameObjectsFactory;
	else
		return (gameObjectsFactory = new GameObjectFactory());
};