"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FUNC_NAME = 'getPeers';
async function getPeers(ctx, args) {
    return new Promise(async (resolve) => {
        // check args
        let cr = await ctx.client.callAsync(FUNC_NAME, {});
        if (ctx.sysinfo.verbose) {
            console.log(cr);
        }
        resolve(cr);
    });
}
exports.getPeers = getPeers;
function prnGetPeers(ctx, obj) {
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
        objJson.forEach((element) => {
            console.log(element.replace(/<=/g, ''));
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.prnGetPeers = prnGetPeers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0cGVlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL2dldHBlZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDO0FBRXRCLEtBQUssbUJBQW1CLEdBQWMsRUFBRSxJQUFjO0lBQ3pELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBRTNDLGFBQWE7UUFFYixJQUFJLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkI7UUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBWkQsNEJBWUM7QUFDRCxxQkFBNEIsR0FBYyxFQUFFLEdBQWE7SUFDckQsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCO0lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtRQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1Y7SUFDRCxJQUFJLE9BQVksQ0FBQztJQUNqQixJQUFJO1FBQ0EsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFlLEVBQUUsRUFBRTtZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtBQUNMLENBQUM7QUFwQkQsa0NBb0JDIn0=