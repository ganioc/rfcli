"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const writer_1 = require("./lib/writer");
var writer_2 = require("./lib/writer");
exports.BufferWriter = writer_2.BufferWriter;
var reader_1 = require("./lib/reader");
exports.BufferReader = reader_1.BufferReader;
const error_code_1 = require("./error_code");
var error_code_2 = require("./error_code");
exports.ErrorCode = error_code_2.ErrorCode;
const encoding_1 = require("./lib/encoding");
const digest = require("./lib/digest");
const bignumber_js_1 = require("bignumber.js");
const util_1 = require("util");
function MapToObject(input) {
    if (!(input instanceof Map)) {
        throw new Error('input MUST be a Map');
    }
    let ret = {};
    for (const [k, v] of input) {
        if (!util_1.isString(k)) {
            throw new Error('input Map`s key MUST be string');
        }
        ret[k] = v;
    }
    return ret;
}
exports.MapToObject = MapToObject;
function SetToArray(input) {
    if (!(input instanceof Set)) {
        throw new Error('input MUST be a Set');
    }
    let ret = new Array();
    for (const item of input) {
        ret.push(item);
    }
    return ret;
}
exports.SetToArray = SetToArray;
function SetFromObject(input) {
    if (!util_1.isObject(input)) {
        throw new Error('input MUST be a Object');
    }
    let ret = new Set();
    input.forEach((v) => ret.add(v));
    return ret;
}
exports.SetFromObject = SetFromObject;
function MapFromObject(input) {
    if (!util_1.isObject(input)) {
        throw new Error('input MUST be a Object');
    }
    let ret = new Map();
    for (const k of Object.keys(input)) {
        ret.set(k, input[k]);
    }
    return ret;
}
exports.MapFromObject = MapFromObject;
function deepCopy(o) {
    if (util_1.isUndefined(o) || util_1.isNull(o)) {
        return o;
    }
    else if (util_1.isNumber(o) || util_1.isBoolean(o)) {
        return o;
    }
    else if (util_1.isString(o)) {
        return o;
    }
    else if (o instanceof bignumber_js_1.BigNumber) {
        return new bignumber_js_1.BigNumber(o);
    }
    else if (util_1.isBuffer(o)) {
        return Buffer.from(o);
    }
    else if (util_1.isArray(o) || o instanceof Array) {
        let s = [];
        for (let e of o) {
            s.push(deepCopy(e));
        }
        return s;
    }
    else if (o instanceof Map) {
        let s = new Map();
        for (let k of o.keys()) {
            s.set(k, deepCopy(o.get(k)));
        }
        return s;
    }
    else if (util_1.isObject(o)) {
        let s = Object.create(null);
        for (let k of Object.keys(o)) {
            s[k] = deepCopy(o[k]);
        }
        return s;
    }
    else {
        throw new Error('not JSONable');
    }
}
exports.deepCopy = deepCopy;
function toEvalText(o) {
    if (util_1.isUndefined(o) || util_1.isNull(o)) {
        return JSON.stringify(o);
    }
    else if (util_1.isNumber(o) || util_1.isBoolean(o)) {
        return JSON.stringify(o);
    }
    else if (util_1.isString(o)) {
        return JSON.stringify(o);
    }
    else if (o instanceof bignumber_js_1.BigNumber) {
        return `new BigNumber('${o.toString()}')`;
    }
    else if (util_1.isBuffer(o)) {
        return `Buffer.from('${o.toString('hex')}', 'hex')`;
    }
    else if (util_1.isArray(o) || o instanceof Array) {
        let s = [];
        for (let e of o) {
            s.push(toEvalText(e));
        }
        return `[${s.join(',')}]`;
    }
    else if (o instanceof Map) {
        throw new Error(`use MapToObject before toStringifiable`);
    }
    else if (o instanceof Set) {
        throw new Error(`use SetToArray before toStringifiable`);
    }
    else if (util_1.isObject(o)) {
        let s = [];
        for (let k of Object.keys(o)) {
            s.push(`'${k}':${toEvalText(o[k])}`);
        }
        return `{${s.join(',')}}`;
    }
    else {
        throw new Error('not JSONable');
    }
}
exports.toEvalText = toEvalText;
function toStringifiable(o, parsable = false) {
    if (util_1.isUndefined(o) || util_1.isNull(o)) {
        return o;
    }
    else if (util_1.isNumber(o) || util_1.isBoolean(o)) {
        return o;
    }
    else if (util_1.isString(o)) {
        return parsable ? 's' + o : o;
    }
    else if (o instanceof bignumber_js_1.BigNumber) {
        return parsable ? 'n' + o.toString() : o.toString();
    }
    else if (util_1.isBuffer(o)) {
        return parsable ? 'b' + o.toString('hex') : o.toString('hex');
    }
    else if (util_1.isArray(o) || o instanceof Array) {
        let s = [];
        for (let e of o) {
            s.push(toStringifiable(e, parsable));
        }
        return s;
    }
    else if (o instanceof Map) {
        throw new Error(`use MapToObject before toStringifiable`);
    }
    else if (o instanceof Set) {
        throw new Error(`use SetToArray before toStringifiable`);
    }
    else if (util_1.isObject(o)) {
        let s = Object.create(null);
        for (let k of Object.keys(o)) {
            s[k] = toStringifiable(o[k], parsable);
        }
        return s;
    }
    else {
        throw new Error('not JSONable');
    }
}
exports.toStringifiable = toStringifiable;
function fromStringifiable(o) {
    // let value = JSON.parse(o);
    function __convertValue(v) {
        if (util_1.isString(v)) {
            if (v.charAt(0) === 's') {
                return v.substring(1);
            }
            else if (v.charAt(0) === 'b') {
                return Buffer.from(v.substring(1), 'hex');
            }
            else if (v.charAt(0) === 'n') {
                return new bignumber_js_1.BigNumber(v.substring(1));
            }
            else {
                throw new Error(`invalid parsable value ${v}`);
            }
        }
        else if (util_1.isArray(v) || v instanceof Array) {
            for (let i = 0; i < v.length; ++i) {
                v[i] = __convertValue(v[i]);
            }
            return v;
        }
        else if (util_1.isObject(v)) {
            for (let k of Object.keys(v)) {
                v[k] = __convertValue(v[k]);
            }
            return v;
        }
        else {
            return v;
        }
    }
    return __convertValue(o);
}
exports.fromStringifiable = fromStringifiable;
class SerializableWithHash {
    constructor() {
        this.m_hash = encoding_1.Encoding.NULL_HASH;
    }
    get hash() {
        return this.m_hash;
    }
    _encodeHashContent(writer) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    encode(writer) {
        // writer.writeHash(this.hash);
        return this._encodeHashContent(writer);
    }
    decode(reader) {
        // this.m_hash = reader.readHash('hex');
        let err = this._decodeHashContent(reader);
        this.updateHash();
        return err;
    }
    updateHash() {
        this.m_hash = this._genHash();
    }
    _genHash() {
        let contentWriter = new writer_1.BufferWriter();
        this._encodeHashContent(contentWriter);
        let content = contentWriter.render();
        return digest.hash256(content).toString('hex');
    }
    _verifyHash() {
        return this.hash === this._genHash();
    }
    stringify() {
        return { hash: this.hash };
    }
}
exports.SerializableWithHash = SerializableWithHash;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvc2VyaWFsaXphYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseUNBQTBDO0FBRzFDLHVDQUEwQztBQUFsQyxnQ0FBQSxZQUFZLENBQUE7QUFDcEIsdUNBQTBDO0FBQWxDLGdDQUFBLFlBQVksQ0FBQTtBQUVwQiw2Q0FBdUM7QUFDdkMsMkNBQXVDO0FBQS9CLGlDQUFBLFNBQVMsQ0FBQTtBQUVqQiw2Q0FBd0M7QUFDeEMsdUNBQXVDO0FBQ3ZDLCtDQUF1QztBQUN2QywrQkFBdUc7QUFNdkcscUJBQTZCLEtBQXVCO0lBQ2hELElBQUksQ0FBQyxDQUFFLEtBQUssWUFBWSxHQUFHLENBQUMsRUFBRTtRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDMUM7SUFDRCxJQUFJLEdBQUcsR0FBUSxFQUFFLENBQUM7SUFDbEIsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUN4QixJQUFJLENBQUMsZUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNkO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBYkQsa0NBYUM7QUFFRCxvQkFBNEIsS0FBZTtJQUN2QyxJQUFJLENBQUMsQ0FBRSxLQUFLLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQzFDO0lBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUN0QixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUks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