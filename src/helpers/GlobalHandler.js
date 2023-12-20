/**
 * @typedef {{[key : String] : Number}|String} FrameworkEventData
 * @typedef {{[key : String] : FrameworkEventData}} FrameworkEvent
 * @typedef {Object} PIXI.Texture
 */

const GlHelper = require('src/helpers/GlHelper');
const ComponentsHelper = require('src/helpers/ComponentsHelper');
const KeyboardListener = require('src/events/GameKeyboardListener');
const KeyboardEvents = require('src/events/JSKeyboardMap');
const ApiHelper = require('src/helpers/ApiHelper');

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');

const {themeDescriptors, localStorageCustomThemeDescriptorName, localStorageCustomImgListName} = require('src/GameTypes/gameSingletons/gameConstants');
const {Point} = require('src/GameTypes/gameSingletons/CoreTypes');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');

const naiveObjectToIndentedTextListConverter = require('src/router/naiveObjectToIndentedTextListConverter');

const linkedTreeData = require('src/clientRoutes/mapData');	//  _problem  _partial2

		/*
		 * globalHandler
		 * 	^ mapData
		 * 	^ currentTheme
		 * 	^ instances of all helpers
		 * 	-> subscribes to events from APIHelper
		 * 	getLoadingSpinner
		 * 	startLoadingSpinner
		 * 	stopLoadingSpinner
		 * 	handleNewMapData
		 * 	handleNewTheme
		 */

/**
 * @constructor GlobalHandler
 * @param {String} rootNodeSelector
 * @param {String} initialMapData // JSON
 */
const GlobalHandler = function(rootNodeSelector, initialMapData) {
	GameState().animableState = this.getNoAnimationParam();
	this.readyElem;
	this.getLoadingSpinner();
	
	this.hookKeyboard();
	
	
	this.rootNodeSelector = rootNodeSelector;
	// Force the style here as we're in light theme for the rendering in canvas
	document.body.style.backgroundColor = '#161e22';
	this.mapData = this.parseMapData(initialMapData);
	GameState().currentTheme = this.getInitialTheme();
	this.alignment = 'centerAligned';
//	this.alignment = 'leftAligned';

	this.glHelper = new GlHelper();
	
	this.apiHelper = new ApiHelper();
	// @ts-ignore inherited method
	this.apiHelper.addEventListener('newMapData', this.handleNewMapData.bind(this));
	
	this.componentsHelper = new ComponentsHelper();
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('newMapData', this.handleNewMapData.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('newMapReady', this.handleMapReady.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('mapChanged', this.handleMapChanged.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('themeChanged', this.handleThemeChanged.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('switchToYourTheme', this.switchToYourTheme.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('themeEditorNeedsRefresh', this.handleThemeEditorRefresh.bind(this));
	
	this.hookEditMapButton();
	
	this.apiHelper.subscribeToMapListEndpoint(this.componentsHelper.mapListSelector);
	
//	this.componentsHelper.handleNewMapData(this.mapData, this.alignment);
	this.appendGameView();
}
//GlobalHandler.prototype = {}



GlobalHandler.prototype.getNoAnimationParam = function() {
	// ANIMATION BYPASS VIA URL
	if (location.href.match(/no_animation/)) {
		return false;
	}
	return true;
}

/**
 * @method handleThemeChanged
 */
GlobalHandler.prototype.loadSavedThemeAndInitThemeEditor = function() {
	this.prepareYourTheme();
	this.componentsHelper.initThemeEditorComponent();
}

/**
 * @method handleThemeChanged
 */
GlobalHandler.prototype.prepareYourTheme = function() {
	const self = this;
	let themeDescriptor,
		/** @type {String} */
		imgList;
	let promiseArray = Array();
	
	if ((themeDescriptor = localStorage.getItem(localStorageCustomThemeDescriptorName))) {
		const savedOptions = JSON.parse(themeDescriptor);
		for (let themeOption in themeDescriptors[this.userThemeName]) {
			if (savedOptions[themeOption])
				// @ts-ignore : inference doesn't work when indexing an object with its own props... weird...
				themeDescriptors[this.userThemeName][themeOption] = savedOptions[themeOption];
		}
	}
	if ((imgList = localStorage.getItem(localStorageCustomImgListName))) {
		/** @type {Array<Object>} */
		let loadedAssets = null;
		AssetsLoader.then(function(loadedBundles) {
			loadedAssets = loadedBundles;
			/** @type {PIXI.Texture} */
			let newTexture;
			const parsedImgList = JSON.parse(imgList);
			for (let assetName in loadedAssets[themeDescriptors[self.userThemeName].id]) {
				if (!parsedImgList[assetName])
					continue;
					
				// @ts-ignore loadedAssets ins't typed
				newTexture = PIXI.Texture.from(parsedImgList[assetName]);
				// PIXI takes a while to reference the actual ressource on the Texture object
				// (it waits for the browser to have interpreted the data-url)
				// => let's enclose that phenomenon in a global promise for locally stored images
				promiseArray.push(new Promise(function(resolve, reject) {
					// @ts-ignore PIXI
					newTexture.baseTexture.on('loaded', () => resolve())
				}))
				// @ts-ignore loadedAssets ins't typed
				loadedAssets[themeDescriptors[self.userThemeName].id][assetName] = newTexture;
				
				// Hacks to handle incomplete theme while we're experimenting
				if (assetName === self.userThemeName + 'leaf00') {
					// @ts-ignore loadedAssets ins't typed
					loadedAssets[themeDescriptors[self.userThemeName].id][assetName + 'Reverse'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf01'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf01Reverse'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf02'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf02Reverse'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf02Long'] = newTexture;
					// @ts-ignore loadedAssets isn't typed && PIXI
					loadedAssets[themeDescriptors[self.userThemeName].id][self.userThemeName + 'leaf02LongReverse'] = newTexture;
				}
				else if (self.hasReversedVersion.indexOf(assetName) !== -1) {
					// @ts-ignore loadedAssets ins't typed
					loadedAssets[themeDescriptors[self.userThemeName].id][assetName + 'Reverse'] = newTexture;
				}
			};
		});
	}
	this.componentsHelper.localStorageLoadedPromise = Promise.all(promiseArray);
}

/**
 * @method switchToYourTheme
 */
GlobalHandler.prototype.switchToYourTheme = function() {
	GameState().animableState = false;
	GameState().setCurrentTheme(this.userThemeName);
}

GlobalHandler.prototype.appendGameView = function() {
	document.querySelector(this.rootNodeSelector).prepend(this.componentsHelper.gameCanvas);
}

GlobalHandler.prototype.getLoadingSpinner = function() {
	// @type {HTMLDivElement}
	this.readyElem = document.querySelector('#ready');
	// @ts-ignore style
	this.readyElem.style.display = 'none';
//	// @ts-ignore style isn't a prop of Element ? wtf! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
//	this.readyElem.style.visibility = 'visible';
	const loadingSpinner = document.querySelector('#loading_spinner_3');
	// @ts-ignore style isn't a prop of Element ? wtf! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
	loadingSpinner.style.display = 'flex';
	// @ts-ignore
	loadingSpinner.style.visibility = 'visible';
	// @ts-ignore style isn't a prop of Element ? wtf! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style
	loadingSpinner.style.opacity = 1;
	
	const loadingText = document.createElement('span');
	loadingText.textContent = "Loading Map..."
	loadingSpinner.append(loadingText);
}

GlobalHandler.prototype.startLoadingSpinner = function() {
	// @ts-ignore style
	this.readyElem.style.display = 'flex';
}

GlobalHandler.prototype.stopLoadingSpinner = function() {
	// @ts-ignore
	this.readyElem.style.display = 'none';
}

GlobalHandler.prototype.hookKeyboard = function() {
	const self = this;
	// PREPARE LISTENING for some Keybord Events
	const keyboardListener = new KeyboardListener();
	// @ts-ignore inherited method
	keyboardListener.addOnPressedListener(function(originalEvent, ctrlKey, shiftKey, altKey, keyCode) {
		if (keyCode === KeyboardEvents.indexOf('Q') && ctrlKey) {
			GameLoop().stop();
		}
//		if (keyCode === KeyboardEvents.indexOf('SPACE')) {
//			console.log('rootTimestamp set :', GameLoop().currentTime / GameLoop().firstFramesDuration.chosen, 'frames');
//			GameState().setRootTimestamp(GameLoop().currentTime);
//		}
		if (keyCode === KeyboardEvents.indexOf('E') && ctrlKey) {
			originalEvent.preventDefault();
			GameLoop().stop();
			self.startLoadingSpinner();
			setTimeout(function() {
				// @ts-ignore too lazzy to type callbacks
				GameLoop().renderer.extract.image(GameLoop().stage, "image/png").then(function(image) {
					image.style.marginTop = self.componentsHelper.menuYOffset.toString() + 'px'
					image.width = 100;
					image.height = 100 * self.componentsHelper.layoutRes.finalViewportHeight / self.componentsHelper.layoutRes.finalViewportWidth
					image.style.position = 'relative';
					image.style.zIndex = '3';
					// @ts-ignore Component isn't typed
					self.componentsHelper.rootViewComponent.view.getWrappingNode().prepend(image);
					self.stopLoadingSpinner();
				});				
			}, 512);
		}
	});
}

/**
 * @method hookEditMapButton
 */
GlobalHandler.prototype.hookEditMapButton = function() {
	const self = this;
	
	// Menu Option : "Edit a Map"
	const editMapForm = this.componentsHelper.editMapModalComponent._children[0];
	this.componentsHelper.menuBar._children[1]._children[2].onclicked_ok = function() {
		editMapForm.streams.content.value = new naiveObjectToIndentedTextListConverter(self.mapData).result;
		self.componentsHelper.editMapModalComponent.streams.hidden.value = false;
	}
}

/**
 * @method parseMapData
 * @param {String} receivedMapData
 */
GlobalHandler.prototype.parseMapData = function(receivedMapData) {
	// DEFAULT MAP DATA or MAP DATA from ID requested in the URL (sent from server directly in the HTML template)
	let parsedMapData = JSON.parse(receivedMapData);
	if (parsedMapData.error) {
		console.warn('No data returned by proxy :', parsedMapData.error);
		parsedMapData = linkedTreeData;
	}
	return parsedMapData;
}

GlobalHandler.prototype.getInitialTheme = function() {
	// THEME ACQUISITION (from URL or defaults to 80s)
	/** @type {Array<String>} */
	let themeMatch,
		theme = '';
		
	if ((themeMatch = decodeURI(location.href).match(/theme=((.|\s)*)$/))) {
		theme = themeDescriptors.hasOwnProperty(themeMatch[1]) && themeMatch[1];
	}
	return theme || this.defaultTheme;
}

/**
 * @method setTheme
 * @param {String} theme
 */
GlobalHandler.prototype.setTheme = function(theme) {
	// Parenthesis are for TS
	GameState().setCurrentTheme((theme || '80s'));
}



/**
 * @method handleMapChanged
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleMapChanged = function(e) {
	const self = this;
	GameLoop().stop();
	self.startLoadingSpinner();
	setTimeout(function() {
		self.glHelper.abortAutoLoopEnd();
		
		// @ts-ignore inherited property (FrameworkEvent is just mocked)
		self.apiHelper.getMapData(e.data);
	}, 1024);
}

/**
 * @method handleThemeChanged
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleThemeChanged = function(e) {
	const self = this;
	GameLoop().stop();
	self.startLoadingSpinner();
	// Time to let the browser show the spinner before we hit the DOM hard (is it still needed ?)
	setTimeout(function() {
		self.glHelper.abortAutoLoopEnd();
		
		// @ts-ignore inherited property (FrameworkEvent is just mocked)
		GameState().currentTheme = e.data;
		self.componentsHelper.handleNewTheme();
		self.componentsHelper.resetZoom();
	}, 32);
}

/**
 * @method handleThemeEditorRefresh
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleThemeEditorRefresh = function(e) {
	GameLoop().stop();
	this.startLoadingSpinner();
	
	// Start a new rendering on a non-animable theme (plants only, we keep the same layout)
	GameLoop().clearStage();
	GameLoop().clearTweens();
	this.componentsHelper.handleNewTheme();
}

/**
 * @method handleNewMapData
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleNewMapData = function(e) {
	this.componentsHelper.resetZoom();
	this.mapData = e.data;
	// onResetMapComponent
	this.componentsHelper.onResetMapComponent(this.mapData, this.alignment);
	this.componentsHelper.resetZoom();
}

/**
 * @method handleMapReady
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleMapReady = function(e) {
	this.glHelper.prepareAutoLoopEnd();
	if (GameState().animableState)
		this.glHelper.delayGameLoopStart(this);
	else {
		this.glHelper.bypassedGameLoopStart(this);
	}
	GameLoop().start();
}

/**
 * @property @static {String} defaultTheme
 */
GlobalHandler.prototype.defaultTheme = '24H du Mind'; //''; 	// midi 

/**
 * @property @static userThemeName
 */
GlobalHandler.prototype.userThemeName = ComponentsHelper.prototype.userThemeName;

GlobalHandler.prototype.hasReversedVersion = ComponentsHelper.prototype.hasReversedVersion;




module.exports = GlobalHandler;