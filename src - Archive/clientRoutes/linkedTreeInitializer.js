/**
 * @def rootViewInitializer
 * @isGroup true
 * 
 */

var TypeManager = require('src/core/TypeManager');
var App = require('src/core/AppIgnition');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var rootViewInitializer = function(options) {
	var init = function(parentView, parent) {
		var linkedTreeComponentDef = TypeManager.mockGroupDef();
		linkedTreeComponentDef.getGroupHostDef().sOverride = [
			{
				selector : ':host',
				opacity: '0'
		  	}
		];
		new App.componentTypes.LinkedTreeComponent(
			linkedTreeComponentDef,
			parentView,
			parent,
			options.linkedTreeData,
			options.alignment
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