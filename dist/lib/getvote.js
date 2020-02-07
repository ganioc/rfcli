"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serializable_1 = require("../core/serializable");
const colors = require("colors");
const FUNC_NAME = 'view';
async function getVote(ctx, args) {
    return new Promise(async (resolve) => {
        let params = {
            method: 'getVote',
            params: {}
        };
        // check args
        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getVote = getVote;
function prnGetVote(ctx, obj) {
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
        let vote = serializable_1.MapFromObject(objJson.value);
        console.log(colors.green('Votes:'));
        for (let [k, v] of vote) {
            console.log(`${k}:  ${v.toString().replace(/n/g, '')}`);
        }
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetVote = prnGetVote;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dm90ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvZ2V0dm90ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLHVEQUFxRDtBQUNyRCxpQ0FBaUM7QUFFakMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDO0FBRWxCLEtBQUssa0JBQWtCLEdBQWMsRUFBRSxJQUFjO0lBQ3hELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLElBQUksTUFBTSxHQUFHO1lBQ1QsTUFBTSxFQUFFLFNBQVM7WUFDakIsTUFBTSxFQUFFLEVBQUU7U0FDYixDQUFBO1FBQ0QsYUFBYTtRQUNiLElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFmRCwwQkFlQztBQUNELG9CQUEyQixHQUFjLEVBQUUsR0FBYTtJQUNwRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO1FBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLE9BQU87S0FDVjtJQUNELElBQUksT0FBWSxDQUFDO0lBQ2pCLElBQUk7UUFDQSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQTJCLDRCQUFhLENBQUMsT0FBTyxDQUFDLEtBQU0sQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDM0Q7S0FDSjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUM7QUF0QkQsZ0NBc0JDIn0=