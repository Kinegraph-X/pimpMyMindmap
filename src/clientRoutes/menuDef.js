/**
 * @def DevToolsMenu
 * @isGroup true
 * 
 * @CSSify styleName : MenuBarHost
 * @CSSify styleName : MenuBarTemplate
 * @CSSifyTheme themeName : basic-light
 * 
 */
var DF = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');




var DevToolsMenu = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// Remove the whitespace between @CSSify and the word DEBUG to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	
	
	
	var moduleDef = DF.createDef({
		host : DF.createDef({
			type : 'MenuBar',
			isCompound : true,
			section : 0
		}),
		members : [
			DF.createDef({
				host : DF.createDef({
					type : 'SimpleText',
					nodeName : 'app-title',
					props : [
						{text : ""}
					],
					sWrapper : CreateStyle([
						{
							selector : ':host',
							backgroundImage : 'url("plugins/LinkedTree/assets/site_title.png")',
							backgroundRepeat : 'no-repeat',
							width : '250px',
							height : '40px',
						},
						{
							selector : ':host span',
							display : "inline-block"	
						}
					])
				})
			}),
			DF.createDef({
				host : DF.createDef({
					type : 'Menu',
					isCompound : true,
					sOverride : [
						{
							selector : ':host',
							color : '#C7C7C7',
							height : 'auto',
							marginLeft : '121px',
							paddingTop : '2px',
							borderRadius : '7px'
						}
					]
				}),
				members : [
					DF.createDef({
						host : DF.createDef({
							type : 'SimpleText',
							nodeName : 'menu-title',
							props : [
								{text : 'Create'}
							]
						})
					}),
					DF.createDef({
						host : DF.createDef({
							type : 'MenuOption',
							props : [
								{title : 'Create your map...'}
							]
						})
					})
				]
			}),
			DF.createDef({
				host : DF.createDef({
					type : 'SelectInput',
					isCompound : true,
					sOverride : [
						{
							selector : ':host',
							position : 'absolute',
							marginLeft : '28%'
						}
					],
					props : [
						{initialValue : "Change Map"}
					]
				})
			}),
			DF.createDef({
				host : DF.createDef({
					type : 'SelectInput',
					isCompound : true,
					sOverride : [
						{
							selector : ':host',
							position : 'absolute',
							marginLeft : '50%'
						}
					],
					props : [
						{initialValue : "Change Theme"}
					]
				})
			}),
			DF.createDef({
				host : DF.createDef({
					type : 'SimpleText',
					nodeName : 'app-title',
					props : [
						{text : 'Alt + Click to zoom-out, Ctrl + E gets the map as an image (then right-click)'}
					],
					sWrapper : CreateStyle([
						{
							selector : ':host',
							color : '#AAA',
							fontSize : '14px',
							position : 'absolute',
							right : '12px',
							height : '40px',
						},
						{
							selector : ':host span',
							display : "inline-block"	
						}
					])
				})
			})
		]
	});
	
//	console.log(moduleDef);
	
	return moduleDef;
}

module.exports = DevToolsMenu;