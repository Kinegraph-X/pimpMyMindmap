
const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const GameState = require('src/GameTypes/gameSingletons/GameState');

/**
 * @constructor BranchOptions
 */
const BranchOptions = function() {
	this.isReversed = false;
	this.animated = GameState().animableState;
	this.curveType = themeDescriptors[GameState().currentTheme].curveType;
	this.maxDurationForBranchlets = themeDescriptors[GameState().currentTheme].maxDurationForBranchlets;
	this.branchletStepIndicesforBranches = themeDescriptors[GameState().currentTheme].branchletStepIndicesforBranches;
	this.branchletStepIndicesforLeaves = themeDescriptors[GameState().currentTheme].branchletStepIndicesforLeaves;
}
//BranchOptions.prototype = {};





module.exports = {
	BranchOptions
}