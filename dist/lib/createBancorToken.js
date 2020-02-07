"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
async function createBancorToken(ctx, args) {
    return new Promise(async (resolve) => {
        if (args.length !== 6) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args number"
            });
            return;
        }
        if (!common_1.checkTokenid(args[0])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong token id length [3-12]"
            });
            return;
        }
        try {
            let objPrebalances = JSON.parse(args[1]);
            console.log(objPrebalances);
        }
        catch (e) {
            console.log(e);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong preBanlances"
            });
            return;
        }
        if (!common_1.checkTokenFactor(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong factor"
            });
            return;
        }
        // let nonliquidity = undefined;
        // let preBanlances = JSON.parse(args[1]);
        // let cost:
        // no nonliquidity
        if (!common_1.checkTokenNonliquidity(args[3])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong nonliquidity"
            });
            return;
        }
        // check cost
        if (!common_1.checkCost(args[4])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong cost value"
            });
            return;
        }
        // check fee
        if (!common_1.checkFee(args[5])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee value"
            });
            return;
        }
        let tokenid = args[0];
        if (ctx.sysinfo.verbose) {
            console.log(args[1]);
            console.log(typeof args[1]);
        }
        let preBalances = JSON.parse(args[1]);
        let factor = args[2];
        let nonliquidity = args[3];
        let amount = preBalances.map((x) => x.amount)
            .reduce((accumulator, currentValue) => {
            return accumulator.plus(currentValue);
        }, new bignumber_js_1.BigNumber(nonliquidity));
        if (!common_1.checkTokenAmount(amount.toString())) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
            });
            return;
        }
        let tx = new transaction_1.ValueTransaction();
        tx.method = 'createBancorToken';
        tx.value = new bignumber_js_1.BigNumber(args[4]);
        tx.fee = new bignumber_js_1.BigNumber(args[5]);
        tx.input = { tokenid: tokenid.toUpperCase(), preBalances, factor, nonliquidity };
        let { err, nonce } = await ctx.client.getNonce({ address: ctx.sysinfo.address });
        if (err) {
            console.error(`transferTo getNonce failed for ${err}`);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_FAILED,
                resp: `transferTo getNonce failed for ${err}`
            });
            return;
        }
        tx.nonce = nonce + 1;
        tx.sign(ctx.sysinfo.secret);
        let sendRet = await ctx.client.sendTransaction({ tx });
        if (sendRet.err) {
            console.error(`transferTo failed for ${sendRet.err}`);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_FAILED,
                resp: `transferTo failed for ${sendRet.err}`
            });
            return;
        }
        console.log(`send transferTo tx: ${tx.hash}`);
        // 需要查找receipt若干次，直到收到回执若干次，才确认发送成功, 否则是失败
        let receiptResult = await common_1.checkReceipt(ctx, tx.hash);
        resolve(receiptResult); // {resp, ret}
    });
}
exports.createBancorToken = createBancorToken;
function prnCreateBancorToken(ctx, obj) {
    console.log(obj.resp);
}
exports.prnCreateBancorToken = prnCreateBancorToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlQmFuY29yVG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2NyZWF0ZUJhbmNvclRva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBQy9DLHFDQUE0SjtBQUM1SiwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBRTNELEtBQUssNEJBQTRCLEdBQWMsRUFBRSxJQUFjO0lBQ2xFLE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLG1CQUFtQjthQUM1QixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsOEJBQThCO2FBQ3ZDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUk7WUFDQSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsb0JBQW9CO2FBQzdCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyx5QkFBZ0IsQ0FBQyxJQUFJLENB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