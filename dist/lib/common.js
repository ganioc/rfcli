"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const address_1 = require("../core/address");
const BigNumber = require('bignumber.js');
const MAX_CONFIRM_TIMES = 3;
const BLOCK_INTERVAL = 10;
exports.TOKEN_MAX_LENGTH = 12;
exports.TOKEN_MIN_LENGTH = 3;
exports.FEE_MAX = 0.1;
exports.FEE_MIN = 0.1;
exports.MAX_NONLIQUIDITY = 1000000000000000000;
exports.MAX_TOKEN_AMOUNT = 1000000000000000000;
exports.MAX_COST = 1000000000000;
exports.MAX_DEPOSIT_SYS = 3000000;
exports.MAX_VOTE_CANDIDATES = 7;
const NUM_DIGITS = 12;
const MAX_NORMAL_TOKEN_PRECISION = 9;
const MAX_QUERY_NUM = 21;
// export const sysTokenSym = 'SYS';
exports.sysTokenSym = 'RUFF';
// const REGIP = /^[1-9]{1}\d{0,2}\.[1-9]{1}\d{0,2}\.[1-9]{1}\d{0,2}\.[1-9]{1}\d{0,2}(:\d{5,9})?$/g;
const REGIP = /^[1-9]{1}\d{0,2}\.([1-9]{1}\d{0,2}|0)\.([1-9]{1}\d{0,2}|0)\.([1-9]{1}\d{0,2}|0)(:\d{5,9})?$/g;
exports.SYS_TOKEN = 'SYS';
exports.SVT_TOKEN = 'RVT';
exports.RUFF_TOKEN = 'RUFF';
const TOKEN_MIN_LEN = 3;
const TOKEN_MAX_LEN = 12;
const REGPAT = /^[A-Z]{1}[0-9A-Z]{2,11}$/g;
/**
 *
 * @param amount: amount of token
 *
 * - it should be a BigNumber
 */
function checkAmount(amount) {
    let bn = new BigNumber(amount);
    if (bn.isNaN() === true) {
        return false;
    }
    let num = JSON.parse(amount);
    return num >= 0;
}
exports.checkAmount = checkAmount;
function checkDepositAmount(amount) {
    let bn = new BigNumber(amount);
    if (bn.lt(new BigNumber(exports.MAX_DEPOSIT_SYS))) {
        return false;
    }
    else {
        return true;
    }
}
exports.checkDepositAmount = checkDepositAmount;
function numNumbers(str) {
    let lst = str.split('');
    let counter = 0;
    for (let i = 0; i < lst.length; i++) {
        if (isNaN(parseInt(lst[i]))) {
            counter++;
        }
    }
    return str.length - counter;
}
function checkTokenid(tokenid) {
    let str = tokenid.toUpperCase();
    // 3~12位
    if (str.length < TOKEN_MIN_LEN || str.length > TOKEN_MAX_LEN) {
        return false;
    }
    if (str === exports.SYS_TOKEN || str === exports.SVT_TOKEN || str === exports.RUFF_TOKEN) {
        return false;
    }
    // 1st not number,
    if (str.match(REGPAT) === null) {
        return false;
    }
    if (numNumbers(str) > 3) {
        return false;
    }
    return true;
}
exports.checkTokenid = checkTokenid;
// export function checkTokenid(token: string): boolean {
//     return token.length >= TOKEN_MIN_LENGTH && token.length <= TOKEN_MAX_LENGTH;
// }
function checkFee(fee) {
    let bn = new BigNumber(fee);
    if (bn.isNaN() === true) {
        return false;
    }
    let num = JSON.parse(fee);
    return num >= exports.FEE_MIN;
}
exports.checkFee = checkFee;
function checkFeeForRange(fee, min, max) {
    let bn = new BigNumber(fee);
    if (bn.isNaN() === true) {
        return false;
    }
    let num = JSON.parse(fee);
    return num >= min && num <= max;
}
exports.checkFeeForRange = checkFeeForRange;
function checkAddress(addr) {
    //console.log("len:", addr.length)
    // return addr.length >= 30;
    return address_1.isValidAddress(addr);
}
exports.checkAddress = checkAddress;
function checkAddressArray(addrStr) {
    //console.log("len:", addr.length)
    let addr;
    try {
        addr = JSON.parse(addrStr);
        console.log('addr', addr);
        for (let i = 0; i < addr.length; i++) {
            console.log(addr[i]);
            if (!address_1.isValidAddress(addr[i])) {
                return false;
            }
        }
    }
    catch (e) {
        return false;
    }
    return addr.length > 0;
}
exports.checkAddressArray = checkAddressArray;
function checkRegisterName(name) {
    if (name.length > 20) {
        return false;
    }
    else {
        return true;
    }
}
exports.checkRegisterName = checkRegisterName;
function checkRegisterIp(name) {
    if (name.match(REGIP) === null) {
        return false;
    }
    else {
        return true;
    }
}
exports.checkRegisterIp = checkRegisterIp;
function checkRegisterUrl(name) {
    if (name.length > 50) {
        return false;
    }
    else {
        return true;
    }
}
exports.checkRegisterUrl = checkRegisterUrl;
function checkRegisterAddress(name) {
    if (name.length > 50) {
        return false;
    }
    else {
        return true;
    }
}
exports.checkRegisterAddress = checkRegisterAddress;
function checkBancorTokenPrebalance(prebalance) {
    if (prebalance.length === undefined
        || prebalance.length === 0) {
        return false;
    }
    for (let p of prebalance) {
        if (p.amount === undefined
            || !checkAmount(p.amount)
            || p.address === undefined
            || !checkAddress(p.address)) {
            return false;
        }
        if ((p.lock_amount !== undefined
            && !checkAmount(p.lock_amount))
            || (p.lock_expiration !== undefined
                && !checkAmount(p.lock_expiration))) {
            return false;
        }
    }
    return true;
}
exports.checkBancorTokenPrebalance = checkBancorTokenPrebalance;
;
async function waitSeconds(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // console.log('*');
            resolve('0');
        }, 1000 * seconds);
    });
}
exports.waitSeconds = waitSeconds;
function strAmountPrecision(num, precision) {
    let nTemp = parseFloat(num);
    return nTemp.toFixed(precision);
}
exports.strAmountPrecision = strAmountPrecision;
async function checkReceipt(ctx, txhash) {
    return new Promise(async (resolve, reject) => {
        let counter = 0;
        for (let i = 0; i < MAX_CONFIRM_TIMES; i++) {
            console.log('Wait to confirm');
            await waitSeconds(1.1 * BLOCK_INTERVAL);
            let result = await ctx.client.callAsync('getTransactionReceipt', { tx: txhash });
            if (ctx.sysinfo.verbose) {
                console.log(result);
            }
            let obj = JSON.parse(result.resp);
            if (result.ret !== 200 || obj.err !== 0) {
                continue;
            }
            // check if receipt valid
            if (obj.receipt.returnCode === 0) {
                counter++;
                console.log('.');
            }
            if (counter >= 1) {
                // console.log('Confirmed');
                resolve({
                    ret: error_code_1.ErrorCode.RESULT_OK,
                    resp: 'TX confirmed:' + txhash
                });
                return;
            }
        }
        // error!
        resolve({
            ret: error_code_1.ErrorCode.RESULT_FAILED,
            resp: 'Not confimred'
        });
    });
}
exports.checkReceipt = checkReceipt;
function checkTokenFactor(factor) {
    let bn = new BigNumber(factor);
    if (bn.isNaN()) {
        return false;
    }
    return bn.isLessThanOrEqualTo(1) && bn.isGreaterThan(0);
}
exports.checkTokenFactor = checkTokenFactor;
function checkTokenNonliquidity(nonliquidity) {
    let bn = new BigNumber(nonliquidity);
    if (bn.isNaN()) {
        return false;
    }
    return bn.isLessThan(exports.MAX_NONLIQUIDITY) && (bn.isGreaterThan(0) || bn.eq(0));
}
exports.checkTokenNonliquidity = checkTokenNonliquidity;
function checkTokenAmount(amount) {
    let bn = new BigNumber(amount);
    if (bn.isNaN()) {
        return false;
    }
    return bn.isLessThan(exports.MAX_TOKEN_AMOUNT) && bn.isGreaterThan(0);
}
exports.checkTokenAmount = checkTokenAmount;
function checkCost(cost) {
    let bn = new BigNumber(cost);
    if (bn.isNaN()) {
        return false;
    }
    let num = JSON.parse(cost);
    return num > 0 && num < exports.MAX_COST;
}
exports.checkCost = checkCost;
function formatNumber(num) {
    // console.log(num);
    try {
        let out = num.replace(/n/g, '');
        let outString = out.toString(); //.toFixed(NUM_DIGITS);
        return outString;
    }
    catch (e) {
        return 'error';
    }
}
exports.formatNumber = formatNumber;
function checkPrecision(arg) {
    let bn = new BigNumber(arg);
    if (bn.isNaN()) {
        return false;
    }
    let num = parseInt(arg);
    return num >= 0 && num <= MAX_NORMAL_TOKEN_PRECISION;
}
exports.checkPrecision = checkPrecision;
function checkLockBancorTokenMultiPreBalances(arg) {
    try {
        let obj = JSON.parse(arg);
        if (obj.length > MAX_QUERY_NUM || obj.length <= 0) {
            return false;
        }
        for (let i = 0; i < obj.length; i++) {
            if (!address_1.isValidAddress(obj[i].address)) {
                return false;
            }
            if (!checkAmount) {
                return false;
            }
        }
    }
    catch (e) {
        console.log("parse arg prebalances failed");
        return false;
    }
    return true;
}
exports.checkLockBancorTokenMultiPreBalances = checkLockBancorTokenMultiPreBalances;
////////////////////////////////////////////////
// functions in common
async function sendAndCheckTx(ctx, tx) {
    let { err, nonce } = await ctx.client.getNonce({ address: ctx.sysinfo.address });
    if (err) {
        console.error(`${tx.method} getNonce failed for ${err}`);
        return {
            ret: error_code_1.ErrorCode.RESULT_FAILED,
            resp: `${tx.method} getNonce failed for ${err}`
        };
    }
    tx.nonce = nonce + 1;
    if (ctx.sysinfo.verbose) {
        console.log('nonce is:', tx.nonce);
    }
    tx.sign(ctx.sysinfo.secret);
    let sendRet = await ctx.client.sendTransaction({ tx });
    if (sendRet.err) {
        console.error(`${tx.method} failed for ${sendRet.err}`);
        return {
            ret: error_code_1.ErrorCode.RESULT_FAILED,
            resp: `${tx.method} failed for ${sendRet.err}`
        };
    }
    console.log(`Send ${tx.method} tx: ${tx.hash}`);
    // 需要查找receipt若干次，直到收到回执若干次，才确认发送成功, 否则是失败
    let receiptResult = await checkReceipt(ctx, tx.hash);
    return receiptResult; // {resp, ret}
}
exports.sendAndCheckTx = sendAndCheckTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtREFBK0M7QUFDL0MsNkNBQWlEO0FBRWpELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUUxQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQztBQUM1QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFFYixRQUFBLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFBLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQUNyQixRQUFBLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDZCxRQUFBLE9BQU8sR0FBRyxHQUFHLENBQUM7QUFDZCxRQUFBLGdCQUFnQixHQUFHLG1CQUFtQixDQUFDO0FBQ3ZDLFFBQUEsZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7QUFDdkMsUUFBQSxRQUFRLEdBQUcsYUFBYSxDQUFDO0FBQ3pCLFFBQUEsZUFBZSxHQUFHLE9BQU8sQ0FBQztBQUMxQixRQUFBLG1CQUFtQixHQUFHLENBQUMsQ0FBQztBQUVyQyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUM7QUFDckMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBRXpCLG9DQUFvQztBQUN2QixRQUFBLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFFbEMsb0dBQW9HO0FBQ3BHLE1BQU0sS0FBSyxHQUFHLDhGQUE4RixDQUFDO0FBRWhHLFFBQUEsU0FBUyxHQUFHLEtBQUssQ0FBQztBQUNsQixRQUFBLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDbEIsUUFBQSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBRWpDLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN4QixNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFFekIsTUFBTSxNQUFNLEdBQUcsMkJB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