"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
const libAddress = require("../address");
const context_1 = require("./context");
class DbftBlockHeader extends value_chain_1.BlockWithSign(value_chain_1.ValueBlockHeader) {
    constructor() {
        super(...arguments);
        // 签名部分不进入hash计算
        this.m_dbftSigns = [];
        this.m_view = 0;
    }
    set view(v) {
        this.m_view = v;
    }
    get view() {
        return this.m_view;
    }
    _encodeHashContent(writer) {
        let err = super._encodeHashContent(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeU32(this.m_view);
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        let err = super._decodeHashContent(reader);
        if (err) {
            return err;
        }
        try {
            this.m_view = reader.readU32();
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    encode(writer) {
        let err = super.encode(writer);
        if (err) {
            return err;
        }
        writer.writeU16(this.m_dbftSigns.length);
        for (let s of this.m_dbftSigns) {
            writer.writeBytes(s.pubkey);
            writer.writeBytes(s.sign);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        let err = super.decode(reader);
        if (err) {
            return err;
        }
        try {
            let n = reader.readU16();
            for (let i = 0; i < n; i++) {
                let pubkey = reader.readBytes(33);
                let sign = reader.readBytes(64);
                this.m_dbftSigns.push({ pubkey, sign });
            }
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    setSigns(signs) {
        this.m_dbftSigns = [];
        this.m_dbftSigns.push(...signs);
    }
    verifySign() {
        return this._verifySign();
    }
    async verify(chain) {
        // 从某个设施验证pubkey是否在列表中,是否轮到这个节点出块
        return await this._verifySigns(chain);
    }
    async _verifySigns(chain) {
        let gm = await chain.dbftHeaderStorage.getMiners(this);
        if (gm.err) {
            return { err: gm.err };
        }
        let gdr = await chain.dbftHeaderStorage.getDueMiner(this, gm.miners);
        if (gdr.err) {
            return { err: gdr.err };
        }
        if (this.miner !== gdr.miner) {
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: false };
        }
        let miners = new Set(gm.miners);
        let verified = new Set();
        for (let s of this.m_dbftSigns) {
            let address = libAddress.addressFromPublicKey(s.pubkey);
            if (miners.has(address) && !verified.has(address)) {
                if (libAddress.verify(this.hash, s.sign, s.pubkey)) {
                    verified.add(address);
                }
            }
        }
        const valid = context_1.DbftContext.isAgreeRateReached(chain.globalOptions, miners.size, verified.size);
        return { err: error_code_1.ErrorCode.RESULT_OK, valid };
    }
    stringify() {
        let obj = super.stringify();
        obj.view = this.m_view;
        return obj;
    }
}
exports.DbftBlockHeader = DbftBlockHeader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL2Jsb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsOENBQTBDO0FBRTFDLGdEQUFpRTtBQUNqRSx5Q0FBeUM7QUFJekMsdUNBQXdDO0FBTXhDLHFCQUE2QixTQUFRLDJCQUFhLENBQUMsOEJBQWdCLENBQUM7SUFBcEU7O1FBQ0ksZ0JBQWdCO1FBQ04sZ0JBQVcsR0FBK0IsRUFBRSxDQUFDO1FBQzdDLFdBQU0sR0FBVyxDQUFDLENBQUM7SUFpSGpDLENBQUM7SUEvR0csSUFBSSxJQUFJLENBQUMsQ0FBUztRQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVTLGtCQUFrQixDQUFDLE1BQW9CO1FBQzdDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFDRCxJQUFJO1lBQ0EsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDaEM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sc0JBQVMsQ0FBQyxvQkFBb0IsQ0FBQztTQUN6QztRQUVELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVTLGtCQUFrQixDQUFDLE1BQW9CO1FBQzdDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFDRCxJQUFJO1lBQ0EsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxF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