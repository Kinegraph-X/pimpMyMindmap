/**
 * @def rootViewInitializer
 * @isGroup true
 * 
 */

// @ts-nocheck

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
		);
		
		const modalBox = new App.componentTypes.BigModalBox(
			TypeManager.mockGroupDef(),
			parentView,
			parent
		);
		
		const introTextDef = TypeManager.createDef({
			host : TypeManager.createDef({
				host : TypeManager.createDef({
					nodeName : 'intro-text',
					sWrapper  : CreateStyle([
						{
							selector : ':host',
							color : "#CCC",
							cursor : 'pointer'
						},
						{
							selector : ':host p',
							fontWeight : "bold"
						}
					])
				})
			}),
			members : [
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'p',
						props : [
							{text : `
							Click anywhere or read this rapid description of my projects bound together:
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							the Formant frontend framework: you're not bound to the DOM :)
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							powerful built-in components: automate this from any minimal JSON tree
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							scoped CSS: it's a standard ul/li structure + custom CSS-in-JS
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							in-house stylesheets & layout-engine: it "matches" and "cascades" itself
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							at this step, you have absolute coordinates of objects in canvas for "free"
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							a lightweight game-engine handles the tweening logic
							`}
						]
					})
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'li',
						props : [
							{text : `
							Just play with sprites in your favorite graphics library, animate & love them :)
							`}
						]
					})
				})
			]
		});
		new App.componentTypes.CompoundComponent(
			introTextDef,
			modalBox.view,
			modalBox
		);
		
	}
		
	return {
		init : init
	}
}

module.exports = rootViewInitializer;