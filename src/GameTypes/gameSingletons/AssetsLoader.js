


// ASSETS PRELOADING
const manifest = {
	bundles : [
		{
			name : 'Midi',
			assets : [
				{name : 'Midiroot', srcs : 'plugins/LinkedTree/assets/root.png'},
				{name : 'Midibranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_01.png'},
				{name : 'MidibranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_root.png'},
				{name : 'Midibranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_01.png'},
				{name : 'MidibranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_root.png'},
				{name : 'Midileaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01.png'},
				{name : 'Midileaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02.png'},
				{name : 'Midileaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03.png'},
				{name : 'Midileaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long.png'},
				{name : 'Midileaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_01_reverse.png'},
				{name : 'Midileaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_02_reverse.png'},
				{name : 'Midileaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_reverse.png'},
				{name : 'Midileaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_03_long_reverse.png'},
				
				{name : 'Midibranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_01.png'},
				{name : 'Midibranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_02.png'},
				{name : 'Midibranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_03.png'},
				
				{name : 'Midifruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_midi_theme_01.png'},
				{name : 'Midifruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_midi_theme_02.png'},

				{name : 'MidithemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/midi_Theme.png'},
				
				{name : 'Midilogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : '80s',
			assets : [
				{name : '80sroot', srcs : 'plugins/LinkedTree/assets/root_theme_80s.png'},
				{name : '80sbranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_01.png'},
				{name : '80sbranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_root.png'},
				{name : '80sbranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_01.png'},
				{name : '80sbranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_80s_root.png'},
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
		},
		{
			name : 'Whitehouse',
			assets : [
				{name : 'Whitehouseroot', srcs : 'plugins/LinkedTree/assets/root_theme_whiteman.png'},
				{name : 'Whitehousebranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_01_theme_whiteman.png'},
				{name : 'WhitehousebranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_root_theme_whiteman.png'},
				{name : 'Whitehousebranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_01_theme_whiteman_reverse.png'},
				{name : 'WhitehousebranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_root_theme_whiteman_reverse.png'},
				{name : 'Whitehouseleaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				{name : 'Whitehouseleaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_whiteman_01.png'},
				
				{name : 'Whitehousebranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_whiteman_01.png'},
				{name : 'Whitehousebranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_whiteman_01.png'},
				{name : 'Whitehousebranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_whiteman_01.png'},
				
				{name : 'Whitehousefruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_whiteman_01.png'},
				{name : 'Whitehousefruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_whiteman_01.png'},

				{name : 'WhitehousethemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/whiteman_theme.png'},
				
				{name : 'Whitehouselogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : 'SteamSoul',
			assets : [
				{name : 'SteamSoulroot', srcs : 'plugins/LinkedTree/assets/root_theme_soulage.png'},
				{name : 'SteamSoulbranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_soulage.png'},
				{name : 'SteamSoulbranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_soulage.png'},
				{name : 'SteamSoulbranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_soulage.png'},
				{name : 'SteamSoulbranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_soulage.png'},
				{name : 'SteamSoulleaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				{name : 'SteamSoulleaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_soulage_01.png'},
				
				{name : 'SteamSoulbranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_soulage_01.png'},
				{name : 'SteamSoulbranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_soulage_01.png'},
				{name : 'SteamSoulbranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_soulage_01.png'},
				
				{name : 'SteamSoulfruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_soulage_01.png'},
				{name : 'SteamSoulfruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_soulage_02.png'},

				{name : 'SteamSoulthemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/soulage_theme.png'},
				
				{name : 'SteamSoullogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : 'MindTrip',
			assets : [
				{name : 'MindTriproot', srcs : 'plugins/LinkedTree/assets/root_theme_michelin.png'},
				{name : 'MindTripbranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_michelin.png'},
				{name : 'MindTripbranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_michelin.png'},
				{name : 'MindTripbranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_michelin.png'},
				{name : 'MindTripbranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_theme_michelin.png'},
				{name : 'MindTripleaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_01.png'},
				{name : 'MindTripleaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_02.png'},
				{name : 'MindTripleaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_02.png'},
				{name : 'MindTripleaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_01.png'},
				{name : 'MindTripleaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_01.png'},
				{name : 'MindTripleaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_02.png'},
				{name : 'MindTripleaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_02.png'},
				{name : 'MindTripleaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_michelin_01.png'},
				
				{name : 'MindTripbranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_michelin_01.png'},
				{name : 'MindTripbranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_michelin_02.png'},
				{name : 'MindTripbranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_michelin_03.png'},
				
				{name : 'MindTripfruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_michelin_01.png'},
				{name : 'MindTripfruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_michelin_01.png'},

				{name : 'MindTripthemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/michelin_theme.png'},
				
				{name : 'MindTriplogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		},
		{
			name : '24H du Mind',
			assets : [
				{name : '24H du Mindroot', srcs : 'plugins/LinkedTree/assets/root_theme_24H.png'},
				{name : '24H du Mindbranch01', srcs : 'plugins/LinkedTree/assets/branches/branch_01_theme_24H.png'},
				{name : '24H du MindbranchRoot', srcs : 'plugins/LinkedTree/assets/branches/branch_root_theme_24H.png'},
				{name : '24H du Mindbranch01Reverse', srcs : 'plugins/LinkedTree/assets/branches/branch_01_theme_24H.png'},
				{name : '24H du MindbranchRootReverse', srcs : 'plugins/LinkedTree/assets/branches/branch_root_theme_24H.png'},
				{name : '24H du Mindleaf00', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_01.png'},
				{name : '24H du Mindleaf01', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_02.png'},
				{name : '24H du Mindleaf02', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_03.png'},
				{name : '24H du Mindleaf02Long', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_01.png'},
				{name : '24H du Mindleaf00Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_01_reverse.png'},
				{name : '24H du Mindleaf01Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_02_reverse.png'},
				{name : '24H du Mindleaf02Reverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_03_reverse.png'},
				{name : '24H du Mindleaf02LongReverse', srcs : 'plugins/LinkedTree/assets/leaves/leaf_theme_24H_01_reverse.png'},
				
				{name : '24H du Mindbranchlet00', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_24H_01.png'},
				{name : '24H du Mindbranchlet01', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_24H_01.png'},
				{name : '24H du Mindbranchlet02', srcs : 'plugins/LinkedTree/assets/branchlets/branchlet_theme_24H_01.png'},
				
				{name : '24H du Mindfruit01', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_24H_01.png'},
				{name : '24H du Mindfruit02', srcs : 'plugins/LinkedTree/assets/fruits/fruit_theme_24H_02.png'},

				{name : '24H du MindthemeBg', srcs : 'plugins/LinkedTree/assets/backgrounds/24H_theme.png'},
				
				{name : '24H du Mindlogo', srcs : 'plugins/LinkedTree/assets/logo.png'}
			]
		}
	]
};
		
		
		
		
module.exports = new Promise(function(resolve, reject) {
		// @ts-ignore
		PIXI.Assets.init({manifest}).then(function() {
			Promise.all([
				// @ts-ignore
				PIXI.Assets.loadBundle('Midi'),
				// @ts-ignore
				PIXI.Assets.loadBundle('80s'),
				// @ts-ignore
				PIXI.Assets.loadBundle('Whitehouse'),
				// @ts-ignore
				PIXI.Assets.loadBundle('SteamSoul'),
				// @ts-ignore
				PIXI.Assets.loadBundle('MindTrip'),
				// @ts-ignore
				PIXI.Assets.loadBundle('24H du Mind')
			]).then(function(loadedAssets) {
				resolve(loadedAssets);
			});
		});
	});