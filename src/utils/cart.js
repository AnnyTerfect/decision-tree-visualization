
// Description: Classification and Regression Tree (CART) implementation

export class DecisionTree {
	// Constructor
	constructor() {
		this.root = null;
		this.tree = null;
	}

	// Function to fit the data
	fit(X, y) {
		// Creating the root node
		this.root = new Node(X, y);
		// Creating the tree
		this.tree = this.root.createTree();
	}

	// Function to predict the output
	predict(X) {
		// Creating the output array
		let output = [];
		// Looping through the input array
		for (let i = 0; i < X.length; i++) {
			// Getting the prediction
			let prediction = this.root.getTreePrediction(X[i]);
			// Pushing the prediction to the output array
			output.push(prediction);
		}
		// Returning the output array
		return output;
	}

	// Get number of nodes
	getNumLeaves() {
		function numLeaves(node) {
			if (node === null) {
				return 0;
			}
			if (node.leaf) {
				return 1;
			}
			return numLeaves(node.left) + numLeaves(node.right);
		}
		return numLeaves(this.tree); 
	}

	// Get depth of tree
	getDepth() {
		function depth(node) {
			if (node === null) {
				return 0;
			}
			if (node.leaf) {
				return 1;
			}
			return Math.max(depth(node.left), depth(node.right)) + 1;
		}
		return depth(this.tree);
	}
}

// Class for Node
class Node {
	// Constructor
	constructor(X, y) {
		this.X = X;
		this.y = y;
		this.left = null;
		this.right = null;
		this.split = null;
		this.splitValue = null;
		this.leaf = false;
		this.prediction = null;
	}

	// Function to create the tree
	createTree() {
		// Getting the best split
		let bestSplit = this.getBestSplit();
		// Checking if the best split is null
		if (bestSplit === null) {
			// Setting the leaf to true
			this.leaf = true;
			// Getting the prediction
			this.prediction = this.getPrediction();
			// Returning the node
			return this;
		}
		// Getting the split
		this.split = bestSplit.split;
		// Getting the split value
		this.splitValue = bestSplit.splitValue;
		// Getting the left and right data
		let leftData = this.getLeftData(this.split, this.splitValue);
		let rightData = this.getRightData(this.split, this.splitValue);
		// Creating the left node
		let leftDataX = leftData.map((x) => x.X);
		let leftDatay = leftData.map((x) => x.y);
		this.left = new Node(leftDataX, leftDatay);
		// Creating the right node
		let rightDataX = rightData.map((x) => x.X);
		let rightDatay = rightData.map((x) => x.y);
		this.right = new Node(rightDataX, rightDatay);
		// Creating the left tree
		this.left.createTree();
		// Creating the right tree
		this.right.createTree();
		// Returning the node
		return this;
	}

	// Function to get the best split
	getBestSplit() {
		if (this.X.length === 0) {
			return null;
		}
		if (this.y.reduce((a, b) => a === b ? a : NaN) === this.y[0]) {
			return null;
		}
		// Getting the number of features
		let numFeatures = this.X[0].length;
		// Getting the number of data points
		// let numDataPoints = this.X.length;
		// Getting the best split
		let bestSplit = null;
		// Looping through the features
		for (let i = 0; i < numFeatures; i++) {
			// Getting the feature values
			let featureValues = this.X.map((x) => x[i]);
			// Getting the unique feature values
			let uniqueFeatureValues = [...new Set(featureValues)];
			// Looping through the unique feature values
			uniqueFeatureValues.sort();
			let cutPoints = [];
			for (let j = 1; j < uniqueFeatureValues.length; j++) {
				cutPoints.push((uniqueFeatureValues[j] + uniqueFeatureValues[j - 1]) / 2);
			}
			for (let j = 0; j < cutPoints.length; j++) {
				// Getting the split
				let split = this.getSplit(i, cutPoints[j]);
				// Checking if the split is null
				if (split === null) {
					continue;
				}
				// Checking if the best split is null
				if (bestSplit === null) {
					// Setting the best split
					bestSplit = split;
				} else {
					// Checking if the impurity is less than the best split
					if (split.impurity < bestSplit.impurity) {
						// Setting the best split
						bestSplit = split;
					}
				}
			}
		}
		// Returning the best split
		return bestSplit;
	}

	// Function to get the split
	getSplit(split, splitValue) {
		// Getting the left and right data
		let leftData = this.getLeftData(split, splitValue);
		let rightData = this.getRightData(split, splitValue);
		// Getting the impurity
		let leftDatay = leftData.map((x) => x.y);
		let rightDatay = rightData.map((x) => x.y);
		let impurity = this.getImpurity(leftDatay, rightDatay);
		// Checking if the impurity is null
		if (impurity === null) {
			// Returning null
			return null;
		}
		// Returning the split
		return {
			split: split,
			splitValue: splitValue,
			impurity: impurity,
		};
	}

	// Function to get the left data
	getLeftData(split, splitValue) {
		// Checking if the split and split value is null
		if (split === null && splitValue === null) {
			// Getting the left data
			let leftData = this.X.map((x, i) => {
				return {
					X: x,
					y: this.y[i],
				};
			});
			// Returning the left data
			return leftData;
		}
		// Getting the left data
		let leftData = this.X.map((x, i) => {
			return {
				X: x,
				y: this.y[i],
			};
		});
		// Filtering the left data
		leftData = leftData.filter((x) => x.X[split] <= splitValue);
		// Returning the left data
		return leftData;
	}

	// Function to get the right data
	getRightData(split, splitValue) {
		// Checking if the split and split value is null
		if (split === null && splitValue === null) {
			// Getting the right data
			let rightData = this.X.map((x, i) => {
				return {
					X: x,
					y: this.y[i],
				};
			});
			// Returning the right data
			return rightData;
		}
		// Getting the right data
		let rightData = this.X.map((x, i) => {
			return {
				X: x,
				y: this.y[i],
			};
		});
		// Filtering the right data
		rightData = rightData.filter((x) => x.X[split] > splitValue);
		// Returning the right data
		return rightData;
	}

	// Function to get the impurity
	getImpurity(leftY, rightY) {
		// Checking if the left y or right y is null
		if (leftY === null || rightY === null) {
			// Returning null
			return null;
		}
		// Getting the number of data points
		let numDataPoints = this.X.length;
		// Getting the number of left data points
		let numLeftDataPoints = leftY.length;
		// Getting the number of right data points
		let numRightDataPoints = rightY.length;
		// Getting the left impurity
		let leftImpurity = this.getGiniImpurity(leftY);
		// Getting the right impurity
		let rightImpurity = this.getGiniImpurity(rightY);
		// Getting the impurity
		let impurity =
			(numLeftDataPoints / numDataPoints) * leftImpurity +
			(numRightDataPoints / numDataPoints) * rightImpurity;
		// Returning the impurity
		return impurity;
	}

	// Function to get the gini impurity
	getGiniImpurity(y) {
		// Getting the number of data points
		let numDataPoints = y.length;
		// Getting the unique labels
		let uniqueLabels = [...new Set(y)];
		// Getting the gini impurity
		let giniImpurity = 1;
		// Looping through the unique labels
		for (let i = 0; i < uniqueLabels.length; i++) {
			// Getting the label
			let label = uniqueLabels[i];
			// Getting the number of occurrences of the label
			let numOccurrences = y.filter((y) => y === label).length;
			// Getting the probability of the label
			let probability = numOccurrences / numDataPoints;
			// Updating the gini impurity
			giniImpurity -= probability * probability;
		}
		// Returning the gini impurity
		return giniImpurity;
	}

	// Function to get the predictions
	getPredictions(X) {
		// Getting the predictions
		let predictions = X.map((x) => this.getPrediction(x));
		// Returning the predictions
		return predictions;
	}

	// Function to get the prediction
	getPrediction() {
		if (this.y.length === 0) {
			return null;
		}
		let counter = {};
		for (let i = 0; i < this.y.length; i++) {
			let label = this.y[i];
			if (counter[label] === undefined) {
				counter[label] = 0;
			}
			counter[label]++;
		}
		return Number(Object.keys(counter).reduce((a, b) =>
			counter[a] > counter[b] ? a : b
		));
	}

	// Function to get the tree prediction
	getTreePrediction(x) {
		// Checking if the tree is a leaf
		if (this.leaf) {
			// Returning the prediction
			return this.prediction;
		}
		// Getting the split value
		let splitValue = x[this.split];
		// Checking if the split value is less than or equal to the split value
		if (splitValue <= this.splitValue) {
			// Getting the prediction
			return this.left.getTreePrediction(x);
		} else {
			return this.right.getTreePrediction(x); 
		}
	}
}

export function traverse(tree, x1, y1, x2, y2, lines, rects) {
	if (tree === null || tree.leaf) {
		rects.push({ x: x1, y: y1, width: x2 - x1, height: y2 - y1, label: tree.prediction })
		return
	}
	if (tree.split === 0) {
		let line = { x1: tree.splitValue, x2: tree.splitValue, y1: y1, y2: y2 }
		lines.push(line)
		traverse(tree.left, x1, y1, tree.splitValue, y2, lines, rects)
		traverse(tree.right, tree.splitValue, y1, x2, y2, lines, rects)
		return
	}
	if (tree.split === 1) {
		let line = { x1: x1, x2: x2, y1: tree.splitValue, y2: tree.splitValue }
		lines.push(line)
		traverse(tree.left, x1, y1, x2, tree.splitValue, lines, rects)
		traverse(tree.right, x1, tree.splitValue, x2, y2, lines, rects)
		return
	}
}
