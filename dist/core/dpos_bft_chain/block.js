"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const dpos_chain_1 = require("../dpos_chain");
class DposBftBlockHeader extends dpos_chain_1.DposBlockHeader {
    constructor() {
        super(...arguments);
        // 签名部分不进入hash计算
        this.m_bftSigns = [];
    }
    set bftSigns(signs) {
        this.m_bftSigns = [];
        this.m_bftSigns.push(...signs);
    }
    get bftSigns() {
        return this.m_bftSigns;
    }
    encode(writer) {
        let err = super.encode(writer);
        if (err) {
            return err;
        }
        writer.writeU16(this.m_bftSigns.length);
        for (let s of this.m_bftSigns) {
            writer.writeBytes(s.pubkey);
            writer.writeBytes(s.sign);
            writer.writeHash(s.hash);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        let err = super.decode(reader);
        if (err) {
            return err;
        }
        this.m_bftSigns = [];
        try {
            let n = reader.readU16();
            for (let i = 0; i < n; i++) {
                let pubkey = reader.readBytes(33);
                let sign = reader.readBytes(64);
                let hash = reader.readHash().toString('hex');
                this.m_bftSigns.push({ hash, pubkey, sign });
            }
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.DposBftBlockHeader = DposBftBlockHeader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2JmdF9jaGFpbi9ibG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwQztBQUMxQyw4Q0FBZ0Q7QUFTaEQsd0JBQWdDLFNBQVEsNEJBQWU7SUFBdkQ7O1FBQ0ksZ0JBQWdCO1FBQ04sZUFBVSxHQUFrQyxFQUFFLENBQUM7SUE0QzdELENBQUM7SUExQ0csSUFBSSxRQUFRLENBQUMsS0FBb0M7UUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7UUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQzNCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRU0sTUFBTSxDQUFDLE1BQW9CO1FBQzlCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEdBQUcsQ0FBQztTQUNkO1FBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSTtZQUNBLElBQUksQ0FBQyxHQUFXLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN4QixJQUFJLE1BQU0sR0FBVyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLElBQUksR0FBVyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLElBQUksR0FBVyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUM5QztTQUNKO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLHNCQUFTLENBQUMscUJBQXFCLENBQUM7U0FDMUM7UUFDRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7Q0FDSjtBQTlDRCxnREE4Q0MifQ==