"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const serializable_1 = require("../serializable");
const encoding_1 = require("../lib/encoding");
const Address = require("../address");
const util_1 = require("util");
class Transaction extends serializable_1.SerializableWithHash {
    constructor() {
        super();
        this.m_publicKey = encoding_1.Encoding.ZERO_KEY;
        this.m_signature = encoding_1.Encoding.ZERO_SIG64;
        this.m_method = '';
        this.m_nonce = -1;
    }
    get address() {
        return Address.addressFromPublicKey(this.m_publicKey);
    }
    get method() {
        return this.m_method;
    }
    set method(s) {
        this.m_method = s;
    }
    get nonce() {
        return this.m_nonce;
    }
    set nonce(n) {
        this.m_nonce = n;
    }
    get input() {
        const input = this.m_input;
        return input;
    }
    set input(i) {
        this.m_input = i;
    }
    /**
     *  virtual验证交易的签名段
     */
    verifySignature() {
        if (!this.m_publicKey) {
            return false;
        }
        return Address.verify(this.m_hash, this.m_signature, this.m_publicKey);
    }
    sign(privateKey) {
        if (privateKey) {
            let pubkey = Address.publicKeyFromSecretKey(privateKey);
            this.m_publicKey = pubkey;
            this.updateHash();
            this.m_signature = Address.sign(this.m_hash, privateKey);
        }
        else {
            console.log('!!!! unlock first !!!!');
        }
    }
    _encodeHashContent(writer) {
        try {
            writer.writeVarString(this.m_method);
            writer.writeU32(this.m_nonce);
            writer.writeBytes(this.m_publicKey);
            this._encodeInput(writer);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    encode(writer) {
        let err = super.encode(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeBytes(this.m_signature);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        try {
            this.m_method = reader.readVarString();
            this.m_nonce = reader.readU32();
            this.m_publicKey = reader.readBytes(33, false);
            this._decodeInput(reader);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        let err = super.decode(reader);
        if (err) {
            return err;
        }
        try {
            this.m_signature = reader.readBytes(64, false);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    _encodeInput(writer) {
        let input;
        if (this.m_input) {
            input = JSON.stringify(serializable_1.toStringifiable(this.m_input, true));
        }
        else {
            input = JSON.stringify({});
        }
        writer.writeVarString(input);
        return writer;
    }
    _decodeInput(reader) {
        this.m_input = serializable_1.fromStringifiable(JSON.parse(reader.readVarString()));
        return serializable_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = super.stringify();
        obj.method = this.method;
        obj.input = this.input;
        obj.nonce = this.nonce;
        obj.caller = this.address;
        return obj;
    }
    static fromRaw(raw, T) {
        let buffer;
        if (util_1.isString(raw)) {
            buffer = Buffer.from(raw, 'hex');
        }
        else if (util_1.isBuffer(raw)) {
            buffer = raw;
        }
        else {
            return undefined;
        }
        let tx = new T();
        let err = tx.decode(new serializable_1.BufferReader(buffer));
        if (err) {
            return undefined;
        }
        return tx;
    }
}
exports.Transaction = Transaction;
class EventLog {
    constructor() {
        this.m_event = '';
    }
    set name(n) {
        this.m_event = n;
    }
    get name() {
        return this.m_event;
    }
    set index(o) {
    }
    get index() {
        return undefined;
    }
    set param(p) {
        this.m_params = p;
    }
    get param() {
        const param = this.m_params;
        return param;
    }
    encode(writer) {
        let input;
        try {
            writer.writeVarString(this.m_event);
            if (this.m_params) {
                input = JSON.stringify(serializable_1.toStringifiable(this.m_params, true));
            }
            else {
                input = JSON.stringify({});
            }
            writer.writeVarString(input);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        try {
            this.m_event = reader.readVarString();
            this.m_params = serializable_1.fromStringifiable(JSON.parse(reader.readVarString()));
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = Object.create(null);
        obj.name = this.name;
        obj.param = this.param;
        return obj;
    }
}
exports.EventLog = EventLog;
var ReceiptSourceType;
(function (ReceiptSourceType) {
    ReceiptSourceType[ReceiptSourceType["preBlockEvent"] = 0] = "preBlockEvent";
    ReceiptSourceType[ReceiptSourceType["postBlockEvent"] = 1] = "postBlockEvent";
    ReceiptSourceType[ReceiptSourceType["transaction"] = 2] = "transaction";
})(ReceiptSourceType = exports.ReceiptSourceType || (exports.ReceiptSourceType = {}));
class Receipt {
    constructor() {
        this.m_returnCode = 0;
        this.m_eventLogs = new Array();
    }
    setSource(source) {
        this.m_sourceType = source.sourceType;
        if (source.sourceType === ReceiptSourceType.preBlockEvent) {
            assert(!util_1.isNullOrUndefined(source.eventIndex), `invalid source event id`);
            this.m_eventIndex = source.eventIndex;
        }
        else if (source.sourceType === ReceiptSourceType.postBlockEvent) {
            assert(!util_1.isNullOrUndefined(source.eventIndex), `invalid source event id`);
            this.m_eventIndex = source.eventIndex;
        }
        else if (source.sourceType === ReceiptSourceType.transaction) {
            assert(source.txHash, `invalid source transaction hash`);
            this.m_transactionHash = source.txHash;
        }
        else {
            assert(false, `invalid source type ${source.sourceType}`);
        }
    }
    get transactionHash() {
        return this.m_transactionHash;
    }
    get eventId() {
        return this.m_eventIndex;
    }
    get sourceType() {
        return this.m_sourceType;
    }
    set returnCode(n) {
        this.m_returnCode = n;
    }
    get returnCode() {
        return this.m_returnCode;
    }
    set eventLogs(logs) {
        this.m_eventLogs = logs;
    }
    get eventLogs() {
        const l = this.m_eventLogs;
        return l;
    }
    encode(writer) {
        if (util_1.isNullOrUndefined(this.m_sourceType)) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        try {
            writer.writeU8(this.m_sourceType);
            if (this.m_sourceType === ReceiptSourceType.transaction) {
                writer.writeVarString(this.m_transactionHash);
            }
            else {
                writer.writeU16(this.m_eventIndex);
            }
            writer.writeI32(this.m_returnCode);
            writer.writeU16(this.m_eventLogs.length);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        for (let log of this.m_eventLogs) {
            let err = log.encode(writer);
            if (err) {
                return err;
            }
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        try {
            this.m_sourceType = reader.readU8();
            if (this.m_sourceType === ReceiptSourceType.transaction) {
                this.m_transactionHash = reader.readVarString();
            }
            else if (this.m_sourceType === ReceiptSourceType.preBlockEvent
                || this.m_sourceType === ReceiptSourceType.postBlockEvent) {
                this.m_eventIndex = reader.readU16();
            }
            this.m_returnCode = reader.readI32();
            let nCount = reader.readU16();
            for (let i = 0; i < nCount; i++) {
                let log = new EventLog();
                let err = log.decode(reader);
                if (err) {
                    return err;
                }
                this.m_eventLogs.push(log);
            }
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = Object.create(null);
        obj.transactionHash = this.m_transactionHash;
        obj.returnCode = this.m_returnCode;
        obj.logs = [];
        for (let l of this.eventLogs) {
            obj.logs.push(l.stringify());
        }
        return obj;
    }
}
exports.Receipt = Receipt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9ibG9jay90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxrREFBZ0o7QUFDaEosOENBQTJDO0FBQzNDLHNDQUFzQztBQUN0QywrQkFBNkQ7QUFHN0QsaUJBQXlCLFNBQVEsbUNBQW9CO0lBT2pEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLG1CQUFRLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxXQUFXLEdBQUcsbUJBQVEsQ0FBQyxVQUFVLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUksTUFBTSxDQUFDLENBQVM7UUFDaEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsQ0FBUztRQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzNCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxJQUFJLEtBQUss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