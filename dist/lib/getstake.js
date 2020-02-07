"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const colors = require("colors");
const FUNC_NAME = 'view';
async function getStake(ctx, args) {
    return new Promise(async (resolve) => {
        let params;
        if (args.length < 1) {
            params =
                {
                    method: 'getStake',
                    params: { address: ctx.sysinfo.address }
                };
        }
        else {
            if (!common_1.checkAddress(args[0])) {
                resolve({
                    ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                    resp: "Wrong Address"
                });
                return;
            }
            params =
                {
                    method: 'getStake',
                    params: { address: args[0] }
                };
        }
        // check args
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getStake = getStake;
function prnGetStake(ctx, obj) {
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
        console.log(colors.green('On stake:'));
        // if (objJson.value) {
        //     console.log(`${sysTokenSym}:`, objJson.value.replace(/n/g, ''))
        // }
        if (!objJson.err) {
            console.log(objJson.value);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetStake = prnGetStake;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0c3Rha2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldHN0YWtlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW9DO0FBQ3BDLHFDQUEwRTtBQUMxRSxpQ0FBaUM7QUFFakMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0FBRWxCLEtBQUssbUJBQW1CLEdBQWMsRUFBRSxJQUFjO0lBQ3pELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzNDLElBQUksTUFBVyxDQUFDO1FBRWhCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsTUFBTTtnQkFDRjtvQkFDSSxNQUFNLEVBQUUsVUFBVTtvQkFDbEIsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO2lCQUMzQyxDQUFBO1NBQ1I7YUFBTTtZQUNILElBQUksQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixPQUFPLENBQUM7b0JBQ0osR0FBRyxFQUFFLGdCQUFTLENBQUMsZ0JBQWdCO29CQUMvQixJQUFJLEVBQUUsZUFBZTtpQkFDeEIsQ0FBQyxDQUFDO2dCQUNILE9BQU87YUFDVjtZQUVELE1BQU07Z0JBQ0Y7b0JBQ0ksTUFBTSxFQUFFLFVBQVU7b0JBQ2xCLE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7aUJBQy9CLENBQUE7U0FDUjtRQUNELGFBQWE7UUFFYixJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBbENELDRCQWtDQztBQUNELHFCQUE0QixHQUFjLEVBQUUsR0FBYTtJQUNyRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDVjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFdkMsdUJBQXVCO1FBQ3ZCLHNFQUFzRTtRQUN0RSxJQUFJO1FBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM5QjtLQUNKO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0wsQ0FBQztBQXpCRCxrQ0F5QkMifQ==