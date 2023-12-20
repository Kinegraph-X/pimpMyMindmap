/**
 * @typedef {{[key : String] : Number}} LayoutNode		// mock
 */

/**
 * @typedef {{[key : String] : Number}|String} FrameworkEventData		// mock
 * @typedef {{[key : String] : FrameworkEventData}} FrameworkEvent		// mock
 */


const App = require('src/core/AppIgnition');
const {EventEmitter} = require('src/core/CoreTypes');
const TypeManager = require('src/core/TypeManager');

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});
const {themeDescriptors, ThemeDescriptorsFactory} = require('src/GameTypes/gameSingletons/gameConstants');

const {windowSize} = require('src/GameTypes/grids/gridManager');
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const GameState = require('src/GameTypes/gameSingletons/GameState');




/**
 * @constructor EditorHelper
 */
const EditorHelper = function() {
	
}
EditorHelper.prototype = Object.create(EventEmitter.prototype)


module.exports = EditorHelper;