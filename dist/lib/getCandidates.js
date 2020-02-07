"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FUNC_NAME = 'view';
async function getCandidates(ctx, args) {
    return new Promise(async (resolve) => {
        let params = {
            method: 'getCandidates',
            params: {}
        };
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getCandidates = getCandidates;
function prnGetCandidates(ctx, obj) {
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
            // objJson.value.forEach((element: string) => {
            //     console.log(element.slice(1));
            // });
            console.log('curMiner:', objJson.value.curMiner);
            console.log(objJson.value.candidates);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetCandidates = prnGetCandidates;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0Q2FuZGlkYXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvZ2V0Q2FuZGlkYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUtBLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUVsQixLQUFLLHdCQUF3QixHQUFjLEVBQUUsSUFBYztJQUM5RCxPQUFPLElBQUksT0FBTyxDQUFXLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUUzQyxJQUFJLE1BQU0sR0FDVjtZQUNJLE1BQU0sRUFBRSxlQUFlO1lBQ3ZCLE1BQU0sRUFBRSxFQUFFO1NBQ2IsQ0FBQTtRQUVELElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFoQkQsc0NBZ0JDO0FBQ0QsMEJBQWlDLEdBQWMsRUFBRSxHQUFhO0lBQzFELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQjtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNWO0lBQ0QsSUFBSSxPQUFZLENBQUM7SUFFakIsSUFBSTtRQUNBLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQ25CLCtDQUErQztZQUMvQyxxQ0FBcUM7WUFDckMsTUFBTTtZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3pDO0tBQ0o7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDTCxDQUFDO0FBekJELDRDQXlCQyJ9