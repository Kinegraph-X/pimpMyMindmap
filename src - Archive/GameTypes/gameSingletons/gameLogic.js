 
 /**
 * @typedef {Object} PIXI.Text										// Mock
 * @typedef {import('src/GameTypes/interfaces/Wounder')} Wounder
 * @typedef {import('src/GameTypes/sprites/Sprite')} Sprite
 * @typedef {import('src/GameTypes/sprites/TilingSprite')} TilingSprite
 * @typedef {import('src/GameTypes/sprites/FoeSpaceShip')} FoeSpaceShip
 * @typedef {import('src/GameTypes/sprites/Projectile')} Projectile
 * @typedef {import('src/GameTypes/sprites/StatusBarSprite')} StatusBarSprite
 */


const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes'); 
const {eventNames, levels, foeDescriptors, weapons, mainSpaceShipCollisionTypes, lootSpritesTypes, objectTypes} = require('src/GameTypes/gameSingletons/gameConstants');
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