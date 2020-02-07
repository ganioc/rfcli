"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FUNC_NAME = 'getLastIrreversibleBlockNumber';
async function getLastIrreversibleBlockNumber(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        let cr = await ctx.client.callAsync(FUNC_NAME, {});
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getLastIrreversibleBlockNumber = getLastIrreversibleBlockNumber;
function prnGetLastIrreversibleBlockNumber(ctx, obj) {
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
        console.log(objJson);
        // objJson.forEach((element: string) => {
        //   console.log(element.replace(/<=/g, ''));
        // });
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetLastIrreversibleBlockNumber = prnGetLastIrreversibleBlockNumber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TElCTnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9nZXRMSUJOdW1iZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxNQUFNLFNBQVMsR0FBRyxnQ0FBZ0MsQ0FBQztBQUU1QyxLQUFLLHlDQUF5QyxHQUFjLEVBQUUsSUFBYztJQUNqRixPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUU3QyxhQUFhO1FBRWIsSUFBSSxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBWkQsd0VBWUM7QUFDRCwyQ0FBa0QsR0FBYyxFQUFFLEdBQWE7SUFDN0UsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xCO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1I7SUFDRCxJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJO1FBQ0YsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDcEIseUNBQXlDO1FBQ3pDLDZDQUE2QztRQUM3QyxNQUFNO0tBQ1A7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEI7QUFDSCxDQUFDO0FBckJELDhFQXFCQyJ9