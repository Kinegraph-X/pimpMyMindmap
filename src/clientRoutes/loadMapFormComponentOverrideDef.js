/**
 * @def FormComponentOverride
 * @isGroup true
 * 
 * @CSSify styleName : FormComponentOverrideHost
 * @CSSify styleName : FormComponentOverrideButton
 * @CSSifyTheme themeName : basic-light
 * 
 */
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');


var FormComponentOverrideDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// Remove the whitespace between @CSSify and the word DEBUG to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	

	var moduleDef = TypeManager.createDef({
		host : TypeManager.createDef({
			type : 'CompoundComponent', 				// this is not implicit if we want to use inference when building the def through the factor
//			states : [
//				{action : options.prefix + 'verify_password/'}
//			],
			sOverride : [
				{
					selector : ':host',
					color : '#C7C7C7'
				}
			]
		/**@CSSify Style componentStyle : FormComponentOverrideHost */
		}),
//		subSections : [
//			TypeManager.createDef({
//				host : TypeManager.createDef({
//					type : 'ComponentWithView',
//					nodeName : 'section'
//				})
//			}),
//			TypeManager.createDef({
//				host : TypeManager.createDef({
//					type : 'ComponentWithView',
//					nodeName : 'section'
//				})
//			})
//		],
		members : [
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'SimpleText',
					nodeName : 'h3',
					section : 0,
					props : [
						{text : 'Create your pimp\'ed map :'}
					]
				})
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'Fieldset',
						section : 0,
						props : [
							{slotsTextContent : ['Paste the content of your map as a space-indented or tab-indented list']}
						]
					})
				}),
				members : [
					TypeManager.createDef({
						host : TypeManager.createDef({
							type : 'TextareaInput',
//							section : 0,
							attributes : [
								{title : '-Map-Content'},
		//						{placeholder : ''}
							]
						})
					})
				]
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'SubmitButton',
					nodeName : 'button',
					section : 1,
					props : [
						{text : 'Show'}
					]
				})
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'CancelButton',
					nodeName : 'button',
					section : 1,
					props : [
						{text : 'Cancel'}
					]
				})
			})
		]
	});
//	console.log(moduleDef);
	return moduleDef;
}

module.exports = FormComponentOverrideDef;