"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
const FUNC_NAME = 'mortgage';
async function mortgage(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length !== 2) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        let amount = common_1.strAmountPrecision(args[0], 0);
        if (!common_1.checkAmount(args[0])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
            });
            return;
        }
        // check fee
        if (!common_1.checkFee(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee value"
            });
            return;
        }
        let tx = new transaction_1.ValueTransaction();
        tx.method = FUNC_NAME;
        tx.fee = new bignumber_js_1.BigNumber(args[1]);
        tx.value = new bignumber_js_1.BigNumber(amount);
        tx.input = amount;
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.mortgage = mortgage;
function prnMortgage(ctx, obj) {
    console.log(obj.resp);
}
exports.prnMortgage = prnMortgage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ydGdhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL21vcnRnYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQStDO0FBQy9DLHFDQUF3SDtBQUN4SCwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBRWxFLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUV0QixLQUFLLG1CQUFtQixHQUFjLEVBQUUsSUFBYztJQUN6RCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLE1BQU0sR0FBRywyQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGNBQWM7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsWUFBWTtRQUNaLElBQUksQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSw4QkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSx3QkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSx3QkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1FBRWxCLElBQUksR0FBRyxHQUFHLE1BQU0sdUJBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWpCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXhDRCw0QkF3Q0M7QUFDRCxxQkFBNEIsR0FBYyxFQUFFLEdBQWE7SUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELGtDQUVDIn0=