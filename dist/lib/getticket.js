"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const colors = require("colors");
const FUNC_NAME = 'view';
async function getTicket(ctx, args) {
    return new Promise(async (resolve) => {
        let params;
        if (args.length < 1) {
            params = {
                method: 'getTicket',
                params: ctx.sysinfo.address
            };
        }
        else {
            if (!common_1.checkAddress(args[0])) {
                resolve({
                    ret: core_1.ErrorCode.RESULT_WRONG_ARG,
                    resp: "Wrong input address"
                });
                return;
            }
            params =
                {
                    method: 'getTicket',
                    params: args[0]
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
exports.getTicket = getTicket;
function prnGetTicket(ctx, obj) {
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
        console.log(colors.green('On ticket:'));
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
exports.prnGetTicket = prnGetTicket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGlja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9nZXR0aWNrZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxrQ0FBb0M7QUFDcEMscUNBQTBFO0FBQzFFLGlDQUFpQztBQUVqQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFFbEIsS0FBSyxvQkFBb0IsR0FBYyxFQUFFLElBQWM7SUFDNUQsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDN0MsSUFBSSxNQUFXLENBQUM7UUFFaEIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNuQixNQUFNLEdBQUc7Z0JBQ1AsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU87YUFDNUIsQ0FBQztTQUNIO2FBQU07WUFDTCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDMUIsT0FBTyxDQUFDO29CQUNOLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtvQkFDL0IsSUFBSSxFQUFFLHFCQUFxQjtpQkFDNUIsQ0FBQyxDQUFDO2dCQUNILE9BQU87YUFDUjtZQUNELE1BQU07Z0JBQ0o7b0JBQ0UsTUFBTSxFQUFFLFdBQVc7b0JBQ25CLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNoQixDQUFBO1NBQ0o7UUFDRCxhQUFhO1FBRWIsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBaENELDhCQWdDQztBQUNELHNCQUE2QixHQUFjLEVBQUUsR0FBYTtJQUN4RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDUjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDRixPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFeEMsdUJBQXVCO1FBQ3ZCLHNFQUFzRTtRQUN0RSxJQUFJO1FBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUI7S0FDRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtBQUNILENBQUM7QUF6QkQsb0NBeUJDIn0=