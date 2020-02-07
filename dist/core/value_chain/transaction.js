"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const chain_1 = require("../chain");
const serializable_1 = require("../serializable");
class ValueTransaction extends chain_1.Transaction {
    constructor() {
        super();
        this.m_value = new bignumber_js_1.BigNumber(0);
        this.m_fee = new bignumber_js_1.BigNumber(0);
    }
    get value() {
        return this.m_value;
    }
    set value(value) {
        this.m_value = value;
    }
    get fee() {
        return this.m_fee;
    }
    set fee(value) {
        this.m_fee = value;
    }
    _encodeHashContent(writer) {
        let err = super._encodeHashContent(writer);
        if (err) {
            return err;
        }
        writer.writeBigNumber(this.m_value);
        writer.writeBigNumber(this.m_fee);
        return serializable_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        let err = super._decodeHashContent(reader);
        if (err) {
            return err;
        }
        try {
            this.m_value = reader.readBigNumber();
            this.m_fee = reader.readBigNumber();
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = super.stringify();
        obj.value = this.value.toString();
        obj.fee = this.fee.toString();
        return obj;
    }
}
exports.ValueTransaction = ValueTransaction;
class ValueReceipt extends chain_1.Receipt {
    constructor() {
        super();
        this.m_cost = new bignumber_js_1.BigNumber(0);
    }
    get cost() {
        const b = this.m_cost;
        return b;
    }
    set cost(c) {
        this.m_cost = c;
    }
    encode(writer) {
        const err = super.encode(writer);
        if (err) {
            return err;
        }
        try {
            writer.writeBigNumber(this.m_cost);
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        const err = super.decode(reader);
        if (err) {
            return err;
        }
        try {
            this.m_cost = reader.readBigNumber();
        }
        catch (e) {
            return serializable_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return serializable_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = super.stringify();
        obj.cost = this.m_cost.toString();
        return obj;
    }
}
exports.ValueReceipt = ValueReceipt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS92YWx1ZV9jaGFpbi90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUF5QztBQUN6QyxvQ0FBOEM7QUFDOUMsa0RBQXdFO0FBRXhFLHNCQUE4QixTQUFRLG1CQUFXO0lBQzdDO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksd0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksd0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBS0QsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFnQjtRQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxHQUFHO1FBQ0gsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLEdBQUcsQ0FBQyxLQUFnQjtRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRVMsa0JBQWtCLENBQUMsTUFBb0I7UUFDN0MsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sd0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVTLGtCQUFrQixDQUFDLE1BQW9C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