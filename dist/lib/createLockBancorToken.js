"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
async function createLockBancorToken(ctx, args) {
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
        let objPrebalances;
        try {
            objPrebalances = JSON.parse(args[1]);
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
        if (!common_1.checkBancorTokenPrebalance(objPrebalances)) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong preBanlances format"
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
        let amount = preBalances.map((x) => {
            let amount1 = parseInt(x.amount);
            let amountlock1 = parseInt(x.lock_amount);
            return (amount1 + amountlock1) + '';
        })
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
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.createLockBancorToken = createLockBancorToken;
function prnCreateLockBancorToken(ctx, obj) {
    console.log(obj.resp);
}
exports.prnCreateLockBancorToken = prnCreateLockBancorToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlTG9ja0JhbmNvclRva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9jcmVhdGVMb2NrQmFuY29yVG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0M7QUFDL0MscUNBQXdNO0FBQ3hNLCtDQUF5QztBQUN6QyxpRUFBa0U7QUFFM0QsS0FBSyxnQ0FBZ0MsR0FBYyxFQUFFLElBQWM7SUFDdEUsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsbUJBQW1CO2FBQzVCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSw4QkFBOEI7YUFDdkMsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxjQUFjLENBQUM7UUFDbkIsSUFBSTtZQUNBLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDL0I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsb0JBQW9CO2FBQzdCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUks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