"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const error_code_1 = require("../error_code");
const chain_1 = require("../chain");
const transaction_1 = require("./transaction");
class BlockExecutor {
    constructor(options) {
        this.m_storage = options.storage;
        this.m_handler = options.handler;
        this.m_block = options.block;
        this.m_externContext = options.externContext;
        this.m_logger = options.logger;
        this.m_externParams = options.externParams.slice(0);
        Object.defineProperty(this.m_externContext, 'logger', {
            writable: false,
            value: this.m_logger
        });
        this.m_globalOptions = options.globalOptions;
    }
    finalize() {
        for (const ep of this.m_externParams) {
            ep.finalize();
        }
    }
    get externContext() {
        return this.m_externContext;
    }
    _newTransactionExecutor(l, tx) {
        return new transaction_1.TransactionExecutor(this.m_handler, l, tx, this.m_logger);
    }
    _newEventExecutor(l) {
        return new transaction_1.EventExecutor(this.m_handler, l, this.m_logger);
    }
    async execute() {
        let t1 = Date.now();
        let ret = await this._execute(this.m_block);
        let t2 = Date.now();
        this.m_logger.info(`runblock time====${t2 - t1}, count=${this.m_block.content.transactions.length}`);
        return ret;
    }
    async verify() {
        let oldBlock = this.m_block;
        this.m_block = this.m_block.clone();
        let err = await this.execute();
        if (err) {
            if (err === error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR) {
                return { err: error_code_1.ErrorCode.RESULT_OK, valid: error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR };
            }
            else {
                return { err };
            }
        }
        if (this.m_block.hash !== oldBlock.hash) {
            this.m_logger.error(`block ${oldBlock.number} hash mismatch!! 
            except storage hash ${oldBlock.header.storageHash}, actual ${this.m_block.header.storageHash}
            except hash ${oldBlock.hash}, actual ${this.m_block.hash}
            `);
        }
        if (this.m_block.hash === oldBlock.hash) {
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: error_code_1.ErrorCode.RESULT_OK };
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: error_code_1.ErrorCode.RESULT_VERIFY_NOT_MATCH };
        }
    }
    async _execute(block) {
        this.m_logger.info(`begin execute block ${block.number}`);
        let receipts = [];
        let ebr = await this.executePreBlockEvent();
        if (ebr.err) {
            this.m_logger.error(`blockexecutor execute begin_event failed,errcode=${ebr.err},blockhash=${block.hash}`);
            return ebr.err;
        }
        receipts.push(...ebr.receipts);
        ebr = await this._executeTransactions();
        if (ebr.err) {
            this.m_logger.error(`blockexecutor execute method failed,errcode=${ebr.err},blockhash=${block.hash}`);
            return ebr.err;
        }
        receipts.push(...ebr.receipts);
        ebr = await this.executePostBlockEvent();
        if (ebr.err) {
            this.m_logger.error(`blockexecutor execute end_event failed,errcode=${ebr.err},blockhash=${block.hash}`);
            return ebr.err;
        }
        receipts.push(...ebr.receipts);
        // 票据
        block.content.setReceipts(receipts);
        // 更新块信息
        return await this._updateBlock(block);
    }
    async executeBlockEvent(listener) {
        let exec = this._newEventExecutor(listener);
        let ret = await exec.execute(this.m_block.header, this.m_storage, this.m_externContext);
        if (ret.err) {
            this.m_logger.error(`block event execute failed`);
        }
        return ret;
    }
    async executePreBlockEvent() {
        if (this.m_block.number === 0) {
            // call initialize
            if (this.m_handler.genesisListener) {
                const eber = await this.executeBlockEvent(this.m_handler.genesisListener);
                if (eber.err || eber.receipt.returnCode) {
                    this.m_logger.error(`handler's genesisListener execute failed`);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
            }
        }
        let receipts = [];
        let listeners = await this.m_handler.getPreBlockListeners(this.m_block.number);
        for (const l of listeners) {
            const eber = await this.executeBlockEvent(l.listener);
            if (eber.err) {
                return { err: eber.err };
            }
            eber.receipt.setSource({ sourceType: chain_1.ReceiptSourceType.preBlockEvent, eventIndex: l.index });
            receipts.push(eber.receipt);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipts };
    }
    async executePostBlockEvent() {
        let receipts = [];
        let listeners = await this.m_handler.getPostBlockListeners(this.m_block.number);
        for (const l of listeners) {
            const eber = await this.executeBlockEvent(l.listener);
            if (eber.err) {
                return { err: eber.err };
            }
            eber.receipt.setSource({ sourceType: chain_1.ReceiptSourceType.postBlockEvent, eventIndex: l.index });
            receipts.push(eber.receipt);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipts };
    }
    async _executeTransactions() {
        let receipts = [];
        // 执行tx
        for (let tx of this.m_block.content.transactions) {
            const ret = await this.executeTransaction(tx);
            if (ret.err) {
                return { err: ret.err };
            }
            receipts.push(ret.receipt);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, receipts };
    }
    async executeTransaction(tx, flag) {
        const checker = this.m_handler.getTxPendingChecker(tx.method);
        if (!checker || checker(tx)) {
            this.m_logger.error(`verfiy block failed for tx ${tx.hash} ${tx.method} checker failed`);
            return { err: error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR };
        }
        let listener = this.m_handler.getTxListener(tx.method);
        assert(listener, `no listener for ${tx.method}`);
        if (!listener) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT };
        }
        let exec = this._newTransactionExecutor(listener, tx);
        let ret = await exec.execute(this.m_block.header, this.m_storage, this.m_externContext, flag);
        return ret;
    }
    async _updateBlock(block) {
        // 写回数据库签名
        const mdr = await this.m_storage.messageDigest();
        if (mdr.err) {
            return mdr.err;
        }
        block.header.storageHash = mdr.value;
        block.header.updateContent(block.content);
        block.header.updateHash();
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.BlockExecutor = BlockExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9leGVjdXRvci9ibG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFrQztBQUVsQyw4Q0FBd0M7QUFDeEMsb0NBQWlGO0FBRWpGLCtDQUF5RjtBQWV6RjtJQVNJLFlBQVksT0FBNkI7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxjQUFjLENBQ2pCLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFO1lBQzVCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3ZCLENBQ0osQ0FBQztRQUNGLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUNqRCxDQUFDO0lBRU0sUUFBUTtRQUNYLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNsQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDakI7SUFDTCxDQUFDO0lBRUQsSUFBVyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRVMsdUJBQXVCLENBQUMsQ0FBYSxFQUFFLEVBQWU7UUFDNUQsT0FBTyxJQUFJLGlDQUFtQixDQUFDLElBQUks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