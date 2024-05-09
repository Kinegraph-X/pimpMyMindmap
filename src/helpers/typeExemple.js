
/** @constructor FakeComponent
 * @param {String} title
 */
const FakeComponent = function(title) {
	this.desc = {
		title : title
	};
};
/**
 * @method update
 * @param {String} value
 */
FakeComponent.prototype.update = function(value) {
	// do something after DOM rendering...
}
/**
 * @method getDesc
 */
FakeComponent.prototype.getDesc = function() {
	return this.desc;
}

/**
 * @constructor ThemeDescriptorFromFactory
 * @param {String} id
 * @return {Object.<String, String>} // not needed, just tried to "help" the type-inference, without success
 */
const ThemeDescriptorFromFactory = function(id) {
	this.id = id;
}

const themeDescriptor = new ThemeDescriptorFromFactory('0');

/** @type {FakeComponent[]} */
const componentList = [];

/**
 * @function forEachCallback
 * @param {keyof ThemeDescriptorFromFactory} key
 */
const forEachCallback = function(key) {
	componentList.push(new FakeComponent(key));
};

Object.keys(themeDescriptor).forEach(forEachCallback);


/**
 * @function componentDecorator
 * @param {FakeComponent} component
 */
const componentDecorator = function(component) {
	const desc = component.getDesc();
	/** @type {keyof ThemeDescriptorFromFactory} */
	const propertyName = /** @type {keyof ThemeDescriptorFromFactory} */ (desc.title); 	// <-- type 'string' is not assignable to type "id"
	component.update(themeDescriptor[propertyName])
}

componentList.forEach(componentDecorator);