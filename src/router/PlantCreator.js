/**
 * @typedef {Object} PIXI.Texture
 * @typedef {Object} PIXI.Graphics
 * @typedef  {Function} getMarginInline
 * @typedef  {Function} getMarginBlock
 * @typedef  {Function} getBorderBlock
 * @typedef {String} UID
 * @typedef {{[key:String] : getMarginInline|getMarginBlock}} Offsets
 * @typedef {{[key:String] : getBorderBlock}} Dimensions
 * @typedef {{[key:String] : PIXI.Graphics}} CanvasShape
 * @typedef {{[key:String] : Offsets|Dimensions}} LayoutAlgo
 * @typedef {{[key:String] : LayoutNode|CanvasShape|LayoutAlgo|UID|String}} LayoutNode
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

const RecurringCallbackTween = require('src/GameTypes/tweens/RecurringCallbackTween');
const DelayedCooledDownRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownRecurringCallbackTween');
const DelayedCooledDownWeightedRecurringCallbackTween = require('src/GameTypes/tweens/DelayedCooledDownWeightedRecurringCallbackTween');
const DelayedOneShotCallbackTween = require('src/GameTypes/tweens/DelayedOneShotCallbackTween');
const DelayedPropFadeOneShotCallbackTween = require('src/GameTypes/tweens/DelayedPropFadeOneShotCallbackTween');
const DelayedWeightedMultiPropFadeOneShotCallbackLastTween = require('src/GameTypes/tweens/DelayedWeightedMultiPropFadeOneShotCallbackLastTween');

/*
 * TODOS:
 * - fallback on a more stepped-animation when the map is huge (pass mapSize = 'medium', or mapSize = 'big' in a first implem)
 * - allow not randomizing the fruit sizes
 * - Make a logo
 * - Benchmark on another machine
 */


/**
 * @constructor RolloverRef
 * @param {LayoutNode} node
 * @param {LayoutNode|Null} currentOrigin
 */
const RolloverRef = function(node, currentOrigin  = null) {
	this.UID = node._UID;
	this.currentOrigin = currentOrigin;
	
	this.node = node;
	/** @type {BranchSprite} */
	this.previousBranch;
	/** @type {BranchSprite} */
	this.underlyingBranch;
	/** @type {LayoutNode[]} */
	this.textNodes = [];
	/** @type {LayoutNode[]} */
	this.nextNode = [];
	/** @type {BranchSprite[]} */
	this.nextBranch = [];
	/** @type {FruitSprite} */
	this.fruit;
	/** @type {DelayedWeightedMultiPropFadeOneShotCallbackLastTween} */
	this.fruitTween;
	/** @type {DelayedWeightedMultiPropFadeOneShotCallbackLastTween[]} */
	this.textTweens = [];
	/** @type {DelayedWeightedMultiPropFadeOneShotCallbackLastTween[]} */
	this.leafTweens = [];
}




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
		alpha : .55,
		distance : 19
	});
	
	// @ts-ignore "cannot use namespace" "as a value" (Most TypeScript types (excluding a few things like enums) do not translate to runtime as they are used for compile time type checking)
	 this.blurFilter = new PIXI.filters.BlurFilter(16, 1);
	 
	/** @type {LayoutNode} */
	this.rootNode = this.layoutTree['2'][1];
	this.subInterval = this.themeOptions.curveType === 'doubleQuad' ? 7 : 12;	// speed of the animation
	this.maxDistanceBeforeIntertweenBypass = 2500;
	/** @type {{[key:String] : Number}} */
	this.delaysMap = {};
	/** @type {{[key:UID] : RolloverRef}}*/
	this.rolloverRefs = {};
		
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
	if (this.themeOptions.blurNodeBoxes) {
		// @ts-ignore : LayoutNode type isn't completely mocked
		this.rootNode.canvasShape.shape.filters = [this.blurFilter];
	}
	
	GameLoop().addSpriteToScene(
		rootSprite
	);
	
	if (this.themeOptions.showRootBox) {
		if (GameState().animableState) {
			// @ts-ignore : LayoutNode type isn't completely mocked
			this.rootNode.canvasShape.shape.alpha = 0;
			GameLoop().unshiftTween(
				// @ts-ignore  LayoutNode type isn't completely mocked
				new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, 'addChild', 0, [this.rootNode.canvasShape.shape], null, null, this.rootNode.canvasShape.shape, 'alpha', 1, this.subInterval)
			);
		}
		else
			// @ts-ignore : LayoutNode type isn't completely mocked
			GameLoop().stage.addChild(this.rootNode.canvasShape.shape);
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
		refDistance = 500;
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
				// @ts-ignore
				this.rolloverRefs[node._UID] = new RolloverRef(node, currentOrigin);
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
				
				// @ts-ignore
				this.rolloverRefs[node._UID].previousBranch = branchSprite;
				if (currentOrigin !== this.rootNode) {
					// @ts-ignore
					this.rolloverRefs[currentOrigin._UID].nextBranch.push(branchSprite);
					// @ts-ignore
					this.rolloverRefs[currentOrigin._UID].nextNode.push(node);
				}
				
				
				if (branchSprite.totalDistance > this.maxDistanceBeforeIntertweenBypass)
					branchSprite.isBigBranch();
				
//				console.log(branchSprite.stepCount / branchSprite.effectiveStepCount); //branchSprite.stepCount /
				
//				console.log(node._UID)
				// @ts-ignore : LayoutNode type isn't completely mocked
				localDeltaTime = this.delaysMap[currentOrigin._UID].offset;
				distanceWeightedFactor = branchSprite.totalDistance / refDistance;
				effectiveInterval = this.subInterval * distanceWeightedFactor;	// (branchSprite.animationTriggersCount) * 
				deltaTimeOffset = branchSprite.animationTriggersCount * effectiveInterval;
				effectiveDuration += deltaTimeOffset;
				
//				console.log(effectiveDuration);
				
				if (themeDescriptors[GameState().currentTheme].dropShadows)
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					branchSprite.spriteObj.filters = [this.shadowFilter];
				
				GameLoop().addSpriteToScene(
					branchSprite
				);
				
				if (GameState().animableState) {
					branchTween = new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, effectiveInterval, branchSprite.effectiveStepCount, localDeltaTime, branchSprite.totalDistance); 
					branchTween.updateWeights(branchSprite.averageWeights);
					GameLoop().unshiftTween(
						branchTween
					);
				}
				
				if (currentDepth <= 4) {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branchRoot : GameState().currentTheme + branchRoot + 'Reverse'
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				else {
					branchTextureName = !branchOptions.isReversed ? GameState().currentTheme + branch01 : GameState().currentTheme + branch01 + 'Reverse'
					branchSprite = new BranchSprite(positionEnd, positionContinued, loadedAssets[themeDescriptors[GameState().currentTheme].id][branchTextureName], branchOptions);
				}
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				this.rolloverRefs[node._UID].underlyingBranch = branchSprite;
				
				distanceWeightedFactor = branchSprite.totalDistance / refDistance;
				effectiveInterval = this.subInterval * distanceWeightedFactor;	// (branchSprite.animationTriggersCount) * 
				
				GameLoop().addSpriteToScene(
					branchSprite
				);
				
				if (GameState().animableState) {
					branchTween = new DelayedCooledDownWeightedRecurringCallbackTween(branchSprite, spriteCallbackName, effectiveInterval, branchSprite.animationTriggersCount, localDeltaTime + deltaTimeOffset); 
					branchTween.updateWeights(branchSprite.averageWeights);
					GameLoop().unshiftTween(
						branchTween
					);
				}
				
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
					
					// @ts-ignore
					this.rolloverRefs[node._UID].fruit = fruitSprite;
					
					if (themeDescriptors[GameState().currentTheme].dropShadows) {
						// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
						fruitSprite.spriteObj.filters = [this.shadowFilter];
					}
					
					if (GameState().animableState) {
						// @ts-ignore : LayoutNode type isn't completely mocked
						fruitSprite.alpha = 0
						GameLoop().unshiftTween(
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + effectiveDuration, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						GameLoop().addSpriteToScene(fruitSprite);
				}
				
				if (this.themeOptions.showNodeBox) {
					if (GameState().animableState) {
						// @ts-ignore : LayoutNode type isn't completely mocked
						node.canvasShape.shape.alpha = 0
						GameLoop().unshiftTween(
							// @ts-ignore : LayoutNode type isn't completely mocked
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + effectiveDuration + standardFruitFadeDuration * 2, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						// @ts-ignore : LayoutNode type isn't completely mocked
						GameLoop().stage.addChild(node.canvasShape.shape);
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.on('mouseenter', this.handleHoverEffect.bind(this, node._UID));
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.on('mouseout', this.handleHoverEndedEffect.bind(this, node._UID));
					// @ts-ignore : LayoutNode type isn't completely mocked
					node.canvasShape.shape.interactive = true;
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
				// @ts-ignore
				this.rolloverRefs[node._UID] = new RolloverRef(node, currentOrigin);
				
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
				
				// @ts-ignore
				this.rolloverRefs[node._UID].previousBranch = leafSprite;
				if (currentOrigin !== this.rootNode) {
					// @ts-ignore
					this.rolloverRefs[currentOrigin._UID].nextBranch.push(leafSprite);
					// @ts-ignore
					this.rolloverRefs[currentOrigin._UID].nextNode.push(node);
				}
				
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
				GameLoop().unshiftTween(
					new DelayedCooledDownWeightedRecurringCallbackTween(leafSprite, spriteCallbackName, this.subInterval, leafSprite.animationTriggersCount, localDeltaTime)
				);
				
				if (this.themeOptions.showLeafFruits && this.getRandomFruitAsBool()) {
					randomFruitZoom = Math.random() / 4 + .45;
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
					
					if (GameState().animableState) {
						// @ts-ignore : TS doesn't understand anything to prototypal inheritance
						fruitSprite.alpha = 0;
						// @ts-ignore : TS doesn't understand anything to prototypal inheritance
						fruitSprite.rotation = !branchOptions.isReversed ? -30 : 15;
						GameLoop().unshiftTween(
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + deltaTimeOffset - standardFruitFadeDuration, [fruitSprite.spriteObj], null, null, fruitSprite.spriteObj, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						GameLoop().addSpriteToScene(fruitSprite);
				}
				
				if (this.themeOptions.showLeafBox) {
					if (GameState().animableState) {
						// @ts-ignore : LayoutNode type isn't completely mocked
						node.canvasShape.shape.alpha = 0
						GameLoop().unshiftTween(
							// @ts-ignore : LayoutNode type isn't completely mocked
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + deltaTimeOffset + standardFruitFadeDuration * 1.5, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						// @ts-ignore : LayoutNode type isn't completely mocked
						GameLoop().stage.addChild(node.canvasShape.shape);
				}
				if (themeDescriptors[GameState().currentTheme].dropShadows) {
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					leafSprite.spriteObj.filters = [this.shadowFilter];
				}
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.canvasShape.shape.filters = Array();
				if (this.themeOptions.blurNodeBoxes) {
					// @ts-ignore : PIXI.SimpleRope type isn't completely mocked
					node.canvasShape.shape.filters.push(this.blurFilter);
					// @ts-ignore : PIXI isn't realy mocked
					node.canvasShape.shape.blendMode = PIXI.BLEND_MODES.ADD;
				}
				
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.canvasShape.shape.on('mouseenter', this.handleHoverEffect.bind(this, node._UID));
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.canvasShape.shape.on('mouseout', this.handleHoverEndedEffect.bind(this, node._UID));
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.canvasShape.shape.interactive = true;
			}
			else if (node.nodeName === textNodeName || node.nodeName === subTextNodeName) {
				// @ts-ignore : LayoutNode type isn't completely mocked
				if (node._parent.nodeName === spanNodeName) {
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					if (node._parent._parent._UID !== this.rootNode._UID)
						// @ts-ignore : LayoutNode type isn't completely mocked
						this.rolloverRefs[node._parent._parent._UID].textNodes.push(node);
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDeltaTime = this.delaysMap[node._parent._parent._UID].offset;
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDuration = this.delaysMap[node._parent._parent._UID].duration;
					if (GameState().animableState) {
						// @ts-ignore : LayoutNode type isn't completely mocked
						node.canvasShape.shape.alpha = 0
						GameLoop().unshiftTween(
							// @ts-ignore : LayoutNode type isn't completely mocked
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + standardFruitFadeDuration * 4, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						// @ts-ignore : LayoutNode type isn't completely mocked
						GameLoop().stage.addChild(node.canvasShape.shape);
				}
				// @ts-ignore : LayoutNode type isn't completely mocked
				else if (node._parent.nodeName === leafNodeName) {
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					this.rolloverRefs[node._parent._UID].textNodes.push(node);
					
					// @ts-ignore : LayoutNode type isn't completely mocked
					localDeltaTime = this.delaysMap[node._parent._UID].offset;
					if (GameState().animableState) {
						// @ts-ignore : LayoutNode type isn't completely mocked
						node.canvasShape.shape.alpha = 0
						GameLoop().unshiftTween(
							// @ts-ignore : LayoutNode type isn't completely mocked
							new DelayedPropFadeOneShotCallbackTween(GameLoop().stage, nodeCallbackName, localDeltaTime + standardFruitFadeDuration * 3, [node.canvasShape.shape], null, null, node.canvasShape.shape, alphaPropName, 1, standardFruitFadeDuration)
						);
					}
					else
						// @ts-ignore : LayoutNode type isn't completely mocked
						GameLoop().stage.addChild(node.canvasShape.shape);
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
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline() + currentOrigin.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2 + currentOrigin.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
		)
		]
		: [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2 + currentOrigin.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
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
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.layoutAlgo.dimensions.getBorderInline() + currentOrigin.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2 + currentOrigin.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.layoutAlgo.dimensions.getBorderInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
			)
		]
		: [
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginInline() + currentOrigin.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				currentOrigin.layoutAlgo.offsets.getMarginBlock() + currentOrigin.layoutAlgo.dimensions.getBorderBlock() / 2 + currentOrigin.canvasShape.shape.y
			),
			new Point(
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginInline() + node.canvasShape.shape.x,
				// @ts-ignore : LayoutNode type isn't completely mocked
				node.layoutAlgo.offsets.getMarginBlock() + node.layoutAlgo.dimensions.getBorderBlock() / 2 + node.canvasShape.shape.y
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

/**
 * @method getRandomLeaf
 */
PlantCreator.prototype.getRandomFruitAsBool = function() {
	return Math.random() > .4;
}

/**
 * @method handleHoverEffect
 * @param {String} UID
 */
PlantCreator.prototype.handleHoverEffect = function(UID) {
	const node = this.rolloverRefs[UID].node;
	if (node.blockingTween)
		return;
	
	// @ts-ignore too lazy to mock a tween-typed prop on LayoutNode (by all means it's a hack for now)
	node.blockingTween = new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
		// @ts-ignore
		node,
		'resetBlockingTween',
		0,
		null,
		null,
		null,
		// @ts-ignore
		node.canvasShape.shape,
		['x'],
		[-25],
		60,
		'easeOutElastic'
	);
	GameLoop().unshiftTween(
		node.blockingTween
	);
	
	this.rolloverRefs[UID].textNodes.forEach(function(textNode) {
		this.rolloverRefs[UID].textTweens.push(
			new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
				// @ts-ignore
				textNode,
				'resetBlockingTween',
				0,
				null,
				null,
				null,
				// @ts-ignore
				textNode.canvasShape.shape,
				['x'],
				// @ts-ignore
				[-25],
				60,
				'easeOutElastic'
			)
		);
		GameLoop().unshiftTween(
			this.rolloverRefs[UID].textTweens[this.rolloverRefs[UID].textTweens.length - 1]
		);
	}, this);
	
	let positionTween = new RecurringCallbackTween(
		this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].node, this.rolloverRefs[UID].currentOrigin),
		5,
		[
			this.rolloverRefs[UID].previousBranch.options.isReversed,
			this.rolloverRefs[UID].previousBranch
		],
		null,
		null,
		12
	);
	GameLoop().unshiftTween(
		positionTween
	);
	
	if (this.rolloverRefs[UID].nextBranch.length) {
		this.rolloverRefs[UID].nextBranch.forEach(function(nextBranch, key) {
			positionTween = new RecurringCallbackTween(
				this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].nextNode[key], this.rolloverRefs[UID].node),
				5,
				[
					nextBranch.options.isReversed,
					nextBranch
				],
				null,
				null,
				12
			);
			GameLoop().unshiftTween(
				positionTween
			);
		}, this);
	}
	
	if (this.rolloverRefs[UID].underlyingBranch) {
		positionTween = new RecurringCallbackTween(
			this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].node, this.rolloverRefs[UID].currentOrigin),
			5,
			[
				this.rolloverRefs[UID].underlyingBranch.options.isReversed,
				this.rolloverRefs[UID].underlyingBranch,
				true
			],
			null,
			null,
			12
		);
		GameLoop().unshiftTween(
			positionTween
		);
	}
	
	if (this.rolloverRefs[UID].fruit) {
		this.rolloverRefs[UID].fruitTween = new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
			// @ts-ignore
			node,
			'resetBlockingTween',
			0,
			null,
			null,
			null,
			this.rolloverRefs[UID].fruit,
			['x'],
			[-25],
			60,
			'easeOutElastic'
		);
		GameLoop().unshiftTween(
			this.rolloverRefs[UID].fruitTween
		);
	}
	
	// @ts-ignore
	if (this.rolloverRefs[UID].nextBranch.length && this.rolloverRefs[UID].nextBranch[0].objectType === 'LeafSprite') {
		this.rolloverRefs[UID].nextNode.forEach(function(nextNode) {
			this.rolloverRefs[UID].leafTweens.push(
				new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
					// @ts-ignore
					nextNode,
					'resetBlockingTween',
					0,
					null,
					null,
					null,
					// @ts-ignore
					nextNode.canvasShape.shape,
					['x'],
					[-5],
					90,
					'easeOutElastic'
				)
			);
			GameLoop().unshiftTween(
				this.rolloverRefs[UID].leafTweens[this.rolloverRefs[UID].leafTweens.length - 1]
			);
		}, this);
	}
}

/**
 * @method handleHoverEndedEffect
 * @param {String} UID
 */
PlantCreator.prototype.handleHoverEndedEffect = function(UID) {
	const node = this.rolloverRefs[UID].node;
	if (node.blockingTween) {
		// @ts-ignore too lazy to mock a tween-typed prop on LayoutNode (by all means it's a hack for now)
		node.blockingTween.ended = true;
	}
	if (this.rolloverRefs[UID].fruitTween)
		this.rolloverRefs[UID].fruitTween.ended = true;
		
	if (this.rolloverRefs[UID].leafTweens.length) {
		this.rolloverRefs[UID].leafTweens.forEach(function(tween) {
			tween.ended = true;
		});
	}
	this.rolloverRefs[UID].textTweens.forEach(function(tween) {
		tween.ended = true;
	});
	
	
	const tween = new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
		// @ts-ignore
		node,
		'resetBlockingTween',
		0,
		null,
		null,
		null,
		// @ts-ignore
		node.canvasShape.shape,
		['x'],
		// @ts-ignore
		[-node.canvasShape.shape.x],
		7,
		'linear'
	);
	GameLoop().unshiftTween(
		tween
	);
	
	this.rolloverRefs[UID].textNodes.forEach(function(textNode) {
		GameLoop().unshiftTween(
			new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
				// @ts-ignore
				textNode,
				'resetBlockingTween',
				0,
				null,
				null,
				null,
				// @ts-ignore
				textNode.canvasShape.shape,
				['x'],
				// @ts-ignore
				[-(textNode.canvasShape.shape.x - textNode.layoutAlgo.offsets.getMarginInline())],
				7,
				'linear'
			)
		);
	}, this);
	this.rolloverRefs[UID].textTweens.length = 0;
	
	let positionTween = new RecurringCallbackTween(
		this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].node, this.rolloverRefs[UID].currentOrigin),
		3,
		[
			this.rolloverRefs[UID].previousBranch.options.isReversed,
			this.rolloverRefs[UID].previousBranch
		],
		null,
		null,
		2
	);
	GameLoop().unshiftTween(
		positionTween
	);
	
	if (this.rolloverRefs[UID].nextBranch.length) {
		this.rolloverRefs[UID].nextBranch.forEach(function(nextBranch, key) {
			positionTween = new RecurringCallbackTween(
				this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].nextNode[key], this.rolloverRefs[UID].node),
				3,
				[
					nextBranch.options.isReversed,
					nextBranch
				],
				null,
				null,
				3
			);
			GameLoop().unshiftTween(
				positionTween
			);
		}, this);
	}
	
	if (this.rolloverRefs[UID].underlyingBranch) {
		positionTween = new RecurringCallbackTween(
			this.refreshPositionsForNodeElasticity.bind(this, this.rolloverRefs[UID].node, this.rolloverRefs[UID].currentOrigin),
			3,
			[
				this.rolloverRefs[UID].underlyingBranch.options.isReversed,
				this.rolloverRefs[UID].underlyingBranch,
				true
			],
			null,
			null,
			3
		);
		GameLoop().unshiftTween(
			positionTween
		);
	}
	
	if (this.rolloverRefs[UID].fruit) {
		this.rolloverRefs[UID].fruitTween.ended = true;
		GameLoop().unshiftTween(
			new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
				// @ts-ignore
				node,
				'resetBlockingTween',
				0,
				null,
				null,
				null,
				this.rolloverRefs[UID].fruit,
				['x'],
				// @ts-ignore
				[-(this.rolloverRefs[UID].fruit.x - node.layoutAlgo.offsets.getMarginInline())],
				7,
				'linear'
			)
		);
	}
	
	// @ts-ignore
	if (this.rolloverRefs[UID].nextBranch.length && this.rolloverRefs[UID].nextBranch[0].objectType === 'LeafSprite') {
		this.rolloverRefs[UID].nextNode.forEach(function(nextNode) {
			GameLoop().unshiftTween(
				new DelayedWeightedMultiPropFadeOneShotCallbackLastTween(
					// @ts-ignore
					nextNode,
					'resetBlockingTween',
					0,
					null,
					null,
					null,
					// @ts-ignore
					nextNode.canvasShape.shape,
					['x'],
					// @ts-ignore
					[-nextNode.canvasShape.shape.x],
					15,
					'linear'
				)
			);
		}, this);
		this.rolloverRefs[UID].leafTweens.length = 0;
	}
}

/**
 * @method refreshPositionsForNodeElasticity
 * @param {LayoutNode} node
 * @param {LayoutNode} currentOrigin
 * @param {Boolean} isReversed
 * @param {BranchSprite} branchToUpdate
 * @param {Boolean} isUnderlying
 */
PlantCreator.prototype.refreshPositionsForNodeElasticity = function(node, currentOrigin, isReversed, branchToUpdate, isUnderlying = false) {
	let newPositions;
	if (branchToUpdate.objectType === 'BranchSprite')
		newPositions = this.getBranchPosition(node, currentOrigin, isReversed);
	else if (branchToUpdate.objectType === 'LeafSprite')
		newPositions = this.getLeafPosition(node, currentOrigin, isReversed);
		
	if (!isUnderlying)
		branchToUpdate.updateGrownBranchCoordinates(newPositions[0], newPositions[1])
	else
		branchToUpdate.updateGrownBranchCoordinates(newPositions[1], newPositions[2]);
}















 
 
 
 
module.exports = PlantCreator;