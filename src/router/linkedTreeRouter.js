/**
 * @router jsLinkedTreeRouter 
 */

const FontFaceObserver = require('src/integrated_libs_&_forks/fontfaceobserver');

const App = require('src/core/AppIgnition');
const TypeManager = require('src/core/TypeManager');
var APIendpointsManager = require('src/core/APIendpointsManager');


const ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');
const LayoutTreePrepare = require('src/_LayoutEngine/LayoutTreePrepare');




const PlantCreator = require('src/router/PlantCreator');

const {windowSize} = require('src/GameTypes/grids/gridManager');
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

const GlobalHandler = require('src/helpers/GlobalHandler');

const BgSprite = require('src/GameTypes/sprites/BgSprite');

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
		(new FontFaceObserver('roboto')).load(null, 10000).then(function() {
			AssetsLoader.then(function() {
				new GlobalHandler(
					rootNodeSelector,
					document.querySelector('#map_data').textContent
				)
			});
		});
	}
		
		
		
		
		
		
		
		
		
		
//		// FIRST INIT WITH DEFAULT DATA
//		const linkedTreeInstance
//		
//		// INIT SELECTORS FOR MAP_ID & THEME
//		var mapListSelector = linkedTreeInstance._children[0]._children[1],
//			themeListSelector = linkedTreeInstance._children[0]._children[2];
//		multiSourceProvider.agnosticSubscribeToEndPoint('list_maps/', mapListSelector);
//		multiSourceProvider.acquireAsync();
//		hackyThemeSelectorDecorator(themeListSelector);
//		hookLoadMapEventOnMapsSelector(mapListSelector, linkedTreeInstance, rootBoundingRect, rootNodeSelector, theme, alignment, prefix);
		
		
		
	
//	function representLayoutTreeAsBreadthFirst(layoutNodes) {
//		const levels = {};
//		let depth = '';
//		layoutNodes.forEach(function(layoutNode) {
//			if (typeof layoutNode.depth === 'undefined')
//				return;
//			
//			depth = layoutNode.depth.toString();
//			if (typeof levels[layoutNode.depth] === 'undefined')
//				levels[depth] = [];
//				
//			levels[depth].push(layoutNode);
//		});
//		return levels;
//	}
//	
//	function centerCanvas(canvasDimensions, canvas) {
//		let zoomFactor = 1, centeringOffsetX = 0, centeringOffsetY = 0;
////		const xOffset = canvasDimensions.x / 2 - (rootNode.layoutAlgo.offsets.getMarginInline() + rootNode.layoutAlgo.dimensions.getBorderInline() / 2);
////		const yOffset = canvasDimensions.y / 2 - (rootNode.layoutAlgo.offsets.getMarginBlock() + rootNode.layoutAlgo.dimensions.getBorderBlock() / 2);
//		
//		if (canvasDimensions.x - windowSize.x.value > canvasDimensions.y - windowSize.y.value) {
//			zoomFactor = windowSize.x.value / canvasDimensions.x;
//			centeringOffsetY = (windowSize.y.value - canvasDimensions.y * zoomFactor) / 2;
//		}
//		else {
//			zoomFactor = windowSize.y.value / canvasDimensions.y;
//			centeringOffsetX = (windowSize.x.value - canvasDimensions.x * zoomFactor) / 2;
//		}
//		
//		canvas.style.transform = `scale(${zoomFactor}, ${zoomFactor})`; //  translateX(${-canvasDimensions.x * zoomFactor / 2}px)
//		canvas.style.marginLeft = '-' + (canvasDimensions.x * (1 - zoomFactor) / 2 - centeringOffsetX).toString() + 'px';
//		canvas.style.marginTop = '-' + (canvasDimensions.y * (1 - zoomFactor) / 2 - centeringOffsetY).toString() + 'px';
//		
////		document.body.scroll(
////			(canvasDimensions.x * zoomFactor / 2 - windowSize.x.value) / 2 - xOffset,
////			(canvasDimensions.y * zoomFactor / 2 - windowSize.y.value) / 2 - yOffset
////		);
//	}
//	
//	/**
//	 * @method getMapDataFromAPI
//	 * @param {String} prefix
//	 * @param {String} mapId
//	 */
//	async function getMapDataFromAPI(prefix, mapId) {
//		var body = new FormData();
//		body.set('map_id', mapId);
//		
//		var options = {
//			method : 'POST',
//			body : body
//		}
//		var url = prefix + 'get_map/',
//			result = '';
//		await fetch(url, options).then(async function(response) {
//			await response.text().then(function(responseObj) {
//				result = JSON.parse(responseObj);
//			})
//		});
//		return result;
//	}
//	
//	/**
//	 * @method resetMap
//	 * @param {App.ComponentTypes.LinkedTreeComponent} linkedTreeInstance
//	 * @param {Object} mapData
//	 * @param {String} alignment
//	 */
//	function resetMap(linkedTreeInstance, mapData, alignment) {
//		var linkedTreeComponentDef = TypeManager.mockGroupDef();
//		linkedTreeComponentDef.getGroupHostDef().sOverride = [
//			{
//				selector : ':host',
//				opacity: '0'
//		  	}
//		];
//		linkedTreeInstance.removeChildAt(1);
//		var newMap = new App.componentTypes.LinkedTreeComponent(
//			linkedTreeComponentDef,
//			linkedTreeInstance.view,
//			null,
//			mapData,
//			alignment
//		);
//		linkedTreeInstance.addChildAt(newMap, 1);
//		
//	}
//	
//	/**
//	 * @method initializeMap
//	 */
//	function initializeMap(linkedTreeInstance, rootBoundingRect, rootNodeSelector, theme) {
//		
//		
//		const naiveDOM = linkedTreeInstance._children[1].getNaiveDOM();
//		
//		const styleSolver = new ComputedStyleSolver(
//			naiveDOM,
//			stylesheetsCollector.collectedSWrappers
//		);
//		styleSolver.CSSSelectorsMatcher.traverseDOMAndMatchSelectors(
//			naiveDOM,
//			styleSolver.CSSRulesBuffer
//		);
//		
//		styleSolver.CSSSelectorsMatcher.matches.results = styleSolver.CSSSelectorsMatcherRefiner.refineMatches(
//			styleSolver.CSSSelectorsMatcher.matches,
//			// HACK: naiveDOMRegistry & masterStyleRegistry
//			// would have been needed if we had gotten the naiveDOM from an outer IFrame
//			TypeManager.naiveDOMRegistry,
//			TypeManager.masterStyleRegistry
//		);
//		
//		
//		performance.mark('totalRendering');
//		const layoutRes = new LayoutTreePrepare(
//			naiveDOM,
//			stylesheetsCollector.collectedSWrappers,
//			TypeManager.masterStyleRegistry,
//			rootBoundingRect,
//			TypeManager.naiveDOMRegistry
//		);
//		performance.measure('bench_total_rendering', 'totalRendering');
//		console.log('layout', performance.getEntriesByName('bench_total_rendering')[performance.getEntriesByName('bench_total_rendering').length - 1].duration + ' ms');
//		
//		const nodesCache = TypeManager.layoutNodesRegistry.cache;
//		for (var UID in nodesCache) {
//			nodesCache[UID].canvasShape = nodesCache[UID].getCanvasShape();
//			nodesCache[UID].updateCanvasShapeDimensions();
//			nodesCache[UID].updateCanvasShapeOffsets();
//		}
//		
//		const pixiRendererComponent = linkedTreeInstance._children[2];
//		pixiRendererComponent.adaptHeightToContainer(layoutRes.finalViewportHeight, layoutRes.finalViewportWidth);
////		pixiRendererComponent.createAndPopulateStage(TypeManager.rasterShapesRegistry.cache);
//		pixiRendererComponent.view.getMasterNode().style.display = 'none';
//		
//		
//		// GAME LAUNCH
//		// Singleton init
//		GameLoop().windowSize = new CoreTypes.Point(
//			layoutRes.finalViewportWidth,
//			layoutRes.finalViewportHeight
//		);
//		GameLoop().applyResize();
//		
//		// Get a usable representation of the tree
//		const layoutTreeAsBreadthFirst = representLayoutTreeAsBreadthFirst(Object.values(TypeManager.layoutNodesRegistry.cache));
//		
//		// Append the view centered
//		document.querySelector(rootNodeSelector).prepend(GameLoop().renderer.view);
//		centerCanvas(
//			{
//				x : layoutRes.finalViewportWidth,
//				y : layoutRes.finalViewportHeight
//			},
//			GameLoop().renderer.view
//		);
//		
//		
//		
//		// Create Plants
//		new PlantCreator(layoutTreeAsBreadthFirst);
//		
//		// Launch
//		GameLoop().start();
//		clearTimeout(globalTimeout);
//		globalTimeout = setTimeout(GameLoop().stop.bind(GameLoop()), 180 * 1000);
//		
//		performance.mark('PIXI Rendering');
////					pixiRendererComponent.renderStage();
//		performance.measure('bench_pixi_rendering', 'PIXI Rendering');
//		console.log('debug rendering', performance.getEntriesByName('bench_pixi_rendering')[performance.getEntriesByName('bench_pixi_rendering').length - 1].duration + ' ms');
//		console.info('Ctrl + Q to leave the render-loop before the 3 min timeout');
//		layoutRes.finallyCleanLayoutTree();
//		
//		setTimeout(function() {
//			GameState().setRootTimestamp(GameLoop().currentTime);
//		}, 4096);
//	}
//	
//	/**
//	 * @method hackyThemeSelectorDecorator
//	 */
//	function hackyThemeSelectorDecorator(themeListSelector) {
//		// HACKY theme selector populate
//		const thunbnailPath = 'plugins/LinkedTree/assets/thumbnails/',
//			thumbnailExt = '.jpg';
//		/** @type {HTMLImageElement} */
//		let img,
//		/** @type {HTMLSpanElement} */
//			span,
//		/** @type {HTMLOptionElement} */
//			opt,
//			i = 1;
//		for(let themeName in themeDescriptors) {
//			themeListSelector.typedSlots[0].push(themeListSelector.typedSlots[0].newItem(themeName));
//			
////			themeListSelector._children[0]._children[i].addEventListener('update', function(e) {
////				console.log(e)
////			});
//			span = document.createElement('span');
//			span.textContent = themeName;
//			opt = themeListSelector._children[0]._children[i].view.getMasterNode();
//			opt.textContent = '';
//			opt.appendChild(span);
//			
//			img = document.createElement('img');
//			img.src = thunbnailPath + themeName + thumbnailExt;
//			img.onload = function(idx, optElem, e) {
//				optElem.prepend(e.target);	
//			}.bind(null, i, opt)
//			i++;
//		}
//	}
//	
//	/**
//	 * @method hookLoadMapEventOnMapsSelector
//	 */
//	function hookLoadMapEventOnMapsSelector(mapListSelector, linkedTreeInstance, rootBoundingRect, rootNodeSelector, theme, alignment, prefix) {
//		var mapData = '';
//		mapListSelector.addEventListener('update', function(e) {
//			var key = e.data.selfKey;
//			if (key === 0)
//				return;
//			else {
//				GameLoop().stop();
//				var clickedNode = mapListSelector._children[0]._children[key].view.getMasterNode();
//				mapData = getMapDataFromAPI(prefix, clickedNode.id);
//				
//				resetMap(linkedTreeInstance, mapData, alignment);
//				initializeMap(linkedTreeInstance, rootBoundingRect, rootNodeSelector, theme);
//			}
//		});
//	}
	
	
	
	
	return {
		init : init
	}
}

module.exports = classConstructor;
