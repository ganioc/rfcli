"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
async function runUserMethod(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length !== 5) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        const to = args[0];
        const amount = args[1];
        const fee = args[2];
        const action = args[3];
        const params = args[4];
        if (!common_1.checkFee(fee)) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong fee min 0.1"
            });
            return;
        }
        if (ctx.sysinfo.verbose) {
            console.log(args[1]);
            console.log(typeof args[1]);
        }
        let tx = new transaction_1.ValueTransaction();
        let { err, nonce } = await ctx.client.getNonce({ address: ctx.sysinfo.address });
        if (err) {
            console.error(`transferTo getNonce failed for ${err}`);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_FAILED,
                resp: `transferTo getNonce failed for ${err}`
            });
            return;
        }
        tx.method = 'runUserMethod';
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.value = new bignumber_js_1.BigNumber(amount);
        tx.input = { action, to, params };
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
exports.runUserMethod = runUserMethod;
function prnRunUserMethod(ctx, obj) {
    console.log(obj.resp);
}
exports.prnRunUserMethod = prnRunUserMethod;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudXNlcm1ldGhvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvcnVudXNlcm1ldGhvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1EQUErQztBQUMvQyxxQ0FBcUY7QUFDckYsK0NBQXlDO0FBQ3pDLGlFQUFrRTtBQUUzRCxLQUFLLHdCQUF3QixHQUFjLEVBQUUsSUFBYztJQUM5RCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFDRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZCLElBQUksQ0FBQyxpQkFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxtQkFBbUI7YUFDNUIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksRUFBRSxHQUFHLElBQUksOEJBQWdCLEVBQUUsQ0FBQztRQUVoQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN2RCxPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYTtnQkFDNUIsSUFBSSxFQUFFLGtDQUFrQyxHQUFHLEVBQUU7YUFDaEQsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsRUFBRSxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUM7UUFDNUIsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLHdCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLHdCQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1QixJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLHlCQUF5QixPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN0RCxPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYTtnQkFDNUIsSUFBSSxFQUFFLHlCQUF5QixPQUFPLENBQUMsR0FBRyxFQUFFO2FBQy9DLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRzlDLDBDQUEwQztRQUMxQyxJQUFJLGFBQWEsR0FBRyxNQUFNLHFCQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyRCxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxjQUFjO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWpFRCxzQ0FpRUM7QUFDRCwwQkFBaUMsR0FBYyxFQUFFLEdBQWE7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQUZELDRDQUVDIn0=