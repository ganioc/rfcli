"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const colors = require("colors");
const FUNC_NAME = 'view';
async function getBalance(ctx, args) {
    return new Promise(async (resolve) => {
        let params;
        // check args
        if (args.length < 1) {
            params = {
                method: 'getBalance',
                params: { address: ctx.sysinfo.address }
            };
        }
        else {
            if (!common_1.checkAddress(args[0])) {
                resolve({
                    ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                    resp: "Wrong address"
                });
                return;
            }
            params =
                {
                    method: 'getBalance',
                    params: { address: args[0] }
                };
        }
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getBalance = getBalance;
function prnGetBalance(ctx, obj) {
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
        console.log(colors.green(`${common_1.sysTokenSym}`), ":", common_1.formatNumber(objJson.value));
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBalance = prnGetBalance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YmFsYW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvZ2V0YmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtDQUFvQztBQUNwQyxxQ0FBdUY7QUFDdkYsaUNBQWlDO0FBRWpDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUVsQixLQUFLLHFCQUFxQixHQUFjLEVBQUUsSUFBYztJQUMzRCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUMzQyxJQUFJLE1BQVcsQ0FBQztRQUNoQixhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixNQUFNLEdBQUc7Z0JBQ0wsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTthQUMzQyxDQUFDO1NBQ0w7YUFBTTtZQUNILElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLENBQUM7b0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO29CQUMvQixJQUFJLEVBQUUsZUFBZTtpQkFDeEIsQ0FBQyxDQUFDO2dCQUNILE9BQU87YUFDVjtZQUNELE1BQU07Z0JBQ0Y7b0JBQ0ksTUFBTSxFQUFFLFlBQVk7b0JBQ3BCLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7aUJBQy9CLENBQUE7U0FDUjtRQUVELElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFoQ0QsZ0NBZ0NDO0FBQ0QsdUJBQThCLEdBQWMsRUFBRSxHQUFhO0lBQ3ZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSTtRQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBVyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUscUJBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtLQUNoRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUM7QUFsQkQsc0NBa0JDIn0=