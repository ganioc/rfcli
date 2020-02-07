"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const METHOD_NAME = 'view';
const FUNC_NAME = 'getBancorTokenBalance';
async function getBancorTokenBalance(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 2) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        if (!common_1.checkTokenid(args[0])) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong tokenid , length [3-12]"
            });
            return;
        }
        if (!common_1.checkAddress(args[1])) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong address "
            });
            return;
        }
        let params = {
            method: 'getBancorTokenBalance',
            params: {
                tokenid: args[0].toUpperCase(),
                address: args[1]
            }
        };
        let cr = await ctx.client.callAsync(METHOD_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getBancorTokenBalance = getBancorTokenBalance;
function prnGetBancorTokenBalance(ctx, obj) {
    if (ctx.sysinfo.verbose) {
        console.log(obj);
    }
    console.log('');
    if (!obj.resp) {
        console.log('Wrong result: ');
        return;
    }
    let objJson;
    try {
        objJson = JSON.parse(obj.resp);
        if (objJson.err === 0) {
            console.log('Balance: ', common_1.formatNumber(objJson.value));
        }
        else {
            console.log('Error:', objJson.err);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBancorTokenBalance = prnGetBancorTokenBalance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QmFuY29yVG9rZW5CYWxhbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9nZXRCYW5jb3JUb2tlbkJhbGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBb0M7QUFDcEMscUNBQXlGO0FBRXpGLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUMzQixNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQztBQUVuQyxLQUFLLGdDQUFnQyxHQUFjLEVBQUUsSUFBYztJQUN0RSxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsK0JBQStCO2FBQ3hDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQztnQkFDSixHQUFHLEVBQUUsZ0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSxnQkFBZ0I7YUFDekIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxNQUFNLEdBQ1Y7WUFDSSxNQUFNLEVBQUUsdUJBQXVCO1lBQy9CLE1BQU0sRUFBRTtnQkFDSixPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtnQkFDOUIsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbkI7U0FDSixDQUFBO1FBRUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO1FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQTNDRCxzREEyQ0M7QUFDRCxrQ0FBeUMsR0FBYyxFQUFFLEdBQWE7SUFDbEUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1Y7SUFDRCxJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJO1FBQ0EsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUscUJBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN6RDthQUFNO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO0tBRUo7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDTCxDQUFDO0FBdkJELDREQXVCQyJ9