"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
const FUNC_NAME = 'register';
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
async function register(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 6) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        // 
        if (!common_1.checkAmount(args[0]) || !common_1.checkDepositAmount(args[0])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
            });
            return;
        }
        if (!common_1.checkRegisterName(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong arg: name"
            });
            return;
        }
        if (!common_1.checkRegisterIp(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong arg: ip"
            });
            return;
        }
        if (!common_1.checkRegisterUrl(args[3])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong arg: url"
            });
            return;
        }
        if (!common_1.checkRegisterAddress(args[4])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong arg: address"
            });
            return;
        }
        if (!common_1.checkFee(args[5])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee"
            });
            return;
        }
        let amount = common_1.strAmountPrecision(args[0], 0);
        let tx = new transaction_1.ValueTransaction();
        tx.method = FUNC_NAME;
        tx.value = new bignumber_js_1.BigNumber(amount);
        tx.fee = new bignumber_js_1.BigNumber(args[5]);
        tx.input = {
            name: args[1],
            ip: args[2],
            url: args[3],
            location: args[4]
        };
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.register = register;
function prnRegister(ctx, obj) {
    console.log(obj.resp);
}
exports.prnRegister = prnRegister;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL3JlZ2lzdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbURBQStDO0FBQy9DLHFDQUF3TjtBQUN4TiwrQ0FBeUM7QUFDekMsaUVBQWtFO0FBRWxFLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQztBQUU3QixpR0FBaUc7QUFFMUYsS0FBSyxtQkFBbUIsR0FBYyxFQUFFLElBQWM7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsR0FBRztRQUVILElBQUksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkQsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGNBQWM7YUFDdkIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLDBCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLHdCQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGVBQWU7YUFDeEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLHlCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzVCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxnQkFBZ0I7YUFDekIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLDZCQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxvQkFBb0I7YUFDN0IsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLGlCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFdBQVc7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxNQUFNLEdBQUcsMkJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVDLElBQUksRUFBRSxHQUFHLElBQUksOEJBQWdCLEVBQUUsQ0FBQztRQUNoQyxFQUFFLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztRQUN0QixFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksd0JBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksd0JBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxFQUFFLENBQUMsS0FBSyxHQUFHO1lBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDYixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNYLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ1osUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDcEIsQ0FBQztRQUVGLElBQUksR0FBRyxHQUFHLE1BQU0sdUJBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTNFRCw0QkEyRUM7QUFDRCxxQkFBNEIsR0FBYyxFQUFFLEdBQWE7SUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELGtDQUVDIn0=