"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rfc_client_1 = require("../client/client/rfc_client");
const colors = require("colors");
let SYSINFO = {};
SYSINFO.secret = "6d23e5ab295b296079c9885056e71981042dc829517343c5c4af19ebac9436a1";
SYSINFO.host = "40.73.1.241";
SYSINFO.port = 18089;
SYSINFO.address = "1jPTj1YjuaWtYviYaNhTRYewyVttvz5wA";
SYSINFO.verbose = true;
let clientHttp;
clientHttp = new rfc_client_1.RPCClient(SYSINFO.host, SYSINFO.port, SYSINFO);
let ctx = {
    client: clientHttp,
    sysinfo: SYSINFO
};
async function main() {
    // get balance
    let funcName = 'view';
    let funcArgs = {
        method: 'getBalance',
        params: {
            address: "1jPTj1YjuaWtYviYaNhTRYewyVttvz5wA"
        }
    };
    let cr = await ctx.client.callAsync(funcName, funcArgs);
    console.log(colors.yellow('----------------- gebalance ----------------------'));
    console.log(cr);
    // get block
    let funcName2 = 'getBlock';
    let funcArgs2 = {
        which: 'latest',
        transactions: false,
        eventLog: false,
        receipts: false
    };
    cr = await ctx.client.callAsync(funcName2, funcArgs2);
    console.log(colors.yellow('----------------- getblock -----------------------'));
    console.log(cr);
    // get block 1
    funcName2 = 'getBlock';
    funcArgs2 = {
        which: 'latest',
        transactions: true,
        eventLog: true,
        receipts: true
    };
    cr = await ctx.client.callAsync(funcName2, funcArgs2);
    console.log(colors.yellow('------------------- getblock 1 ---------------------'));
    console.log(cr);
    // get tx
    let funcName3 = 'getTransactionReceipt';
    let funcArgs3 = {
        tx: "254f0cd0ab6c4203e9518f16da7bb3ca7e71c04e24596b0724845a63678c4f05",
    };
    cr = await ctx.client.callAsync(funcName3, funcArgs3);
    console.log(colors.yellow('------------------ get tx ----------------------'));
    console.log(cr);
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtb19zdGF0dXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGVtby9kZW1vX3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDREQUF3RDtBQUN4RCxpQ0FBaUM7QUFFakMsSUFBSSxPQUFPLEdBQVEsRUFBRSxDQUFDO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsa0VBQWtFLENBQUM7QUFDcEYsT0FBTyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7QUFDN0IsT0FBTyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDckIsT0FBTyxDQUFDLE9BQU8sR0FBRyxtQ0FBbUMsQ0FBQztBQUN0RCxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUV2QixJQUFJLFVBQXFCLENBQUM7QUFFMUIsVUFBVSxHQUFHLElBQUksc0JBQVMsQ0FDdEIsT0FBTyxDQUFDLElBQUksRUFDWixPQUFPLENBQUMsSUFBSSxFQUNaLE9BQU8sQ0FDVixDQUFDO0FBRUYsSUFBSSxHQUFHLEdBQUc7SUFDTixNQUFNLEVBQUUsVUFBVTtJQUNsQixPQUFPLEVBQUUsT0FBTztDQUNuQixDQUFBO0FBR0QsS0FBSztJQUNELGNBQWM7SUFDZCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUE7SUFDckIsSUFBSSxRQUFRLEdBQUc7UUFDWCxNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUU7WUFDSixPQUFPLEVBQUUsbUNBQW1DO1NBQy9DO0tBQ0osQ0FBQTtJQUVELElBQUksRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUE7SUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixZQUFZO0lBQ1osSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFBO0lBQzFCLElBQUksU0FBUyxHQUFHO1FBQ1osS0FBSyxFQUFFLFFBQVE7UUFDZixZQUFZLEVBQUUsS0FBSztRQUNuQixRQUFRLEVBQUUsS0FBSztRQUNmLFFBQVEsRUFBRSxLQUFLO0tBQ2xCLENBQUE7SUFFRCxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQTtJQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhCLGNBQWM7SUFDZCxTQUFTLEdBQUcsVUFBVSxDQUFBO0lBQ3RCLFNBQVMsR0FBRztRQUNSLEtBQUssRUFBRSxRQUFRO1FBQ2YsWUFBWSxFQUFFLElBQUk7UUFDbEIsUUFBUSxFQUFFLElBQUk7UUFDZCxRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFBO0lBRUQsRUFBRSxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxzREFBc0QsQ0FBQyxDQUFDLENBQUE7SUFDbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixTQUFTO0lBQ1QsSUFBSSxTQUFTLEdBQUcsdUJBQXVCLENBQUE7SUFDdkMsSUFBSSxTQUFTLEdBQUc7UUFDWixFQUFFLEVBQUUsa0VBQWtFO0tBQ3pFLENBQUE7SUFDRCxFQUFFLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQTtJQUM5RSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9