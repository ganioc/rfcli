"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const error_code_1 = require("../error_code");
const address_1 = require("../address");
const chain_1 = require("../chain");
const context_1 = require("./context");
const transaction_1 = require("./transaction");
const chain_2 = require("./chain");
const util_1 = require("util");
const assert = require('assert');
class ValueBlockExecutor extends chain_1.BlockExecutor {
    _newTransactionExecutor(l, tx) {
        return new ValueTransactionExecutor(this.m_handler, l, tx, this.m_logger);
    }
    async executeMinerWageEvent() {
        let l = this.m_handler.getMinerWageListener();
        let wage = await l(this.m_block.number);
        let kvBalance = (await this.m_storage.getKeyValue(chain_1.Chain.dbSystem, chain_2.ValueChain.kvBalance)).kv;
        let ve = new context_1.Context(kvBalance);
        let coinbase = this.m_block.header.coinbase;
        assert(address_1.isValidAddress(coinbase), `block ${this.m_block.hash} has no coinbase set`);
        if (!address_1.isValidAddress(coinbase)) {
            coinbase = chain_2.ValueChain.sysAddress;
        }
        return await ve.issue(coinbase, wage);
    }
    async executePreBlockEvent() {
        const err = await this.executeMinerWageEvent();
        if (err) {
            return { err };
        }
        return await super.executePreBlockEvent();
    }
}
exports.ValueBlockExecutor = ValueBlockExecutor;
class ValueTransactionExecutor extends chain_1.TransactionExecutor {
    constructor(handler, listener, tx, logger) {
        super(handler, listener, tx, logger);
        this.m_totalCost = new bignumber_js_1.BigNumber(0);
    }
    async prepareContext(blockHeader, storage, externContext) {
        let context = await super.prepareContext(blockHeader, storage, externContext);
        Object.defineProperty(context, 'value', {
            writable: false,
            value: this.m_tx.value
        });
        Object.defineProperty(context, 'fee', {
            writable: false,
            value: this.m_tx.fee
        });
        context.cost = (fee) => {
            let totalCost = this.m_totalCost;
            totalCost = totalCost.plus(fee);
            if (totalCost.gt(this.m_tx.fee)) {
                this.m_totalCost = this.m_tx.fee;
                return error_code_1.ErrorCode.RESULT_TX_FEE_NOT_ENOUGH;
            }
            else {
                this.m_totalCost = totalCost;
                return error_code_1.ErrorCode.RESULT_OK;
            }
        };
        return context;
    }
    async execute(blockHeader, storage, externContext, flag) {
        if (!(flag && flag.ignoreNoce)) {
            let nonceErr = await this._dealNonce(this.m_tx, storage);
            if (nonceErr !== error_code_1.ErrorCode.RESULT_OK) {
                return { err: nonceErr };
            }
        }
        let kvBalance = (await storage.getKeyValue(chain_1.Chain.dbSystem, chain_2.ValueChain.kvBalance)).kv;
        let fromAddress = this.m_tx.address;
        let nFee = this.m_tx.fee;
        let nToValue = this.m_tx.value.plus(nFee);
        let receipt = new transaction_1.ValueReceipt();
        receipt.setSource({ sourceType: chain_1.ReceiptSourceType.transaction, txHash: this.m_tx.hash });
        let ve = new context_1.Context(kvBalance);
        if ((await ve.getBalance(fromAddress)).lt(nToValue)) {
            this.m_logger.error(`methodexecutor failed for value not enough need ${nToValue.toString()} but ${(await ve.getBalance(fromAddress)).toString()} address=${this.m_tx.address}, hash=${this.m_tx.hash}`);
            receipt.returnCode = error_code_1.ErrorCode.RESULT_NOT_ENOUGH;
            return { err: error_code_1.ErrorCode.RESULT_OK, receipt };
        }
        let context = await this.prepareContext(blockHeader, storage, externContext);
        let work = await storage.beginTransaction();
        if (work.err) {
            this.m_logger.error(`methodexecutor failed for beginTransaction failed,address=${this.m_tx.address}, hash=${this.m_tx.hash}`);
            return { err: work.err };
        }
        let err = await ve.transferTo(fromAddress, chain_2.ValueChain.sysAddress, this.m_tx.value);
        if (err) {
            this.m_logger.error(`methodexecutor failed for transferTo sysAddress failed,address=${this.m_tx.address}, hash=${this.m_tx.hash}`);
            await work.value.rollback();
            return { err };
        }
        receipt.returnCode = await this._execute(context, this.m_tx.input);
        receipt.cost = this.m_totalCost;
        assert(util_1.isNumber(receipt.returnCode), `invalid handler return code ${receipt.returnCode}`);
        if (!util_1.isNumber(receipt.returnCode)) {
            this.m_logger.error(`methodexecutor failed for invalid handler return code type, return=${receipt.returnCode},address=${this.m_tx.address}, hash=${this.m_tx.hash}`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (receipt.returnCode) {
            await work.value.rollback();
        }
        else {
            receipt.eventLogs = this.m_logs;
            err = await work.value.commit();
        }
        let coinbase = blockHeader.coinbase;
        assert(address_1.isValidAddress(coinbase), `block ${blockHeader.hash} has no coinbase set`);
        if (!address_1.isValidAddress(coinbase)) {
            coinbase = chain_2.ValueChain.sysAddress;
        }
        err = await ve.transferTo(fromAddress, coinbase, receipt.cost);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipt };
    }
}
exports.ValueTransactionExecutor = ValueTransactionExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS92YWx1ZV9jaGFpbi9leGVjdXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUF1QztBQUN2Qyw4Q0FBd0M7QUFDeEMsd0NBQTBDO0FBRTFDLG9DQUFnTjtBQUNoTix1Q0FBa0M7QUFFbEMsK0NBQTZEO0FBRTdELG1DQUFtQztBQUVuQywrQkFBZ0M7QUFFaEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLHdCQUFnQyxTQUFRLHFCQUFhO0lBQ3ZDLHVCQUF1QixDQUFDLENBQWEsRUFBRSxFQUFvQjtRQUNqRSxPQUFPLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLFNBQXlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUYsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUI7UUFDdkIsSUFBSSxDQUFDLEdBQUksSUFBSSxDQUFDLFNBQTBCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoRSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksU0FBUyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxhQUFLLENBQUMsUUFBUSxFQUFFLGtCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUM7UUFDN0YsSUFBSSxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hDLElBQUksUUFBUSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBMkIsQ0FBQyxRQUFRLENBQUM7UUFDbEUsTUFBTSxDQUFDLHdCQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsU0FBUyxJQUFJLENBQUMsT0FBTyxDQUFDLElB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