"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const METHOD_NAME = 'view';
const FUNC_NAME = 'getBancorTokenReserve';
async function getBancorTokenReserve(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        if (args.length < 1) {
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
            method: FUNC_NAME,
            params: {
                tokenid: args[0].toUpperCase()
            }
        };
        let cr = await ctx.client.callAsync(METHOD_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getBancorTokenReserve = getBancorTokenReserve;
function prnGetBancorTokenReserve(ctx, obj) {
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
            console.log('Reserve: ', common_1.formatNumber(objJson.value));
        }
        else {
            console.log('Error:', objJson.err);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBancorTokenReserve = prnGetBancorTokenReserve;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QmFuY29yVG9rZW5SZXNlcnZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9nZXRCYW5jb3JUb2tlblJlc2VydmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBb0M7QUFDcEMscUNBQXlGO0FBRXpGLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUMzQixNQUFNLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQztBQUVuQyxLQUFLLGdDQUFnQyxHQUFjLEVBQUUsSUFBYztJQUN0RSxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxhQUFhO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4QixPQUFPLENBQUM7Z0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO2dCQUMvQixJQUFJLEVBQUUsK0JBQStCO2FBQ3hDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksTUFBTSxHQUNWO1lBQ0ksTUFBTSxFQUFFLFNBQVM7WUFDakIsTUFBTSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2FBQ2pDO1NBQ0osQ0FBQTtRQUVELElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFuQ0Qsc0RBbUNDO0FBQ0Qsa0NBQXlDLEdBQWMsRUFBRSxHQUFhO0lBQ2xFLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSTtRQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLHFCQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDekQ7YUFBTTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QztLQUVKO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0wsQ0FBQztBQXZCRCw0REF1QkMifQ==