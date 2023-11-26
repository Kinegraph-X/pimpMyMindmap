


// ASSETS PRELOADING
const manifest = {
	bundles : [
		{
			name : 'midi',
			assets : [
				{name : 'midiroot', srcs : 'plugins/LinkedTree/assets/root.png'},
				{name : 'midibranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_01.png'},
				{name : 'midibranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_root.png'},
				{name : 'midileaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01.png'},
				{name : 'midileaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02.png'},
				{name : 'midileaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03.png'},
				{name : 'midileaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long.png'},
				{name : 'midileaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01_reverse.png'},
				{name : 'midileaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02_reverse.png'},
				{name : 'midileaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_reverse.png'},
				{name : 'midileaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long_reverse.png'},
				
				{name : 'midibranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_01.png'},
				{name : 'midibranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_02.png'},
				{name : 'midibranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_03.png'},
				
				{name : 'midifruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_midi_theme_01.png'},
				{name : 'midifruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_midi_theme_02.png'},

				{name : 'midithemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/midi_Theme.png'},
				
				{name : 'midilogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : '80s',
			assets : [
				{name : '80sroot', srcs : 'plugins/LinkedTree/assets/root_theme_80s.png'},
				{name : '80sbranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_01.png'},
				{name : '80sbranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_root.png'},
				{name : '80sleaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_01.png'},
				{name : '80sleaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_02.png'},
				{name : '80sleaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_03.png'},
				{name : '80sleaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_03_long.png'},
				{name : '80sleaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_01_reverse.png'},
				{name : '80sleaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_02_reverse.png'},
				{name : '80sleaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_03_reverse.png'},
				{name : '80sleaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_80s_03_long_reverse.png'},
				
				{name : '80sbranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_80s_01.png'},
				{name : '80sbranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_80s_02.png'},
				{name : '80sbranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_80s_03.png'},
				
				{name : '80sfruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_80s_01.png'},
				{name : '80sfruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_80s_02.png'},

				{name : '80sthemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/80s_Theme.png'},
				
				{name : '80slogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		}
	]
};
		
		
		
		
module.exports = new Promise(function(resolve, reject) {
		// @ts-ignore
		PIXI.Assets.init({manifest}).then(function() {
			Promise.all([
				// @ts-ignore
				PIXI.Assets.loadBundle('midi'),
				// @ts-ignore
				PIXI.Assets.loadBundle('80s'),
			]).then(function(loadedAssets) {
				resolve(loadedAssets);
			});
		});
	});