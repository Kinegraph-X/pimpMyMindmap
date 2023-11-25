

/**
 * @constructor GameState
 */
const GameState = function() {
	this.rootTimestamp = +Infinity;
	this.currentTheme = 'midi';
	this.animableState = true;
}
//GameState.prototype = {};

GameState.prototype.setRootTimestamp = function(value) {
	console.log('rootTimestamp set :', value);
	this.rootTimestamp = value;
}

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