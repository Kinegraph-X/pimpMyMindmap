/**
 * @def FormComponentOverride
 * @isGroup true
 * 
 * @CSSify styleName : FormComponentOverrideHost
 * @CSSify styleName : FormComponentOverrideBigger
 * @CSSifyTheme themeName : basic-light
 * 
 */
// @ts-nocheck
var TypeManager = require('src/core/TypeManager');
var CreateStyle = require('src/UI/generics/GenericStyleConstructor');



var FormComponentOverrideDef = function(uniqueID, options, model) {
	/**@CSSify DEBUG */		// Remove the whitespace between @CSSify and the word DEBUG to trigger debug infos
		
	// Some CSS stuff (styles are directly injected in the main def below)
	/**@CSSifySlots placeholder */
	

	var moduleDef = TypeManager.createDef({
		host : TypeManager.createDef({
			type : 'CompoundComponent', 				// this is not implicit if we want to use inference when building the def through the factory
//			states : [
//				{action : options.prefix + 'verify_password/'}	// form without "action" (FormComponent updated to handle that)
//			],
			props : [
				{content : undefined}
			],
			sOverride : [
				{
					selector : ':host',
					color : '#C7C7C7'
				},
				{
					selector : ':host section:nth-child(3)',
					flexDirection : 'row',
					justifyContent : 'flex-end',
					gap : '12px'
				}
			]
		/**@CSSify Style componentStyle : FormComponentOverrideHost */
		}),
		subSections : [
			// subSections not overridden
		],
		members : [
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'SimpleText',
					nodeName : 'h3',
					section : 0,
					props : [
						{text : 'Edit the current map'}
					]
				})
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					host : TypeManager.createDef({
						type : 'Fieldset',
						section : 0,
						props : [
							{slotsTextContent : ['']},
							{content : undefined}
						],
						reactOnParent : [
							{
								from : 'content',
								to : 'content'
							}
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
							],
							reactOnParent : [
								{
									cbOnly : true,
									from : 'content',
									subscribe : function(value) {
										this.setContentFromValueOnMemberView(value, 1);
									}
								}
							]
						})
					})
				]
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'CancelButton',
					nodeName : 'cancel-button',
					attributes : [
						{role : 'button'}
					],
					section : 1,
					props : [
						{text : 'Cancel'}
					]
				})
			}),
			TypeManager.createDef({
				host : TypeManager.createDef({
					type : 'SubmitButton',
					nodeName : 'submit-button',
					attributes : [
						{role : 'button'}
					],
					section : 1,
					props : [
						{text : 'Show'}
					]
				})
			})
		]
	});
//	console.log(moduleDef);
	return moduleDef;
}

module.exports = FormComponentOverrideDef;