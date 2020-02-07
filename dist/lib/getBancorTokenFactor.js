"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const METHOD_NAME = 'view';
const FUNC_NAME = 'getBancorTokenFactor';
async function getBancorTokenFactor(ctx, args) {
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
exports.getBancorTokenFactor = getBancorTokenFactor;
function prnGetBancorTokenFactor(ctx, obj) {
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
            console.log('Factor: ', common_1.formatNumber(objJson.value));
        }
        else {
            console.log('Error:', objJson.err);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBancorTokenFactor = prnGetBancorTokenFactor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QmFuY29yVG9rZW5GYWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldEJhbmNvclRva2VuRmFjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0NBQW9DO0FBQ3BDLHFDQUEyRTtBQUUzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDM0IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUM7QUFFbEMsS0FBSywrQkFBK0IsR0FBYyxFQUFFLElBQWM7SUFDckUsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFM0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDckIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxDQUFDO2dCQUNKLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLCtCQUErQjthQUN4QyxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLE1BQU0sR0FDVjtZQUNJLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE1BQU0sRUFBRTtnQkFDSixPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTthQUNqQztTQUNKLENBQUE7UUFFRCxJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBbkNELG9EQW1DQztBQUNELGlDQUF3QyxHQUFjLEVBQUUsR0FBYTtJQUNqRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDVjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxxQkFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3hEO2FBQU07WUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEM7S0FFSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUM7QUF2QkQsMERBdUJDIn0=