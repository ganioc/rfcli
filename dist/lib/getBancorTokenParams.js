"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const common_1 = require("./common");
const METHOD_NAME = 'view';
const FUNC_NAME = 'getBancorTokenParams';
async function getBancorTokenParams(ctx, args) {
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
exports.getBancorTokenParams = getBancorTokenParams;
function prnGetBancorTokenParams(ctx, obj) {
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
            // console.log('Factor: ', formatNumber(objJson.value));
            if (typeof objJson.value === 'number') {
                console.log('Fail:', objJson.value);
            }
            console.log(objJson.value);
        }
        else {
            console.log('Error:', objJson.err);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetBancorTokenParams = prnGetBancorTokenParams;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0QmFuY29yVG9rZW5QYXJhbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldEJhbmNvclRva2VuUGFyYW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0NBQW9DO0FBQ3BDLHFDQUEyRTtBQUUzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUM7QUFDM0IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUM7QUFFbEMsS0FBSywrQkFBK0IsR0FBYyxFQUFFLElBQWM7SUFDdkUsT0FBTyxJQUFJLE9BQU8sQ0FBVyxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFFN0MsYUFBYTtRQUNiLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDbkIsT0FBTyxDQUFDO2dCQUNOLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLFlBQVk7YUFDbkIsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNSO1FBRUQsSUFBSSxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDMUIsT0FBTyxDQUFDO2dCQUNOLEdBQUcsRUFBRSxnQkFBUyxDQUFDLGdCQUFnQjtnQkFDL0IsSUFBSSxFQUFFLCtCQUErQjthQUN0QyxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1I7UUFFRCxJQUFJLE1BQU0sR0FDVjtZQUNFLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTthQUMvQjtTQUNGLENBQUE7UUFFRCxJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFuQ0Qsb0RBbUNDO0FBQ0QsaUNBQXdDLEdBQWMsRUFBRSxHQUFhO0lBQ25FLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNSO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSTtRQUNGLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLHdEQUF3RDtZQUN4RCxJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUNwQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEM7S0FFRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtBQUNILENBQUM7QUEzQkQsMERBMkJDIn0=