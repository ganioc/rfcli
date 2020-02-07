"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const error_code_1 = require("../error_code");
const assert = require('assert');
const address_1 = require("../address");
const chain_1 = require("../chain");
const block_1 = require("./block");
const transaction_1 = require("./transaction");
const executor_1 = require("./executor");
const ValueContext = require("./context");
const pending_1 = require("./pending");
class ValueChain extends chain_1.Chain {
    constructor(options) {
        super(options);
    }
    async _newBlockExecutor(block, storage, externParams) {
        let kvBalance = (await storage.getKeyValue(chain_1.Chain.dbSystem, ValueChain.kvBalance)).kv;
        let ve = new ValueContext.Context(kvBalance);
        let externContext = Object.create(null);
        externContext.getBalance = (address) => {
            return ve.getBalance(address);
        };
        externContext.transferTo = async (address, amount) => {
            return await ve.transferTo(ValueChain.sysAddress, address, amount);
        };
        let executor = new executor_1.ValueBlockExecutor({
            logger: this.logger,
            block,
            storage,
            handler: this.m_handler,
            externContext,
            globalOptions: this.m_globalOptions,
            externParams
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, executor };
    }
    async newViewExecutor(header, storage, method, param) {
        let dbSystem = (await storage.getReadableDataBase(chain_1.Chain.dbSystem)).value;
        let kvBalance = (await dbSystem.getReadableKeyValue(ValueChain.kvBalance)).kv;
        let ve = new ValueContext.ViewContext(kvBalance);
        let externContext = Object.create(null);
        externContext.getBalance = (address) => {
            return ve.getBalance(address);
        };
        let executor = new chain_1.ViewExecutor({ logger: this.logger, header, storage, method, param, handler: this.m_handler, externContext });
        return { err: error_code_1.ErrorCode.RESULT_OK, executor };
    }
    _getBlockHeaderType() {
        return block_1.ValueBlockHeader;
    }
    _getTransactionType() {
        return transaction_1.ValueTransaction;
    }
    _getReceiptType() {
        return transaction_1.ValueReceipt;
    }
    _createPending() {
        return new pending_1.ValuePendingTransactions({
            storageManager: this.m_storageManager,
            logger: this.logger,
            overtime: this.m_instanceOptions.pendingOvertime,
            handler: this.m_handler,
            maxCount: this.m_instanceOptions.maxPendingCount,
            warnCount: this.m_instanceOptions.warnPendingCount
        });
    }
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let err = await super.onCreateGenesisBlock(block, storage, genesisOptions);
        if (err) {
            return err;
        }
        let dbr = await storage.getReadWritableDatabase(chain_1.Chain.dbSystem);
        if (dbr.err) {
            assert(false, `value chain create genesis failed for no system database`);
            return dbr.err;
        }
        const dbSystem = dbr.value;
        let gkvr = await dbSystem.getReadWritableKeyValue(chain_1.Chain.kvConfig);
        if (gkvr.err) {
            return gkvr.err;
        }
        let rpr = await gkvr.kv.rpush('features', 'value');
        if (rpr.err) {
            return rpr.err;
        }
        if (!genesisOptions || !address_1.isValidAddress(genesisOptions.coinbase)) {
            this.m_logger.error(`create genesis failed for genesisOptioins should has valid coinbase`);
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        block.header.coinbase = genesisOptions.coinbase;
        let kvr = await dbSystem.createKeyValue(ValueChain.kvBalance);
        // 在这里给用户加钱
        if (genesisOptions && genesisOptions.preBalances) {
            // 这里要给几个账户放钱
            let kvBalance = kvr.kv;
            for (let index = 0; index < genesisOptions.preBalances.length; index++) {
                // 按照address和amount预先初始化钱数
                await kvBalance.set(genesisOptions.preBalances[index].address, new bignumber_js_1.BigNumber(genesisOptions.preBalances[index].amount));
            }
        }
        return kvr.err;
    }
}
// 存储每个address的money，其中有一个默认的系统账户
ValueChain.kvBalance = 'balance'; // address<--->blance
ValueChain.sysAddress = '0';
exports.ValueChain = ValueChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS92YWx1ZV9jaGFpbi9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUF5QztBQUN6Qyw4Q0FBMEM7QUFDMUMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLHdDQUEwQztBQUcxQyxvQ0FBNE87QUFDNU8sbUNBQTBDO0FBQzFDLCtDQUErRDtBQUMvRCx5Q0FBK0M7QUFDL0MsMENBQTBDO0FBQzFDLHVDQUFtRDtBQXNCbkQsZ0JBQXdCLFNBQVEsYUFBSztJQUNqQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRVMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEtBQVksRUFBRSxPQUFnQixFQUFFLFlBQXdDO1FBQ3RHLElBQUksU0FBUyxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsV0FBVyxDQUFDLGFBQUssQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDO1FBQ3RGLElBQUksRUFBRSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM3QyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxPQUFlLEVBQXNCLEVBQUU7WUFDL0QsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztRQUNGLGFBQWEsQ0FBQyxVQUFVLEdBQUcsS0FBSyxFQUFFLE9BQWUsRUFBRSxNQUFpQixFQUFzQixFQUFFO1lBQ3hGLE9BQU8sTUFBTSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxD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