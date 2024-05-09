/**
 * @typedef {{[key : String] : Number}} LayoutNode		// mock
 */

/**
 * @typedef {{[key : String] : Number}|String} FrameworkEventData		// mock
 * @typedef {{[key : String] : FrameworkEventData}} FrameworkEvent		// mock
 */


const App = require('src/core/AppIgnition');
const {EventEmitter, SavableStore} = require('src/core/CoreTypes');
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
const {themeDescriptors, ThemeDescriptorFromFactory, localStorageCustomImgListName} = require('src/GameTypes/gameSingletons/gameConstants');

const {windowSize} = require('src/GameTypes/grids/gridManager');
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const BgSprite = require('src/GameTypes/sprites/BgSprite');

const linkedTreeInitializer = require('src/clientRoutes/linkedTreeInitializer');

const PlantCreator = require('src/router/PlantCreator');
const naiveTextIndentedListParser = require('src/router/naiveTextIndentedListParser');





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
	this.editingMode = false;
	/** @type {Promise<any[]>} */
	this.localStorageLoadedPromise;
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
	this.hookCreateMapForm();
	this.hookEditMapForm();
	this.hookEditThemeForm();
	
	// @ts-ignore inherited method
	this.createEvent('newMapData');
	// @ts-ignore inherited method
	this.createEvent('newMapReady');
	// @ts-ignore inherited method
	this.createEvent('mapChanged');
	// @ts-ignore inherited method
	this.createEvent('themeChanged');
	// @ts-ignore inherited method
	this.createEvent('switchToYourTheme');
	// @ts-ignore inherited method
	this.createEvent('themeEditorNeedsRefresh');
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
	this.menuBar = this.rootViewComponent._children[0];
	// @ts-ignore Component isn't typed
	this.pixiRendererComponent = this.rootViewComponent._children[1];
	// @ts-ignore Component isn't typed
	this.createMapModalComponent = this.rootViewComponent._children[3];
	// @ts-ignore Component isn't typed
	this.editMapModalComponent = this.rootViewComponent._children[4];
	// @ts-ignore Component isn't typed
	this.themeEditorComponent = this.rootViewComponent._children[5];
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
	this.rootViewComponent.removeChildAt(6);
	// @ts-ignore Component isn't typed
	this.linkedTreeInstance = new App.componentTypes.LinkedTreeComponent(
		this.linkedTreeComponentDef,
		// @ts-ignore Component isn't typed
		this.rootViewComponent.view,
		this.rootViewComponent,
		mapData,
		alignment
	);
	// NaiveDOMNode needs a ref to the DOM view... Shade...
	// @ts-ignore App isn't typed
//	new App.DelayedDecoration();
}

/**
 * @method initThemeEditorComponent
 */
ComponentsHelper.prototype.initThemeEditorComponent = function() {
	// Remove any previously added ImagPlaceholder
//	this.themeEditorComponent._children[0]._children[0].removeAllChildren();
//	this.themeEditorComponent._children[1]._children[0].removeAllChildren();

	// @ts-ignore too lazy to type callbacks
	this.themeEditorComponent._children[3]._children[1].view.getMasterNode().addEventListener('mouseup', function(e) {
		// Move canvas form background to background
		document.body.prepend(this.gameCanvas);
		this.themeEditorComponent.streams.hidden.value = true;
		this.themeEditorComponent.view.getMasterNode().style.display = 'none';
		
		// Reset window size
		windowSize.x.value = window.innerWidth;
		windowSize.y.value = window.innerHeight;
		
		GameState().animableState = true;
		// @ts-ignore Framework's specialty
		this.trigger('themeEditorNeedsRefresh');
		
	}.bind(this));
	
	const themeIdx = themeDescriptors[this.userThemeName].id;
	// @ts-ignore too lazy to type callbacks (values from an interface are almost impossible to type)
	const savableStoreCallback = function(values) {
		localStorage.setItem(localStorageCustomImgListName, values);
	}
	const savableStore = new SavableStore(savableStoreCallback);
	
	// Add new ImgPlaceholders	
	Object.keys(loadedAssets[themeIdx]).forEach(function(assetName) {
		if (this.visibleFields.indexOf(assetName) === -1)
			return;
		this.addImgPlaceholderInFirstColumn(assetName);
		this.addImgPlaceholderInSecondColumn(assetName, savableStore);
	}, this);
	
	// @ts-ignore Framework specialties
	new App.DelayedDecoration();
	// After rendering cause we need the locallySavableInterface to have defined the valueNames (extracted from the DOM)
	this.populateCheckboxesFromThemeDescriptor();
	this.prePopulateStoreForSecondColumn();
}

/**
 * @method addImgPlaceholderInFirstColumn
 * @param {String} assetName
 */
ComponentsHelper.prototype.addImgPlaceholderInFirstColumn = function(assetName) {
	// @ts-ignore loadedAssets isn't typed
	const textureResource = loadedAssets[themeDescriptors[this.userThemeName].id][assetName].baseTexture.resource;
	// @ts-ignore Framework specialties
	new App.componentTypes.ImgPlaceholder(
		// @ts-ignore Framework specialties
		TypeManager.createDef({
			// @ts-ignore Framework specialties
			host : TypeManager.createDef({
				nodeName : 'image-placeholder',
				props : [
					// There's something asynchronous in Pixi's handling of textures
					{imgURL : textureResource.src || textureResource.url}
				]
			})
		}),
		this.themeEditorComponent._children[0]._children[0].view,
		this.themeEditorComponent._children[0]._children[0]
	);
}

/**
 * @method addImgPlaceholderInSecondColumn
 * @param {String} assetName
 * @param {SavableStore} store
 */
ComponentsHelper.prototype.addImgPlaceholderInSecondColumn = function(assetName, store) {
	// @ts-ignore Framework specialties
	const imgPlaceholderDef = TypeManager.mockDef();
	imgPlaceholderDef.getHostDef().section = 0;
	imgPlaceholderDef.getHostDef().attributes.push(new TypeManager.AttributeModel({title : assetName}));
	// We're ultra-exceptionnaly making use of the options prop (not typed, so not meant to by widely used)
	imgPlaceholderDef.options = {savableStore : store};
	// @ts-ignore Framework specialties
	const dropZone = new App.componentTypes.DroppableImgPlaceholder(
		imgPlaceholderDef,
		this.themeEditorComponent._children[1]._children[0].view,
		this.themeEditorComponent._children[1]._children[0]
	);
	dropZone.addEventListener('update', this.replacePixiTextureInAssets.bind(this, assetName, dropZone));
}

/**
 * @method prePopulateStoreForSecondColumn
 */
ComponentsHelper.prototype.prePopulateStoreForSecondColumn = function() {
	this.localStorageLoadedPromise.then(function() {
		let assetName = '', textureResource, assetURL = '';
		// @ts-ignore too lazy to type callbacks
		this.themeEditorComponent._children[1]._children[0]._children.forEach(function(dropZone, key) {
			assetName = this.visibleFields[key];
			// @ts-ignore loadedAssets isn't typed
			textureResource = loadedAssets[themeDescriptors[this.userThemeName].id][assetName].baseTexture.resource;
			// There's something asynchronous in Pixi's handling of textures
			assetURL = textureResource.src || textureResource.url;
			dropZone.savableStore.update(assetName, assetURL);
			
			if (assetURL.slice(0, 4) === 'data') {
				dropZone.streams.imgURL.value = assetURL;
			}
		}, this);
	}.bind(this));
}

/**
 * @template KeyOfThemeDescriptorFromFactory extends keyof ThemeDescriptorFromFactory
 */

/**
 * @method populateCheckboxesFromThemeDescriptor
 */
ComponentsHelper.prototype.populateCheckboxesFromThemeDescriptor = function() {
	const self = this;
	const themeDescriptor = themeDescriptors[this.userThemeName];
	// @ts-ignore Framework specialties
	this.themeEditorComponent._children[3]._children[0]._children.forEach(function(child) {
		/** @type {{title : keyof ThemeDescriptorFromFactory}} */
		const elem  = child.view.getMasterNode();
		const propertyName = elem.title;

		// @ts-ignore Framework specialties
		if (child.streams.checked)
			// @ts-ignore Framework specialties
			child.streams.checked.value = themeDescriptor[propertyName];	// checkboxes
		else
			// @ts-ignore Framework specialties
			child.setValue(themeDescriptor[propertyName]);					// text-inputs
		
		child.savableStore.update(propertyName, themeDescriptor[propertyName]);
		// @ts-ignore Framework specialties
		child.addEventListener('update', function(e) {
			// @ts-ignore can't get to make the "keyof" type work
			themeDescriptors[GameState().currentTheme][propertyName] = child.getValue();
			// @ts-ignore Framework specialties
			self.trigger('themeEditorNeedsRefresh');
		});
	});
}

const ThemeDescriptorFromFactoryProps = ['id'];

/**
 * @method createPixiTexture
 * @param {String} assetName
 * @param {Object} component
 * @param {FrameworkEvent} e
 */
ComponentsHelper.prototype.replacePixiTextureInAssets = function(assetName, component, e) {
	const self = this;
	// @ts-ignore FrameworkEvent.data has a "any" type (here it's a DOM File)
	createImageBitmap(e.data).then(function(imgBmp) {
		var reader = new FileReader();
		reader.onloadend = function() {
			// @ts-ignore Framework's specialty
			component.streams.imgURL.value = reader.result;
		}
		// @ts-ignore FrameworkEvent.data has a "any" type (here it's a DOM File)
		reader.readAsDataURL(e.data);
		
		
		// @ts-ignore PIXI isn't completely mocked
		const newTexture = PIXI.Texture.from(imgBmp);
		// @ts-ignore loadedAssets isn't typed && PIXI
		loadedAssets[themeDescriptors[GameState().currentTheme].id][assetName] = newTexture;
		
		// Hacks to handle incomplete theme while we're experimenting
		if (assetName === self.userThemeName + 'leaf00') {
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][assetName + 'Reverse'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf01'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf01Reverse'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf02'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf02Reverse'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf02Long'] = newTexture;
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][self.userThemeName + 'leaf02LongReverse'] = newTexture;
		}
		else if (self.hasReversedVersion.indexOf(assetName) !== -1) {
			// @ts-ignore loadedAssets isn't typed && PIXI
			loadedAssets[themeDescriptors[GameState().currentTheme].id][assetName + 'Reverse'] = newTexture;
		}
			
		// @ts-ignore Framework's specialty
		self.trigger('themeEditorNeedsRefresh');
	});
}

ComponentsHelper.prototype.getMapSelectorComponent = function() {
	// @ts-ignore Component isn't typed
	this.mapListSelector = this.rootViewComponent._children[0]._children[2];
	this.hookLoadMapEventOnMapsSelector();
}

ComponentsHelper.prototype.getThemeSelectorComponent = function() {
	// @ts-ignore Component isn't typed
	this.themeListSelector = this.rootViewComponent._children[0]._children[3];
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
	
	// First take advantage of the batched DOM rendering
	const itemList = [];
	for(let themeName in themeDescriptors) {
		itemList.push(this.themeListSelector.typedSlots[0].newItem(themeName));
	}
	this.themeListSelector.typedSlots[0].pushApply(itemList);
	
	// Then hack the whole stack with random DOM insertions (but we have faith in the implicit batching of the Browser)
	for(let themeName in themeDescriptors) {
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

/**
 * @method hookCreateMapForm
 */
ComponentsHelper.prototype.hookCreateMapForm = function () {
	const self = this;
	
	// Menu Option : "Create a Map"
	this.menuBar._children[1]._children[1].onclicked_ok = function() {self.createMapModalComponent.streams.hidden.value = null;}
	
	// @ts-ignore Component isn't typed
	const createMapForm = this.createMapModalComponent._children[0];
	this.createMapModalComponent.streams.hidden.value = true;
	
	createMapForm.onsubmit = function() {
		if (!createMapForm.data.get('mapcontent'))  {
			if (!createMapForm._children[1]._children[0].streams.errors.value)
				createMapForm._children[1]._children[0].streams.errors.value = ['', 'No change has been made.'];
			return;
		}
		try {
			const mapData = new naiveTextIndentedListParser(createMapForm.data.get('mapcontent'));
			// @ts-ignore inherited method
			self.trigger('newMapData', mapData.result);
			this.createMapModalComponent.streams.hidden.value = true;
		}
		catch (e) {
			createMapForm._children[1]._children[0].setTooltipContentAndShow('The text seems badly formatted');
		}
	}
}

/**
 * @method hookEditMapForm
 */
ComponentsHelper.prototype.hookEditMapForm = function () {
	const self = this;
	
	// Menu Option : "Create a Map"
	this.menuBar._children[1]._children[2].onclicked_ok = function() {self.editMapModalComponent.streams.hidden.value = null;}
	
	// @ts-ignore Component isn't typed
	const editMapForm = this.editMapModalComponent._children[0];
	this.editMapModalComponent.streams.hidden.value = true;
	
	editMapForm.onsubmit = function() {
		if (!editMapForm.data.get('mapcontent'))  {
			if (!editMapForm._children[1]._children[0].streams.errors.value)
				editMapForm._children[1]._children[0].streams.errors.value = ['', 'No change has been made.'];
			return;
		}
		try {
			const mapData = new naiveTextIndentedListParser(editMapForm.data.get('mapcontent'));
			// @ts-ignore inherited method
			self.trigger('newMapData', mapData.result);
			this.editMapModalComponent.streams.hidden.value = true;
		}
		catch (e) {
			editMapForm._children[1]._children[0].setTooltipContentAndShow('The text seems badly formatted.');
		}
	}
}

/**
 * @method hookEditThemeForm
 */
ComponentsHelper.prototype.hookEditThemeForm = function () {
	const self = this;
	
	// Menu Option : "Create a Map"
	this.menuBar._children[1]._children[3].onclicked_ok = function() {
		self.editingMode = true;
		self.themeEditorComponent.streams.hidden.value = null;
		self.themeEditorComponent.view.getMasterNode().style.display = 'flex';
		// Move canvas form background to foreground
		self.themeEditorComponent._children[2]._children[0].view.getWrappingNode().appendChild(self.gameCanvas);
		
		// Reset window size
		windowSize.x.value = 1116;
		windowSize.y.value = 820;
		
		// @ts-ignore Framework's specialty
		self.trigger('switchToYourTheme');
		// @ts-ignore Framework's specialty
		self.trigger('themeEditorNeedsRefresh');
	}
	
	this.themeEditorComponent.streams.hidden.value = true;
	this.themeEditorComponent.view.getMasterNode().style.display = 'none';
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
 * @method handleNewTheme
 */
ComponentsHelper.prototype.handleNewTheme = function() {
	this.resetPlantsRenderer();
	this.updatePlantsRenderer();
	this.createBgSprite();
	this.createPlants();
	this.centerCanvas(false);
	// @ts-ignore inherited method
	this.trigger('newMapReady');
}

/**
 * @method onResetMapComponent
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
	this.trigger('newMapReady');
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

/**
 * @method centerCanvas
 * @param {Boolean} fromRealWindowSize
 */
ComponentsHelper.prototype.centerCanvas = function(fromRealWindowSize = true) {
	var self = this;
	this.menuBarReadyPromise.then(function() {
		if (fromRealWindowSize) {
			windowSize.x.value = window.innerWidth;
			windowSize.y.value = window.innerHeight;
		}
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
	if (this.editingMode)
		return;
		
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

/**
 * @method showEditorComponent
 */
ComponentsHelper.prototype.showEditorComponent = function() {
	this.zoomOut();
}

/**
 * @property @static userThemeName
 */
ComponentsHelper.prototype.userThemeName = 'Your Theme';


/**
 * @property @static userThemeName
 */
ComponentsHelper.prototype.visibleFields = [
	ComponentsHelper.prototype.userThemeName + 'root',
	ComponentsHelper.prototype.userThemeName + 'branchRoot',
	ComponentsHelper.prototype.userThemeName + 'branch01',
	ComponentsHelper.prototype.userThemeName + 'leaf00',
	ComponentsHelper.prototype.userThemeName + 'fruit01',
	ComponentsHelper.prototype.userThemeName + 'fruit02',
	ComponentsHelper.prototype.userThemeName + 'themeBg',
];

/**
 * @property @static hasReversedVersion
 */
ComponentsHelper.prototype.hasReversedVersion = [
	ComponentsHelper.prototype.userThemeName + 'branchRoot',
	ComponentsHelper.prototype.userThemeName + 'branch01',
	ComponentsHelper.prototype.userThemeName + 'leaf00',
	ComponentsHelper.prototype.userThemeName + 'leaf01	',
	ComponentsHelper.prototype.userThemeName + 'leaf02',,
	ComponentsHelper.prototype.userThemeName + 'leaf02Long'
]






module.exports = ComponentsHelper;