/**
 * @def rootViewInitializer
 * @isGroup true
 * 
 */

var TypeManager = require('src/core/TypeManager');
var App = require('src/core/AppIgnition');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');

const createMenuDef = require('src/clientRoutes/menuDef');

var rootViewInitializer = function(options) {
	var init = function(parentView, parent) {
		
		new App.componentTypes.MenuBar(
			createMenuDef(),
			parentView,
			parent
		);
		
		var pixiRendererDef = TypeManager.mockDef();
		pixiRendererDef.getHostDef().sOverride = [
			{
				selector : ':host',
				overflowY: 'initial',
				position: 'absolute',
				top: '0'
		  	}
		];
		new App.componentTypes.PIXIRendererComponent(
			pixiRendererDef,
			parentView,
			parent
		)
		
		
	}
		
	return {
		init : init
	}
}

module.exports = rootViewInitializer;