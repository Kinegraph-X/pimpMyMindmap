/**
 * @def rootViewInitializer
 * @isGroup true
 * 
 */

// @ts-nocheck

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var App = require('src/core/AppIgnition');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');

const createModalBoxDef = require('src/UI/packages/boxes/BigModalBox/packageComponentDefs/VeryBigModalBoxHostDef');
const createLoadMapBoxFormComponentOverrideDef = require('src/clientRoutes/loadMapFormComponentOverrideDef');
const createEditMapBoxFormComponentOverrideDef = require('src/clientRoutes/editMapFormComponentOverrideDef');
const createThemeEditorDef = require('src/clientRoutes/themeEditorDef');
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
			createModalBoxDef(),
			parentView,
			parent
		);
		
		const loadMapFormBox = new App.componentTypes.BigModalBox(
			createModalBoxDef(),
			parentView,
			parent
		);
		
		var loadMapForm = new App.componentTypes.FormComponent(
			createLoadMapBoxFormComponentOverrideDef(),
			loadMapFormBox.view,
			loadMapFormBox
		);
		
		const editMapFormBox = new App.componentTypes.BigModalBox(
			createModalBoxDef(),
			parentView,
			parent
		);
		
		var editMapForm = new App.componentTypes.FormComponent(
			createEditMapBoxFormComponentOverrideDef(),
			editMapFormBox.view,
			editMapFormBox
		);
		
		
		const introTextDef = TypeManager.createDef({
			host : TypeManager.createDef({
				host : TypeManager.createDef({
					nodeName : 'intro-text',
					sWrapper  : CreateStyle([
						{
							selector : ':host',
							display : 'block',
							color : "#C7C7C7",
							cursor : 'pointer',
							padding : '6px'
						},
						{
							selector : ':host a',
							color : '#6eb2ff'
						},
						{
							selector : ':host a:visited',
							color : '#8fc4f6'
						},
						{
							selector : ':host p',
							fontWeight : "bold"
						},
						{
							selector : ':host li',
							marginLeft : "12px"
						},
						{
							selector : ':host span.welcome',
							backgroundImage : 'url("plugins/LinkedTree/assets/site_title_B&W.png")',
							backgroundPosition : 'right center',
							backgroundRepeat : 'no-repeat',
							fontSize : '21px',
							paddingRight : '250px',
//							padding : "7px",
//							backgroundColor : '#2f71af',
							color : "#FFF"
						},
						{
							selector : ':host .fake_button',
							padding : "7px",
							backgroundColor : '#2f71af',
							color : "#FFF"
						},
						{
							selector : ':host p.highlight',
							marginTop : "7px",
							color : "#FFF"
						}
					])
				})
			}),
			members : [
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'ComponentVithView',
						nodeName : 'p'
					}),
					members : [
						TypeManager.createDef({
							nodeName : 'span',
							attributes : [
								{className : 'welcome'},
								{innerHTML : 'Welcome to '},
								{title : 'Pimp my Mindmap / Pimp my Mind-Map / Pimp my Mind Map'}
							]
						}),
						TypeManager.createDef({
							nodeName : 'p',
							attributes : [
								{innerHTML : 'Give life to your mind-maps with stunning illustrative themes before sharing or printing them !'}
							]
						}),
						TypeManager.createDef({
							nodeName : 'p',
							attributes : [
								{innerHTML : 'You can use a map you\'ve already created in another website or write it directly here in an indented text representation (<i>Create you map</i> button) or query it from another site (tested with wisemap.ai, but definitve implementations soon to come).'}
							]
						}),
						TypeManager.createDef({
							nodeName : 'p',
							attributes : [
								{className : 'fake_button'},
								{innerHTML : 'Click to Start'}
							]
						}),
						TypeManager.createDef({
							nodeName : 'span',
							attributes : [
								{innerHTML : '&nbsp; or read a quick "tech" presentation of this project, which brings some of my projects all together:'}
							]
						}),
						TypeManager.createDef({
							nodeName : 'p',
							attributes : [
								{className : 'highlight'},
								{innerHTML : 'This uses the <a href="https://github.com/Kinegraph-X/formant-core">Formant</a> frontend framework and its affiliated modules.'}
							]
						})
					]
				}),
				TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'SimpleText',
						nodeName : 'p',
						props : [
							{text : `
							What you get:
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
							the "views" are destination-agnostic: you're not bound to the DOM :)
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
							"use what you already know", here a standard ul/li structure & scoped CSS-in-JS
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
							in-house stylesheets & layout: Formant "matches" and "cascades" by itself
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
							at this step, you have the absolute coordinates of the canvas-objects "for free"
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
						nodeName : 'p',
						attributes : [
							{className : 'highlight'},
						],
						props : [
							{text : `
							Just play with sprites, your favorite graphics library, animate & love them :)
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
		
		new App.componentTypes.BigModalBox(
			createThemeEditorDef(),
			parentView,
			parent
		)
		
	}
		
	return {
		init : init
	}
}

module.exports = rootViewInitializer;