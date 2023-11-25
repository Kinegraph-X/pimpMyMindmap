


// ASSETS PRELOADING
const manifest = {
	bundles : [
		{
			name : 'branches',
			assets : [
				{name : 'root', srcs : 'plugins/LinkedTree/assets/root.png'},
				{name : 'branch01', srcs : 'plugins/LinkedTree/assets/branches/branch_01.png'},
				{name : 'branchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_root.png'},
				{name : 'leaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01.png'},
				{name : 'leaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02.png'},
				{name : 'leaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03.png'},
				{name : 'leaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long.png'},
				{name : 'leaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01_reverse.png'},
				{name : 'leaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02_reverse.png'},
				{name : 'leaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_reverse.png'},
				{name : 'leaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long_reverse.png'}
			]
		},
		{
			name : 'branchlets',
			assets : [
				{name : 'branchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_01.png'},
				{name : 'branchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_02.png'},
				{name : 'branchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_03.png'},
			]
		},
		{
			name : 'fruits',
			assets : [
//				{name : 'logo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : 'backgrounds',
			assets : [
				{name : 'midi', srcs : 'plugins/LinkedTree/assets/backgrounds/Midi_Theme.png'}
			]
		},
		{
			name : 'graphics',
			assets : [
				{name : 'logo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		}
	]
};
		
		
		
		
module.exports = new Promise(function(resolve, reject) {
		// @ts-ignore
		PIXI.Assets.init({manifest}).then(function() {
			Promise.all([
				// @ts-ignore
				PIXI.Assets.loadBundle('branches'),
				// @ts-ignore
				PIXI.Assets.loadBundle('branchlets'),
				// @ts-ignore
				PIXI.Assets.loadBundle('fruits'),
				// @ts-ignore
				PIXI.Assets.loadBundle('backgrounds'),
				// @ts-ignore
				PIXI.Assets.loadBundle('graphics')
			]).then(function(loadedAssets) {
				resolve(loadedAssets);
			});
		});
	});