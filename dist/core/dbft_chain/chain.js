"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const util_1 = require("util");
const value_chain_1 = require("../value_chain");
const block_1 = require("./block");
const context_1 = require("./context");
const executor_1 = require("./executor");
const ValueContext = require("../value_chain/context");
const header_storage_1 = require("./header_storage");
class DbftChain extends value_chain_1.ValueChain {
    constructor(options) {
        super(options);
    }
    // 都不需要验证内容
    get _ignoreVerify() {
        return true;
    }
    // 不会分叉
    async _onMorkSnapshot(options) {
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    async _newBlockExecutor(block, storage, externParams) {
        let kvBalance = (await storage.getKeyValue(value_chain_1.Chain.dbSystem, value_chain_1.ValueChain.kvBalance)).kv;
        let ve = new ValueContext.Context(kvBalance);
        let externalContext = Object.create(null);
        externalContext.getBalance = async (address) => {
            return await ve.getBalance(address);
        };
        externalContext.transferTo = async (address, amount) => {
            return await ve.transferTo(value_chain_1.ValueChain.sysAddress, address, amount);
        };
        let context = new context_1.DbftContext(storage, this.globalOptions, this.logger);
        externalContext.register = async (caller, address) => {
            return await context.registerToCandidate(caller, block.number, address);
        };
        externalContext.unregister = async (caller, address) => {
            return await context.unRegisterFromCandidate(caller, address);
        };
        externalContext.getMiners = async () => {
            let gm = await context.getMiners();
            if (gm.err) {
                throw Error('newBlockExecutor getMiners failed errcode ${gm.err}');
            }
            return gm.miners;
        };
        externalContext.isMiner = async (address) => {
            let im = await context.isMiner(address);
            if (im.err) {
                throw Error('newBlockExecutor isMiner failed errcode ${gm.err}');
            }
            return im.isminer;
        };
        let executor = new executor_1.DbftBlockExecutor({
            logger: this.logger,
            block,
            storage,
            handler: this.m_handler,
            externContext: externalContext,
            globalOptions: this.m_globalOptions,
            externParams
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, executor: executor };
    }
    async newViewExecutor(header, storage, method, param) {
        let nvex = await super.newViewExecutor(header, storage, method, param);
        let externalContext = nvex.executor.externContext;
        let dbftProxy = new context_1.DbftContext(storage, this.m_globalOptions, this.logger);
        externalContext.getMiners = async () => {
            let gm = await dbftProxy.getMiners();
            if (gm.err) {
                throw Error('newBlockExecutor getMiners failed errcode ${gm.err}');
            }
            return gm.miners;
        };
        externalContext.isMiner = async (address) => {
            let im = await dbftProxy.isMiner(address);
            if (im.err) {
                throw Error('newBlockExecutor isMiner failed errcode ${gm.err}');
            }
            return im.isminer;
        };
        return nvex;
    }
    async initComponents(options) {
        let err = await super.initComponents(options);
        if (err) {
            return err;
        }
        this.m_dbftHeaderStorage = new header_storage_1.DbftHeaderStorage({
            db: this.m_db,
            headerStorage: this.m_headerStorage,
            globalOptions: this.globalOptions,
            logger: this.logger,
            readonly: this.m_readonly
        });
        err = await this.m_dbftHeaderStorage.init();
        if (err) {
            this.logger.error(`dbft header storage init err `, err);
        }
        return err;
    }
    async uninitComponents() {
        if (this.m_dbftHeaderStorage) {
            this.m_dbftHeaderStorage.uninit();
            delete this.m_dbftHeaderStorage;
        }
        await super.uninitComponents();
    }
    _getBlockHeaderType() {
        return block_1.DbftBlockHeader;
    }
    async _onVerifiedBlock(block) {
        return await this.m_dbftHeaderStorage.addHeader(block.header, this.m_storageManager);
    }
    _onCheckGlobalOptions(globalOptions) {
        if (!super._onCheckGlobalOptions(globalOptions)) {
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.minValidator)) {
            this.m_logger.error(`globalOptions should has minValidator`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.maxValidator)) {
            this.m_logger.error(`globalOptions should has maxValidator`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.reSelectionBlocks)) {
            this.m_logger.error(`globalOptions should has reSelectionBlocks`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.blockInterval)) {
            this.m_logger.error(`globalOptions should has blockInterval`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.minWaitBlocksToMiner)) {
            this.m_logger.error(`globalOptions should has minWaitBlocksToMiner`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.superAdmin)) {
            this.m_logger.error(`globalOptions should has superAdmin`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.agreeRateNumerator)) {
            this.m_logger.error(`globalOptions should has agreeRateNumerator`);
            return false;
        }
        if (util_1.isNullOrUndefined(globalOptions.agreeRateDenominator)) {
            this.m_logger.error(`globalOptions should has agreeRateDenominator`);
            return false;
        }
        return true;
    }
    _onCheckTypeOptions(typeOptions) {
        return typeOptions.consensus === 'dbft';
    }
    get dbftHeaderStorage() {
        return this.m_dbftHeaderStorage;
    }
    async _calcuteReqLimit(fromHeader, limit) {
        let hr = await this.getHeader(fromHeader);
        let reSelectionBlocks = this.globalOptions.reSelectionBlocks;
        return reSelectionBlocks - (hr.header.number % reSelectionBlocks);
    }
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let err = await super.onCreateGenesisBlock(block, storage, genesisOptions);
        if (err) {
            return err;
        }
        let gkvr = await storage.getKeyValue(value_chain_1.Chain.dbSystem, value_chain_1.Chain.kvConfig);
        if (gkvr.err) {
            return gkvr.err;
        }
        let rpr = await gkvr.kv.set('consensus', 'dbft');
        if (rpr.err) {
            return rpr.err;
        }
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            return dbr.err;
        }
        // storage的键值对要在初始化的时候就建立好
        let kvr = await dbr.value.createKeyValue(context_1.DbftContext.kvDBFT);
        if (kvr.err) {
            return kvr.err;
        }
        let denv = new context_1.DbftContext(storage, this.globalOptions, this.m_logger);
        let ir = await denv.init(genesisOptions.miners);
        if (ir.err) {
            return ir.err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    getLastIrreversibleBlockNumber() {
        return this.m_tip.number;
    }
}
exports.DbftChain = DbftChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL2NoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTBDO0FBQzFDLCtCQUF5QztBQUN6QyxnREFBK1I7QUFDL1IsbUNBQTBDO0FBQzFDLHVDQUF3QztBQUN4Qyx5Q0FBK0M7QUFDL0MsdURBQXVEO0FBQ3ZELHFEQUFxRDtBQW9CckQsZUFBdUIsU0FBUSx3QkFBVTtJQUdyQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsV0FBVztJQUNYLElBQWMsYUFBYTtRQUN2QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsT0FBTztJQUNHLEtBQUssQ0FBQyxlQUFlLENBQUMsT0FBa0Q7UUFDOUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFUyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBWSxFQUFFLE9BQWdCLEVBQUUsWUFBd0M7UUFDdEcsSUFBSSxTQUFTLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxXQUFXLENBQUMsbUJBQUssQ0FBQyxRQUFRLEVBQUUsd0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQztRQUV0RixJQUFJLEVBQUUsR0FBRyxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxlQUFlLENBQUMsVUFBVSxHQUFHLEtBQUssRUFBRSxPQUFlLEVBQXNCLEVBQUU7WUFDdkUsT0FBTyxNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDO1FBQ0YsZUFBZSxDQUFDLFVBQVUsR0FBRyxL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