/**
 * @typedef {import('src/helpers/GlobalHandler')} GlobalHandler
 */

const {windowSize} = require('src/GameTypes/grids/gridManager');
const CoreTypes = require('src/GameTypes/gameSingletons/CoreTypes');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const GameState = require('src/GameTypes/gameSingletons/GameState');

		/* 
		 * glHelper
		 *	initLoop
		 * 	startLoop
		 * 	prepareAutoLoopEnd
		 * 	abortAutoLoopEnd
		 */

/**
 * @constructor GlHelper
 */

const GlHelper = function() {
	/** @type {NodeJS.Timeout} */
	this.globalTimeout;
	
	this.initLoop();
}
//GlHelper.prototype = {}

GlHelper.prototype.initLoop = function() {
	GameLoop(new CoreTypes.Point(
		0,
		0
	));
}

GlHelper.prototype.prepareAutoLoopEnd = function() {
	this.globalTimeout = setTimeout(GameLoop().stop.bind(GameLoop()), 60 * 1000);
}

GlHelper.prototype.abortAutoLoopEnd = function() {
	clearTimeout(this.globalTimeout);
}

/**
 * @method delayGameLoopStart
 * @param {GlobalHandler} parentScope
 */
GlHelper.prototype.delayGameLoopStart = function(parentScope) {
	setTimeout(function() {
		parentScope.stopLoadingSpinner();
		GameState().setRootTimestamp(GameLoop().currentTime);
	}, 4096);
}





module.exports = GlHelper;