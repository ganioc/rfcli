"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
let fs = require('fs');
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
async function transferLockBancorTokenToMulti(ctx, args) {
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
        if (!common_1.checkFee(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee"
            });
            return;
        }
        let tokenid = args[0];
        let addresses;
        let fee = args[2];
        if (args[1] === 'airdrop.json') {
            let obj;
            try {
                if (!fs.existsSync('./airdrop.json')) {
                    // Do something
                    console.log('No config file');
                    throw new Error();
                }
                let configBuffer = fs.readFileSync('./airdrop.json');
                obj = JSON.parse(configBuffer.toString());
            }
            catch (e) {
                resolve({
                    ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                    resp: "Wrong airdrop.json"
                });
                return;
            }
            addresses = JSON.parse(JSON.stringify(obj));
        }
        else if (!common_1.checkLockBancorTokenMultiPreBalances(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong address amount"
            });
            return;
        }
        else {
            addresses = JSON.parse(args[1]);
        }
        let tx = new transaction_1.ValueTransaction();
        tx.method = 'transferBancorTokenToMulti';
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.input = {
            tokenid: tokenid.toUpperCase(),
            to: addresses
        };
        let rtn = await common_1.sendAndCheckTx(ctx, tx);
        resolve(rtn);
    });
}
exports.transferLockBancorTokenToMulti = transferLockBancorTokenToMulti;
function prnTransferLockBancorTokenToMulti(ctx, obj) {
    console.log(obj.resp);
}
exports.prnTransferLockBancorTokenToMulti = prnTransferLockBancorTokenToMulti;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJMb2NrQmFuY29yVG9rZW5Ub011bHRpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi90cmFuc2ZlckxvY2tCYW5jb3JUb2tlblRvTXVsdGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtREFBK0M7QUFDL0MscUNBQXdKO0FBQ3hKLCtDQUF5QztBQUN6QyxpRUFBa0U7QUFDbEUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXZCLGlHQUFpRztBQUUxRixLQUFLLHlDQUF5QyxHQUFjLEVBQUUsSUFBYztJQUMvRSxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsZUFBZTthQUN4QixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsaUJBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNwQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsV0FBVzthQUNwQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsSUFBSSxTQUFjLENBQUM7UUFDbkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLGNBQWMsRUFBRTtZQUM1QixJQUFJLEdBQVEsQ0FBQztZQUNiLElBQUk7Z0JBQ0EsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtvQkFDbEMsZUFBZTtvQkFDZixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7b0JBQzdCLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztpQkFDckI7Z0JBQ0QsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNyRCxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUU3QztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE9BQU8sQ0FBQztvQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7b0JBQy9CLElBQUksRUFBRSxvQkFBb0I7aUJBQzdCLENBQUMsQ0FBQztnQkFDSCxPQUFPO2FBQ1Y7WUFDRCxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLENBQUMsNkNBQW9DLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkQsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLHNCQUFzQjthQUMvQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7YUFBTTtZQUNILFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSw4QkFBZ0IsRUFBRSxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsNEJBQTRCLENBQUM7UUFDekMsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLHdCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsRUFBRSxDQUFDLEtBQUssR0FBRztZQUNQLE9BQU8sRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQzlCLEVBQUUsRUFBRSxTQUFTO1NBQ2hCLENBQUM7UUFFRixJQUFJLEdBQUcsR0FBRyxNQUFNLHVCQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUF4RUQsd0VBd0VDO0FBQ0QsMkNBQWtELEdBQWMsRUFBRSxHQUFhO0lBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFGRCw4RUFFQyJ9