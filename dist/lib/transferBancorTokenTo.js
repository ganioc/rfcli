"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../core/error_code");
const common_1 = require("./common");
const bignumber_js_1 = require("bignumber.js");
const transaction_1 = require("../core/value_chain/transaction");
// tokenid: string, preBalances: { address: string, amount: string }[], cost: string, fee: string
async function transferBancorTokenTo(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 4) {
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
        if (!common_1.checkAddress(args[1])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong address"
            });
            return;
        }
        if (!common_1.checkAmount(args[2])) {
            resolve({
                ret: error_code_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong amount"
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
        let address = args[1];
        let amount = args[2];
        let fee = args[3];
        let tx = new transaction_1.ValueTransaction();
        tx.method = 'transferBancorTokenTo';
        tx.fee = new bignumber_js_1.BigNumber(fee);
        tx.input = {
            tokenid: tokenid.toUpperCase(),
            to: address,
            amount: amount
        };
        let { err, nonce } = await ctx.client.getNonce({ address: ctx.sysinfo.address });
        if (err) {
            console.error(`transferBancorTokenTo getNonce failed for ${err}`);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_FAILED,
                resp: `transferBancorTokenTo getNonce failed for ${err}`
            });
            return;
        }
        tx.nonce = nonce + 1;
        if (ctx.sysinfo.verbose) {
            console.log('nonce is:', tx.nonce);
        }
        tx.sign(ctx.sysinfo.secret);
        let sendRet = await ctx.client.sendTransaction({ tx });
        if (sendRet.err) {
            console.error(`transferBancorTokenTo failed for ${sendRet.err}`);
            resolve({
                ret: error_code_1.ErrorCode.RESULT_FAILED,
                resp: `transferBancorTokenTo failed for ${sendRet.err}`
            });
            return;
        }
        console.log(`Send transferBancorTokenTo tx: ${tx.hash}`);
        // 需要查找receipt若干次，直到收到回执若干次，才确认发送成功, 否则是失败
        let receiptResult = await common_1.checkReceipt(ctx, tx.hash);
        resolve(receiptResult); // {resp, ret}
    });
}
exports.transferBancorTokenTo = transferBancorTokenTo;
function prnTransferBancorTokenTo(ctx, obj) {
    console.log(obj.resp);
}
exports.prnTransferBancorTokenTo = prnTransferBancorTokenTo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJCYW5jb3JUb2tlblRvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi90cmFuc2ZlckJhbmNvclRva2VuVG8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtREFBK0M7QUFDL0MscUNBQWdIO0FBQ2hILCtDQUF5QztBQUN6QyxpRUFBa0U7QUFFbEUsaUdBQWlHO0FBRTFGLEtBQUssZ0NBQWdDLEdBQWMsRUFBRSxJQUFjO0lBQ3RFLE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxZQUFZO2FBQ3JCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxlQUFlO2FBQ3hCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxlQUFlO2FBQ3hCLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxjQUFjO2FBQ3ZCLENBQUMs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