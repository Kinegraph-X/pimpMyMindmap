/**
 * @definitions
 */

/**
* @type {{[key:String] : String}}
* dictionay of event names
*/
const eventNames = {
	disposableSpriteAnimationEnded : 'disposableSpriteAnimationEnded',
	resize : 'resize'
}

/**
 * @type {number}
 */
const defaultInterpolationStepCount = 12;
/**
 * @type {number}
 */
const branchletAnimationSteps = 2;

/**
* @type {{[key:String] : String}}
* dictionay of curve types
*/
const curveTypes = {
	singleQuad : 'singleQuad',
	doubleQuad : 'doubleQuad'
}

/**
 * @constructor themeDescriptorsFactory
 * 
 * @param {Number} id
 * @param {Boolean|Null} showBranchFruits
 * @param {Boolean|Null} showLeafFruits
 * @param {Boolean|Null} showRootBox
 * @param {Boolean|Null} showNodeBox
 * @param {Boolean|Null} showLeafBox
 * @param {Boolean|Null} dropShadows
 * @param {Boolean|Null} blurNodeBoxes
 * @param {Array<Number>|Null} branchletStepIndicesforBranches
 * @param {Array<Number>|Null} branchletStepIndicesforLeaves
 * @param {Number|Null} maxDurationForBranchlets
 * @param {String|Null} curveType
 * @param {Boolean|Null} disableHoverEffect
 */
const ThemeDescriptorsFactory = function(
	id,
	showBranchFruits,
	showLeafFruits,
	showRootBox,
	showNodeBox,
	showLeafBox,
	dropShadows,
	blurNodeBoxes,
	branchletStepIndicesforBranches,
	branchletStepIndicesforLeaves,
	maxDurationForBranchlets,
	curveType,
	disableHoverEffect = false
) {
	this.id = id;
	this.showBranchFruits = showBranchFruits ?? true;
	this.showLeafFruits = showLeafFruits ?? false;
	this.showRootBox = showRootBox ?? false;
	this.showNodeBox = showNodeBox ?? false;
	this.showLeafBox = showLeafBox ?? true;
	this.dropShadows = dropShadows ?? true;
	this.blurNodeBoxes = blurNodeBoxes ?? false;
	this.branchletStepIndicesforBranches = branchletStepIndicesforBranches ?? [];
	this.branchletStepIndicesforLeaves = branchletStepIndicesforLeaves ?? [];
	this.maxDurationForBranchlets = maxDurationForBranchlets ?? 8
	this.curveType = curveType ?? 'singleQuad';
	this.disableHoverEffect = disableHoverEffect;
}

/**
 * @type {{[key:String] : ThemeDescriptorsFactory}}
 */
const themeDescriptors = {
	'DeepMind' : new ThemeDescriptorsFactory(
		0,
		null,
		true,
		true,
		true,
		null,
		false,
		true,
		null,	// []
		null,
		null,
		null
	),
	'Midi' : new ThemeDescriptorsFactory(
		1,
		true,
		true,
		true,
		true,
		true,
		null,
		null,
		[2, 3, 5, 6, 9, 10],
		[1, 3, 6],
		null,
		null,
		true
	),
	'80s' : new ThemeDescriptorsFactory(
		2,
		null,
		true,
		true,
		true,
		null,
		false,
		null,
		[],		// 9
		null,
		null,
		'doubleQuad'
	),
	'Whitehouse' : new ThemeDescriptorsFactory(
		3,
		null,
		true,
		null,
		null,
		false,
		false,
		true,
		[],		// 9
		null,
		null,
		'singleQuad'
	),
	'SteamSoul' : new ThemeDescriptorsFactory(
		4,
		null,
		true,
		true,
		true,
		null,
		null,
		null,
		[],		// 9
		null,
		null,
		'doubleQuad'
	),
	'MindTrip' : new ThemeDescriptorsFactory(
		5,
		null,
		null,
		true,
		true,
		false,
		null,
		true,
		[10],		// 9
		null,
		null,
		'singleQuad'
	),
	'24H du Mind' : new ThemeDescriptorsFactory(
		6,
		null,
		true,
		true,
		true,
		null,
		false,
		null,
		[0],		// 9
		null,
		null,
		'doubleQuad'
	)
}

/**
* @type {{[key:String] : String}}
* dictionay of object types
*/
const objectTypes = {
	background : 'background',
	title : 'title',
	infiniteTitle : 'infiniteTitle',
}


const gameConstants = {
	eventNames,
	defaultInterpolationStepCount,
	branchletAnimationSteps,
	curveTypes,
	themeDescriptors,
	objectTypes
}

module.exports = gameConstants