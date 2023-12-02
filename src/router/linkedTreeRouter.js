/**
 * @router jsLinkedTreeRouter 
 */

const FontFaceObserver = require('src/integrated_libs_&_forks/fontfaceobserver');

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GlobalHandler = require('src/helpers/GlobalHandler');


var classConstructor = function() {	
	
	/**
	 * @param {String} rootNodeSelector
	 */
	function init(rootNodeSelector) {
		/*
		 * globalHandler
		 * 	^ mapData
		 * 	^ instances of all helpers
		 * 	-> subscribes to events from APIHelper
		 *  -> subscribes to events from componentHelper
		 * 	getLoadingSpinner
		 * 	startLoadingSpinner
		 * 	stopLoadingSpinner
		 * 	handleNewMapData
		 * 	handleNewTheme
		 * 
		 * glHelper
		 *	initLoop
		 * 	delayGameLoopStart
		 * 	prepareAutoLoopEnd
		 * 	abortAutoLoopEnd
		 * 
		 * componentHelper
		 * 	^ events [newLayoutReady, mapChanged, themeChanged]
		 * 	createRootComponent
		 * 	createMapComponent
		 * 	resetMapCompoent
		 * 	createMapSelectorComponent
		 * 	createThemeSelectorComponent
		 * 
		 * APIHelper
		 * 	^ URLprefix
		 * 	^ events [newMapData]
		 * 	initEndpoints
		 *  getMapData
		 */
		
		// WAIT FOR THE FONT & LAUNCH !!!!!!!!!!! RASTER RENDERING
		/* Fontfaceobserver : (from the github) 
		 * If your font doesn't contain at least the latin "BESbwy" characters
		 * you must pass a custom test string to the load method.
		 * (here, null) 
		 */
		const globalHandler = new GlobalHandler(
			rootNodeSelector,
			document.querySelector('#map_data').textContent
		);
		(new FontFaceObserver('roboto')).load(null, 10000).then(function() {
			AssetsLoader.then(function() {
				globalHandler.componentsHelper.handleNewMapData(globalHandler.mapData, globalHandler.alignment);
				if (GameState().animableState === false)
					globalHandler.stopLoadingSpinner();
			});
		});
	}
	
	
	return {
		init : init
	}
}

module.exports = classConstructor;
