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

const themeDescriptors = {
	'midi' : {
		id : 0,
		showBranchFruits : false,
		showLeafFruits : false,
		showNodeBox : false
	},
	'80s' : {
		id : 1,
		showBranchFruits : false,
		showLeafFruits : false,
		showNodeBox : false
	}
}


const objectTypes = {
	background : 'background',
	title : 'title',
	infiniteTitle : 'infiniteTitle',
}


const gameConstants = {
	eventNames,
	themeDescriptors,
	objectTypes
}

module.exports = gameConstants