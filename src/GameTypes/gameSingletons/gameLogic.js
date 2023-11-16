 
 /**
 * @typedef {import('src/GameTypes/sprites/Sprite')} Sprite
 * @typedef {import('src/GameTypes/sprites/TilingSprite')} TilingSprite
 */


const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes'); 
const {eventNames, objectTypes} = require('src/GameTypes/gameSingletons/gameConstants');
const {windowSize, occupiedCells} = require('src/GameTypes/grids/gridManager');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const GameObjectsFactory = require('src/GameTypes/factories/GameObjectsFactory');

const Tween = require('src/GameTypes/tweens/Tween');






/**
 * @singleton gameLogic
 * Rules for the actual game
 */




module.exports = {

};