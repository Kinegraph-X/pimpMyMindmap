/**
 * @definition mapEditor
 */


const DF = require('src/core/TypeManager');
const CoreTypes = require('src/core/CoreTypes');
const CreateStyle = require('src/core/GenericStyleConstructor');

const {themeDescriptors, localStorageCustomThemeDescriptorName} = require('src/GameTypes/gameSingletons/gameConstants');



const mapEditorDef = function() {
	const def = DF.createDef({
		host : DF.createDef({
			isCompound : true,
			sOverride : [
				{
					selector : ':host',
//					display : 'flex',
					flexDirection : 'row',
					color : '#C7C7C7',
					width : '1900px',
					height : '860px',
					marginTop : '-430px',
					marginLeft : '-950px'
				}
			]
		}),
		members : [
			DF.createDef({
				host : DF.createDef({
					type  : 'CompoundComponent',
					nodeName : 'image-viewer',
					sWrapper : CreateStyle([
						{
							selector : ':host',
							boxSizing : 'border-box',
//							minWidth : '255px',
							height : '100%',
							padding : '7px'
						},
						{
							selector : ':host fieldset',
							borderColor : '#383838'
						}
					])
				}),
				members : [
					DF.createDef({
						host : DF.createDef({
							type : 'Fieldset',
							isCompound : true,
							section : 0,
							props : [
								{slotsTextContent : ['Source images']}
							]
						})
					})
				]
			}),
			DF.createDef({
				host : DF.createDef({
					type  : 'FormComponent',
					isCompound : true,
					sOverride : [
						{
							selector : ':host section:nth-child(2)',
							width : '170px',
							height : '100%'
						},
						{
							selector : ':host fieldset',
							width : 'auto',
//							height : '100%',
//							overflowY : 'scroll'
						}
					]
				}),
				members : [
					DF.createDef({
						host : DF.createDef({
							type : 'Fieldset',
							isCompound : true,
							section : 0,
							props : [
								{slotsTextContent : ['Your images']}
							]
						})
					})
				]
			}),
			DF.createDef({
				host : DF.createDef({
					type  : 'CompoundComponent',
					nodeName : 'map-preview',
					sWrapper : CreateStyle([
						{
							selector : ':host',
							width : '1120px'
						}
					])
				}),
				members : [
					DF.createDef({
						host : DF.createDef({
							type : 'ComponentWithView',
							nodeName : 'div',
							section : 0
						})
					})
				]
			}),
			DF.createDef({
				host : DF.createDef({
					type  : 'FormComponent',
					isCompound : true,
					sOverride : [
						{
							selector : ':host section:nth-child(2)',
							width : '380px',
							height : '100%'
						},
						{
							selector : ':host fieldset',
							width : 'auto'
						}
					]
				}),
				members : [
					DF.createDef({
						host : DF.createDef({
							type : 'Fieldset',
							isCompound : true,
							section : 0,
							props : [
								{slotsTextContent : ['Theme Parameters']}
							]
						})
					}),
					DF.createDef({
						host : DF.createDef({
							type : 'CancelButton',
							nodeName : 'close-button',
							attributes : [
								{role : 'button'}
							],
							section : 1,
							props : [
								{text : 'Exit'}
							]
						})
					})
				]
			})
		]
	});
	
	const savableStoreCallback = function(values) {
		localStorage.setItem(localStorageCustomThemeDescriptorName, values);
	}
	
	const savableStore = new CoreTypes.SavableStore(savableStoreCallback);
	
	const emptyThemeDescriptor = themeDescriptors['Your Theme'];
	Object.keys(emptyThemeDescriptor).forEach(function(key, idx) {
		if (idx === 0 || idx === 8 || idx === 9 || idx === 10)
			return;
		if (idx === 11) {
			def.members[3].members[0].members.push(
				DF.createDef({
					host : DF.createDef({
						type : 'TextInput',
						attributes : [
							{title : '-' + key},
							{value : emptyThemeDescriptor[key]}
						]
					}),
					// We're ultra-exceptionnaly making use of the options prop (not typed, so not meant to by used)
					options : {
						savableStore : savableStore
					}
				})
			);
		}
		else {
			def.members[3].members[0].members.push(
				DF.createDef({
					host : DF.createDef({
						type : 'CheckboxInput',
						attributes : [
							{title : '-' + key},
							{value : emptyThemeDescriptor[key]}
						]
					}),
					// We're ultra-exceptionnaly making use of the options prop (not typed, so not meant to by used)
					options : {
						savableStore : savableStore
					}
				})
			);
		}
	});
	
	
	
	
	
	return def;
}










module.exports = mapEditorDef;