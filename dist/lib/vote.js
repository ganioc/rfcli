"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
const FUNC_NAME = 'vote';
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
async function vote(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length !== 2) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        let candidates;
        try {
            candidates = JSON.parse(args[0]);
        }
        catch (e) {
            console.log();
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong candidates"
            });
        }
        if (candidates.length > common_1.MAX_VOTE_CANDIDATES) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong candidates num"
            });
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
        tx.input = candidates;
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.vote = vote;
function prnVote(ctx, obj) {
    console.log(obj.resp);
}
exports.prnVote = prnVote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidm90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdm90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUErQztBQUMvQyxxQ0FBNEc7QUFDNUcsK0NBQXlDO0FBQ3pDLGlFQUFrRTtBQUVsRSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFFekIsaUdBQWlHO0FBRTFGLEtBQUssZUFBZSxHQUFjLEVBQUUsSUFBYztJQUNyRCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLFVBQVUsQ0FBQztRQUNmLElBQUk7WUFDQSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLGtCQUFrQjthQUMzQixDQUFDLENBQUM7U0FDTjtRQUVELElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyw0QkFBbUIsRUFBRTtZQUN6QyxPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsc0JBQXNCO2FBQy9CLENBQUMsQ0FBQztTQUNOO1FBRUQsWUFBWTtRQUNaLElBQUksQ0FBQyxpQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxpQkFBaUI7YUFDMUIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSw4QkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSx3QkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO1FBRXRCLElBQUksR0FBRyxHQUFHLE1BQU0sdUJBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQS9DRCxvQkErQ0M7QUFDRCxpQkFBd0IsR0FBYyxFQUFFLEdBQWE7SUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELDBCQUVDIn0=