"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const writer_1 = require("../lib/writer");
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
const consensus = require("./consensus");
const assert = require("assert");
const digest = require("../lib/digest");
// type Constructor<T> = new () => T;
// export function blockHeaderClass<T extends BaseBlock.BlockHeader>(superBlockHeader: Constructor<T>) {
//     class BlockHeaderClass extends (superBlockHeader as Constructor<BaseBlock.BlockHeader>) {
class PowBlockHeader extends value_chain_1.ValueBlockHeader {
    constructor() {
        super();
        this.m_bits = 0;
        this.m_nonce = 0;
        this.m_nonce1 = 0;
        // this.m_bits = POWUtil.getTarget(prevheader);
    }
    get bits() {
        return this.m_bits;
    }
    set bits(bits) {
        this.m_bits = bits;
    }
    get nonce() {
        return this.m_nonce;
    }
    set nonce(_nonce) {
        assert(_nonce <= consensus.INT32_MAX);
        this.m_nonce = _nonce;
    }
    get nonce1() {
        return this.m_nonce1;
    }
    set nonce1(nonce) {
        assert(nonce <= consensus.INT32_MAX);
        this.m_nonce1 = nonce;
    }
    _encodeHashContent(writer) {
        let err = super._encodeHashContent(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeU32(this.m_bits);
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    encode(writer) {
        let err = super.encode(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeU32(this.m_nonce);
            writer.writeU32(this.m_nonce1);
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        let err = super._decodeHashContent(reader);
        if (err !== error_code_1.ErrorCode.RESULT_OK) {
            return err;
        }
        try {
            this.m_bits = reader.readU32();
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        let err = super.decode(reader);
        if (err !== error_code_1.ErrorCode.RESULT_OK) {
            return err;
        }
        try {
            this.m_nonce = reader.readU32();
            this.m_nonce1 = reader.readU32();
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async verify(chain) {
        let vr = await super.verify(chain);
        if (vr.err || !vr.valid) {
            return vr;
        }
        // check bits
        let { err, target } = await consensus.getTarget(this, chain);
        if (err) {
            return { err };
        }
        if (this.m_bits !== target) {
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: false };
        }
        // check POW
        return { err: error_code_1.ErrorCode.RESULT_OK, valid: this.verifyPOW() };
    }
    verifyPOW() {
        let writer = new writer_1.BufferWriter();
        if (this.encode(writer)) {
            return false;
        }
        let content = writer.render();
        return consensus.verifyPOW(digest.hash256(content), this.m_bits);
    }
    stringify() {
        let obj = super.stringify();
        obj.difficulty = this.bits;
        return obj;
    }
}
exports.PowBlockHeader = PowBlockHeader;
//     return BlockHeaderClass as Constructor<T & BlockHeaderClass>;
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9wb3dfY2hhaW4vYmxvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQ0FBNkM7QUFFN0MsOENBQTBDO0FBQzFDLGdEQUF5RDtBQUN6RCx5Q0FBeUM7QUFDekMsaUNBQWlDO0FBQ2pDLHdDQUF3QztBQUV4QyxxQ0FBcUM7QUFFckMsd0dBQXdHO0FBQ3hHLGdHQUFnRztBQUNoRyxvQkFBNEIsU0FBUSw4QkFBZ0I7SUFDaEQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLCtDQUErQztJQUNuRCxDQUFDO0lBTUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFZO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE1BQWM7UUFDcEIsTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsS0FBYTtRQUNwQixNQUFNLENBQUMsS0FBSyxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUMx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