/**
 * @router jsLinkedTreeRouter 
 */

const FontFaceObserver = require('src/integrated_libs_&_forks/fontfaceobserver');
const KeyboardEvents = require('src/events/JSKeyboardMap');
const KeyboardListener = require('src/events/GameKeyboardListener');
const App = require('src/core/AppIgnition');
const TypeManager = require('src/core/TypeManager');
const StylesheetsCollector = require('src/_LayoutEngine/StylesheetsCollector');
const ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');
const LayoutTreePrepare = require('src/_LayoutEngine/LayoutTreePrepare');

const linkedTreeInitializer = require('src/clientRoutes/linkedTreeInitializer');
const linkedTreeData = require('src/clientRoutes/mapData');	// _partial

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
//const gameLogic = require('src/GameTypes/gameSingletons/gameLogic');

//const GameObjectsFactory = require('src/GameTypes/factories/GameObjectsFactory');
// // Singleton init
//GameObjectsFactory();

//const Sprite = require('src/GameTypes/sprites/Sprite');
//const TilingSprite = require('src/GameTypes/sprites/TilingSprite');
//const Tween = require('src/GameTypes/tweens/Tween');

const BgSprite = require('src/GameTypes/sprites/BgSprite');

var classConstructor = function() {	

	function init(rootNodeSelector, mapData, theme) {
//		let alignment = 'centerAligned';
		let alignment = 'leftAligned';
		GameState().setCurrentTheme(theme || 'midi') 	// 80s
		let parsedMapData = JSON.parse(map_data.textContent);

		if (parsedMapData.error) {
			console.warn('No data returned by proxy :', parsedMapData.error);
			parsedMapData = linkedTreeData;
		}
			
		const keyboardListener = new KeyboardListener();
		const rootBoundingRect = document.body.getBoundingClientRect();
		const linkedTreeInstance = new App.RootView(
			linkedTreeInitializer(
				{
					linkedTreeData : parsedMapData,
					alignment : alignment
				}
			),
			null,
			'noAppend'
		);
		
		(new FontFaceObserver('roboto'))
			.load().then(function() {
				const renderFunc = function() {
				
					// Prepare for a potential browser-scrollbar if the canva's height is greater than the window's height
					rootBoundingRect.width -= 21;
					
					const naiveDOM = linkedTreeInstance._children[0].getNaiveDOM();
					const stylesheetsCollector = new StylesheetsCollector();
					const styleSolver = new ComputedStyleSolver(
						naiveDOM,
						stylesheetsCollector.collectedSWrappers
					);
					styleSolver.CSSSelectorsMatcher.traverseDOMAndMatchSelectors(
						naiveDOM,
						styleSolver.CSSRulesBuffer
					);
					
					styleSolver.CSSSelectorsMatcher.matches.results = styleSolver.CSSSelectorsMatcherRefiner.refineMatches(
						styleSolver.CSSSelectorsMatcher.matches,
						// HACK: naiveDOMRegistry & masterStyleRegistry
						// would have been needed if we had gotten the naiveDOM from an outer IFrame
						TypeManager.naiveDOMRegistry,
						TypeManager.masterStyleRegistry
					);
					
					
						performance.mark('totalRendering');
					const layoutRes = new LayoutTreePrepare(
						naiveDOM,
						stylesheetsCollector.collectedSWrappers,
						TypeManager.masterStyleRegistry,
						rootBoundingRect,
						TypeManager.naiveDOMRegistry
					);
					performance.measure('bench_total_rendering', 'totalRendering');
					console.log('layout', performance.getEntriesByName('bench_total_rendering')[performance.getEntriesByName('bench_total_rendering').length - 1].duration + ' ms');
					
					
					const nodesCache = TypeManager.layoutNodesRegistry.cache;
					for (var UID in nodesCache) {
						nodesCache[UID].canvasShape = nodesCache[UID].getCanvasShape();
						nodesCache[UID].updateCanvasShapeDimensions();
						nodesCache[UID].updateCanvasShapeOffsets();
					}
					
					const  pixiRendererComponent = linkedTreeInstance._children[1];
					pixiRendererComponent.adaptHeightToContainer(layoutRes.finalViewportHeight);
					pixiRendererComponent.createAndPopulateStage(TypeManager.rasterShapesRegistry.cache);
					
					// GAME LAUNCH
					// Singleton init
					GameLoop(new CoreTypes.Point(
						layoutRes.finalViewportWidth,
						layoutRes.finalViewportHeight
					));
					
					// Get a usable representation of the tree
					const layoutTreeAsBreadthFirst = representLayoutTreeAsBreadthFirst(Object.values(TypeManager.layoutNodesRegistry.cache));
					
					// Append the view centered
					document.querySelector(rootNodeSelector).prepend(GameLoop().renderer.view);
					centerCanvas(
						{
							x : layoutRes.finalViewportWidth,
							y : layoutRes.finalViewportHeight
						},
						GameLoop().renderer.view,
						layoutTreeAsBreadthFirst['2'][1]
					);
					
					// Hacky Title
//					const xBase = layoutTreeAsBreadthFirst['2'][1].layoutAlgo.offsets.getMarginInline();
//					const yBase = layoutTreeAsBreadthFirst['2'][1].layoutAlgo.offsets.getMarginBlock() - 437
//					const logo = PIXI.Sprite.from(loadedAssets[4].logo);
//					logo.x = xBase - 264;
//					logo.y = yBase + 43;
//					logo.alpha = .7;
//					GameLoop().stage.addChild(
//						logo
//					)
//					const titleTextSprite01 = new PIXI.Text(
//						'Wisemap',
//						{
//							fontSize: 32,
//							fill: '0x444444C9'
//						}
//					);
//					titleTextSprite01.x = xBase - 351;
//					titleTextSprite01.y = yBase + 45;
//					GameLoop().stage.addChild(
//						titleTextSprite01
//					);
//					const titleTextSprite02 = new PIXI.Text(
//						'Naturizer',
//						{
//							fontSize: 32,
//							fill: '0x2b6e01E9'
//						}
//					);
//					titleTextSprite02.x = xBase - 351;
//					titleTextSprite02.y = yBase + 67;
//					GameLoop().stage.addChild(
//						titleTextSprite02
//					)
					
					// Background
					const bgSprite = new BgSprite(loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'themeBg']);
					bgSprite.centerOnCanvas(
						new CoreTypes.Point(
							layoutRes.finalViewportWidth,
							layoutRes.finalViewportHeight
						)
					);
					GameLoop().addSpriteToScene(
						bgSprite
					);
					
					// Create Plants
					new PlantCreator(layoutTreeAsBreadthFirst, theme);
					
					// Launch
					GameLoop().start();
					setTimeout(GameLoop().stop.bind(GameLoop()), 180 * 1000);
					
					performance.mark('PIXI Rendering');
//					pixiRendererComponent.renderStage();
					performance.measure('bench_pixi_rendering', 'PIXI Rendering');
					console.log('debug rendering', performance.getEntriesByName('bench_pixi_rendering')[performance.getEntriesByName('bench_pixi_rendering').length - 1].duration + ' ms');
					console.info('Ctrl + Q to leave the render-loop before the 3 min timeout');
					layoutRes.finallyCleanLayoutTree();
					
					setTimeout(function() {
						GameState().setRootTimestamp(GameLoop().currentTime);
					}, 4096);
				}
				
				AssetsLoader.then(function(loadedAssets) {
					keyboardListener.addOnReleasedListener(function(originalEvent, ctrlKey, shiftKey, altKey, keyCode) {
						if (keyCode === KeyboardEvents.indexOf('Q') && ctrlKey) {
							GameLoop().stop();
						}
						if (keyCode === KeyboardEvents.indexOf('SPACE')) {
							GameState().setRootTimestamp(GameLoop().currentTime);
						}
					});
					renderFunc();
				});
		})
	}
	
	function representLayoutTreeAsBreadthFirst(layoutNodes) {
		const levels = {};
		let depth = '';
		
		layoutNodes.forEach(function(layoutNode) {
			if (typeof layoutNode.depth === 'undefined')
				return;
			
			depth = layoutNode.depth.toString();
			if (typeof levels[layoutNode.depth] === 'undefined')
				levels[depth] = [];
				
			levels[depth].push(layoutNode);
		});
		
		return levels;
	}
	
	function centerCanvas(canvasDimensions, canvas, rootNode) {
		let zoomFactor = 1, centeringOffsetX = 0, centeringOffsetY = 0;
//		const xOffset = canvasDimensions.x / 2 - (rootNode.layoutAlgo.offsets.getMarginInline() + rootNode.layoutAlgo.dimensions.getBorderInline() / 2);
//		const yOffset = canvasDimensions.y / 2 - (rootNode.layoutAlgo.offsets.getMarginBlock() + rootNode.layoutAlgo.dimensions.getBorderBlock() / 2);
		
		if (canvasDimensions.x - windowSize.x.value > canvasDimensions.y - windowSize.y.value) {
			zoomFactor = windowSize.x.value / canvasDimensions.x;
			centeringOffsetY = (windowSize.y.value - canvasDimensions.y * zoomFactor) / 2;
		}
		else {
			zoomFactor = windowSize.y.value / canvasDimensions.y;
			centeringOffsetX = (windowSize.x.value - canvasDimensions.x * zoomFactor) / 2;
		}
		
		canvas.style.transform = `scale(${zoomFactor}, ${zoomFactor})`; //  translateX(${-canvasDimensions.x * zoomFactor / 2}px)
		canvas.style.marginLeft = '-' + (canvasDimensions.x * (1 - zoomFactor) / 2 - centeringOffsetX).toString() + 'px';
		canvas.style.marginTop = '-' + (canvasDimensions.y * (1 - zoomFactor) / 2 - centeringOffsetY).toString() + 'px';
		
//		document.body.scroll(
//			(canvasDimensions.x * zoomFactor / 2 - windowSize.x.value) / 2 - xOffset,
//			(canvasDimensions.y * zoomFactor / 2 - windowSize.y.value) / 2 - yOffset
//		);
	}
	
	return {
		init : init
	}
}

module.exports = classConstructor;
