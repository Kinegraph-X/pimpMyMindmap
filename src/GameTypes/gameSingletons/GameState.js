const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');

/**
 * @constructor GameState
 */
const GameState = function() {
	this.rootTimestamp = +Infinity;
	this.currentTheme = 'midi';
	this.animableState = true;
}
//GameState.prototype = {};

/**
 * @method setRootTimestamp
 * @param {Number} value
 */
GameState.prototype.setRootTimestamp = function(value) {
	console.log('rootTimestamp set :', value / GameLoop().firstFramesDuration.chosen, 'frames');
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






/** @type {GameState} */
var gameState;

module.exports = function() {
	if (typeof gameState !== 'undefined')
		return gameState;
	else
		return (gameState = new GameState());
};