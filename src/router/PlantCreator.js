const AssetsLoader = require('src/GameTypes/gameSingletons/AssetsLoader');
/** @type {Array<Object>} */
let loadedAssets = null;
AssetsLoader.then(function(loadedBundles) {
	loadedAssets = loadedBundles;
});

const {Point} = require('src/GameTypes/gameSingletons/CoreTypes');
const {themeDescriptors} = require('src/GameTypes/gameSingletons/gameConstants');
const GameState = require('src/GameTypes/gameSingletons/GameState');
const GameLoop = require('src/GameTypes/gameSingletons/GameLoop');
const RootSprite = require('src/GameTypes/sprites/RootSprite');
const BranchSprite = require('src/GameTypes/sprites/BranchSprite');
const LeafSprite = require('src/GameTypes/sprites/LeafSprite');
const FruitSprite = require('src/GameTypes/sprites/FruitSprite');

const DelayedCooledDownRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownRecurringCallbackTween');
const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');
const DelayedOneShotCallbackTween = require('src/GameTypes/tweens/DelayedOneShotCallbackTween');
const DelayedPropFadeOneShotCallbackTween = require('src/GameTypes/tweens/DelayedPropFadeOneShotCallbackTween');

/**
 * @constructor PlantCreator
 * 
 */

const PlantCreator = function(layoutTree) {
	 this.layoutTree = layoutTree;
	 this.rootNode = this.layoutTree['2'][1];
	 this.subInterval = 12;
	 this.maxDepth = Object.keys(layoutTree).length;
	 this.themeOptions = themeDescriptors[GameState().currentTheme];
	 this.getRootNode();
	 this.getBranches();
}
PlantCreator.prototype = {};

PlantCreator.prototype.getRootNode = function() {
	const shadowFilter = new PIXI.filters.DropShadowFilter({
			alpha : .4,
			distance : 15
		});
	const position = new Point(
		this.rootNode.layoutAlgo.offsets.getMarginInline(),
		this.rootNode.layoutAlgo.offsets.getMarginBlock() + this.rootNode.layoutAlgo.dimensions.getBorderBlock() / 2
	);
	
	const rootSprite = new RootSprite(position, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + 'root']);
	rootSprite.spriteObj.filters = [shadowFilter];
	GameLoop().addSpriteToScene(
		rootSprite
	);
	
	if (this.themeOptions.showNodeBox) {
		this.rootNode.canvasShape.shape.alpha = 0;
		GameLoop().pushTween(
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
		maxYExcursion = 80,
		deltaTimeOffset = branchAnimationSteps * this.subInterval,
		shadowFilter = new PIXI.filters.DropShadowFilter({
			alpha : .4,
			distance : 15
		});
	let	currentDepth = 4,
		branchOptions = {
			isReversed : false,
			animated : GameState().animableState
		},
		isNodeDepth = false,
		candidateParent,
		currentOrigin,
		branchSprite,
		leafSprite,
		fruitSprite,
		leafTextureName,
		randomFruitZoom = 1,
//		yBranchScale = 0,
		deltaTime = this.subInterval,
	 	positionStart = new Point(0, 0),
	 	positionEnd = new Point(0, 0),
	 	positionContinued = new Point(0, 0),
	 	debugSeen = false;
	 	
	while(currentDepth <= maxDepth) {
		isNodeDepth = false;
//		yBranchScale = 1 + (this.maxDepth / currentDepth) * .3;
		this.layoutTree[currentDepth.toString()].forEach(function(node, key) {
//			console.log(node.nodeName);
			if ((node.nodeName !== branchNodeName && node.nodeName !== leafNodeName && node.nodeName !== textNodeName && node.nodeName !== 'subTextNode') || debugSeen)
			 	return;
			
			branchOptions.isReversed = node._parent.layoutAlgo.cs.getFlexDirection() === rowReverse;
			if (currentDepth === 4 && node.nodeName === branchNodeName)
				currentOrigin = this.rootNode;
			else {
				if ((candidateParent = this.getOriginNode(node)) !== currentOrigin)
					currentOrigin = candidateParent;
			}
			
			if (node.nodeName === branchNodeName) {
//				debugSeen = true;
				isNodeDepth = true;
				[positionStart, positionEnd, positionContinued] = this.getBranchPosition(
					node,
					currentOrigin,
					branchOptions.isReversed
				);
				if (currentDepth <= 6)
					branchSprite = new BranchSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + branchRoot], branchOptions);
				else
					branchSprite = new BranchSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + branch01], branchOptions);
				
				branchSprite.spriteObj.filters = [shadowFilter];
				GameLoop().addSpriteToScene(
					branchSprite
				);
				
				GameLoop().pushTween(
					new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, this.subInterval, branchSprite.stepCount, deltaTime)
				);
				
				if (currentDepth <= 4)
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + branchRoot], branchOptions);
				else
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + branch01], branchOptions);
				
				branchSprite.spriteObj.filters = [shadowFilter];
				GameLoop().addSpriteToScene(
					branchSprite
				);

				GameLoop().pushTween(
					new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, this.subInterval, branchSprite.stepCount, deltaTime + deltaTimeOffset)
				);
				
				if (this.themeOptions.showBranchFruits) {
					fruitSprite = new FruitSprite(
						new Point(
							node.layoutAlgo.offsets.getMarginInline(),
							positionEnd.y.value
						),
						new Point(
							node.layoutAlgo.dimensions.getBorderInline() * (Math.random() / 4 + .57),
							node.layoutAlgo.dimensions.getBorderBlock() * (Math.random() / 4 + .57)
						),
						loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + fruit01]
					);
					
					fruitSprite.spriteObj.filters = [shadowFilter];
					fruitSprite.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset * 1.7, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, deltaTimeOffset)
					);
				}
				
				if (this.themeOptions.showNodeBox) {
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset * 2.4, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, deltaTimeOffset)
					);
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
				
				leafSprite = new LeafSprite(positionStart, positionEnd, loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + leafTextureName], branchOptions.isReversed);
				leafSprite.spriteObj.filters = [shadowFilter];
				GameLoop().addSpriteToScene(
					leafSprite
				);
				GameLoop().pushTween(
					new DelayedCooledDownWeightedRecurringCallbackTween(leafSprite, spriteCallbackName, this.subInterval, leafSprite.stepCount, deltaTime)
				);
				
				if (this.themeOptions.showLeafFruits) {
					randomFruitZoom = Math.random() / 4 + .75;
					fruitSprite = new FruitSprite(
						new Point(
							node.layoutAlgo.offsets.getMarginInline() + (isReversed ? node.layoutAlgo.dimensions.getBorderInline() * .59 * randomFruitZoom : 0),
							positionEnd.y.value + 67 * randomFruitZoom
						),
						new Point(
							node.layoutAlgo.dimensions.getBorderInline() * randomFruitZoom / 2,
							node.layoutAlgo.dimensions.getBorderBlock() * randomFruitZoom / 2
						),
						loadedAssets[themeDescriptors[GameState().currentTheme].id][GameState().currentTheme + fruit02]
					);
					fruitSprite.spriteObj.filters = [shadowFilter];
					fruitSprite.alpha = 0
					fruitSprite.rotation = !isReversed ? -30 : 15;
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset / 9, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, deltaTimeOffset)
					);
				}
				
				if (this.themeOptions.showNodeBox) {
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset / 4, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, deltaTimeOffset)
					);
				}
			}
			else if (node.nodeName === textNodeName || node.nodeName === subTextNodeName) {
				if (node._parent.nodeName === spanNodeName) {
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset / 2, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, deltaTimeOffset)
					);
				}
				else if (node._parent.nodeName === leafNodeName) {
					node.canvasShape.shape.alpha = 0
					GameLoop().pushTween(
						new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, deltaTime + deltaTimeOffset / 2, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, deltaTimeOffset)
					);
				}
			}
		}, this);
		 
		if (isNodeDepth) {
			deltaTime += deltaTimeOffset * 2;
		}
		currentDepth += 1;
	 }
}

PlantCreator.prototype.getOriginNode = function(currentNode) {
	return currentNode.nodeName === 'h4'
		? currentNode._parent._parent.previousSibling
		: currentNode._parent._parent.previousSibling;
}

PlantCreator.prototype.getBranchPosition = function(node, currentOrigin, isReversed) {
	return !isReversed
		? [
			new Point(
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline(),
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				node.layoutAlgo.offsets.getMarginInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
			,
			new Point(
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
		)
		]
		: [
			new Point(
				currentOrigin.layoutAlgo.offsets.getMarginInline(),
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				node.layoutAlgo.offsets.getMarginInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
}

PlantCreator.prototype.getLeafPosition = function(node, currentOrigin, isReversed) {
	return !isReversed
		? [
			new Point(
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline(),
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
		: [
			new Point(
				currentOrigin.layoutAlgo.offsets.getMarginInline(),
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2
			),
			new Point(
				node.layoutAlgo.offsets.getMarginInline(),
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2
			)
		]
}

PlantCreator.prototype.getDistanceToFirstLeafInterval = function(startPosition, endPosition) {
	const targetXPosition = startPosition.x.value + (endPosition.x.value - startPosition.x.value) / 4; 
	return Math.hypot(targetXPosition - startPosition.x.value, endPosition.y.value - startPosition.y.value);
}

/**
 * @method getRandomLeaf
 * @param {Number} count
 */
PlantCreator.prototype.getRandomLeaf = function(count) {
	return Math.abs(Math.floor(Math.random() * count - .0001)).toString();
}


 
 
 
 
module.exports = PlantCreator;