
const {EventEmitter} = require('src/core/CoreTypes');
var APIendpointsManager = require('src/core/APIendpointsManager');

		 /* 
		 * APIHelper
		 * 	^ URLprefix
		 * 	^ events [newMapData, newTheme]
		 * 	initEndpoints
		 * 	registerCallbackOnAdditionalEndpoint
		 */


/**
 * @constructor ApiHelper
 */
const ApiHelper = function() {
	EventEmitter.call(this);
	
	this.URLprefix = '';
	this.mapsEndpointNames = ['list_maps/'];
	this.provider;
	// @ts-ignore inherited method
	this.createEvent('newMapData');
	
	this.getApiPrefix();
	this.initEndpoints();
}
ApiHelper.prototype = Object.create(EventEmitter.prototype);

ApiHelper.prototype.getApiPrefix = function() {
	// Hack in case we're requesting the "local" server : find a potential path-prefix in the URL
	var locationTest;
	if ((locationTest = window.location.href.match(/localhost(\/.*?\/)/))) {
		this.URLprefix = locationTest[1];
	}
}

ApiHelper.prototype.initEndpoints = function() {
	// App-level providers (they consume the server-side API)
	// @ts-ignore too lazy to type callbacks
	var dataPresenterFunc = function(response) {
		var peers = Array(), key = '';
		// @ts-ignore too lazy to type callbacks
		response.payload.forEach(function(doc) {
			key = Object.keys(doc)[0];
			peers.push(doc[key]);
		});
		
		return {
			endPointName : response.endPointName,
			payload : peers
		};
	};
	this.provider = new APIendpointsManager(
		'maps_endpoint',	// APIEndpointManager's name
		this.URLprefix,					// API path
		'',						// "GET" parameters
		dataPresenterFunc,		// dataPresenterFunction
		this.mapsEndpointNames
	);
}

/**
 * @method subscribeToMapListEndpoint
 * @param {Object} mapListSelector // Component
 */
ApiHelper.prototype.subscribeToMapListEndpoint = function(mapListSelector) {
	this.provider.agnosticSubscribeToEndPoint('list_maps/', mapListSelector);
	this.provider.acquireAsync();
}

/**
 * @method getMapDataFromAPI
 * @param {String} mapId
 */
ApiHelper.prototype.getMapData = async function getMapDataFromAPI(mapId) {
	var body = new FormData();
	body.set('map_id', mapId);
	
	var options = {
		method : 'POST',
		body : body
	}
	var url = this.URLprefix + 'get_map/',
		result = '';
	await fetch(url, options).then(async function(response) {
		await response.text().then(function(responseObj) {
			result = JSON.parse(responseObj);
		})
	});
	// @ts-ignore Component isn't typed
	this.trigger('newMapData', result);
}




module.exports = ApiHelper;