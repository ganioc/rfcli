"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const FUNC_NAME = 'view';
async function getUserCode(ctx, args) {
    return new Promise(async (resolve) => {
        let params;
        // check args
        if (args.length < 1) {
            params = {
                method: 'getUserCode',
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
                    method: 'getUserCode',
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
exports.getUserCode = getUserCode;
function prnGetUserCode(ctx, obj) {
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
        if (!objJson.value) {
            console.log('No UserCode deployed');
            return;
        }
        const t = objJson.value[0];
        if (t !== 'b') {
            console.log('Wrong format');
            return;
        }
        const v = objJson.value.slice(1);
        const value = Buffer.from(v, 'hex');
        console.log('code is: ', value.toString());
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetUserCode = prnGetUserCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dXNlcmNvZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldHVzZXJjb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esa0NBQW9DO0FBQ3BDLHFDQUF1RjtBQUd2RixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFFbEIsS0FBSyxzQkFBc0IsR0FBYyxFQUFFLElBQWM7SUFDNUQsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDM0MsSUFBSSxNQUFXLENBQUM7UUFDaEIsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsTUFBTSxHQUFHO2dCQUNMLE1BQU0sRUFBRSxhQUFhO2dCQUNyQixNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7YUFDM0MsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFJLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxDQUFDO29CQUNKLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtvQkFDL0IsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCLENBQUMsQ0FBQztnQkFDSCxPQUFPO2FBQ1Y7WUFDRCxNQUFNO2dCQUNGO29CQUNJLE1BQU0sRUFBRSxhQUFhO29CQUNyQixNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO2lCQUMvQixDQUFBO1NBQ1I7UUFFRCxJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV2RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBaENELGtDQWdDQztBQUNELHdCQUErQixHQUFjLEVBQUUsR0FBYTtJQUN4RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDVjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3BDLE9BQU87U0FDVjtRQUNELE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM1QixPQUFPO1NBQ1Y7UUFDRCxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztLQUM5QztJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUM7QUE5QkQsd0NBOEJDIn0=