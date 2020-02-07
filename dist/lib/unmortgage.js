"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
const FUNC_NAME = 'unmortgage';
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
async function unmortgage(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length !== 2) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
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
        let amount = args[0];
        let tx = new transaction_1.ValueTransaction();
        tx.method = FUNC_NAME;
        tx.fee = new bignumber_js_1.BigNumber(args[1]);
        tx.input = amount;
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.unmortgage = unmortgage;
function prnUnmortgage(ctx, obj) {
    console.log(obj.resp);
}
exports.prnUnmortgage = prnUnmortgage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5tb3J0Z2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdW5tb3J0Z2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUErQztBQUMvQyxxQ0FBb0c7QUFDcEcsK0NBQXlDO0FBQ3pDLGlFQUFrRTtBQUVsRSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUM7QUFFL0IsaUdBQWlHO0FBRTFGLEtBQUsscUJBQXFCLEdBQWMsRUFBRSxJQUFjO0lBQzNELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxZQUFZO2FBQ3JCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxjQUFjO2FBQ3ZCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELFlBQVk7UUFDWixJQUFJLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsaUJBQWlCO2FBQzFCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyQixJQUFJLEVBQUUsR0FBRyxJQUFJLDhCQUFnQixFQUFFLENBQUM7UUFDaEMsRUFBRSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDdEIsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLHdCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7UUFFbEIsSUFBSSxHQUFHLEdBQUcsTUFBTSx1QkFBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV4QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBdkNELGdDQXVDQztBQUNELHVCQUE4QixHQUFjLEVBQUUsR0FBYTtJQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRkQsc0NBRUMifQ==