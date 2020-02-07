"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const colors = require("colors");
const FUNC_NAME = 'getNonce';
async function getNonce(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 1) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        let params = {
            address: args[0]
        };
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        resolve(cr);
    });
}
exports.getNonce = getNonce;
function prnGetNonce(ctx, obj) {
    if (ctx.sysinfo.verbose) {
        console.log(obj.resp);
    }
    let objJson;
    try {
        objJson = JSON.parse(obj.resp);
        if (objJson.err === 0) {
            console.log(colors.green('nonce:'), objJson.nonce);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetNonce = prnGetNonce;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Tm9uY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldE5vbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW9DO0FBRXBDLGlDQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUM7QUFHdEIsS0FBSyxtQkFBbUIsR0FBYyxFQUFFLElBQWM7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxNQUFNLEdBQ1Y7WUFDSSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNuQixDQUFBO1FBRUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdkQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXJCRCw0QkFxQkM7QUFDRCxxQkFBNEIsR0FBYyxFQUFFLEdBQWE7SUFDckQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6QjtJQUVELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSyxDQUFDLENBQUM7UUFDaEMsSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3REO0tBQ0o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFFTCxDQUFDO0FBZkQsa0NBZUMifQ==