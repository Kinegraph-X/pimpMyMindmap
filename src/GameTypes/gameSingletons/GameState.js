const {Point} = require('src/GameTypes/gameSingletons/CoreTypes');

/**
 * @constructor GameState
 * @param {Boolean} noMousePolling
 */
const GameState = function(noMousePolling) {
	this.rootTimestamp = +Infinity;
	this.currentTheme = 'Midi';	// Default value is never read here (overridden by the GlobalHandler Class)
	this.animableState = true;
	this.lastMousePosition = new Point(0, 0);
	this.mousePosition = new Point(0, 0);
	this.lastFrameCount = 0;
	this.mouseVector = new Point(0, 0);
	
	if (!noMousePolling)
		document.addEventListener('mousemove', this.pollMousePosition.bind(this));
}
//GameState.prototype = {};

/**
 * @method setRootTimestamp
 * @param {Number} value
 */
GameState.prototype.setRootTimestamp = function(value) {
	this.rootTimestamp = value;
}

/**
 * @method setRootTimestamp
 * @param {String} value
 */
GameState.prototype.setCurrentTheme = function(value) {
	console.log('currentTheme set :', value);
	this.currentTheme = value;
}

/**
 * @method handleRecursiveHoverEffect
 * @param {MouseEvent} e
 */
GameState.prototype.pollMousePosition = function(e) {
	this.mousePosition.x.value = e.clientX;
	this.mousePosition.y.value = e.clientY;
}

/**
 * @method syncedUpdateMouseVector
 * @param {Number} frameCount
 */
GameState.prototype.syncedUpdateMouseVector = function(frameCount) {
	this.mouseVector = new Point(
		this.mousePosition.x.value - this.lastMousePosition.x.value,
		this.mousePosition.y.value - this.lastMousePosition.y.value
	);
	this.lastFrameCount = frameCount;
	this.lastMousePosition = new Point(
		this.mousePosition.x.value,
		this.mousePosition.y.value
	);
}






/** @type {GameState} */
var gameState;

module.exports = function() {
	if (typeof gameState !== 'undefined')
		return gameState;
	else
		return (gameState = new GameState());
};