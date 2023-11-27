/**
 * @typedef {Object} PIXI.Texture
 * @typedef {Object} PIXI.Graphics
 * @typedef  {Function} getMarginInline
 * @typedef  {Function} getMarginBlock
 * @typedef  {Function} getBorderBlock
 * @typedef {{[key:String] : getMarginInline|getMarginBlock}} Offsets
 * @typedef {{[key:String] : getBorderBlock}} Dimensions
 * @typedef {{[key:String] : PIXI.Graphics}} CanvasShape
 * @typedef {{[key:String] : Offsets|Dimensions}} LayoutAlgo
 * @typedef {{[key:String] : LayoutNode|CanvasShape|LayoutAlgo|String}} LayoutNode
 */

const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<{[key:String] : PIXI.Texture}>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const {Point} = require('src/GameTypes/gameSingletons/CoreTypes');
const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const {BranchOptions} = require('src/GameTypes/gameSingletons/AppTypes');
const RootSprite = require('src/GameTypes/sprites/RootSprite');
const BranchSprite = require('src/GameTypes/sprites/BranchSprite');
const LeafSprite = require('src/GameTypes/sprites/LeafSprite');
const FruitSprite = require('src/GameTypes/sprites/FruitSprite');

const DelayedCooledDownRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownRecurringCallbackTween');
const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');
const DelayedOneShotCallbackTween = require('src/GameTypes/tweens/DelayedOneShotCallbackTween');
const DelayedPropFadeOneShotCallbackTween = require('src/GameTypes/tweens/DelayedPropFadeOneShotCallbackTween');

/*
 * TODOS:
 * - condition the animation speed to the theme
 * - allow not randomizing the fruit sizes
 * - log the difference between animation-steps and weights
 * - Make a logo
 * - Benchmark on another machine
 * - Re-implment intertweens
 */

/**
 * @constructor PlantCreator
 * @param {{[key:String]:Array<LayoutNode>}} layoutTree
 */
const PlantCreator = function(layoutTree) {
	// @ts-ignore PIXI
	PIXI.settings.FILTER_RESOLUTION = .5;
	this.layoutTree = layoutTree;
	this.themeOptions = themeDescriptors[GameState().currentTheme];
	 
	// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
	this.shadowFilter = new PIXI.filters.DropShadowFilter({
		alpha : .4,
		distance : 15
	});
	
	// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
	 this.blurFilter = new PIXI.filters.BlurFilter(21, 1);
	 
	/** @type {LayoutNode} */
	this.rootNode = this.layoutTree['2'][1];
	this.subInterval = this.themeOptions.curveType === 'doubleQuad' ? 7 : 12;	// speed of the animation
	/** @type {{[key:String] : Number}} */
	this.delaysMap = {};
	
	this.maxDepth = Object.keys(layoutTree).length;
	
	this.getRootNode();
	this.getBranches();
}
//PlantCreator.prototype = {};

/**
 * @method getRootNode
 */
PlantCreator.prototype.getRootNode = function() {
	const position = new Point(
		// @ts-ignore : LayoutNode type isn't completely mocked
		this.rootNode.layoutAlgo.offsets.getMarginInline(),
		// @ts-ignore : LayoutNode type isn't completely mocked
		this.rootNode.layoutAlgo.offsets.getMarginBlock() + this.rootNode.layoutAlgo.dimensions.getBorderBlock() / 2
	);
	
	const rootSprite = new RootSprite(position, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'root']);
	// @ts-ignore : LayoutNode type isn't completely mocked
	this.delaysMap[this.rootNode._UID] = {
		offset : 0,
		duration : 10		// let's take a big margin... "1" should be enough
	};
	rootSprite.spriteObj.filters = [this.shadowFilter];
	GameLoop().addSpriteToScene(
		rootSprite
	);
	
	if (this.themeOptions.showRootBox) {
		// @ts-ignore : LayoutNode type isn't completely mocked
		this.rootNode.canvasShape.shape.alpha = 0;
		GameLoop().pushTween(
			// @ts-ignore  LayoutNode type isn't completely mocked
			new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, 'addChild', 0, [this.rootNode.canvasShape.shape], null, null, this.rootNode.canvasShape.shape, 'alpha', 1, this.subInterval)
		);
	}
}
 
PlantCreator.prototype.getBranches = function() {
	const maxDepth = Object.keys(this.layoutTree).length,
		branchNodeName = 'h4',
		spanNodeName = 'span',
		leafNodeName = 'label',
		textNodeName = 'textNode',
		subTextNodeName = 'subTextNode',
		spriteCallbackName = 'getNextStepForPath',
		nodeCallbackName  = 'addChild',
		alphaPropName  = 'alpha',
		rowReverse = 'row-reverse',
		branchRoot = 'branchRoot',
		branch01 = 'branch01',
		fruit01 = 'fruit01',
		fruit02 = 'fruit02',
		branchAnimationSteps = BranchSprite.prototype.stepCount,
		leafAnimationSteps = 3,
		standardFruitFadeDuration = 30,
		maxYExcursion = 80,
		refDistance = 12000;
	let	currentDepth = 4,
		deltaTimeOffset = 0, // branchAnimationSteps * this.subInterval,
		distanceWeightedFactor = 1,
		effectiveInterval = 0,
		effectiveDuration = 0,
		branchOptions = new BranchOptions(),
		isNodeDepth = false,
		candidateParent,
		/** @type {LayoutNode} */
		currentOrigin,
		branchSprite,
		branchTween,
		leafSprite,
		fruitSprite,
		leafTextureName,
		branchTextureName,
		randomFruitZoom = 1,
		localDeltaTime = 0,
		localDuration = 0,
		deltaTime = 0,
	 	positionStart = new Point(0, 0),
	 	positionEnd = new Point(0, 0),
	 	positionContinued = new Point(0, 0),
	 	hackyMaxDuration = 0,
	 	debugSeen = false;
	 	
	while(currentDepth <= maxDepth) {
		isNodeDepth = false;
		this.layoutTree[currentDepth.toString()].forEach(function(node, key) {
//			console.log(node.nodeName);
			if ((node.nodeName !== branchNodeName && node.nodeName !== leafNodeName && node.nodeName !== textNodeName && node.nodeName !== 'subTextNode') || debugSeen)
			 	return;
			 
			// @ts-ignore : LayoutNode type isn't completely mocked
			branchOptions.isReversed = node._parent.layoutAlgo.cs.getFlexDirection() === rowReverse;
			if (currentDepth === 4 && node.nodeName === branchNodeName)
				currentOrigin = this.rootNode;
			else {
				if ((candidateParent = this.getOriginNode(node)) !== currentOrigin)
					currentOrigin = candidateParent;
			}
			
			if (node.nodeName === branchNodeName) {
				effectiveDuration = 0;
//				debugSeen = true;
				isNodeDepth = true;
				[positionStart, positionEnd, positionContinued] = this.getBranchPosition(
					node,
					currentOrigin,
					branchOptions.isReversed
				);
				
				if (currentDepth <= 6) {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branchRoot : GameState().currentTheme + branchRoot + 'Reverse'
					branchSprite = new BranchSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				else {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branch01 : GameState().currentTheme + branch01 + 'Reverse'
					branchSprite = new BranchSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				
//				console.log(branchSprite.stepCount / branchSprite.effectiveStepCount); //branchSprite.stepCount /
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				localDeltaTime = this.delaysMap[currentOrigin._UID].offset;
				distanceWeightedFactor = this.getDistance(positionStart, positionEnd) / refDistance;
				effectiveInterval = (branchSprite.animationTriggersCount) * this.subInterval * distanceWeightedFactor;
				deltaTimeOffset = branchSprite.animationTriggersCount * effectiveInterval;
				effectiveDuration += deltaTimeOffset;
				
//				console.log(effectiveDuration);
				
				if (themeDescriptors[GameState().currentTheme].dropShadows)
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					branchSprite.spriteObj.filters = [this.shadowFilter];
				
				GameLoop().addSpriteToScene(
					branchSprite
				);
				
				branchTween = new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, effectiveInterval, branchSprite.effectiveStepCount, localDeltaTime); 
				branchTween.updateWeights(branchSprite.averageWeights);
				GameLoop().pushTween(
					branchTween
				);
				
				if (currentDepth <= 4) {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branchRoot : GameState().currentTheme + branchRoot + 'Reverse'
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				else {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branch01 : GameState().currentTheme + branch01 + 'Reverse'
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				
				
				distanceWeightedFactor = this.getDistance(positionEnd, positionContinued) / refDistance;
				effectiveInterval = (branchSprite.animationTriggersCount) * this.subInterval * distanceWeightedFactor;
				
				GameLoop().addSpriteToScene(
					branchSprite
				);
				
				branchTween = new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, effectiveInterval, branchSprite.animationTriggersCount, localDeltaTime + deltaTimeOffset); 
				branchTween.updateWeights(branchSprite.averageWeights);
				GameLoop().pushTween(
					branchTween
				);
				
				deltaTimeOffset = branchSprite.animationTriggersCount * effectiveInterval ;
				effectiveDuration += deltaTimeOffset;
				
				hackyMaxDuration = Math.max(hackyMaxDuration, effectiveDuration);
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				this.delaysMap[node._UID] = {
					// @ts-ignore : LayoutNode type isn't completely mocked
					offset : this.delaysMap[currentOrigin._UID].offset + effectiveDuration,
					duration : effectiveDuration
				};
				
				if (this.themeOptions.showBranchFruits) {
					fruitSprite = new FruitSprite(
						new Point(
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.offsets.getMarginInline(),
							positionEnd.y.value
						),
						new Point(
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.dimensions.getBorderInline() * (Math.random() / 4 + .57),
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.dimensions.getBorderBlock() * (Math.random() / 4 + .57)
						),
						loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + fruit01]
					);
					
					if (themeDescriptors[GameState().currentTheme].dropShadows) {
						// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
						fruitSprite.spriteObj.filters = [this.shadowFilter];
					}
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					fruitSprite.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + effectiveDuration, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
				
				if (this.themeOptions.showNodeBox) {
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						// @ts-ignore : LayoutNode type isn't completely mocked
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + effectiveDuration + standardFruitFadeDuration * 2, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
				
				// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
				branchSprite.spriteObj.filters = Array();
				if (this.themeOptions.dropShadows) {
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					branchSprite.spriteObj.filters.push(this.shadowFilter);
				}
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.canvasShape.shape.filters = Array();
				if (this.themeOptions.blurNodeBoxes) {
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					node.canvasShape.shape.filters.push(this.blurFilter);
					// @ts-ignore : PIXI isn't realy mocked
					node.canvasShape.shape.blendMode = PIXI.BLEND_MODES.ADD;
				}
			}
			else if (node.nodeName === leafNodeName) {
				[positionStart, positionEnd] = this.getLeafPosition(
					node,
					currentOrigin,
					branchOptions.isReversed
				);
				
				// Avoid strongly deformed sprites
				if (Math.abs(positionEnd.y.value - positionStart.y.value) > maxYExcursion) {
					leafTextureName = !branchOptions.isReversed
						? 'leaf02Long'
						: 'leaf02LongReverse';
				}
				else {
					leafTextureName = !branchOptions.isReversed
						? 'leaf0' + this.getRandomLeaf(3)
						: 'leaf0' + this.getRandomLeaf(3) + 'Reverse';
				}
				
				leafSprite = new LeafSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + leafTextureName], branchOptions);
				
				effectiveInterval = this.subInterval;
				deltaTimeOffset = leafSprite.effectiveStepCount * effectiveInterval ;
				effectiveDuration = deltaTimeOffset;
				// @ts-ignore : LayoutNode type isn't completely mocked
				localDeltaTime = this.delaysMap[currentOrigin._UID].offset;
				// @ts-ignore : LayoutNode type isn't completely mocked
				this.delaysMap[node._UID] = {
					offset : localDeltaTime + effectiveDuration,
					duration : effectiveDuration
				};
				
				
				GameLoop().addSpriteToScene(
					leafSprite
				);
				GameLoop().pushTween(
					new DelayedCooledDownWeightedRecurringCallbackTween(leafSprite, spriteCallbackName, this.subInterval, leafSprite.stepCount, localDeltaTime)
				);
				
				if (this.themeOptions.showLeafFruits) {
					randomFruitZoom = Math.random() / 4 + .75;
					fruitSprite = new FruitSprite(
						new Point(
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.offsets.getMarginInline() + (branchOptions.isReversed ? node.layoutAlgo.dimensions.getBorderInline() * .59 * randomFruitZoom : 0),
							positionEnd.y.value + 67 * randomFruitZoom
						),
						new Point(
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.dimensions.getBorderInline() * randomFruitZoom / 2,
							// @ts-ignore : LayoutNode type isn't completely mocked
							node.layoutAlgo.dimensions.getBorderBlock() * randomFruitZoom / 2
						),
						loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + fruit02]
					);
					
					if (themeDescriptors[GameState().currentTheme].dropShadows) {
						fruitSprite.spriteObj.filters = [this.shadowFilter];
					}
					
					// @ts-ignore : TS doesn't understand anything to prototypal inheritance
					fruitSprite.alpha = 0;
					// @ts-ignore : TS doesn't understand anything to prototypal inheritance
					fruitSprite.rotation = !branchOptions.isReversed ? -30 : 15;
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + deltaTimeOffset - standardFruitFadeDuration, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
				
				if (this.themeOptions.showLeafBox) {
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						// @ts-ignore : LayoutNode type isn't completely mocked
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + deltaTimeOffset + standardFruitFadeDuration * 1.5, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
				if (themeDescriptors[GameState().currentTheme].dropShadows) {
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					leafSprite.spriteObj.filters = [this.shadowFilter];
				}
			}
			else if (node.nodeName === textNodeName || node.nodeName === subTextNodeName) {
				// @ts-ignore : LayoutNode type isn't completely mocked
				if (node._parent.nodeName === spanNodeName) {
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDeltaTime = this.delaysMap[node._parent._parent._UID].offset;
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDuration = this.delaysMap[node._parent._parent._UID].duration;
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						// @ts-ignore : LayoutNode type isn't completely mocked
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + standardFruitFadeDuration * 4, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
				// @ts-ignore : LayoutNode type isn't completely mocked
				else if (node._parent.nodeName === leafNodeName) {
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDeltaTime = this.delaysMap[node._parent._UID].offset;
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						// @ts-ignore : LayoutNode type isn't completely mocked
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + standardFruitFadeDuration * 3, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
					);
				}
			}
		}, this);
		 
		if (isNodeDepth) {
//			console.log('UpdateDelta', deltaTime, deltaTimeOffset);
			deltaTime += deltaTimeOffset * 2;
		}
		currentDepth += 1;
	 }
}

/**
 * @method getOriginNode
 * @param {LayoutNode} currentNode
 */
PlantCreator.prototype.getOriginNode = function(currentNode) {
	return currentNode.nodeName === 'h4'
		// @ts-ignore : LayoutNode type isn't completely mocked
		? currentNode._parent._parent.previousSibling
		// @ts-ignore : LayoutNode type isn't completely mocked
		: currentNode._parent._parent.previousSibling;
}

/**
 * @method getBranchPosition
 * @param {LayoutNode} node
 * @param {LayoutNode} currentOrigin
 * @param {Boolean} isReversed
 */
PlantCreator.prototype.getBranchPosition = function(node, currentOrigin, isReversed) {
	return !isReversed
		? [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
			,
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
		)
		]
		: [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
}

/**
 * @method getLeafPosition
 * @param {LayoutNode} node
 * @param {LayoutNode} currentOrigin
 * @param {Boolean} isReversed
 */
PlantCreator.prototype.getLeafPosition = function(node, currentOrigin, isReversed) {
	return !isReversed
		? [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
		: [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline(),
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
}

/**
 * @method getDistance
 * @param {Point} startPosition
 * @param {Point} endPosition
 */
PlantCreator.prototype.getDistance = function(startPosition, endPosition) {
	return Math.hypot(endPosition.x.value - startPosition.x.value, endPosition.y.value - startPosition.y.value);
}

/**
 * @method getRandomLeaf
 * @param {Number} count
 */
PlantCreator.prototype.getRandomLeaf = function(count) {
	return Math.abs(Math.floor(Math.random() * count - .0001)).toString();
}













 
 
 
 
module.exports = PlantCreator;