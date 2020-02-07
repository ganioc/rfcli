"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const FUNC_NAME = 'getBlock';
async function getReceipt(ctx, args) {
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
            tx: args[0]
        };
        let cr = await ctx.client.callAsync('getTransactionReceipt', params);
        resolve(cr);
    });
}
exports.getReceipt = getReceipt;
function prnGetReceipt(ctx, obj) {
    console.log(obj);
    // print receipt in good format
}
exports.prnGetReceipt = prnGetReceipt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0cmVjZWlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvZ2V0cmVjZWlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGtDQUFvQztBQUdwQyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUM7QUFHdEIsS0FBSyxxQkFBcUIsR0FBYyxFQUFFLElBQWM7SUFDM0QsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBQ0QsSUFBSSxNQUFNLEdBQUc7WUFDVCxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNkLENBQUM7UUFFRixJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXJFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFuQkQsZ0NBbUJDO0FBQ0QsdUJBQThCLEdBQWMsRUFBRSxHQUFhO0lBRXZELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFJakIsK0JBQStCO0FBRW5DLENBQUM7QUFSRCxzQ0FRQyJ9