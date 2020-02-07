"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
const FUNC_NAME = 'sellBancorToken';
async function sellLockBancorToken(ctx, args) {
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
        if (!common_1.checkAmount(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
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
        let amount = args[1];
        let fee = args[2];
        let tx = new transaction_1.ValueTransaction();
        tx.method = FUNC_NAME;
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.input = {
            tokenid: tokenid.toUpperCase(),
            amount: amount
        };
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.sellLockBancorToken = sellLockBancorToken;
function prnSellLockBancorToken(ctx, obj) {
    console.log(obj.resp);
}
exports.prnSellLockBancorToken = prnSellLockBancorToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsbExvY2tCYW5jb3JUb2tlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvc2VsbExvY2tCYW5jb3JUb2tlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUErQztBQUMvQyxxQ0FBMkk7QUFDM0ksK0NBQXlDO0FBQ3pDLGlFQUFrRTtBQUVsRSxpR0FBaUc7QUFFakcsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUM7QUFFN0IsS0FBSyw4QkFBOEIsR0FBYyxFQUFFLElBQWM7SUFDcEUsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGVBQWU7YUFDeEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGNBQWM7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFdBQVc7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEIsSUFBSSxFQUFFLEdBQUcsSUFBSSw4QkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSx3QkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxLQUFLLEdBQUc7WUFDUCxPQUFPLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRTtZQUM5QixNQUFNLEVBQUUsTUFBTTtTQUNqQixDQUFDO1FBRUYsSUFBSSxHQUFHLEdBQUcsTUFBTSx1QkFBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBaERELGtEQWdEQztBQUNELGdDQUF1QyxHQUFjLEVBQUUsR0FBYTtJQUNoRSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRkQsd0RBRUMifQ==