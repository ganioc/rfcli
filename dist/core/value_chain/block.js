"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("../chain");
const error_code_1 = require("../error_code");
class ValueBlockHeader extends chain_1.BlockHeader {
    constructor() {
        super();
        this.m_coinbase = '';
    }
    get coinbase() {
        return this.m_coinbase;
    }
    set coinbase(coinbase) {
        this.m_coinbase = coinbase;
    }
    _encodeHashContent(writer) {
        let err = super._encodeHashContent(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeVarString(this.m_coinbase);
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
            this.m_coinbase = reader.readVarString('utf-8');
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = super.stringify();
        obj.coinbase = this.coinbase;
        return obj;
    }
}
exports.ValueBlockHeader = ValueBlockHeader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS92YWx1ZV9jaGFpbi9ibG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUF1QztBQUd2Qyw4Q0FBMEM7QUFFMUMsc0JBQThCLFNBQVEsbUJBQVc7SUFDN0M7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFJRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQWdCO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0lBQy9CLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxNQUFvQjtRQUM3QyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0MsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEdBQUcsQ0FBQztTQUNkO1FBQ0QsSUFBSTtZQUNBLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzFDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLHNCQUFTLENBQUMscUJBQXFCLENBQUM7U0FDMUM7UUFFRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxNQUFvQjtRQUM3QyxJQUFJLEdBQUcsR0FBYyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsSUFBSSxHQUFHLEtBQUssc0JBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDN0IsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELElBQUk7WUFDQSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sc0JBQVMsQ0FBQyxxQkFBcUIsQ0FBQztTQUMxQztRQUNELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVNLFNBQVM7UUFDWixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBaERELDRDQWdEQyJ9