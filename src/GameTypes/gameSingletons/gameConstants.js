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

const themesCount = 8;
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
 * @param {Boolean|Null} showText
 * @param {Boolean|Null} disableHoverEffect
 * @return {Object.<String, String|Boolean>}
 */
const ThemeDescriptorFromFactory = function(
	id = themesCount,
	showBranchFruits = true,
	showLeafFruits = false,
	showRootBox = false,
	showNodeBox = false,
	showLeafBox = true,
	dropShadows = true,
	blurNodeBoxes = false,
	branchletStepIndicesforBranches = Array(),
	branchletStepIndicesforLeaves = Array(),
	maxDurationForBranchlets = 8,
	curveType = 'singleQuad',
	showText = true,
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
	this.showText = showText ?? true;
	this.disableHoverEffect = disableHoverEffect ?? false;
}


/**
 * @type {{[key:String] : ThemeDescriptorFromFactory}}
 */
const themeDescriptors = {
	'DeepMind' : new ThemeDescriptorFromFactory(
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
	'Midi' : new ThemeDescriptorFromFactory(
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
		null,
		true
	),
	'80s' : new ThemeDescriptorFromFactory(
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
	'Whitehouse' : new ThemeDescriptorFromFactory(
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
	'SteamSoul' : new ThemeDescriptorFromFactory(
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
	'MindTrip' : new ThemeDescriptorFromFactory(
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
	'24H du Mind' : new ThemeDescriptorFromFactory(
		6,
		null,
		true,
		true,
		true,
		null,
		false,
		null,
		null,		// 9
		null,
		null,
		'doubleQuad'
	),
	'Your Theme' : new ThemeDescriptorFromFactory(
		7,
		null,
		true,
		null,
		null,
		false,
		false,
		null,
		null,		// 9
		null,
		null,
		'doubleQuad',
		false,
		true
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

const localStorageCustomThemeDescriptorName = 'PimpMyMindMap.customThemeDescriptor';
const localStorageCustomImgListName = 'PimpMyMindMap.customImgList';


const gameConstants = {
	eventNames,
	defaultInterpolationStepCount,
	branchletAnimationSteps,
	curveTypes,
	ThemeDescriptorFromFactory,
	themeDescriptors,
	objectTypes,
	localStorageCustomThemeDescriptorName,
	localStorageCustomImgListName
}

module.exports = gameConstants