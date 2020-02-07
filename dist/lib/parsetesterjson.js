"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transferto_1 = require("./transferto");
const common_1 = require("./common");
const error_code_1 = require("../core/error_code");
const colors = require("colors");
const getbalance_1 = require("./getbalance");
async function parseTesterJson(ctx, inObj) {
    return new Promise(async (resolve) => {
        let newObj = inObj;
        let errorLst = [];
        //
        console.log('parseTesterJson, It will take several minutes ... ');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
                return;
            }, 3000);
        });
        for (let i = 0; i < newObj.testers.length; i++) {
            let item = newObj.testers[i];
            console.log(`\n[ ${item.name} of ${newObj.testers.length}]`);
            console.log('\nTransfer ', item.amount, ` ${common_1.sysTokenSym} => `, item.address);
            let result = await transferto_1.transferTo(ctx, [item.address, item.amount.toString(), "0.1"]);
            if (result.ret !== error_code_1.ErrorCode.RESULT_OK) {
                errorLst.push(item);
            }
            else {
                console.log(colors.green('Finished'));
            }
        }
        if (errorLst.length > 0) {
            console.log(colors.red('\nFollowing transfer failed:'));
            console.log(errorLst);
        }
        else {
            console.log(colors.green('All transfers succeed'));
        }
        console.log('\n');
        // check all balance
        console.log('Check transfers:');
        console.log('It will take several minutes ...');
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
                return;
            }, 3000);
        });
        errorLst = [];
        for (let i = 0; i < newObj.testers.length; i++) {
            let item = newObj.testers[i];
            console.log(`\n[ ${item.name} of ${newObj.testers.length}]`);
            // console.log('\nTransfer ', item.amount, ` ${sysTokenSym} => `, item.address);
            let result = await getbalance_1.getBalance(ctx, [item.address]);
            if (result.ret !== error_code_1.ErrorCode.RESULT_OK && result.ret !== 200) {
                errorLst.push(item);
            }
            else {
                // console.log('Finished');
                try {
                    let objJson = JSON.parse(result.resp);
                    console.log('\nShould be: ', item.amount);
                    console.log('Got      : ', objJson.value.replace(/n/g, ''));
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        if (errorLst.length > 0) {
            console.log(colors.red('\nFollowing getBalance failed:'));
            console.log(errorLst);
        }
        else {
            console.log(colors.green('All getBalance succeed'));
        }
        console.log('\n');
        resolve({
            ret: error_code_1.ErrorCode.RESULT_OK,
            resp: '1'
        });
    });
}
exports.parseTesterJson = parseTesterJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2V0ZXN0ZXJqc29uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9wYXJzZXRlc3Rlcmpzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMscUNBQTREO0FBQzVELG1EQUErQztBQUMvQyxpQ0FBaUM7QUFDakMsNkNBQTBDO0FBZW5DLEtBQUssMEJBQTBCLEdBQWMsRUFBRSxLQUFVO0lBQzVELE9BQU8sSUFBSSxPQUFPLENBQVcsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQzNDLElBQUksTUFBTSxHQUFHLEtBQXFCLENBQUM7UUFDbkMsSUFBSSxRQUFRLEdBQWUsRUFBRSxDQUFDO1FBQzlCLEVBQUU7UUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLG9EQUFvRCxDQUFDLENBQUM7UUFDbEUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzFCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNaLE9BQU87WUFDWCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksb0JBQVcsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUU3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