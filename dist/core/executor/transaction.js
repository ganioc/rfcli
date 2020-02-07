"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const error_code_1 = require("../error_code");
const chain_1 = require("../chain");
const util_1 = require("util");
const client_1 = require("../../client");
const { LogShim } = require('../lib/log_shim');
class BaseExecutor {
    constructor(options) {
        this.m_logs = [];
        this.m_logger = options.logger;
        this.m_eventDefinations = options.eventDefinations;
    }
    async prepareContext(blockHeader, storage, externContext) {
        let database = (await storage.getReadWritableDatabase(chain_1.Chain.dbUser)).value;
        let context = Object.create(externContext);
        // context.getNow = (): number => {
        //     return blockHeader.timestamp;
        // };
        Object.defineProperty(context, 'now', {
            writable: false,
            value: blockHeader.timestamp
        });
        Object.defineProperty(context, 'height', {
            writable: false,
            value: blockHeader.number
        });
        Object.defineProperty(context, 'storage', {
            writable: false,
            value: database
        });
        context.emit = (name, param) => {
            if (this.m_eventDefinations.has(name)) {
                let log = new chain_1.EventLog();
                log.name = name;
                log.param = param;
                this.m_logs.push(log);
            }
            else {
                this.m_logger.error(`undefined event ${name}`);
                assert(false, `undefined event ${name}`);
            }
        };
        return context;
    }
}
class TransactionExecutor extends BaseExecutor {
    constructor(handler, listener, tx, logger) {
        super({
            eventDefinations: handler.getEventDefinations(),
            logger: new LogShim(logger).bind(`[transaction: ${tx.hash}]`, true).log
        });
        this.m_addrIndex = 0;
        this.m_listener = listener;
        this.m_tx = tx;
    }
    async _dealNonce(tx, storage) {
        // 检查nonce
        let kvr = await storage.getKeyValue(chain_1.Chain.dbSystem, chain_1.Chain.kvNonce);
        if (kvr.err !== error_code_1.ErrorCode.RESULT_OK) {
            this.m_logger.error(`methodexecutor, _dealNonce, getReadWritableKeyValue failed`);
            return kvr.err;
        }
        let nonce = -1;
        let nonceInfo = await kvr.kv.get(tx.address);
        if (nonceInfo.err === error_code_1.ErrorCode.RESULT_OK) {
            nonce = nonceInfo.value;
        }
        if (tx.nonce !== nonce + 1) {
            this.m_logger.error(`methodexecutor, _dealNonce, nonce error,nonce should ${nonce + 1}, but ${tx.nonce}, txhash=${tx.hash} address=${tx.address}`);
            return error_code_1.ErrorCode.RESULT_ERROR_NONCE_IN_TX;
        }
        await kvr.kv.set(tx.address, tx.nonce);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async execute(blockHeader, storage, externContext, flag) {
        if (!(flag && flag.ignoreNoce)) {
            let nonceErr = await this._dealNonce(this.m_tx, storage);
            if (nonceErr !== error_code_1.ErrorCode.RESULT_OK) {
                return { err: nonceErr };
            }
        }
        let context = await this.prepareContext(blockHeader, storage, externContext);
        let receipt = new chain_1.Receipt();
        let work = await storage.beginTransaction();
        if (work.err) {
            this.m_logger.error(`methodexecutor, beginTransaction error,storagefile=${storage.filePath}`);
            return { err: work.err };
        }
        receipt.returnCode = await this._execute(context, this.m_tx.input);
        assert(util_1.isNumber(receipt.returnCode), `invalid handler return code ${receipt.returnCode}`);
        if (!util_1.isNumber(receipt.returnCode)) {
            this.m_logger.error(`methodexecutor failed for invalid handler return code type, return=`, receipt.returnCode);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        receipt.setSource({ sourceType: chain_1.ReceiptSourceType.transaction, txHash: this.m_tx.hash });
        if (receipt.returnCode) {
            this.m_logger.warn(`handler return code=${receipt.returnCode}, will rollback storage`);
            await work.value.rollback();
        }
        else {
            this.m_logger.debug(`handler return code ${receipt.returnCode}, will commit storage`);
            let err = await work.value.commit();
            if (err) {
                this.m_logger.error(`methodexecutor, transaction commit error, err=${err}, storagefile=${storage.filePath}`);
                return { err };
            }
            receipt.eventLogs = this.m_logs;
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipt };
    }
    async _execute(env, input) {
        try {
            this.m_logger.info(`will execute tx ${this.m_tx.hash}: ${this.m_tx.method},from ${this.m_tx.address}, params ${JSON.stringify(this.m_tx.input)}`);
            return await this.m_listener(env, this.m_tx.input);
        }
        catch (e) {
            this.m_logger.error(`execute method linstener e=`, e.stack);
            return error_code_1.ErrorCode.RESULT_EXECUTE_ERROR;
        }
    }
    async prepareContext(blockHeader, storage, externContext) {
        let context = await super.prepareContext(blockHeader, storage, externContext);
        // 执行上下文
        Object.defineProperty(context, 'caller', {
            writable: false,
            value: this.m_tx.address
        });
        context.createAddress = () => {
            let buf = Buffer.from(this.m_tx.address + this.m_tx.nonce + this.m_addrIndex);
            this.m_addrIndex++;
            return client_1.addressFromPublicKey(buf);
        };
        return context;
    }
}
exports.TransactionExecutor = TransactionExecutor;
class EventExecutor extends BaseExecutor {
    constructor(handler, listener, logger) {
        super({
            eventDefinations: handler.getEventDefinations(),
            logger
        });
        this.m_bBeforeBlockExec = true;
        this.m_listener = listener;
    }
    async execute(blockHeader, storage, externalContext) {
        this.m_logger.debug(`execute event on ${blockHeader.number}`);
        let context = await this.prepareContext(blockHeader, storage, externalContext);
        let work = await storage.beginTransaction();
        if (work.err) {
            this.m_logger.error(`eventexecutor, beginTransaction error,storagefile=${storage.filePath}`);
            return { err: work.err };
        }
        let receipt = new chain_1.Receipt();
        let returnCode;
        try {
            returnCode = await this.m_listener(context);
        }
        catch (e) {
            this.m_logger.error(`execute event linstener error, e=`, e);
            returnCode = error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        assert(util_1.isNumber(returnCode), `event handler return code invalid ${returnCode}`);
        if (!util_1.isNumber(returnCode)) {
            this.m_logger.error(`execute event failed for invalid return code`);
            returnCode = error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        receipt.returnCode = returnCode;
        if (receipt.returnCode === error_code_1.ErrorCode.RESULT_OK) {
            this.m_logger.debug(`event handler commit storage`);
            let err = await work.value.commit();
            if (err) {
                this.m_logger.error(`eventexecutor, transaction commit error,storagefile=${storage.filePath}`);
                return { err };
            }
        }
        else {
            this.m_logger.debug(`event handler return code ${returnCode} rollback storage`);
            await work.value.rollback();
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipt };
    }
}
exports.EventExecutor = EventExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9leGVjdXRvci90cmFuc2FjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw4Q0FBd0M7QUFDeEMsb0NBQXdHO0FBSXhHLCtCQUFnQztBQUNoQyx5Q0FBb0Q7QUFDcEQsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBTTdDO0lBSUksWUFBWSxPQUEwRTtRQUY1RSxXQUFNLEdBQWUsRUFBRSxDQUFDO1FBRzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDO0lBQ3ZELENBQUM7SUFDUyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQXdCLEVBQUUsT0FBZ0IsRUFBRSxhQUFrQjtRQUN6RixJQUFJLFFBQVEsR0FBSSxDQUFDLE1BQU0sT0FBTyxDQUFDLHVCQUF1QixDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQU0sQ0FBQztRQUM3RSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTNDLG1DQUFtQztRQUNuQyxvQ0FBb0M7UUFDcEMsS0FBSztRQUVMLE1BQU0sQ0FBQyxjQUFjLENBQ2pCLE9BQU8sRUFBRSxLQUFLLEVBQUU7WUFDWixRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxXQUFXLENBQUMsU0FBUztTQUMvQixDQUNKLENBQUM7UUFFRixNQUFNLENBQUMsY0FBYyxDQUNqQixPQUFPLEVBQUUsUUFBUSxFQUFFO1lBQ2YsUUFBUSxFQUFFLEtBQUs7WUFDZixLQUFLLEVBQUUsV0FBVyxDQUFDLE1BQU07U0FDNUIsQ0FD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