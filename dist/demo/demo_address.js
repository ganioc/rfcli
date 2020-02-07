"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const core_1 = require("../core");
const secp256k1 = require('secp256k1');
const colors = require("colors");
let createKey = function () {
    let privateKey;
    do {
        privateKey = crypto_1.randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    const pkey = secp256k1.publicKeyCreate(privateKey, true);
    let address = core_1.addressFromSecretKey(privateKey);
    console.log('');
    console.log(colors.green('address   : '), address);
    console.log(colors.green('public key: '), pkey.toString('hex'));
    console.log(colors.green('secret key: '), privateKey.toString('hex'));
    console.log('');
    if (core_1.isValidAddress(address)) {
        console.log(colors.blue('Valid address: ') + address);
    }
    else {
        console.log(colors.red('Invalid address: ') + address);
    }
};
function main() {
    createKey();
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVtb19hZGRyZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RlbW8vZGVtb19hZGRyZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXFDO0FBQ3JDLGtDQUErRDtBQUMvRCxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsaUNBQWlDO0FBRWpDLElBQUksU0FBUyxHQUFHO0lBQ1osSUFBSSxVQUFVLENBQUM7SUFFZixHQUFHO1FBQ0MsVUFBVSxHQUFHLG9CQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtJQUVsRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV6RCxJQUFJLE9BQU8sR0FBRywyQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUUvQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQixJQUFJLHFCQUFjLENBQUMsT0FBUSxDQUFDLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUE7S0FDeEQ7U0FBTTtRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFBO0tBQ3pEO0FBQ0wsQ0FBQyxDQUFBO0FBRUQ7SUFDSSxTQUFTLEVBQUUsQ0FBQztBQUVoQixDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMifQ==