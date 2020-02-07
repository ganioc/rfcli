"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const FUNC_NAME = 'view';
async function getBalances(ctx, args) {
    return new Promise(async (resolve) => {
        let params;
        // check args
        if (args.length < 1) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }
        if (!common_1.checkAddressArray(args[0])) {
            resolve({
                ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong addresses, no space in address array"
            });
            return;
        }
        let addrs = JSON.parse(args[0]);
        params =
            {
                method: 'getBalances',
                params: { addresses: addrs }
            };
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getBalances = getBalances;
function prnGetBalances(ctx, obj) {
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
        // console.log(colors.green(`${sysTokenSym}`), ":", formatNumber(objJson.value))
        console.log(objJson);
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBalances = prnGetBalances;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YmFsYW5jZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldGJhbGFuY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW9DO0FBQ3BDLHFDQUFrRTtBQUdsRSxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFFbEIsS0FBSyxzQkFBc0IsR0FBYyxFQUFFLElBQWM7SUFDOUQsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDN0MsSUFBSSxNQUFXLENBQUM7UUFDaEIsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxDQUFDO2dCQUNOLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDbkIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNSO1FBQ0QsSUFBSSxDQUFDLDBCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQy9CLE9BQU8sQ0FBQztnQkFDTixHQUFHLEVBQUUsZ0JBQVMsQ0FBQyxnQkFBZ0I7Z0JBQy9CLElBQUksRUFBRSw0Q0FBNEM7YUFDbkQsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNSO1FBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVoQyxNQUFNO1lBQ0o7Z0JBQ0UsTUFBTSxFQUFFLGFBQWE7Z0JBQ3JCLE1BQU0sRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUU7YUFDN0IsQ0FBQTtRQUdILElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNqQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQW5DRCxrQ0FtQ0M7QUFDRCx3QkFBK0IsR0FBYyxFQUFFLEdBQWE7SUFDMUQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1I7SUFDRCxJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJO1FBQ0YsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLGdGQUFnRjtRQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0FBQ0gsQ0FBQztBQW5CRCx3Q0FtQkMifQ==