"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializable_1 = require("../core/serializable");
const FUNC_NAME = 'getProcessInfo';
async function getProcessInfo(ctx, args) {
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
exports.getProcessInfo = getProcessInfo;
function prnGetProcessInfo(ctx, obj) {
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
exports.prnGetProcessInfo = prnGetProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UHJvY2Vzc0luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldFByb2Nlc3NJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsdURBQWdFO0FBR2hFLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDO0FBRTVCLEtBQUsseUJBQXlCLEdBQWMsRUFBRSxJQUFjO0lBQy9ELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLElBQUksTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFBO1FBRXpCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUN2QixJQUFJO2dCQUNBLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDdkI7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixPQUFPLENBQUM7b0JBQ0osR0FBRyxFQUFFLHdCQUFTLENBQUMsZ0JBQWdCO29CQUMvQixJQUFJLEVBQUUsK0JBQStCO2lCQUN4QyxDQUFDLENBQUE7YUFDTDtTQUNKO1FBQ0QsYUFBYTtRQUNiLElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUF4QkQsd0NBd0JDO0FBQ0QsMkJBQWtDLEdBQWMsRUFBRSxHQUFhO0lBQzNELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFDakIsSUFBSTtRQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixvRUFBb0U7UUFDcEUsdUNBQXVDO1FBQ3ZDLDZCQUE2QjtRQUM3QiwrREFBK0Q7UUFDL0QsSUFBSTtRQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDeEI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDTCxDQUFDO0FBdkJELDhDQXVCQyJ9