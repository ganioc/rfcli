"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
// tokenid: string, preBalances: string { address: string, amount: string }[], cost: string, fee: string
async function createToken(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length !== 4) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        // check token id
        if (!common_1.checkTokenid(args[0])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong token id length [3-12]"
            });
            return;
        }
        if (!common_1.checkPrecision(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong precision"
            });
            return;
        }
        if (!common_1.checkFee(args[3])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee"
            });
            return;
        }
        let tokenid = args[0];
        if (ctx.sysinfo.verbose) {
            console.log(args[1]);
            console.log(typeof args[1]);
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
        let preBalances = JSON.parse(args[1]);
        let precision = args[2];
        let fee = args[3];
        let amount = preBalances.map((x) => x.amount)
            .reduce((accumulator, currentValue) => {
            return accumulator.plus(currentValue);
        }, new bignumber_js_1.BigNumber(0));
        if (!common_1.checkTokenAmount(amount.toString())) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
            });
            return;
        }
        let tx = new transaction_1.ValueTransaction();
        tx.method = 'createToken';
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.input = { tokenid: tokenid.toUpperCase(), preBalances, precision };
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.createToken = createToken;
function prnCreateToken(ctx, obj) {
    console.log(obj.resp);
}
exports.prnCreateToken = prnCreateToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRldG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2NyZWF0ZXRva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQStDO0FBQy9DLHFDQUF1STtBQUN2SSwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBRWxFLHdHQUF3RztBQUVqRyxLQUFLLHNCQUFzQixHQUFjLEVBQUUsSUFBYztJQUM1RCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxpQkFBaUI7UUFDakIsSUFBSSxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLDhCQUE4QjthQUN2QyxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsdUJBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUMxQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsaUJBQWlCO2FBQzFCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxXQUFXO2FBQ3BCLENBQUMsQ0FB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