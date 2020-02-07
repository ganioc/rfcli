"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializable_1 = require("../core/serializable");
const FUNC_NAME = 'getConnInfo';
async function getConnInfo(ctx, args) {
    return new Promise(async (resolve) => {
        let params = { index: 0 };
        if (args[0] !== undefined) {
            try {
                let mInd = parseInt(args[0]);
                params.index = mInd;
            }
            catch (e) {
                resolve({
                    ret: serializable_1.ErrorCode.RESULT_WRONG_ARG,
                    resp: "Wrong arg , should be integer"
                });
            }
        }
        // check args
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getConnInfo = getConnInfo;
function prnGetConnInfo(ctx, obj) {
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
        // let vote: Map<string, BigNumber> = MapFromObject(objJson.value!);
        // console.log(colors.green('Votes:'));
        // for (let [k, v] of vote) {
        //     console.log(`${k}:  ${v.toString().replace(/n/g, '')}`);
        // }
        console.log(objJson);
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetConnInfo = prnGetConnInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q29ubkluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldENvbm5JbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsdURBQWdFO0FBSWhFLE1BQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQztBQUV6QixLQUFLLHNCQUFzQixHQUFjLEVBQUUsSUFBYztJQUM1RCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxJQUFJLE1BQU0sR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQTtRQUV6QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7WUFDdkIsSUFBSTtnQkFDQSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2FBQ3ZCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxDQUFDO29CQUNKLEdBQUcsRUFBRSx3QkFBUyxDQUFDLGdCQUFnQjtvQkFDL0IsSUFBSSxFQUFFLCtCQUErQjtpQkFDeEMsQ0FBQyxDQUFBO2FBQ0w7U0FDSjtRQUNELGFBQWE7UUFDYixJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBeEJELGtDQXdCQztBQUNELHdCQUErQixHQUFjLEVBQUUsR0FBYTtJQUN4RCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDVjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0Isb0VBQW9FO1FBQ3BFLHVDQUF1QztRQUN2Qyw2QkFBNkI7UUFDN0IsK0RBQStEO1FBQy9ELElBQUk7UUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3hCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0FBQ0wsQ0FBQztBQXZCRCx3Q0F1QkMifQ==