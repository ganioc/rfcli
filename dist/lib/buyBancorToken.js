"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
const FUNC_NAME = 'buyBancorToken';
async function buyBancorToken(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 3) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        if (!common_1.checkTokenid(args[0])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong tokenid"
            });
            return;
        }
        if (!common_1.checkCost(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong cost"
            });
            return;
        }
        if (!common_1.checkFee(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee"
            });
            return;
        }
        let tokenid = args[0];
        let cost = args[1];
        let fee = args[2];
        let tx = new transaction_1.ValueTransaction();
        tx.method = 'buyBancorToken';
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.value = new bignumber_js_1.BigNumber(cost);
        tx.input = {
            tokenid: tokenid.toUpperCase()
        };
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.buyBancorToken = buyBancorToken;
function prnBuyBancorToken(ctx, obj) {
    console.log(obj.resp);
}
exports.prnBuyBancorToken = prnBuyBancorToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV5QmFuY29yVG9rZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2J1eUJhbmNvclRva2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQStDO0FBQy9DLHFDQUEySTtBQUMzSSwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBRWxFLGlHQUFpRztBQUVqRyxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztBQUU1QixLQUFLLHlCQUF5QixHQUFjLEVBQUUsSUFBYztJQUMvRCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsZUFBZTthQUN4QixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsa0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsV0FBVzthQUNwQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQixJQUFJLEVBQUUsR0FBRyxJQUFJLDhCQUFnQixFQUFFLENBQUM7UUFDaEMsRUFBRSxDQUFDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QixFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksd0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksd0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixFQUFFLENBQUMsS0FBSyxHQUFHO1lBQ1AsT0FBTyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUU7U0FDakMsQ0FBQztRQUVGLElBQUksR0FBRyxHQUFHLE1BQU0sdUJBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWhERCx3Q0FnREM7QUFDRCwyQkFBa0MsR0FBYyxFQUFFLEdBQWE7SUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELDhDQUVDIn0=