"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1 = require('secp256k1');
const { randomBytes } = require('crypto');
const digest = require("./lib/digest");
const staticwriter_1 = require("./lib/staticwriter");
const base58 = require("./lib/base58");
const util_1 = require("util");
const client_1 = require("../client");
// prefix can identify different network
// will be readed from consensus params
const defaultPrefix = 0x00;
function pubKeyToBCFormat(publickey) {
    const keyHash = digest.hash160(publickey);
    const size = 5 + keyHash.length;
    const bw = new staticwriter_1.StaticWriter(size);
    bw.writeU8(defaultPrefix);
    bw.writeBytes(keyHash);
    bw.writeChecksum();
    return bw.render();
}
function signBufferMsg(msg, key) {
    // Sign message
    let sig = secp256k1.sign(msg, key);
    // Ensure low S value
    return secp256k1.signatureNormalize(sig.signature);
}
exports.signBufferMsg = signBufferMsg;
function verifyBufferMsg(msg, sig, key) {
    if (sig.length === 0) {
        return false;
    }
    if (key.length === 0) {
        return false;
    }
    try {
        sig = secp256k1.signatureNormalize(sig);
        return secp256k1.verify(msg, sig, key);
    }
    catch (e) {
        return false;
    }
}
exports.verifyBufferMsg = verifyBufferMsg;
function addressFromPublicKey(publicKey) {
    if (util_1.isString(publicKey)) {
        publicKey = Buffer.from(publicKey, 'hex');
    }
    return base58.encode(pubKeyToBCFormat(publicKey));
}
exports.addressFromPublicKey = addressFromPublicKey;
function publicKeyFromSecretKey(secret) {
    if (util_1.isString(secret)) {
        secret = Buffer.from(secret, 'hex');
    }
    if (!secp256k1.privateKeyVerify(secret)) {
        return;
    }
    const key = secp256k1.publicKeyCreate(secret, true);
    return key;
}
exports.publicKeyFromSecretKey = publicKeyFromSecretKey;
function addressFromSecretKey(secret) {
    let publicKey = publicKeyFromSecretKey(secret);
    if (publicKey) {
        return addressFromPublicKey(publicKey);
    }
}
exports.addressFromSecretKey = addressFromSecretKey;
function createKeyPair() {
    let privateKey;
    do {
        privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    const key = secp256k1.publicKeyCreate(privateKey, true);
    return [key, privateKey];
}
exports.createKeyPair = createKeyPair;
function sign(md, secret) {
    if (util_1.isString(secret)) {
        secret = Buffer.from(secret, 'hex');
    }
    if (util_1.isString(md)) {
        md = Buffer.from(md, 'hex');
    }
    return signBufferMsg(md, secret);
}
exports.sign = sign;
function verify(md, signature, publicKey) {
    if (util_1.isString(md)) {
        md = Buffer.from(md, 'hex');
    }
    return verifyBufferMsg(md, signature, publicKey);
}
exports.verify = verify;
function isValidAddress(address) {
    let buf;
    try {
        buf = base58.decode(address);
        if (buf.length !== 25) {
            return false;
        }
    }
    catch (e) {
        return false;
    }
    let br = new client_1.BufferReader(buf);
    br.readU8();
    br.readBytes(20);
    try {
        br.verifyChecksum();
    }
    catch (error) {
        return false;
    }
    return true;
}
exports.isValidAddress = isValidAddress;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkcmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2FkZHJlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdkMsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQyx1Q0FBdUM7QUFDdkMscURBQWtEO0FBQ2xELHVDQUF1QztBQUN2QywrQkFBZ0M7QUFDaEMsc0NBQXlDO0FBRXpDLHdDQUF3QztBQUN4Qyx1Q0FBdUM7QUFDdkMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBRTNCLDBCQUEwQixTQUFpQjtJQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ2hDLE1BQU0sRUFBRSxHQUFHLElBQUksMkJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVsQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRTFCLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBRW5CLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCx1QkFBOEIsR0FBVyxFQUFFLEdBQVc7SUFDbEQsZUFBZTtJQUNmLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLHFCQUFxQjtJQUNyQixPQUFPLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUxELHNDQUtDO0FBRUQseUJBQWdDLEdBQVcsRUFBRSxHQUFXLEVB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