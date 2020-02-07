"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const FUNC_NAME = 'view';
async function getTokenBalance(ctx, args) {
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
        let params = {
            method: 'getTokenBalance',
            params: {
                address: args[1],
                tokenid: args[0].toUpperCase()
            }
        };
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getTokenBalance = getTokenBalance;
function prnGetTokenBalance(ctx, obj) {
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
exports.prnGetTokenBalance = prnGetTokenBalance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VG9rZW5CYWxhbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9nZXRUb2tlbkJhbGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBb0M7QUFDcEMscUNBQTJFO0FBRTNFLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUVsQixLQUFLLDBCQUEwQixHQUFjLEVBQUUsSUFBYztJQUNoRSxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsK0JBQStCO2FBQ3hDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksTUFBTSxHQUNWO1lBQ0ksTUFBTSxFQUFFLGlCQUFpQjtZQUN6QixNQUFNLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2FBQ2pDO1NBQ0osQ0FBQTtRQUVELElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFwQ0QsMENBb0NDO0FBQ0QsNEJBQW1DLEdBQWMsRUFBRSxHQUFhO0lBQzVELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSTtRQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLHFCQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDekQ7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QztLQUVKO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0wsQ0FBQztBQXZCRCxnREF1QkMifQ==