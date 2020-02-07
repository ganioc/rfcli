"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const BN = require('bn.js');
const assert = require("assert");
const error_code_1 = require("../error_code");
exports.INT32_MAX = 0xffffffff;
// 我们测试时保证1分钟一块，每10块调整一次难度
// //每次重新计算难度的间隔块，BTC为2016, 
// export const retargetInterval = 10;
// //每个难度的理想持续时间，BTC为14 * 24 * 60 * 60, 单位和timestamp单位相同，seconds
// export const targetTimespan = 1 * 60;
// //初始bits,BTC为486604799， 对应的hash值为'00000000ffff0000000000000000000000000000000000000000000000000000'
// //我们设定为'0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
// export const basicBits = 520159231;
// //最小难度
// export const limit = new BN('0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
function onCheckGlobalOptions(globalOptions) {
    if (util_1.isNullOrUndefined(globalOptions.retargetInterval)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.targetTimespan)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.basicBits)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.limit)) {
        return false;
    }
    return true;
}
exports.onCheckGlobalOptions = onCheckGlobalOptions;
/**
 * Convert a compact number to a big number.
 * Used for `block.bits` -> `target` conversion.
 * @param {Number} compact
 * @returns {BN}
 */
function fromCompact(compact) {
    if (compact === 0) {
        return new BN(0);
    }
    const exponent = compact >>> 24;
    const negative = (compact >>> 23) & 1;
    let mantissa = compact & 0x7fffff;
    let num;
    if (exponent <= 3) {
        mantissa >>>= 8 * (3 - exponent);
        num = new BN(mantissa);
    }
    else {
        num = new BN(mantissa);
        num.iushln(8 * (exponent - 3));
    }
    if (negative) {
        num.ineg();
    }
    return num;
}
exports.fromCompact = fromCompact;
/**
 * Convert a big number to a compact number.
 * Used for `target` -> `block.bits` conversion.
 * @param {BN} num
 * @returns {Number}
 */
function toCompact(num) {
    if (num.isZero()) {
        return 0;
    }
    let exponent = num.byteLength();
    let mantissa;
    if (exponent <= 3) {
        mantissa = num.toNumber();
        mantissa <<= 8 * (3 - exponent);
    }
    else {
        mantissa = num.ushrn(8 * (exponent - 3)).toNumber();
    }
    if (mantissa & 0x800000) {
        mantissa >>= 8;
        exponent++;
    }
    let compact = (exponent << 24) | mantissa;
    if (num.isNeg()) {
        compact |= 0x800000;
    }
    compact >>>= 0;
    return compact;
}
exports.toCompact = toCompact;
/**
 * Verify proof-of-work.
 * @param {Hash} hash
 * @param {Number} bits
 * @returns {Boolean}
 */
function verifyPOW(hash, bits) {
    let target = fromCompact(bits);
    if (target.isNeg() || target.isZero()) {
        return false;
    }
    let targetHash = target.toBuffer('be', 32);
    return hash.compare(targetHash) < 1;
}
exports.verifyPOW = verifyPOW;
function retarget(prevbits, actualTimespan, chain) {
    let target = fromCompact(prevbits);
    if (actualTimespan < (chain.globalOptions.targetTimespan / 4 | 0)) {
        actualTimespan = chain.globalOptions.targetTimespan / 4 | 0;
    }
    if (actualTimespan > chain.globalOptions.targetTimespa * 4) {
        actualTimespan = chain.globalOptions.targetTimespan * 4;
    }
    target.imuln(actualTimespan);
    target.idivn(chain.globalOptions.targetTimespan);
    if (target.gt(new BN(chain.globalOptions.limit, 'hex'))) {
        return chain.globalOptions.basicBits;
    }
    return toCompact(target);
}
exports.retarget = retarget;
async function getTarget(header, chain) {
    // Genesis
    if (header.number === 0) {
        return { err: error_code_1.ErrorCode.RESULT_OK, target: chain.globalOptions.basicBits };
    }
    let prevRet = await chain.getHeader(header.preBlockHash);
    // Genesis
    if (!prevRet.header) {
        return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
    }
    // Do not retarget
    if ((header.number + 1) % chain.globalOptions.retargetInterval !== 0) {
        return { err: error_code_1.ErrorCode.RESULT_OK, target: prevRet.header.bits };
    }
    // Back 2 weeks
    const height = header.number - (chain.globalOptions.retargetInterval - 1);
    assert(height >= 0);
    let hr = await chain.getHeader(height);
    let retargetFrom;
    if (!hr.err) {
        assert(hr.header);
        retargetFrom = hr.header;
    }
    else if (hr.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
        let ghr = await chain.getHeader(header, -(chain.globalOptions.retargetInterval - 1));
        if (ghr.err) {
            return { err: ghr.err };
        }
        assert(ghr.header);
        retargetFrom = ghr.header;
    }
    else {
        return { err: hr.err };
    }
    let newTraget = retarget(prevRet.header.bits, prevRet.header.timestamp - retargetFrom.timestamp, chain);
    return { err: error_code_1.ErrorCode.RESULT_OK, target: newTraget };
}
exports.getTarget = getTarget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc2Vuc3VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvcG93X2NoYWluL2NvbnNlbnN1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUF5QztBQUN6QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFHNUIsaUNBQWlDO0FBQ2pDLDhDQUEwQztBQUU3QixRQUFBLFNBQVMsR0FBRyxVQUFVLENBQUM7QUFFcEMsMEJBQTBCO0FBRTFCLDRCQUE0QjtBQUM1QixzQ0FBc0M7QUFFdEMsZ0VBQWdFO0FBQ2hFLHdDQUF3QztBQUV4QyxzR0FBc0c7QUFDdEcsNEVBQTRFO0FBQzVFLHNDQUFzQztBQUV0QyxTQUFTO0FBQ1QsMEdBQTBHO0FBRTFHLDhCQUFxQyxhQUFrQjtJQUNuRCxJQUFJLHdCQUFpQixDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ25ELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsSUFBSSx3QkFBaUIsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDakQsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLHdCQUFpQixDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUM1QyxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELElBQUksd0JBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3hDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQWRELG9EQWNDO0FBRUQ7Ozs7O0dBS0c7QUFFSCxxQkFBNEIsT0FBZTtJQUN2QyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7UUFDZixPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BCO0lBRUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxLQUFLLEVBQUUsQ0FBQztJQUNoQyxNQUFNLFFBQVEsR0FB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