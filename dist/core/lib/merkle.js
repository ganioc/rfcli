/*!
 * merkle.js - merkle trees for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module crypto/merkle
 */
const digest = require("./digest");
/**
 * Build a merkle tree from leaves.
 * Note that this will mutate the `leaves` array!
 * @param {Buffer[]} leaves
 * @returns {Array} [nodes, malleated]
 */
function createTree(leaves) {
    const nodes = leaves;
    let size = leaves.length;
    let malleated = false;
    let i = 0;
    if (size === 0) {
        nodes.push(Buffer.alloc(32));
        return [nodes, malleated];
    }
    while (size > 1) {
        for (let j = 0; j < size; j += 2) {
            const k = Math.min(j + 1, size - 1);
            const left = nodes[i + j];
            const right = nodes[i + k];
            if (k === j + 1 && k + 1 === size
                && left.equals(right)) {
                malleated = true;
            }
            const hash = digest.root256(left, right);
            nodes.push(hash);
        }
        i += size;
        size += 1;
        size >>>= 1;
    }
    return [nodes, malleated];
}
exports.createTree = createTree;
/**
 * Calculate merkle root from leaves.
 * @param {Buffer[]} leaves
 * @returns {Array} [root, malleated]
 */
function createRoot(leaves) {
    const [nodes, malleated] = createTree(leaves);
    const root = nodes[nodes.length - 1];
    return [root, malleated];
}
exports.createRoot = createRoot;
/**
 * Collect a merkle branch from vector index.
 * @param {Number} index
 * @param {Buffer[]} leaves
 * @returns {Buffer[]} branch
 */
function createBranch(index, leaves) {
    let size = leaves.length;
    const [nodes] = createTree(leaves);
    const branch = [];
    let i = 0;
    while (size > 1) {
        const j = Math.min(index ^ 1, size - 1);
        branch.push(nodes[i + j]);
        index >>>= 1;
        i += size;
        size += 1;
        size >>>= 1;
    }
    return branch;
}
exports.createBranch = createBranch;
/**
 * Derive merkle root from branch.
 * @param {Buffer} hash
 * @param {Buffer[]} branch
 * @param {Number} index
 * @returns {Buffer} root
 */
function deriveRoot(hash, branch, index) {
    let root = hash;
    for (const branchHash of branch) {
        if (index & 1) {
            root = digest.root256(branchHash, root);
        }
        else {
            root = digest.root256(root, branchHash);
        }
        index >>>= 1;
    }
    return root;
}
exports.deriveRoot = deriveRoot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVya2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL21lcmtsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILFlBQVksQ0FBQzs7QUFFYjs7R0FFRztBQUVILG1DQUFtQztBQUduQzs7Ozs7R0FLRztBQUVILG9CQUEyQixNQUFnQjtJQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUM7SUFDckIsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUN6QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVYsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0IsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztLQUM3QjtJQUVELE9BQU8sSUFBSSxHQUFHLENBQUMsRUFBRTtRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUzQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSTttQkFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkIsU0FBUyxHQUFHLElBQUksQ0FBQzthQUNwQjtZQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXpDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7UUFDRCxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ1YsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUNWLElBQUksTUFBTSxDQUFDLENBQUM7S0FDZjtJQUVELE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQWhDRCxnQ0FnQ0M7QUFFRDs7OztHQUlHO0FBRUgsb0JBQTJCLE1BQWdCO0lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUpELGdDQUlDO0FBRUQ7Ozs7O0dBS0c7QUFFSCxzQkFBNkIsS0FBYSxFQUFFLE1BQWdCO0lBQ3hELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVYsT0FBTyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1FBQ2IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixLQUFLLE1BQU0sQ0FBQyxDQUFDO1FBQ2IsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUNWLElBQUksSUFBSSxDQUFDLENBQUM7UUFDVixJQUFJLE1BQU0sQ0FBQyxDQUFDO0tBQ2Y7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBaEJELG9DQWdCQztBQUVEOzs7Ozs7R0FNRztBQUVILG9CQUEyQixJQUFZLEVBQUUsTUFBZ0IsRUFBRSxLQUFhO0lBQ3BFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUVoQixLQUFLLE1BQU0sVUFBVSxJQUFJLE1BQU0sRUFBRTtRQUM3QixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDWCxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNILElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztTQUMzQztRQUVELEtBQUssTUFBTSxDQUFDLENBQUM7S0FDaEI7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDO0FBZEQsZ0NBY0MifQ==