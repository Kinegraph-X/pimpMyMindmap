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
//			DF.createDef({
//				host : DF.createDef({
//					type : 'ComponentWithView',
//					nodeName : 'app-title',
//					sWrapper : CreateStyle([
//						{
//							selector : ':host',
//							backgroundImage : 'url("plugins/DevToolsStruct/ressources/Formant_Logo_64_V4_w_text.png")',
//							backgroundRepeat : 'no-repeat',
//							backgroundPosition : 'center left',
//							backgroundSize : 'contain',
//							display : 'inline-block',
//							width : '143px',
//							height : '44px',
//							marginLeft : '12px',
//						}
//					])
//				})
//			}),
			DF.createDef({
				host : DF.createDef({
					type : 'SimpleText',
					nodeName : 'app-title',
					props : [
						{text : "Pimp My MindMap"}
					],
					sWrapper : CreateStyle([
						{
							selector : ':host',
							color : '#CCCCCC',							// 2da4be
							fontSize : '20px',
							paddingRight : '34px'
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
					type : 'SelectInput',
					isCompound : true,
					sOverride : [
						{
							selector : ':host',
							position : 'absolute',
							marginLeft : '19%'
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
							marginLeft : '60%'
						}
					],
					props : [
						{initialValue : "Change Theme"}
					]
				})
			})
		]
	});
	
//	console.log(moduleDef);
	
	return moduleDef;
}

module.exports = DevToolsMenu;