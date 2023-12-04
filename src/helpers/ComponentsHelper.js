/**
 * @typedef {{[key : String] : Number}} LayoutNode
 */

/**
 * @typedef {{[key : String] : Number}|String} FrameworkEventData
 * @typedef {{[key : String] : FrameworkEventData}} FrameworkEvent
 */


const App = require('src/core/AppIgnition');
const {EventEmitter} = require('src/core/CoreTypes');
const TypeManager = require('src/core/TypeManager');
const StylesheetsCollector = require('src/_LayoutEngine/StylesheetsCollector');
const ComputedStyleSolver = require('src/_LayoutEngine/ComputedStyleSolver');
const LayoutTreePrepare = require('src/_LayoutEngine/LayoutTreePrepare');

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});
const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');

const {windowSize} = require('src/GameTypes/grids/gridManager');
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const BgSprite = require('src/GameTypes/sprites/BgSprite');

const linkedTreeInitializer = require('src/clientRoutes/linkedTreeInitializer');

const PlantCreator = require('src/router/PlantCreator');




		 /* 
		 * componentHelper
		 * 	createRootComponent
		 * 	createMapComponent
		 * 	resetMapCompoent
		 * 	createMapSelectorComponent
		 * 	createThemeSelectorComponent
		 */

/**
 * @constructor ComponentsHelper
 */
const ComponentsHelper = function() {
	EventEmitter.call(this);
	
	this.firstInit = true;
	this.rootBoundingRect = document.body.getBoundingClientRect();
	this.menuBarReadyPromise;
	this.menuYOffset = 0;
	this.zoomState = 0;
	this.zoomedInFactor = .64;
	this.dragStartPosition = {
		marginLeft : 0,
		marginTop : 0
	}
	this.gameCanvasCoord = {
		position : new CoreTypes.Point(0, 0),
		zoomFactor : 1
	};
	this.boundHandleDragStart = this.handleDragStart.bind(this);
	this.boundHandleDragMove = this.handleDragMove.bind(this);
	this.boundHandleDragEnd = this.handleDragEnd.bind(this);
	
	this.layoutRes;
	
	this.stylesheetsCollector = new StylesheetsCollector();
	this.mapListSelector;
	this.themeListSelector;

	this.rootViewComponent;
	this.pixiRendererComponent;
	this.linkedTreeInstance;
	this.gameCanvas = GameLoop().renderer.view;
	this.initialResetHoverEventsOnGameCanvas();
	this.hookZoomOnCanvas();
	this.handleAltKey();
	this.layoutTreeAsBreadthFirst;
	
	this.createRootComponent();
	this.getMapSelectorComponent();
	this.getThemeSelectorComponent();
	
	// @ts-ignore inherited method
	this.createEvent('newLayoutReady');
	// @ts-ignore inherited method
	this.createEvent('mapChanged');
	// @ts-ignore inherited method
	this.createEvent('themeChanged');
}
ComponentsHelper.prototype = Object.create(EventEmitter.prototype);


/**
 * @method initialResetHoverEventsOnGameCanvas
 */
ComponentsHelper.prototype.initialResetHoverEventsOnGameCanvas = function() {
	// The app-root component is positionned and has an superior z-index due to the fact it comes after in the DOM tree
	// => position the canvas at a higher z-index
	this.gameCanvas.style.position = 'relative';
	this.gameCanvas.style.zIndex = '2';
	this.gameCanvas.draggable = true;
	document.addEventListener("dragover", (event) => {
	    event.preventDefault();
	});
	GameLoop().renderer.plugins.interaction.cursorStyles.default = 'zoom-in';
}

/**
 * @method hookZoomOnCanvas
 */
ComponentsHelper.prototype.hookZoomOnCanvas = function () {
	this.gameCanvas.addEventListener('mouseup', this.handleZoomOnCanvas.bind(this));
}

/**
 * @method hookLoadThemeEventOnThemeSelector
 */
ComponentsHelper.prototype.handleAltKey = function () {
	const self = this;
	// @ts-ignore too lazy to type callbacks
	document.addEventListener('keydown', function(e) {
		if (self.zoomState !== 0 && e.key === 'Alt') {
			e.preventDefault();
			self.gameCanvas.style.cursor = 'zoom-out';
		}
	});
	document.addEventListener('keyup', function(e) {
		if (self.zoomState !== 0 && e.key === 'Alt') {
			e.preventDefault();
			self.gameCanvas.style.cursor = 'grab';
		}
	});
}

/**
 * @method defineRootBoundingRect
 */
ComponentsHelper.prototype.defineRootBoundingRect = function() {
	const self = this;
	// Prepare for a potential browser-scrollbar if the canva's height is greater than the window's height
	this.rootBoundingRect.width -= 21
	// @ts-ignore Component isn't typed
	const menuBar = this.rootViewComponent._children[0];
	// @ts-ignore too lazy to type callbacks
	this.menuBarReadyPromise = menuBar.getBoundingBox(function(resolve, e) {
		var boundingBox = e.data.boundingBox;
		// Hack cause the resize observer sometimes fires the second time with a false value: take the one already in DOM if its greater
		if (boundingBox.h < self.menuYOffset) {
			resolve();
			return;
		}
		else if (self.menuYOffset) {
			self.menuYOffset = boundingBox.h;
			self.rootBoundingRect.height -= self.menuYOffset;
			resolve();
		}
		// case of first time triggered
		self.menuYOffset = boundingBox.h;
		self.rootBoundingRect.height -= self.menuYOffset;
		
	});
}

ComponentsHelper.prototype.createRootComponent = function() {
	this.rootViewComponent = new App.RootView(
		linkedTreeInitializer(),
		null,
		//'noAppend'
	);
	// @ts-ignore Component isn't typed
	this.pixiRendererComponent = this.rootViewComponent._children[1];
}

/**
 * @method resetMapComponent
 * @param {Object} mapData
 * @param {String} alignment
 */
ComponentsHelper.prototype.resetMapComponent = function(mapData, alignment) {
	this.createMapComponent(mapData, alignment);
}

/**
 * @method createMapComponent
 * @param {Object} mapData
 * @param {String} alignment
 */
ComponentsHelper.prototype.createMapComponent = function(mapData, alignment) {
	this.linkedTreeComponentDef = TypeManager.mockGroupDef();
	// @ts-ignore ComponentDef isn't typed
	this.linkedTreeComponentDef.getGroupHostDef().sOverride = [
		{
			selector : ':host',
			opacity: '0'
	  	}
	];
	this.setMapComponent(mapData, alignment);
}

/**
 * @method resetMapComponent
 * @param {Object} mapData
 * @param {String} alignment
 */
ComponentsHelper.prototype.setMapComponent = function(mapData, alignment) {
	// @ts-ignore Component isn't typed
	this.rootViewComponent.removeChildAt(2);
	// @ts-ignore Component isn't typed
	this.linkedTreeInstance = new App.componentTypes.LinkedTreeComponent(
		this.linkedTreeComponentDef,
		// @ts-ignore Component isn't typed
		this.rootViewComponent.view,
		this.rootViewComponent,
		mapData,
		alignment
	);
	// @ts-ignore App isn't typed
//	new App.DelayedDecoration();
	App.Ignition.prototype.cleanRegisters();
}



ComponentsHelper.prototype.getMapSelectorComponent = function() {
	// @ts-ignore Component isn't typed
	this.mapListSelector = this.rootViewComponent._children[0]._children[1];
	this.hookLoadMapEventOnMapsSelector();
}

ComponentsHelper.prototype.getThemeSelectorComponent = function() {
	// @ts-ignore Component isn't typed
	this.themeListSelector = this.rootViewComponent._children[0]._children[2];
	this.hackyThemeSelectorDecorator();
	this.hookLoadThemeEventOnThemeSelector();
}

/**
 * @method hackyThemeSelectorDecorator
 * This relies on the browser making the requests for image assets via <img> tags
 * Do we need something better ?
 */
ComponentsHelper.prototype.hackyThemeSelectorDecorator = function () {
	// HACKY theme selector populate
	const thunbnailPath = 'plugins/LinkedTree/assets/thumbnails/',
		thumbnailExt = '.jpg';
	/** @type {HTMLImageElement} */
	let img,
	/** @type {HTMLSpanElement} */
		span,
	/** @type {HTMLOptionElement} */
		opt, 
		i = 1;
	for(let themeName in themeDescriptors) {
		this.themeListSelector.typedSlots[0].push(this.themeListSelector.typedSlots[0].newItem(themeName));
		
		span = document.createElement('span');
		// @ts-ignore extended native
		span.textContent = themeName;//.capitalizeFirstChar();
		opt = this.themeListSelector._children[0]._children[i].view.getWrappingNode();
		Array.from(opt.childNodes).forEach(function(child) {
			if (child instanceof Text)
				opt.removeChild(child);
		})
		opt.appendChild(span);
		
		img = document.createElement('img');
		// @ts-ignore callback
		img.onload = function(optElem, e) {
			optElem.prepend(e.target);	
		}.bind(null, opt)
		img.src = thunbnailPath + themeName + thumbnailExt;
		i++;
	}
}

/**
 * @method hookLoadMapEventOnMapsSelector
 */
ComponentsHelper.prototype.hookLoadMapEventOnMapsSelector = function () {
	/** @param {FrameworkEvent} e*/
	const cb = function(e) {
		// @ts-ignore inherited property (FrameworkEvent is just mocked)
		var key = e.data.self_key;
		if (key === 0)
			return;
		this.trigger(
			'mapChanged',
			this.mapListSelector._children[0]._children[key].streams.optionId.value
		);
	}
	this.mapListSelector.addEventListener('update', cb.bind(this));
}

/**
 * @method hookLoadThemeEventOnThemeSelector
 */
ComponentsHelper.prototype.hookLoadThemeEventOnThemeSelector = function () {
	/** @param {FrameworkEvent} e*/
	const cb = function(e) {
		// @ts-ignore inherited property (FrameworkEvent is just mocked)
		const key = e.data.self_key;
		if (key === 0)
			return;
		this.trigger(
			'themeChanged',
			this.themeListSelector._children[0]._children[key].view.getWrappingNode().querySelector('span').textContent
		);
	}
	this.themeListSelector.addEventListener('update', cb.bind(this));
}

ComponentsHelper.prototype.createBgSprite = function() {
	// @ts-ignore loadedAssets isn't typed
	const bgSprite = new BgSprite(loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'themeBg']);
	bgSprite.centerOnCanvas(
		new CoreTypes.Point(
			this.layoutRes.finalViewportWidth,
			this.layoutRes.finalViewportHeight
		)
	);
	GameLoop().addSpriteToScene(
		bgSprite
	);
}

/**
 * @method handleNewMapData
 * @param {Object} mapData	// JSON as Object
 * @param {String} alignment
 */
ComponentsHelper.prototype.handleNewMapData = function(mapData, alignment) {
	this.resetDebugRenderer();
	this.resetPlantsRenderer();
	if (this.firstInit) {
		this.defineRootBoundingRect();
		this.firstInit = false;
	}
	this.resetMapComponent(mapData, alignment);
	this.executeLayout();
	this.updateDebugRenderer();
	this.representLayoutTreeAsBreadthFirst();
	this.updatePlantsRenderer();
	this.createBgSprite();
	this.createPlants();
	this.centerCanvas();
}

/**
 * @method handleNewMapData
 * @param {Object} mapData	// JSON as Object
 * @param {String} alignment
 */
ComponentsHelper.prototype.onResetMapComponent = function(mapData, alignment) {
	this.handleNewMapData(mapData, alignment);
}

ComponentsHelper.prototype.executeLayout = function() {
	if (this.layoutRes)
		this.layoutRes.finallyCleanLayoutTree();
	
	// @ts-ignore Component isn't typed
	const naiveDOM = this.linkedTreeInstance.getNaiveDOM();
	
	const styleSolver = new ComputedStyleSolver(
		naiveDOM,
		this.stylesheetsCollector.collectedSWrappers
	);
	styleSolver.CSSSelectorsMatcher.traverseDOMAndMatchSelectors(
		naiveDOM,
		styleSolver.CSSRulesBuffer
	);
	
	styleSolver.CSSSelectorsMatcher.matches.results = styleSolver.CSSSelectorsMatcherRefiner.refineMatches(
		styleSolver.CSSSelectorsMatcher.matches,
		// HACK: naiveDOMRegistry & masterStyleRegistry
		// would have been needed if we had gotten the naiveDOM from an outer IFrame
		// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
		TypeManager.naiveDOMRegistry,
		// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
		TypeManager.masterStyleRegistry
	);
	
	performance.mark('totalRendering');
	this.layoutRes = new LayoutTreePrepare(
		naiveDOM,
		this.stylesheetsCollector.collectedSWrappers,
		// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
		TypeManager.masterStyleRegistry,
		this.rootBoundingRect,
		// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
		TypeManager.naiveDOMRegistry
	);
	performance.measure('bench_total_rendering', 'totalRendering');
	console.log('layout', performance.getEntriesByName('bench_total_rendering')[performance.getEntriesByName('bench_total_rendering').length - 1].duration + ' ms');
	
	// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
	const nodesCache = TypeManager.layoutNodesRegistry.cache;
	for (var UID in nodesCache) {
		nodesCache[UID].canvasShape = nodesCache[UID].getCanvasShape();
		nodesCache[UID].updateCanvasShapeDimensions();
		nodesCache[UID].updateCanvasShapeOffsets();
	}
	// @ts-ignore inherited method
	this.trigger('newLayoutReady');
}

ComponentsHelper.prototype.representLayoutTreeAsBreadthFirst = function() {
	// @ts-ignore we should unify our strategy when exporting TypeManager (double assignments)
	const layoutNodes = Object.values(TypeManager.layoutNodesRegistry.cache);
	
	/** @type {{[key : String] : Array<LayoutNode>}} */
	const levels = {};
	let depth = '';
	
	/** @param {LayoutNode} layoutNode*/
	const cb = function(layoutNode) {
		if (typeof layoutNode.depth === 'undefined')
			return;
		
		depth = layoutNode.depth.toString();
		if (typeof levels[layoutNode.depth] === 'undefined')
			levels[depth] = [];
			
		levels[depth].push(layoutNode);
	}
	layoutNodes.forEach(cb);
	this.layoutTreeAsBreadthFirst = levels;
}

ComponentsHelper.prototype.createPlants = function() {
	// @ts-ignore mocking types has its limits
	new PlantCreator(this.layoutTreeAsBreadthFirst);
}

ComponentsHelper.prototype.updateDebugRenderer = function() {
	// @ts-ignore Component isn't typed
	this.pixiRendererComponent.adaptHeightToContainer(this.layoutRes.finalViewportHeight, this.layoutRes.finalViewportWidth);
	// @ts-ignore Component isn't typed
//	this.pixiRendererComponent.populateStage(TypeManager.rasterShapesRegistry.cache);
	// @ts-ignore Component isn't typed
	this.pixiRendererComponent.view.getMasterNode().style.display = 'none';
}

ComponentsHelper.prototype.updatePlantsRenderer = function() {
	GameLoop().windowSize = new CoreTypes.Point(
		this.layoutRes.finalViewportWidth,
		this.layoutRes.finalViewportHeight
	);
	GameLoop().applyResizeToContent();
}

ComponentsHelper.prototype.resetDebugRenderer = function() {
	this.pixiRendererComponent.stage.removeChildren();
}

ComponentsHelper.prototype.resetPlantsRenderer = function() {
	GameLoop().clearTweens();
	GameLoop().clearStage();
}

ComponentsHelper.prototype.centerCanvas = function() {
	var self = this;
	this.menuBarReadyPromise.then(function() {
		windowSize.x.value = window.innerWidth;
		windowSize.y.value = window.innerHeight;
		let windowY = windowSize.y.value - self.menuYOffset,
			zoomFactor = 1, centeringOffsetX = 0, centeringOffsetY = 0;
		const canvasDimensions = {
			x : self.layoutRes.finalViewportWidth,
			y : self.layoutRes.finalViewportHeight
		};
		
		if (canvasDimensions.x / canvasDimensions.y > windowSize.x.value / windowY) {
			zoomFactor = windowSize.x.value / canvasDimensions.x;
			centeringOffsetY = (windowY - canvasDimensions.y * zoomFactor) / 2 + self.menuYOffset;
			self.gameCanvasCoord.position.x.value = 0;
			self.gameCanvasCoord.position.y.value = centeringOffsetY;
			self.gameCanvasCoord.zoomFactor = zoomFactor;
		}
		else {
			zoomFactor = windowY / canvasDimensions.y;
			centeringOffsetX = (windowSize.x.value - canvasDimensions.x * zoomFactor) / 2;
			centeringOffsetY = self.menuYOffset;
			self.gameCanvasCoord.position.x.value = centeringOffsetX;
			self.gameCanvasCoord.position.y.value = centeringOffsetY;
			self.gameCanvasCoord.zoomFactor = zoomFactor;
		}
		
		self.gameCanvas.style.transform = `scale(${zoomFactor}, ${zoomFactor})`; //  translateX(${-canvasDimensions.x * zoomFactor / 2}px)
		self.gameCanvas.style.marginLeft = (-canvasDimensions.x * (1 - zoomFactor) / 2 + centeringOffsetX).toString() + 'px';
		self.gameCanvas.style.marginTop = (-canvasDimensions.y * (1 - zoomFactor) / 2 + centeringOffsetY).toString() + 'px';
		
		if (self.gameCanvasCoord.zoomFactor >= self.zoomedInFactor) {
			self.gameCanvas.style.cursor = 'default';
		}
	})
}

/**
 * @method handleZoomOnCanvas
 * @param {MouseEvent} e
 */
ComponentsHelper.prototype.handleZoomOnCanvas = function(e) {
	if (this.zoomState !== 0) {
		if (e.altKey)
			this.zoomOut();
	}
	else {
		this.zoomIn(e);
	}
}

/**
 * @method zoomIn
 * @param {MouseEvent} e
 */
ComponentsHelper.prototype.zoomIn = function(e) {
	if (this.gameCanvasCoord.zoomFactor >= this.zoomedInFactor)
		return;
	
//	GameLoop().stop();
	const canvasDimensions = new CoreTypes.Point(
		this.layoutRes.finalViewportWidth,
		this.layoutRes.finalViewportHeight
	);
	const clickedPoint = new CoreTypes.Point(
		(e.clientX - this.gameCanvasCoord.position.x.value) / this.gameCanvasCoord.zoomFactor,
		(e.clientY - this.gameCanvasCoord.position.y.value) / this.gameCanvasCoord.zoomFactor
	);
	this.gameCanvas.style.transform = `scale(${this.zoomedInFactor}, ${this.zoomedInFactor})`;
	this.gameCanvas.style.marginLeft = (-(canvasDimensions.x.value / 2 + (clickedPoint.x.value - canvasDimensions.x.value / 2) * this.zoomedInFactor) + e.clientX).toString() + 'px';
	this.gameCanvas.style.marginTop = (-(canvasDimensions.y.value / 2 + (clickedPoint.y.value - canvasDimensions.y.value / 2) * this.zoomedInFactor) + e.clientY).toString() + 'px';
	this.gameCanvas.style.cursor = 'grab';
	this.zoomState = 1;
	
	this.handlePan();
}

/**
 * @method zoomOut
 */
ComponentsHelper.prototype.zoomOut = function() {
	this.gameCanvas.removeEventListener('dragstart', this.boundHandleDragStart);
	this.gameCanvas.removeEventListener('dragend', this.boundHandleDragEnd);
	document.removeEventListener('dragover', this.boundHandleDragMove);
	this.centerCanvas();
	this.zoomState = 0;
	this.gameCanvas.style.cursor = 'zoom-in';
}

/**
 * @method handlePan
 */
ComponentsHelper.prototype.handlePan = function() {
	this.tempCursorPos = new CoreTypes.Point(0, 0);
	this.gameCanvas.addEventListener('dragstart', this.boundHandleDragStart);
	this.gameCanvas.addEventListener('dragend', this.boundHandleDragEnd);
	document.addEventListener('dragover', this.boundHandleDragMove);
	
}

/**
 * @method handleDragStart
 * @param {DragEvent} dragEvent
 */
ComponentsHelper.prototype.handleDragStart = function(dragEvent) {
	dragEvent.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
	// Has no visible effect
	dragEvent.dataTransfer.effectAllowed = "move";
	// Not working
//	this.gameCanvas.style.cursor = 'move';
	this.dragStartPosition.marginLeft = parseInt(this.gameCanvas.style.marginLeft.slice(0, -2));
	this.dragStartPosition.marginTop = parseInt(this.gameCanvas.style.marginTop.slice(0, -2));
	this.tempCursorPos.x.value = dragEvent.clientX;
	this.tempCursorPos.y.value = dragEvent.clientY;
}

/**
 * @method handleDragMove
 * @param {DragEvent} dragEvent
 */
ComponentsHelper.prototype.handleDragMove = function(dragEvent) {
	let distance = new CoreTypes.Point(
		dragEvent.clientX - this.tempCursorPos.x.value,
		dragEvent.clientY - this.tempCursorPos.y.value
	);
	this.gameCanvas.style.marginLeft = (this.dragStartPosition.marginLeft + distance.x.value).toString() + 'px';
	this.gameCanvas.style.marginTop = (this.dragStartPosition.marginTop + distance.y.value).toString() + 'px';
}

/**
 * @method handleDragEnd
 * @param {DragEvent} dragEvent
 */
ComponentsHelper.prototype.handleDragEnd = function(dragEvent) {
	this.gameCanvas.style.cursor = 'grab';
}

/**
 * @method resetZoom
 */
ComponentsHelper.prototype.resetZoom = function() {
	this.zoomOut();
}






module.exports = ComponentsHelper;