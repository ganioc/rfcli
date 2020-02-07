"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("../chain");
const error_code_1 = require("../error_code");
const bignumber_js_1 = require("bignumber.js");
const chain_2 = require("./chain");
class ValuePendingTransactions extends chain_1.PendingTransactions {
    constructor() {
        super(...arguments);
        this.m_balance = new Map();
    }
    async _onCheck(txTime, txOld) {
        let ret = await super._onCheck(txTime, txOld);
        if (ret) {
            return ret;
        }
        let br = await this.getBalance(txTime.tx.address);
        if (br.err) {
            return br.err;
        }
        let balance = br.value;
        let txValue = txTime.tx;
        let totalUse = txValue.value.plus(txValue.fee);
        if (txOld) {
            let txOldValue = txOld.tx;
            totalUse = totalUse.minus(txOldValue.value).minus(txOldValue.fee);
        }
        if (balance.lt(totalUse)) {
            this.m_logger.error(`addTransaction failed, need total ${totalUse.toString()} but balance ${balance.toString()}`);
            return error_code_1.ErrorCode.RESULT_NOT_ENOUGH;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onAddedTx(txTime, txOld) {
        let br = await this.getBalance(txTime.tx.address);
        if (br.err) {
            return br.err;
        }
        let balance = br.value;
        let txValue = txTime.tx;
        if (txOld) {
            let txOldValue = txOld.tx;
            balance = balance.plus(txOldValue.fee).plus(txOldValue.value).minus(txValue.fee).minus(txValue.value);
        }
        else {
            balance = balance.minus(txValue.fee).minus(txValue.value);
        }
        this.m_balance.set(txTime.tx.address, balance);
        return await super._onAddedTx(txTime);
    }
    async updateTipBlock(header) {
        this.m_balance = new Map();
        return await super.updateTipBlock(header);
    }
    async getStorageBalance(s) {
        try {
            let dbr = await this.m_storageView.getReadableDataBase(chain_1.Chain.dbSystem);
            if (dbr.err) {
                return { err: dbr.err };
            }
            let kvr = await dbr.value.getReadableKeyValue(chain_2.ValueChain.kvBalance);
            if (kvr.err !== error_code_1.ErrorCode.RESULT_OK) {
                return { err: kvr.err };
            }
            let ret = await kvr.kv.get(s);
            if (!ret.err) {
                return ret;
            }
            else if (ret.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                return { err: error_code_1.ErrorCode.RESULT_OK, value: new bignumber_js_1.BigNumber(0) };
            }
            else {
                return { err: ret.err };
            }
        }
        catch (error) {
            this.m_logger.error(`getStorageBalance error=${error}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    // 获取pending中的balance
    async getBalance(s) {
        if (this.m_balance.has(s)) {
            return { err: error_code_1.ErrorCode.RESULT_OK, value: this.m_balance.get(s) };
        }
        return this.getStorageBalance(s);
    }
    async _checkSmallNonceTx(txNew, txOld) {
        if (txNew.fee.gt(txOld.fee)) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        return error_code_1.ErrorCode.RESULT_FEE_TOO_SMALL;
    }
    _addToQueue(txTime, pos) {
        pos = 0;
        for (let i = 0; i < this.m_transactions.length; i++) {
            if (this.m_transactions[i].tx.address === txTime.tx.address) {
                pos = this.m_transactions[i].tx.nonce < txTime.tx.nonce ? i + 1 : i;
            }
            else {
                pos = this.m_transactions[i].tx.fee.lt(txTime.tx.fee) ? i : i + 1;
            }
        }
        this.m_transactions.splice(pos, 0, txTime);
    }
    popTransactionWithFee(maxFee) {
        let txs = [];
        let total = new bignumber_js_1.BigNumber(0);
        for (let pos = 0; pos < this.m_transactions.length; pos++) {
            total = total.plus(this.m_transactions[pos].tx.fee);
            if (total.gt(maxFee)) {
                break;
            }
            txs.push(this.m_transactions[pos].tx);
        }
        return txs;
    }
}
exports.ValuePendingTransactions = ValuePendingTransactions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZhbHVlX2NoYWluL3BlbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxvQ0FBc0Y7QUFDdEYsOENBQTBDO0FBRTFDLCtDQUF1QztBQUN2QyxtQ0FBbUM7QUFHbkMsOEJBQXNDLFNBQVEsMkJBQW1CO0lBQWpFOztRQUNjLGNBQVMsR0FBMkIsSUFBSSxHQUFHLEVBQXFCLENBQUM7SUFrSC9FLENBQUM7SUFoSGEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEyQixFQUFHLEtBQTJCO1FBQzlFLElBQUksR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUMsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBaUIsQ0FBQyxDQUFDO1FBQzVELElBQUksRUFBRSxDQUFDLEdBQUcsRUFBRTtZQUNSLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztTQUNqQjtRQUNELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxLQUFNLENBQUM7UUFDeEIsSUFBSSxPQUFPLEdBQXFCLE1BQU0sQ0FBQyxFQUFzQixDQUFDO1FBQzlELElBQUksUUFBUSxHQUFjLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRCxJQUFJLEtBQUssRUFBRTtZQUNQLElBQUksVUFBVSxHQUFxQixLQUFLLENBQUMsRUFBc0IsQ0FBQztZQUNoRSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyRTtRQUNELElB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