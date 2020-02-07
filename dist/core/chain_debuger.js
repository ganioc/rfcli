"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const error_code_1 = require("./error_code");
const bignumber_js_1 = require("bignumber.js");
const tmp_manager_1 = require("./lib/tmp_manager");
const storage_1 = require("./storage_json/storage");
const storage_2 = require("./storage_sqlite/storage");
const value_chain_1 = require("./value_chain");
const address_1 = require("./address");
const storage_3 = require("./storage");
const util_1 = require("util");
class ValueChainDebugSession {
    constructor(debuger) {
        this.debuger = debuger;
    }
    async init(options) {
        const chain = this.debuger.chain;
        const dumpSnapshotManager = new storage_3.StorageDumpSnapshotManager({
            logger: chain.logger,
            path: options.storageDir
        });
        this.m_dumpSnapshotManager = dumpSnapshotManager;
        const snapshotManager = new storage_3.StorageLogSnapshotManager({
            path: chain.storageManager.path,
            headerStorage: chain.headerStorage,
            storageType: storage_1.JsonStorage,
            logger: chain.logger,
            dumpSnapshotManager
        });
        const tmpManager = new tmp_manager_1.TmpManager({
            root: options.storageDir,
            logger: chain.logger
        });
        let err = tmpManager.init({ clean: true });
        if (err) {
            chain.logger.error(`ValueChainDebugSession init tmpManager init failed `, error_code_1.stringifyErrorCode(err));
            return err;
        }
        const storageManager = new storage_3.StorageManager({
            tmpManager,
            path: options.storageDir,
            storageType: storage_1.JsonStorage,
            logger: chain.logger,
            snapshotManager
        });
        this.m_storageManager = storageManager;
        err = await this.m_storageManager.init();
        if (err) {
            chain.logger.error(`ValueChainDebugSession init storageManager init failed `, error_code_1.stringifyErrorCode(err));
            return err;
        }
        const ghr = await chain.headerStorage.getHeader(0);
        if (ghr.err) {
            chain.logger.error(`ValueChainDebugSession init get genesis header failed `, error_code_1.stringifyErrorCode(ghr.err));
            return ghr.err;
        }
        const genesisHash = ghr.header.hash;
        const gsr = await this.m_dumpSnapshotManager.getSnapshot(genesisHash);
        if (!gsr.err) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        else if (gsr.err !== error_code_1.ErrorCode.RESULT_NOT_FOUND) {
            chain.logger.error(`ValueChainDebugSession init get gensis dump snapshot err `, error_code_1.stringifyErrorCode(gsr.err));
            return gsr.err;
        }
        const gsvr = await chain.storageManager.getSnapshotView(genesisHash);
        if (gsvr.err) {
            chain.logger.error(`ValueChainDebugSession init get gensis dump snapshot err `, error_code_1.stringifyErrorCode(gsvr.err));
            return gsvr.err;
        }
        const srcStorage = gsvr.storage;
        let csr = await storageManager.createStorage('genesis');
        if (csr.err) {
            chain.logger.error(`ValueChainDebugSession init create genesis memory storage failed `, error_code_1.stringifyErrorCode(csr.err));
            return csr.err;
        }
        const dstStorage = csr.storage;
        const tjsr = await srcStorage.toJsonStorage(dstStorage);
        if (tjsr.err) {
            chain.logger.error(`ValueChainDebugSession init transfer genesis memory storage failed `, error_code_1.stringifyErrorCode(tjsr.err));
            return tjsr.err;
        }
        csr = await this.m_storageManager.createSnapshot(dstStorage, genesisHash, true);
        if (csr.err) {
            chain.logger.error(`ValueChainDebugSession init create genesis memory dump failed `, error_code_1.stringifyErrorCode(csr.err));
            return csr.err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async block(hash) {
        const chain = this.debuger.chain;
        const block = chain.blockStorage.get(hash);
        if (!block) {
            chain.logger.error(`block ${hash} not found`);
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        const csr = await this.m_storageManager.createStorage(hash, block.header.preBlockHash);
        if (csr.err) {
            chain.logger.error(`block ${hash} create pre block storage failed `, error_code_1.stringifyErrorCode(csr.err));
        }
        const { err } = await this.debuger.debugBlock(csr.storage, block);
        csr.storage.remove();
        return { err };
    }
    async transaction(hash) {
        const chain = this.debuger.chain;
        const gtrr = await chain.getTransactionReceipt(hash);
        if (gtrr.err) {
            chain.logger.error(`transaction ${hash} get receipt failed `, error_code_1.stringifyErrorCode(gtrr.err));
            return { err: gtrr.err };
        }
        return this.block(gtrr.block.hash);
    }
    async view(from, method, params) {
        const chain = this.debuger.chain;
        let hr = await chain.headerStorage.getHeader(from);
        if (hr.err !== error_code_1.ErrorCode.RESULT_OK) {
            chain.logger.error(`view ${method} failed for load header ${from} failed for ${hr.err}`);
            return { err: hr.err };
        }
        let header = hr.header;
        let svr = await this.m_storageManager.getSnapshotView(header.hash);
        if (svr.err !== error_code_1.ErrorCode.RESULT_OK) {
            chain.logger.error(`view ${method} failed for get snapshot ${header.hash} failed for ${svr.err}`);
            return { err: svr.err };
        }
        const ret = await this.debuger.debugView(svr.storage, header, method, params);
        this.m_storageManager.releaseSnapshotView(header.hash);
        return ret;
    }
}
exports.ValueChainDebugSession = ValueChainDebugSession;
class ValueIndependDebugSession {
    constructor(debuger) {
        this.debuger = debuger;
        this.m_fakeNonces = new Map();
    }
    async init(options) {
        const storageOptions = Object.create(null);
        storageOptions.memory = options.memoryStorage;
        if (!(util_1.isNullOrUndefined(options.memoryStorage) || options.memoryStorage)) {
            const storageDir = options.storageDir;
            fs.ensureDirSync(storageDir);
            const storagePath = path.join(storageDir, `${Date.now()}`);
            storageOptions.path = storagePath;
        }
        const csr = await this.debuger.createStorage(storageOptions);
        if (csr.err) {
            return { err: csr.err };
        }
        this.m_storage = csr.storage;
        this.m_storage.createLogger();
        if (util_1.isArray(options.accounts)) {
            this.m_accounts = options.accounts.map((x) => Buffer.from(x));
        }
        else {
            this.m_accounts = [];
            for (let i = 0; i < options.accounts; ++i) {
                this.m_accounts.push(address_1.createKeyPair()[1]);
            }
        }
        this.m_interval = options.interval;
        const chain = this.debuger.chain;
        let gh = chain.newBlockHeader();
        gh.timestamp = Date.now() / 1000;
        let block = chain.newBlock(gh);
        let genesissOptions = {};
        genesissOptions.candidates = [];
        genesissOptions.miners = [];
        genesissOptions.coinbase = address_1.addressFromSecretKey(this.m_accounts[options.coinbase]);
        if (options.preBalance) {
            genesissOptions.preBalances = [];
            this.m_accounts.forEach((value) => {
                genesissOptions.preBalances.push({ address: address_1.addressFromSecretKey(value), amount: options.preBalance });
            });
        }
        const err = await chain.onCreateGenesisBlock(block, csr.storage, genesissOptions);
        if (err) {
            chain.logger.error(`onCreateGenesisBlock failed for `, error_code_1.stringifyErrorCode(err));
            return { err };
        }
        block.header.updateHash();
        const dber = await this.debuger.debugBlockEvent(this.m_storage, block.header, { preBlock: true });
        if (dber.err) {
            return { err };
        }
        this.m_curBlock = {
            header: block.header,
            transactions: [],
            receipts: []
        };
        this.m_curBlock.receipts.push(...dber.receipts);
        if (options.height > 0) {
            return await this.updateHeightTo(options.height, options.coinbase);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    get curHeader() {
        return this.m_curBlock.header;
    }
    get storage() {
        return this.m_storage;
    }
    async updateHeightTo(height, coinbase) {
        if (height <= this.m_curBlock.header.number) {
            this.debuger.chain.logger.error(`updateHeightTo ${height} failed for current height ${this.m_curBlock.header.number} is larger`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        const offset = height - this.m_curBlock.header.number;
        let blocks = [];
        for (let i = 0; i < offset; ++i) {
            const nhr = await this._nextHeight(coinbase, []);
            if (nhr.err) {
                return { err: nhr.err };
            }
            blocks.push(nhr.block);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, blocks };
    }
    nextHeight(coinbase, transactions) {
        return this._nextHeight(coinbase, transactions);
    }
    async _nextHeight(coinbase, transactions) {
        let curHeader = this.m_curBlock.header;
        for (let tx of transactions) {
            const dtr = await this.debuger.debugTransaction(this.m_storage, curHeader, tx);
            if (dtr.err) {
                return { err: dtr.err };
            }
            this.m_curBlock.transactions.push(tx);
            this.m_curBlock.receipts.push(dtr.receipt);
        }
        let dber = await this.debuger.debugBlockEvent(this.m_storage, curHeader, { postBlock: true });
        if (dber.err) {
            return { err: dber.err };
        }
        this.m_curBlock.receipts.push(...dber.receipts);
        let block = this.debuger.chain.newBlock(this.m_curBlock.header);
        for (const tx of this.m_curBlock.transactions) {
            block.content.addTransaction(tx);
        }
        block.content.setReceipts(this.m_curBlock.receipts);
        block.header.updateHash();
        let header = this.debuger.chain.newBlockHeader();
        header.timestamp = curHeader.timestamp + this.m_interval;
        header.coinbase = address_1.addressFromSecretKey(this.m_accounts[coinbase]);
        header.setPreBlock(block.header);
        this.m_curBlock = {
            header: header,
            transactions: [],
            receipts: []
        };
        dber = await this.debuger.debugBlockEvent(this.m_storage, curHeader, { preBlock: true });
        if (dber.err) {
            return { err: dber.err };
        }
        this.m_curBlock.receipts.push(...dber.receipts);
        return { err: error_code_1.ErrorCode.RESULT_OK, block };
    }
    createTransaction(options) {
        const tx = new value_chain_1.ValueTransaction();
        tx.fee = new bignumber_js_1.BigNumber(0);
        tx.value = new bignumber_js_1.BigNumber(options.value);
        tx.method = options.method;
        tx.input = options.input;
        tx.fee = options.fee;
        let pk;
        if (Buffer.isBuffer(options.caller)) {
            pk = options.caller;
        }
        else {
            pk = this.m_accounts[options.caller];
        }
        tx.nonce = util_1.isNullOrUndefined(options.nonce) ? 0 : options.nonce;
        tx.sign(pk);
        return tx;
    }
    async transaction(options) {
        let pk;
        if (Buffer.isBuffer(options.caller)) {
            pk = options.caller;
        }
        else {
            pk = this.m_accounts[options.caller];
        }
        let addr = address_1.addressFromSecretKey(pk);
        const nonce = this.m_fakeNonces.has(addr) ? this.m_fakeNonces.get(addr) : 0;
        this.m_fakeNonces.set(addr, nonce + 1);
        const txop = Object.create(options);
        txop.nonce = nonce;
        const tx = this.createTransaction(txop);
        const dtr = await this.debuger.debugTransaction(this.m_storage, this.m_curBlock.header, tx);
        if (dtr.err) {
            return { err: dtr.err };
        }
        this.m_curBlock.transactions.push(tx);
        this.m_curBlock.receipts.push(dtr.receipt);
        return dtr;
    }
    wage() {
        return this.debuger.debugMinerWageEvent(this.m_storage, this.m_curBlock.header);
    }
    view(options) {
        return this.debuger.debugView(this.m_storage, this.m_curBlock.header, options.method, options.params);
    }
    getAccount(index) {
        return address_1.addressFromSecretKey(this.m_accounts[index]);
    }
}
exports.ValueIndependDebugSession = ValueIndependDebugSession;
class ChainDebuger {
    constructor(chain, logger) {
        this.chain = chain;
        this.logger = logger;
    }
    async createStorage(options) {
        const inMemory = (util_1.isNullOrUndefined(options.memory) || options.memory);
        let storage;
        if (inMemory) {
            storage = new storage_1.JsonStorage({
                filePath: '',
                logger: this.logger
            });
        }
        else {
            storage = new storage_2.SqliteStorage({
                filePath: options.path,
                logger: this.logger
            });
        }
        const err = await storage.init();
        if (err) {
            this.chain.logger.error(`init storage failed `, error_code_1.stringifyErrorCode(err));
            return { err };
        }
        storage.createLogger();
        return { err: error_code_1.ErrorCode.RESULT_OK, storage };
    }
    async debugTransaction(storage, header, tx) {
        const block = this.chain.newBlock(header);
        const nber = await this.chain.newBlockExecutor({ block, storage });
        if (nber.err) {
            return { err: nber.err };
        }
        const etr = await nber.executor.executeTransaction(tx, { ignoreNoce: true });
        if (etr.err) {
            return { err: etr.err };
        }
        await nber.executor.finalize();
        return { err: error_code_1.ErrorCode.RESULT_OK, receipt: etr.receipt };
    }
    async debugBlockEvent(storage, header, options) {
        const block = this.chain.newBlock(header);
        const nber = await this.chain.newBlockExecutor({ block, storage });
        if (nber.err) {
            return { err: nber.err };
        }
        let result;
        do {
            if (options.listener) {
                const ebr = await nber.executor.executeBlockEvent(options.listener);
                if (ebr.err) {
                    result = { err: ebr.err };
                    break;
                }
                else {
                    result = { err: error_code_1.ErrorCode.RESULT_OK, receipts: [ebr.receipt] };
                    break;
                }
            }
            else {
                let receipts = [];
                if (options.preBlock) {
                    const ebr = await nber.executor.executePreBlockEvent();
                    if (ebr.err) {
                        result = { err: ebr.err };
                        break;
                    }
                    receipts.push(...ebr.receipts);
                }
                if (options.postBlock) {
                    const ebr = await nber.executor.executePostBlockEvent();
                    if (ebr.err) {
                        result = { err: ebr.err };
                        break;
                    }
                    receipts.push(...ebr.receipts);
                }
                result = { err: error_code_1.ErrorCode.RESULT_OK, receipts };
            }
        } while (false);
        await nber.executor.finalize();
        return result;
    }
    async debugView(storage, header, method, params) {
        const nver = await this.chain.newViewExecutor(header, storage, method, params);
        if (nver.err) {
            return { err: nver.err };
        }
        return nver.executor.execute();
    }
    async debugBlock(storage, block) {
        const nber = await this.chain.newBlockExecutor({ block, storage });
        if (nber.err) {
            return { err: nber.err };
        }
        const err = await nber.executor.execute();
        await nber.executor.finalize();
        return { err };
    }
}
class ValueChainDebuger extends ChainDebuger {
    async debugMinerWageEvent(storage, header) {
        const block = this.chain.newBlock(header);
        const nber = await this.chain.newBlockExecutor({ block, storage });
        if (nber.err) {
            return { err: nber.err };
        }
        const err = await nber.executor.executeMinerWageEvent();
        await nber.executor.finalize();
        return { err };
    }
    createIndependSession() {
        return new ValueIndependDebugSession(this);
    }
    async createChainSession(storageDir) {
        let err = await this.chain.initComponents();
        if (err) {
            return { err };
        }
        const session = new ValueChainDebugSession(this);
        err = await session.init({ storageDir });
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, session };
    }
}
exports.ValueChainDebuger = ValueChainDebuger;
async function createValueDebuger(chainCreator, dataDir) {
    const ccir = await chainCreator.createChainInstance(dataDir, { readonly: true, initComponents: false });
    if (ccir.err) {
        chainCreator.logger.error(`create chain instance from ${dataDir} failed `, error_code_1.stringifyErrorCode(ccir.err));
        return { err: ccir.err };
    }
    return { err: error_code_1.ErrorCode.RESULT_OK, debuger: new ValueChainDebuger(ccir.chain, chainCreator.logger) };
}
exports.createValueDebuger = createValueDebuger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fZGVidWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2NoYWluX2RlYnVnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBQzdCLDZDQUEyRDtBQUMzRCwrQ0FBdUM7QUFDdkMsbURBQStDO0FBRS9DLG9EQUFtRDtBQUNuRCxzREFBdUQ7QUFHdkQsK0NBQWlIO0FBQ2pILHVDQUE4RDtBQUM5RCx1Q0FBeUc7QUFDekcsK0JBQWtEO0FBRWxEO0lBQ0ksWUFBNkIsT0FBMEI7UUFBMUIsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7SUFFdkQsQ0FBQztJQUdELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBNkI7UUFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDakMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLG9DQUEwQixDQUFDO1lBQ3ZELE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVU7U0FDM0IsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLHFCQUFxQixHQUFHLG1CQUFtQixDQUFDO1FBQ2pELE1BQU0sZUFBZSxHQUFHLElBQUksbUNBQXlCLENBQUM7WUFDbEQsSUFBSSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSTtZQUMvQixhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWE7WUFDbEMsV0FBVyxFQUFFLHFCQUFXO1lBQ3hCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixtQkFBbUI7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxVQUFVLEdBQUcsSUFBSSx3QkFBVSxDQUFDO1lBQzlCLElBQUksRUFBRSxPQUFPLENBQUMsVUFBVTtZQUN4QixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxHQUFHLEdBQUcsVUFBVSxD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