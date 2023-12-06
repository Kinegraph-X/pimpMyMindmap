/**
 * @typedef {{[key : String] : Number}|String} FrameworkEventData
 * @typedef {{[key : String] : FrameworkEventData}} FrameworkEvent
 */

const GlHelper = require('src/helpers/GlHelper');
const ComponentsHelper = require('src/helpers/ComponentsHelper');
const KeyboardListener = require('src/events/GameKeyboardListener');
const KeyboardEvents = require('src/events/JSKeyboardMap');
const ApiHelper = require('src/helpers/ApiHelper');

const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const {Point} = require('src/GameTypes/gameSingletons/CoreTypes');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');

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
	this.componentsHelper.addEventListener('newLayoutReady', this.handleNewLayout.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('mapChanged', this.handleMapChanged.bind(this));
	// @ts-ignore inherited method
	this.componentsHelper.addEventListener('themeChanged', this.handleThemeChanged.bind(this));
	
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
	// Time to let the browser show the spinner before we hit the DOM hard
	setTimeout(function() {
		self.glHelper.abortAutoLoopEnd();
		
		// @ts-ignore inherited property (FrameworkEvent is just mocked)
		GameState().currentTheme = e.data;
		self.componentsHelper.onResetMapComponent(self.mapData, self.alignment);
		self.componentsHelper.resetZoom();
	}, 1024);
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
 * @method handleNewLayout
 * @param {FrameworkEvent} e
 */
GlobalHandler.prototype.handleNewLayout = function(e) {
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




module.exports = GlobalHandler;