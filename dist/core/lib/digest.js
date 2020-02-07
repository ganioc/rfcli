/*!
 * digest.js - hash functions for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module crypto.digest
 */
const assert = require('assert');
const crypto = require('crypto');
const POOL64 = Buffer.allocUnsafe(64);
/**
 * Hash with chosen algorithm.
 * @param {String} alg
 * @param {Buffer} data
 * @returns {Buffer}
 */
function hash(alg, data) {
    return crypto.createHash(alg).update(data).digest();
}
exports.hash = hash;
/**
 * Hash with ripemd160.
 * @param {Buffer} data
 * @returns {Buffer}
 */
function ripemd160(data) {
    return hash('ripemd160', data);
}
exports.ripemd160 = ripemd160;
/**
 * Hash with sha1.
 * @param {Buffer} data
 * @returns {Buffer}
 */
function sha1(data) {
    return hash('sha1', data);
}
exports.sha1 = sha1;
function md5(data) {
    return hash('md5', data);
}
exports.md5 = md5;
/**
 * Hash with sha256.
 * @param {Buffer} data
 * @returns {Buffer}
 */
function sha256(data) {
    return hash('sha256', data);
}
exports.sha256 = sha256;
/**
 * Hash with sha256 and ripemd160 (OP_HASH160).
 * @param {Buffer} data
 * @returns {Buffer}
 */
function hash160(data) {
    return ripemd160(exports.sha256(data));
}
exports.hash160 = hash160;
/**
 * Hash with sha256 twice (OP_HASH256).
 * @param {Buffer} data
 * @returns {Buffer}
 */
function hash256(data) {
    return sha256(exports.sha256(data));
}
exports.hash256 = hash256;
/**
 * Hash left and right hashes with hash256.
 * @param {Buffer} left
 * @param {Buffer} right
 * @returns {Buffer}
 */
function root256(left, right) {
    const data = POOL64;
    assert(left.length === 32);
    assert(right.length === 32);
    left.copy(data, 0);
    right.copy(data, 32);
    return hash256(data);
}
exports.root256 = root256;
/**
 * Create an HMAC.
 * @param {String} alg
 * @param {Buffer} data
 * @param {Buffer} key
 * @returns {Buffer} HMAC
 */
function hmac(alg, data, key) {
    const ctx = crypto.createHmac(alg, key);
    return ctx.update(data).digest();
}
exports.hmac = hmac;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlnZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL2RpZ2VzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQUViOztHQUVHO0FBRUgsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXRDOzs7OztHQUtHO0FBRUgsY0FBcUIsR0FBVyxFQUFFLElBQVk7SUFDNUMsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0RCxDQUFDO0FBRkQsb0JBRUM7QUFFRDs7OztHQUlHO0FBRUgsbUJBQTBCLElBQVk7SUFDcEMsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFGRCw4QkFFQztBQUVEOzs7O0dBSUc7QUFFSCxjQUFxQixJQUFZO0lBQy9CLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRkQsb0JBRUM7QUFFRCxhQUFvQixJQUFZO0lBQzVCLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRkQsa0JBRUM7QUFFRDs7OztHQUlHO0FBRUgsZ0JBQXVCLElBQVk7SUFDakMsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFGRCx3QkFFQztBQUVEOzs7O0dBSUc7QUFFSCxpQkFBd0IsSUFBWTtJQUNsQyxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUZELDBCQUVDO0FBRUQ7Ozs7R0FJRztBQUVILGlCQUF3QixJQUFZO0lBQ2xDLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRkQsMEJBRUM7QUFFRDs7Ozs7R0FLRztBQUVILGlCQUF3QixJQUFZLEVBQUUsS0FBYTtJQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUM7SUFFcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLENBQUM7SUFFNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFckIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQVZELDBCQVVDO0FBRUQ7Ozs7OztHQU1HO0FBRUgsY0FBcUIsR0FBVyxFQUFFLElBQVksRUFBRSxHQUFXO0lBQ3pELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNuQyxDQUFDO0FBSEQsb0JBR0MifQ==