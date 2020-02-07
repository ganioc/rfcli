"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const events_1 = require("events");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const fs = require("fs-extra");
const util_1 = require("util");
const error_code_1 = require("../error_code");
const logger_util_1 = require("../lib/logger_util");
const tmp_manager_1 = require("../lib/tmp_manager");
const serializable_1 = require("../serializable");
const block_1 = require("../block");
const storage_1 = require("../storage");
const storage_2 = require("../storage_sqlite/storage");
const executor_1 = require("../executor");
const pending_1 = require("./pending");
const chain_node_1 = require("./chain_node");
const executor_routine_1 = require("./executor_routine");
var ChainState;
(function (ChainState) {
    ChainState[ChainState["none"] = 0] = "none";
    ChainState[ChainState["init"] = 1] = "init";
    ChainState[ChainState["syncing"] = 2] = "syncing";
    ChainState[ChainState["synced"] = 3] = "synced";
})(ChainState || (ChainState = {}));
class Chain extends events_1.EventEmitter {
    /**
     * @param options.dataDir
     * @param options.blockHeaderType
     * @param options.node
     */
    constructor(options) {
        super();
        this.m_state = ChainState.none;
        this.m_constSnapshots = [];
        this.m_pendingHeaders = new Array();
        this.m_pendingBlocks = {
            hashes: new Set(),
            sequence: new Array()
        };
        this.m_refSnapshots = new Set();
        this.m_storageMorkRequests = {};
        this.m_connSyncMap = new Map();
        this.m_logger = logger_util_1.initLogger(options);
        this.m_dataDir = options.dataDir;
        this.m_handler = options.handler;
        this.m_globalOptions = Object.create(null);
        Object.assign(this.m_globalOptions, options.globalOptions);
        this.m_tmpManager = new tmp_manager_1.TmpManager({ root: this.m_dataDir, logger: this.logger });
        this.m_networkCreator = options.networkCreator;
        this.m_executorParamCreator = new executor_1.BlockExecutorExternParamCreator({ logger: this.m_logger });
    }
    static dataDirValid(dataDir) {
        if (!fs.pathExistsSync(dataDir)) {
            return false;
        }
        if (!fs.pathExistsSync(path.join(dataDir, Chain.s_dbFile))) {
            return false;
        }
        return true;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    prependListener(event, listener) {
        return super.prependListener(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    prependOnceListener(event, listener) {
        return super.prependOnceListener(event, listener);
    }
    // broadcast数目，广播header时会同时广播tip到这个深度的header
    get _broadcastDepth() {
        return this.m_instanceOptions.confirmDepth;
    }
    get _confirmDepth() {
        return this.m_instanceOptions.confirmDepth;
    }
    get _headerReqLimit() {
        return this.m_instanceOptions.headerReqLimit;
    }
    get _initializePeerCount() {
        return this.m_instanceOptions.initializePeerCount;
    }
    get _ignoreVerify() {
        return this.m_instanceOptions.ignoreVerify;
    }
    get _saveMismatch() {
        return this.m_logger.level === 'debug';
    }
    get globalOptions() {
        const c = this.m_globalOptions;
        return c;
    }
    get logger() {
        return this.m_logger;
    }
    get pending() {
        return this.m_pending;
    }
    get storageManager() {
        return this.m_storageManager;
    }
    get blockStorage() {
        return this.m_blockStorage;
    }
    get dataDir() {
        return this.m_dataDir;
    }
    get node() {
        return this.m_node;
    }
    get handler() {
        return this.m_handler;
    }
    get headerStorage() {
        return this.m_headerStorage;
    }
    get routineManager() {
        return this.m_routineManager;
    }
    get tmpManager() {
        return this.m_tmpManager;
    }
    get executorParamCreator() {
        return this.m_executorParamCreator;
    }
    async _loadGenesis() {
        let genesis = await this.m_headerStorage.getHeader(0);
        if (genesis.err) {
            return genesis.err;
        }
        let gsv = await this.m_storageManager.getSnapshotView(genesis.header.hash);
        if (gsv.err) {
            this.m_logger.error(`chain initialize failed for load genesis snapshot failed ${gsv.err}`);
            return gsv.err;
        }
        this.m_constSnapshots.push(genesis.header.hash);
        let dbr = await gsv.storage.getReadableDataBase(Chain.dbSystem);
        if (dbr.err) {
            this.m_logger.error(`chain initialize failed for load system database failed ${dbr.err}`);
            return dbr.err;
        }
        let kvr = await dbr.value.getReadableKeyValue(Chain.kvConfig);
        if (kvr.err) {
            this.m_logger.error(`chain initialize failed for load global config failed ${kvr.err}`);
            return kvr.err;
        }
        let typeOptions = Object.create(null);
        let kvgr = await kvr.kv.get('consensus');
        if (kvgr.err) {
            this.m_logger.error(`chain initialize failed for load global config consensus failed ${kvgr.err}`);
            return kvgr.err;
        }
        typeOptions.consensus = kvgr.value;
        kvgr = await kvr.kv.lrange('features', 1, -1);
        if (kvgr.err === error_code_1.ErrorCode.RESULT_OK) {
            typeOptions.features = kvgr.value;
        }
        else if (kvgr.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
            typeOptions.features = [];
        }
        else {
            this.m_logger.error(`chain initialize failed for load global config features failed ${kvgr.err}`);
            return kvgr.err;
        }
        if (!this._onCheckTypeOptions(typeOptions)) {
            this.m_logger.error(`chain initialize failed for check type options failed`);
            return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
        }
        kvgr = await kvr.kv.hgetall('global');
        if (kvgr.err) {
            this.m_logger.error(`chain initialize failed for load global config global failed ${kvgr.err}`);
            return kvgr.err;
        }
        // 将hgetall返回的数组转换成对象
        if (Array.isArray(kvgr.value)) {
            kvgr.value = kvgr.value.reduce((obj, item) => {
                const { key, value } = item;
                obj[key] = value;
                return obj;
            }, {});
        }
        // TODO: compare with globalOptions
        return error_code_1.ErrorCode.RESULT_OK;
    }
    newNetwork(options) {
        let parsed = Object.create(this._defaultNetworkOptions());
        parsed.dataDir = this.m_dataDir;
        parsed.headerStorage = this.headerStorage;
        parsed.blockHeaderType = this._getBlockHeaderType();
        parsed.transactionType = this._getTransactionType();
        parsed.receiptType = this._getReceiptType();
        parsed.node = options.node;
        parsed.logger = this.m_logger;
        if (options.netType) {
            parsed.nettype = options.netType;
        }
        const cr = this.m_networkCreator.create({ parsed, origin: new Map() });
        if (cr.err) {
            return { err: cr.err };
        }
        cr.network.setInstanceOptions(options);
        return cr;
    }
    async initComponents(options) {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state >= ChainState.init) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        if (!await this._onCheckGlobalOptions(this.m_globalOptions)) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        const readonly = options && options.readonly;
        this.m_readonly = readonly;
        let err;
        err = this.m_tmpManager.init({ clean: !this.m_readonly });
        if (err) {
            this.m_logger.error(`chain init faield for tmp manager init failed `, err);
            return err;
        }
        this.m_blockStorage = new block_1.BlockStorage({
            logger: this.m_logger,
            path: this.m_dataDir,
            blockHeaderType: this._getBlockHeaderType(),
            transactionType: this._getTransactionType(),
            receiptType: this._getReceiptType(),
            readonly
        });
        await this.m_blockStorage.init();
        let sqliteOptions = {};
        if (!readonly) {
            sqliteOptions.mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
        }
        else {
            sqliteOptions.mode = sqlite3.OPEN_READONLY;
        }
        try {
            this.m_db = await sqlite.open(this.m_dataDir + '/' + Chain.s_dbFile, sqliteOptions);
        }
        catch (e) {
            this.m_logger.error(`open database failed`, e);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        this.m_headerStorage = new block_1.HeaderStorage({
            logger: this.m_logger,
            blockHeaderType: this._getBlockHeaderType(),
            db: this.m_db,
            blockStorage: this.m_blockStorage,
            readonly
        });
        err = await this.m_headerStorage.init();
        if (err) {
            this.m_logger.error(`chain init faield for header storage init failed `, err);
            return err;
        }
        this.m_storageManager = new storage_1.StorageManager({
            path: path.join(this.m_dataDir, 'storage'),
            tmpManager: this.m_tmpManager,
            storageType: storage_2.SqliteStorage,
            logger: this.m_logger,
            headerStorage: this.m_headerStorage,
            readonly
        });
        err = await this.m_storageManager.init();
        if (err) {
            return err;
        }
        this.m_state = ChainState.init;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async uninitComponents() {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state !== ChainState.init) {
            return;
        }
        this.m_storageManager.uninit();
        delete this.m_storageManager;
        this.m_headerStorage.uninit();
        delete this.m_headerStorage;
        await this.m_db.close();
        delete this.m_db;
        this.m_blockStorage.uninit();
        delete this.m_blockStorage;
        delete this.m_handler;
        delete this.m_dataDir;
        this.m_state = ChainState.none;
    }
    _onCheckTypeOptions(typeOptions) {
        return true;
    }
    _onCheckGlobalOptions(globalOptions) {
        return true;
    }
    parseInstanceOptions(options) {
        let value = Object.create(null);
        value.routineManagerType = options.parsed.routineManagerType;
        value.saveMismatch = options.origin.get('saveMismatch');
        const ops = [];
        if (options.origin.get('net')) {
            ops.push({
                parsed: this._defaultNetworkOptions(),
                origin: options.origin
            });
        }
        else if (options.origin.get('netConfig')) {
            let _path = options.origin.get('netConfig');
            if (!path.isAbsolute(_path)) {
                _path = path.join(process.cwd(), _path);
            }
            let netConfig;
            try {
                netConfig = fs.readJsonSync(_path);
            }
            catch (e) {
                this.m_logger.error(`read net config ${_path} failed `, e);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            if (!util_1.isArray(netConfig) || !netConfig[0] || !util_1.isObject(netConfig[0])) {
                this.m_logger.error(`read net config ${_path} must contain array of config `);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            ops.push({
                parsed: this._defaultNetworkOptions(),
                origin: serializable_1.MapFromObject(netConfig[0])
            });
            for (let c of netConfig.slice(1)) {
                ops.push({
                    parsed: {},
                    origin: serializable_1.MapFromObject(c)
                });
            }
        }
        else {
            this.m_logger.error(`config should has net or netConfig`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        value.networks = [];
        for (let o of ops) {
            const pnr = this._parseNetwork(o);
            if (pnr.err) {
                return { err: pnr.err };
            }
            value.networks.push(pnr.network);
        }
        value.pendingOvertime = options.origin.get('pendingOvertime');
        value.maxPendingCount = options.origin.get('maxPendingCount');
        value.warnPendingCount = options.origin.get('warnPendingCount');
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    async initialize(instanceOptions) {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state !== ChainState.init) {
            this.m_logger.error(`chain initialize failed for hasn't initComponent`);
            return error_code_1.ErrorCode.RESULT_INVALID_STATE;
        }
        let err = await this._loadGenesis();
        if (err) {
            this.m_logger.error(`chain initialize failed for load genesis ${err}`);
            return err;
        }
        this.m_state = ChainState.syncing;
        let _instanceOptions = Object.create(null);
        Object.assign(_instanceOptions, instanceOptions);
        // 初始化时，要同步的peer数目，与这个数目的peer完成同步之后，才开始接收tx，挖矿等等
        _instanceOptions.initializePeerCount = !util_1.isNullOrUndefined(instanceOptions.initializePeerCount) ? instanceOptions.initializePeerCount : 1;
        // 初始化时，一次请求的最大header数目
        _instanceOptions.headerReqLimit = !util_1.isNullOrUndefined(instanceOptions.headerReqLimit) ? instanceOptions.headerReqLimit : 2000;
        // confirm数目，当块的depth超过这个值时，认为时绝对安全的；分叉超过这个depth的两个fork，无法自动合并回去
        _instanceOptions.confirmDepth = !util_1.isNullOrUndefined(instanceOptions.confirmDepth) ? instanceOptions.confirmDepth : 6;
        _instanceOptions.ignoreVerify = !util_1.isNullOrUndefined(instanceOptions.ignoreVerify) ? instanceOptions.ignoreVerify : false;
        _instanceOptions.pendingOvertime = !util_1.isNullOrUndefined(instanceOptions.pendingOvertime) ? instanceOptions.pendingOvertime : 60 * 60;
        _instanceOptions.maxPendingCount = !util_1.isNullOrUndefined(instanceOptions.maxPendingCount) ? instanceOptions.maxPendingCount : 10000;
        _instanceOptions.warnPendingCount = !util_1.isNullOrUndefined(instanceOptions.warnPendingCount) ? instanceOptions.warnPendingCount : 5000;
        this.m_instanceOptions = _instanceOptions;
        this.m_pending = this._createPending();
        this.m_pending.on('txAdded', (tx) => {
            this.logger.debug(`broadcast transaction txhash=${tx.hash}, nonce=${tx.nonce}, address=${tx.address}`);
            this.m_node.broadcast([tx]);
        });
        this.m_pending.init();
        this.m_routineManager = new instanceOptions.routineManagerType(this);
        let node = new chain_node_1.ChainNode({
            networks: _instanceOptions.networks,
            logger: this.m_logger,
            blockStorage: this.m_blockStorage,
            storageManager: this.m_storageManager,
            blockWithLog: !!this._ignoreVerify
        });
        this.m_node = node;
        this.m_node.on('blocks', (params) => {
            this._addPendingBlocks(params);
        });
        this.m_node.on('headers', (params) => {
            this._addPendingHeaders(params);
        });
        this.m_node.on('transactions', async (conn, transactions) => {
            for (let tx of transactions) {
                const _err = await this._addTransaction(tx);
                if (_err === error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR) {
                    this._banConnection(conn.fullRemote, block_1.BAN_LEVEL.forever);
                    break;
                }
            }
        });
        this.m_node.on('ban', (remote) => {
            this._onConnectionError(remote);
        });
        this.m_node.on('error', (remote) => {
            this._onConnectionError(remote);
        });
        err = await this._loadChain();
        if (err) {
            this.m_logger.error(`chain initialize failed for load chain ${err}`);
            return err;
        }
        // init chainnode in _initialBlockDownload
        err = await this._initialBlockDownload();
        if (err) {
            this.m_logger.error(`chain initialize failed for initial block download ${err}`);
            return err;
        }
        err = await new Promise(async (resolve) => {
            this.prependOnceListener('tipBlock', () => {
                this.m_logger.info(`chain initialized success, tip number: ${this.m_tip.number} hash: ${this.m_tip.hash}`);
                resolve(error_code_1.ErrorCode.RESULT_OK);
            });
        });
        if (err) {
            this.m_logger.error(`chain initialize failed for first tip ${err}`);
            return err;
        }
        // 初始化完成之后开始监听，这样初始化中的节点不会被作为初始化的sync 节点
        err = await this.m_node.listen();
        if (err) {
            this.m_logger.error(`chain initialize failed for listen ${err}`);
            return err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async uninitialize() {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state <= ChainState.init) {
            return;
        }
        await this.m_node.uninit();
        delete this.m_node;
        this.m_pending.uninit();
        delete this.m_pending;
        delete this.m_instanceOptions;
        for (let s of this.m_constSnapshots) {
            this.m_storageManager.releaseSnapshotView(s);
        }
        this.m_state = ChainState.init;
    }
    _createPending() {
        return new pending_1.PendingTransactions({
            storageManager: this.m_storageManager,
            logger: this.logger,
            overtime: this.m_instanceOptions.pendingOvertime,
            handler: this.m_handler,
            maxCount: this.m_instanceOptions.maxPendingCount,
            warnCount: this.m_instanceOptions.warnPendingCount
        });
    }
    _defaultNetworkOptions() {
        return { netType: 'random' };
    }
    _parseNetwork(options) {
        let parsed = Object.create(options.parsed);
        parsed.dataDir = this.m_dataDir;
        parsed.headerStorage = this.headerStorage;
        parsed.blockHeaderType = this._getBlockHeaderType();
        parsed.transactionType = this._getTransactionType();
        parsed.receiptType = this._getReceiptType();
        parsed.logger = this.m_logger;
        const ncr = this.m_networkCreator.create({ parsed, origin: options.origin });
        if (ncr.err) {
            return { err: ncr.err };
        }
        const por = ncr.network.parseInstanceOptions(options);
        if (por.err) {
            return { err: por.err };
        }
        ncr.network.setInstanceOptions(por.value);
        return { err: error_code_1.ErrorCode.RESULT_OK, network: ncr.network };
    }
    async _loadChain() {
        assert(this.m_headerStorage);
        assert(this.m_blockStorage);
        let result = await this.m_headerStorage.getHeader('latest');
        let err = result.err;
        if (err || !result.header) {
            return err;
        }
        err = await this._updateTip(result.header);
        if (err) {
            return err;
        }
        this.m_logger.info(`load chain tip from disk, height:${this.m_tip.number}, hash:${this.m_tip.hash}`);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _morkSnapshot(hashes) {
        this.m_logger.debug(`request to mork storage `, hashes);
        if (this.m_storageMorkRequests.morking) {
            if (this.m_storageMorkRequests.pending) {
                this.m_logger.debug(`ignore pending mork storage request`, this.m_storageMorkRequests.pending);
            }
            this.m_storageMorkRequests.pending = new Set(hashes.values());
            return;
        }
        this.m_storageMorkRequests.morking = new Set(hashes.values());
        const doMork = async () => {
            const morking = this.m_storageMorkRequests.morking;
            this.m_logger.debug(`begin to mork storage `, morking);
            let toMork = [];
            for (const blockHash of morking) {
                if (!this.m_refSnapshots.has(blockHash)) {
                    toMork.push(blockHash);
                }
            }
            let toRelease = [];
            for (const blockHash of this.m_refSnapshots) {
                if (!morking.has(blockHash)) {
                    toRelease.push(blockHash);
                }
            }
            let morked = [];
            for (const blockHash of toMork) {
                this.logger.debug(`=============_updateTip get 2, hash=${blockHash}`);
                const gsv = await this.m_storageManager.getSnapshotView(blockHash);
                this.logger.debug(`=============_updateTip get 2 1,hash=${blockHash}`);
                if (gsv.err) {
                    this.m_logger.error(`mork ${blockHash}'s storage failed`);
                    continue;
                }
                morked.push(blockHash);
            }
            this.m_logger.debug(`morking release snapshots `, toRelease);
            for (const hash of toRelease) {
                this.m_storageManager.releaseSnapshotView(hash);
                this.m_refSnapshots.delete(hash);
            }
            this.m_logger.debug(`morking add ref snapshots `, morked);
            for (const hash of morked) {
                this.m_refSnapshots.add(hash);
            }
            this.m_logger.debug(`recyclde snapshots`);
            this.m_storageManager.recycleSnapshot();
        };
        while (this.m_storageMorkRequests.morking) {
            await doMork();
            delete this.m_storageMorkRequests.morking;
            this.m_storageMorkRequests.morking = this.m_storageMorkRequests.pending;
        }
    }
    async _updateTip(tip) {
        this.m_tip = tip;
        let toMork = new Set([tip.hash]);
        const msr = await this._onMorkSnapshot({ tip, toMork });
        if (msr.err) {
            this.m_logger.error(`on mork snapshot failed for ${error_code_1.stringifyErrorCode(msr.err)}`);
        }
        this._morkSnapshot(toMork);
        let err = await this.m_pending.updateTipBlock(tip);
        if (err) {
            return err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onMorkSnapshot(options) {
        let mork = options.tip.number - 2 * this._confirmDepth;
        mork = mork >= 0 ? mork : 0;
        if (mork !== options.tip.number) {
            let hr = await this.m_headerStorage.getHeader(mork);
            if (hr.err) {
                this.m_logger.error(`get header ${mork} failed ${hr.err}`);
                return { err: error_code_1.ErrorCode.RESULT_FAILED };
            }
            options.toMork.add(hr.header.hash);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    get tipBlockHeader() {
        return this.m_tip;
    }
    getBlock(hash) {
        return this.m_blockStorage.get(hash);
    }
    async _addTransaction(tx) {
        if (this.m_state !== ChainState.synced) {
            return error_code_1.ErrorCode.RESULT_INVALID_STATE;
        }
        let err = await this.m_pending.addTransaction(tx);
        return err;
    }
    async _compareWork(comparedHeader, bestChainTip) {
        // TODO: pow 用height并不安全， 因为大bits高height的工作量可能低于小bits低height 的工作量
        return { err: error_code_1.ErrorCode.RESULT_OK, result: comparedHeader.number - bestChainTip.number };
    }
    async _addPendingHeaders(params) {
        // TODO: 这里可以和pending block一样优化，去重已经有的
        this.m_pendingHeaders.push(params);
        if (this.m_pendingHeaders.length === 1) {
            while (this.m_pendingHeaders.length) {
                let _params = this.m_pendingHeaders[0];
                await this._addHeaders(_params);
                this.m_pendingHeaders.shift();
            }
        }
    }
    async _addPendingBlocks(params, head = false) {
        let pendingBlocks = this.m_pendingBlocks;
        if (pendingBlocks.hashes.has(params.block.hash)) {
            return;
        }
        if (head) {
            pendingBlocks.sequence.unshift(params);
        }
        else {
            pendingBlocks.sequence.push(params);
        }
        pendingBlocks.hashes.add(params.block.hash);
        if (!pendingBlocks.adding) {
            while (pendingBlocks.sequence.length) {
                pendingBlocks.adding = pendingBlocks.sequence.shift();
                let { block, from, storage, redoLog } = pendingBlocks.adding;
                await this._addBlock(block, { remote: from, storage, redoLog });
                pendingBlocks.hashes.delete(block.hash);
                delete pendingBlocks.adding;
            }
        }
    }
    _onConnectionError(remote) {
        this.m_connSyncMap.delete(remote);
        let hi = 1;
        while (true) {
            if (hi >= this.m_pendingHeaders.length) {
                break;
            }
            const ph = this.m_pendingHeaders[hi];
            if (ph.from === remote) {
                this.m_pendingHeaders.splice(hi, 1);
            }
            else {
                ++hi;
            }
        }
        let bi = 1;
        let pendingBlocks = this.m_pendingBlocks;
        while (true) {
            if (bi >= pendingBlocks.sequence.length) {
                break;
            }
            let params = pendingBlocks.sequence[bi];
            if (params.from === remote) {
                pendingBlocks.sequence.splice(bi, 1);
                pendingBlocks.hashes.delete(params.block.hash);
            }
            else {
                ++bi;
            }
        }
    }
    _banConnection(remote, level) {
        let connSync;
        if (typeof remote === 'string') {
            connSync = this.m_connSyncMap.get(remote);
            if (!connSync) {
                return error_code_1.ErrorCode.RESULT_NOT_FOUND;
            }
            this.m_node.banConnection(remote, level);
        }
        else {
            connSync = remote;
            this.m_node.banConnection(connSync.conn.fullRemote, level);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _continueSyncWithConnection(connSync) {
        if (connSync.moreHeaders) {
            connSync.lastRequestHeader = connSync.lastRecvHeader.hash;
            let limit = await this._calcuteReqLimit(connSync.lastRequestHeader, this._headerReqLimit);
            connSync.reqLimit = limit;
            this.m_node.requestHeaders(connSync.conn, { from: connSync.lastRecvHeader.hash, limit });
        }
        else {
            connSync.state = ChainState.synced;
            delete connSync.moreHeaders;
            if (this.m_state === ChainState.syncing) {
                let syncedCount = 0;
                let out = this.m_node.getOutbounds();
                for (let conn of out) {
                    let _connSync = this.m_connSyncMap.get(conn.fullRemote);
                    if (_connSync && _connSync.state === ChainState.synced) {
                        ++syncedCount;
                    }
                }
                if (syncedCount >= this._initializePeerCount) {
                    this.m_state = ChainState.synced;
                    this.logger.debug(`emit tipBlock with ${this.m_tip.hash} ${this.m_tip.number}`);
                    this.emit('tipBlock', this, this.m_tip);
                }
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _createSyncedConnection(from) {
        let conn = this.m_node.getConnection(from);
        if (!conn) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        let connSync = { state: ChainState.synced, conn, reqLimit: this._headerReqLimit };
        this.m_connSyncMap.set(from, connSync);
        return { err: error_code_1.ErrorCode.RESULT_OK, connSync };
    }
    async _beginSyncWithConnection(from, fromHeader) {
        let connSync;
        if (from.connSync) {
            connSync = from.connSync;
        }
        else {
            const conn = from.conn;
            connSync = this.m_connSyncMap.get(conn.fullRemote);
            if (!connSync) {
                connSync = { state: ChainState.syncing, conn, reqLimit: this._headerReqLimit };
                this.m_connSyncMap.set(conn.fullRemote, connSync);
            }
        }
        connSync.state = ChainState.syncing;
        connSync.lastRequestHeader = fromHeader;
        let limit = await this._calcuteReqLimit(fromHeader, this._headerReqLimit);
        connSync.reqLimit = limit;
        this.m_node.requestHeaders(connSync.conn, { from: fromHeader, limit });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _calcuteReqLimit(fromHeader, limit) {
        return limit;
    }
    async _verifyAndSaveHeaders(headers) {
        assert(this.m_headerStorage);
        let hr = await this.m_headerStorage.getHeader(headers[0].preBlockHash);
        if (hr.err) {
            return { err: hr.err };
        }
        let toSave = [];
        let toRequest = [];
        for (let ix = 0; ix < headers.length; ++ix) {
            let header = headers[ix];
            let result = await this.m_headerStorage.getHeader(header.hash);
            if (result.err) {
                if (result.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    toSave = headers.slice(ix);
                    break;
                }
                else {
                    return { err: result.err };
                }
            }
            else if (result.verified === block_1.VERIFY_STATE.notVerified) {
                // 已经认证过的block就不要再请求了
                toRequest.push(header);
            }
            else if (result.verified === block_1.VERIFY_STATE.invalid) {
                // 如果这个header已经判定为invalid，那么后续的header也不用被加入了
                return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
            }
        }
        toRequest.push(...toSave);
        assert(this.m_tip);
        for (let header of toSave) {
            let { err, valid } = await header.verify(this);
            if (err) {
                return { err };
            }
            if (!valid) {
                return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
            }
            let saveRet = await this.m_headerStorage.saveHeader(header);
            if (saveRet) {
                return { err: saveRet };
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, toRequest };
    }
    async _addHeaders(params) {
        let { from, headers, request, error } = params;
        let connSync = this.m_connSyncMap.get(from);
        if (request && !connSync) {
            // 非广播的headers一定请求过
            return error_code_1.ErrorCode.RESULT_NOT_FOUND;
        }
        if (!connSync) {
            // 广播过来的可能没有请求过header，此时创建conn sync
            let cr = this._createSyncedConnection(from);
            if (cr.err) {
                return cr.err;
            }
            connSync = cr.connSync;
        }
        if (connSync.state === ChainState.syncing) {
            if (request && request.from) {
                if (request.from !== connSync.lastRequestHeader) {
                    this.m_logger.error(`request ${connSync.lastRequestHeader} from ${from} while got headers from ${request.from}`);
                    this._banConnection(from, block_1.BAN_LEVEL.forever);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                if (error === error_code_1.ErrorCode.RESULT_OK) {
                    // 现有机制下，不可能ok并返回空，干掉
                    if (!headers.length) {
                        this._banConnection(from, block_1.BAN_LEVEL.forever);
                        return error_code_1.ErrorCode.RESULT_OK;
                    }
                    this.m_logger.info(`get headers [${headers[0].hash}, ${headers[headers.length - 1].hash}] from ${from} at syncing`);
                    let vsh = await this._verifyAndSaveHeaders(headers);
                    // 找不到的header， 或者验证header出错， 都干掉
                    if (vsh.err === error_code_1.ErrorCode.RESULT_NOT_FOUND || vsh.err === error_code_1.ErrorCode.RESULT_INVALID_BLOCK) {
                        this._banConnection(from, block_1.BAN_LEVEL.forever);
                        return error_code_1.ErrorCode.RESULT_OK;
                    }
                    else if (vsh.err) {
                        // TODO：本地出错，可以重新请求？
                        return vsh.err;
                    }
                    connSync.lastRecvHeader = headers[headers.length - 1];
                    connSync.moreHeaders = (headers.length === connSync.reqLimit);
                    if (vsh.toRequest.length) {
                        // 向conn 发出block请求
                        // 如果options.redoLog=1 同时也请求redo log内容, redo log 会随着block package 一起返回
                        this.m_node.requestBlocks(from, {
                            headers: vsh.toRequest,
                            redoLog: this._ignoreVerify ? 1 : 0,
                        });
                    }
                    else {
                        // 继续同步header回来
                        return await this._continueSyncWithConnection(connSync);
                    }
                }
                else if (error === error_code_1.ErrorCode.RESULT_SKIPPED) {
                    // 没有更多了
                    connSync.moreHeaders = false;
                    // 继续同步header回来
                    return await this._continueSyncWithConnection(connSync);
                }
                else if (error === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    // 上次请求的没有获取到，那么朝前回退limit再请求
                    let hsr = await this.getHeader(connSync.lastRequestHeader, -this._headerReqLimit);
                    if (hsr.err) {
                        return hsr.err;
                    }
                    return await this._beginSyncWithConnection(connSync, hsr.header.hash);
                }
                else {
                    assert(false, `get header with syncing from ${from} with err ${error}`);
                }
            }
            else if (!request) {
                // 广播来的直接忽略
            }
            else {
                this.m_logger.error(`invalid header request ${request} response when syncing with ${from}`);
                this._banConnection(from, block_1.BAN_LEVEL.forever);
            }
        }
        else if (connSync.state === ChainState.synced) {
            if (!request) {
                this.m_logger.info(`get headers [${headers[0].hash}, ${headers[headers.length - 1].hash}] from ${from} at synced`);
                let vsh = await this._verifyAndSaveHeaders(headers);
                // 验证header出错干掉
                if (vsh.err === error_code_1.ErrorCode.RESULT_INVALID_BLOCK) {
                    this._banConnection(from, block_1.BAN_LEVEL.day);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                else if (vsh.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    // 找不到可能是因为落后太久了，先从当前tip请求吧
                    let hsr = await this.getHeader(this.getLastIrreversibleBlockNumber());
                    if (hsr.err) {
                        return hsr.err;
                    }
                    return await this._beginSyncWithConnection(connSync, hsr.header.hash);
                }
                else if (vsh.err) {
                    // TODO：本地出错，可以重新请求？
                    return vsh.err;
                }
                connSync.lastRecvHeader = headers[headers.length - 1];
                this.m_node.requestBlocks(from, { headers: vsh.toRequest });
            }
            else {
                // 不是广播来来的都不对
                this.m_logger.error(`invalid header request ${request} response when synced with ${from}`);
                this._banConnection(from, block_1.BAN_LEVEL.forever);
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _addBlock(block, options) {
        // try{
        assert(this.m_headerStorage);
        this.m_logger.info(`begin adding block number: ${block.number}  hash: ${block.hash} to chain `);
        let err = error_code_1.ErrorCode.RESULT_OK;
        if (options.storage) {
            // mine from local miner
            let _err = await this._addVerifiedBlock(block, options.storage);
            if (_err) {
                return _err;
            }
        }
        else {
            do {
                // 加入block之前肯定已经有header了
                let headerResult = await this.m_headerStorage.getHeader(block.hash);
                if (headerResult.err) {
                    this.m_logger.warn(`ignore block for header missing`);
                    err = headerResult.err;
                    if (err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                        err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                    }
                    break;
                }
                assert(headerResult.header && headerResult.verified !== undefined);
                if (headerResult.verified === block_1.VERIFY_STATE.verified
                    || headerResult.verified === block_1.VERIFY_STATE.invalid) {
                    this.m_logger.info(`ignore block for block has been verified as ${headerResult.verified}`);
                    if (headerResult.verified === block_1.VERIFY_STATE.invalid) {
                        err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                    }
                    else {
                        err = error_code_1.ErrorCode.RESULT_SKIPPED;
                    }
                    break;
                }
                headerResult = await this.m_headerStorage.getHeader(block.header.preBlockHash);
                if (headerResult.err) {
                    this.m_logger.warn(`ignore block for previous header hash: ${block.header.preBlockHash} missing`);
                    err = headerResult.err;
                    break;
                }
                assert(headerResult.header && headerResult.verified !== undefined);
                if (headerResult.verified === block_1.VERIFY_STATE.notVerified) {
                    this.m_logger.info(`ignore block for previous header hash: ${block.header.preBlockHash} hasn't been verified`);
                    err = error_code_1.ErrorCode.RESULT_SKIPPED;
                    break;
                }
                else if (headerResult.verified === block_1.VERIFY_STATE.invalid) {
                    this.m_logger.info(`ignore block for previous block has been verified as invalid`);
                    await this.m_headerStorage.updateVerified(block.header, block_1.VERIFY_STATE.invalid);
                    err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                    break;
                }
            } while (false);
            if (err === error_code_1.ErrorCode.RESULT_INVALID_BLOCK) {
                if (options.remote) {
                    this._banConnection(options.remote, block_1.BAN_LEVEL.day);
                }
                return err;
            }
            else if (err !== error_code_1.ErrorCode.RESULT_OK) {
                return err;
            }
            const name = `${block.hash}${Date.now()}`;
            let rr = await this.verifyBlock(name, block, { redoLog: options.redoLog });
            if (rr.err) {
                this.m_logger.error(`add block failed for verify failed for ${rr.err}`);
                return rr.err;
            }
            const routine = rr.routine;
            const vbr = await rr.next();
            if (vbr.valid === error_code_1.ErrorCode.RESULT_OK) {
                this.m_logger.info(`${routine.name} block verified`);
                assert(routine.storage, `${routine.name} verified ok but storage missed`);
                let csr = await this.m_storageManager.createSnapshot(routine.storage, block.hash);
                if (csr.err) {
                    this.m_logger.error(`${name} verified ok but save snapshot failed`);
                    await routine.storage.remove();
                    return csr.err;
                }
                let _err = await this._addVerifiedBlock(block, csr.snapshot);
                if (_err) {
                    return _err;
                }
            }
            else {
                this.m_logger.info(`${routine.name} block invalid for `, error_code_1.stringifyErrorCode(vbr.valid));
                if (options.remote) {
                    this._banConnection(options.remote, block_1.BAN_LEVEL.day);
                }
                let _err = await this.m_headerStorage.updateVerified(block.header, block_1.VERIFY_STATE.invalid);
                if (_err) {
                    return _err;
                }
                return error_code_1.ErrorCode.RESULT_OK;
            }
        }
        let syncing = false;
        let synced = false;
        let broadcastExcept = new Set();
        for (let remote of this.m_connSyncMap.keys()) {
            let connSync = this.m_connSyncMap.get(remote);
            if (connSync.state === ChainState.syncing) {
                if (connSync.lastRecvHeader && connSync.lastRecvHeader.hash === block.hash) {
                    await this._continueSyncWithConnection(connSync);
                    syncing = true;
                }
                broadcastExcept.add(remote);
            }
            else {
                if (connSync.lastRecvHeader && connSync.lastRecvHeader.hash === block.hash) {
                    synced = true;
                    broadcastExcept.add(remote);
                }
            }
        }
        if (options.storage || (!syncing && synced)) {
            if (this.m_tip.hash === block.header.hash) {
                this.logger.debug(`emit tipBlock with ${this.m_tip.hash} ${this.m_tip.number}`);
                this.emit('tipBlock', this, this.m_tip);
                let hr = await this.getHeader(this.m_tip, -this._broadcastDepth);
                if (hr.err) {
                    return hr.err;
                }
                assert(hr.headers);
                if (hr.headers[0].number === 0) {
                    hr.headers = hr.headers.slice(1);
                }
                this.m_node.broadcast(hr.headers, { filter: (conn) => {
                        this.m_logger.debug(`broadcast to ${conn.fullRemote}: ${!broadcastExcept.has(conn.fullRemote)}`);
                        return !broadcastExcept.has(conn.fullRemote);
                    } });
                this.m_logger.info(`broadcast tip headers from number: ${hr.headers[0].number} hash: ${hr.headers[0].hash} to number: ${this.m_tip.number} hash: ${this.m_tip.hash}`);
            }
        }
        let nextResult = await this.m_headerStorage.getNextHeader(block.header.hash);
        if (nextResult.err) {
            if (nextResult.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                return error_code_1.ErrorCode.RESULT_OK;
            }
            else {
                return nextResult.err;
            }
        }
        assert(nextResult.results && nextResult.results.length);
        for (let result of nextResult.results) {
            let _block = this.m_blockStorage.get(result.header.hash);
            if (_block) {
                this.m_logger.info(`next block hash ${result.header.hash} is ready`);
                this._addPendingBlocks({ block: _block }, true);
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
        // } catch (e) {
        //     console.error(e);
        //     return ErrorCode.RESULT_OK;
        // }
    }
    async _addVerifiedBlock(block, storage) {
        this.m_logger.info(`begin add verified block to chain`);
        assert(this.m_headerStorage);
        assert(this.m_tip);
        let cr = await this._compareWork(block.header, this.m_tip);
        if (cr.err) {
            return cr.err;
        }
        if (cr.result > 0) {
            this.m_logger.info(`begin extend chain's tip`);
            let err = await this.m_headerStorage.changeBest(block.header);
            if (err) {
                this.m_logger.info(`extend chain's tip failed for save to header storage failed for ${err}`);
                return err;
            }
            err = await this._onVerifiedBlock(block);
            err = await this._updateTip(block.header);
            if (err) {
                return err;
            }
        }
        else {
            let err = await this.m_headerStorage.updateVerified(block.header, block_1.VERIFY_STATE.verified);
            if (err) {
                this.m_logger.error(`add verified block to chain failed for update verify state to header storage failed for ${err}`);
                return err;
            }
            err = await this._onForkedBlock(block);
            if (err) {
                return err;
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onForkedBlock(block) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onVerifiedBlock(block) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    newBlockHeader() {
        return new (this._getBlockHeaderType())();
    }
    newBlock(header) {
        let block = new block_1.Block({
            header,
            headerType: this._getBlockHeaderType(),
            transactionType: this._getTransactionType(),
            receiptType: this._getReceiptType()
        });
        return block;
    }
    async newBlockExecutor(options) {
        let { block, storage, externParams } = options;
        if (!externParams) {
            const ppr = await this.prepareExternParams(block, storage);
            if (ppr.err) {
                return { err: ppr.err };
            }
            externParams = ppr.params;
        }
        return this._newBlockExecutor(block, storage, externParams);
    }
    async prepareExternParams(block, storage) {
        return { err: error_code_1.ErrorCode.RESULT_OK, params: [] };
    }
    async _newBlockExecutor(block, storage, externParams) {
        let executor = new executor_1.BlockExecutor({
            logger: this.m_logger,
            block,
            storage,
            handler: this.m_handler,
            externContext: {},
            globalOptions: this.m_globalOptions,
            externParams: []
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, executor };
    }
    async newViewExecutor(header, storage, method, param) {
        let executor = new executor_1.ViewExecutor({ logger: this.m_logger, header, storage, method, param, handler: this.m_handler, externContext: {} });
        return { err: error_code_1.ErrorCode.RESULT_OK, executor };
    }
    async getHeader(arg1, arg2) {
        return await this.m_headerStorage.getHeader(arg1, arg2);
    }
    async _initialBlockDownload() {
        assert(this.m_node);
        let err = await this.m_node.init();
        if (err) {
            if (err === error_code_1.ErrorCode.RESULT_SKIPPED) {
                this.m_state = ChainState.synced;
                this.logger.debug(`emit tipBlock with ${this.m_tip.hash} ${this.m_tip.number}`);
                const tip = this.m_tip;
                setImmediate(() => {
                    this.emit('tipBlock', this, tip);
                });
                return error_code_1.ErrorCode.RESULT_OK;
            }
            return err;
        }
        this.m_node.on('outbound', async (conn) => {
            let syncPeer = conn;
            assert(syncPeer);
            let hr = await this.m_headerStorage.getHeader(this.getLastIrreversibleBlockNumber());
            if (hr.err) {
                return hr.err;
            }
            assert(hr.header);
            return await this._beginSyncWithConnection({ conn }, hr.header.hash);
        });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async verifyBlock(name, block, options) {
        this.m_logger.info(`begin verify block number: ${block.number} hash: ${block.hash} `);
        let sr = await this.m_storageManager.createStorage(name, block.header.preBlockHash);
        if (sr.err) {
            this.m_logger.warn(`verify block failed for recover storage to previous block's failed for ${sr.err}`);
            return { err: sr.err };
        }
        const storage = sr.storage;
        storage.createLogger();
        let crr;
        // 通过redo log 来添加block的内容
        if (options && options.redoLog) {
            crr = { err: error_code_1.ErrorCode.RESULT_OK, routine: new VerifyBlockWithRedoLogRoutine({
                    name,
                    block,
                    storage,
                    redoLog: options.redoLog,
                    logger: this.logger
                }) };
        }
        else {
            crr = this.m_routineManager.create({ name, block, storage });
        }
        if (crr.err) {
            await storage.remove();
            return { err: crr.err };
        }
        const routine = crr.routine;
        const next = async () => {
            const rr = await routine.verify();
            if (rr.err || rr.result.err) {
                await storage.remove();
                return { err: rr.err };
            }
            if (rr.result.valid !== error_code_1.ErrorCode.RESULT_OK) {
                if (!(this._saveMismatch && rr.result.valid === error_code_1.ErrorCode.RESULT_VERIFY_NOT_MATCH)) {
                    await storage.remove();
                }
            }
            return rr.result;
        };
        return { err: error_code_1.ErrorCode.RESULT_OK, routine, next };
    }
    async addMinedBlock(block, storage) {
        this.m_blockStorage.add(block);
        this.m_logger.info(`miner mined block number:${block.number} hash:${block.hash}`);
        assert(this.m_headerStorage);
        let err = await this.m_headerStorage.saveHeader(block.header);
        if (!err) {
            this._addPendingBlocks({ block, storage });
        }
    }
    /**
     * virtual
     * @param block
     */
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let dbr = await storage.createDatabase(Chain.dbUser);
        if (dbr.err) {
            this.m_logger.error(`miner create genensis block failed for create user table to storage failed ${dbr.err}`);
            return dbr.err;
        }
        dbr = await storage.createDatabase(Chain.dbSystem);
        if (dbr.err) {
            return dbr.err;
        }
        let kvr = await dbr.value.createKeyValue(Chain.kvNonce);
        if (kvr.err) {
            this.m_logger.error(`miner create genensis block failed for create nonce table to storage failed ${kvr.err}`);
            return kvr.err;
        }
        kvr = await dbr.value.createKeyValue(Chain.kvConfig);
        if (kvr.err) {
            this.m_logger.error(`miner create genensis block failed for create config table to storage failed ${kvr.err}`);
            return kvr.err;
        }
        for (let [key, value] of Object.entries(this.globalOptions)) {
            if (!(util_1.isString(value) || util_1.isNumber(value) || util_1.isBoolean(value))) {
                assert(false, `invalid globalOptions ${key}`);
                this.m_logger.error(`miner create genensis block failed for write global config to storage failed for invalid globalOptions ${key}`);
                return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
            }
            let { err } = await kvr.kv.hset('global', key, value);
            if (err) {
                this.m_logger.error(`miner create genensis block failed for write global config to storage failed ${err}`);
                return err;
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async onPostCreateGenesis(genesis, storage) {
        // assert(genesis.header.storageHash === (await storage.messageDigest()).value);
        assert(genesis.number === 0);
        if (genesis.number !== 0) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        assert(this.m_headerStorage && this.m_blockStorage);
        this.m_blockStorage.add(genesis);
        let err = await this.m_headerStorage.createGenesis(genesis.header);
        if (err) {
            return err;
        }
        await this._onVerifiedBlock(genesis);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async view(from, methodname, param) {
        let retInfo = { err: error_code_1.ErrorCode.RESULT_FAILED };
        let storageView;
        do {
            let hr = await this.getHeader(from);
            if (hr.err !== error_code_1.ErrorCode.RESULT_OK) {
                this.m_logger.error(`view ${methodname} failed for load header ${from} failed for ${hr.err}`);
                retInfo = { err: hr.err };
                break;
            }
            let header = hr.header;
            let svr = await this.m_storageManager.getSnapshotView(header.hash);
            if (svr.err !== error_code_1.ErrorCode.RESULT_OK) {
                this.m_logger.error(`view ${methodname} failed for get snapshot ${header.hash} failed for ${svr.err}`);
                retInfo = { err: svr.err };
                break;
            }
            storageView = svr.storage;
            let nver = await this.newViewExecutor(header, storageView, methodname, param);
            if (nver.err) {
                this.m_logger.error(`view ${methodname} failed for create view executor failed for ${nver.err}`);
                retInfo = { err: nver.err };
                this.m_storageManager.releaseSnapshotView(header.hash);
                break;
            }
            let ret1 = await nver.executor.execute();
            this.m_storageManager.releaseSnapshotView(header.hash);
            if (ret1.err === error_code_1.ErrorCode.RESULT_OK) {
                retInfo = { err: error_code_1.ErrorCode.RESULT_OK, value: ret1.value };
                break;
            }
            this.m_logger.error(`view ${methodname} failed for view executor execute failed for ${ret1.err}`);
            retInfo = { err: ret1.err };
            break;
        } while (false);
        return retInfo;
    }
    async getNonce(s) {
        return await this.m_pending.getNonce(s);
    }
    async getTransactionReceipt(s) {
        let ret = await this.m_headerStorage.txView.get(s);
        if (ret.err !== error_code_1.ErrorCode.RESULT_OK) {
            this.logger.error(`get transaction receipt ${s} failed for ${ret.err}`);
            return { err: ret.err };
        }
        let block = this.getBlock(ret.blockhash);
        if (!block) {
            this.logger.error(`get transaction receipt failed for get block ${ret.blockhash} failed`);
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        let tx = block.content.getTransaction(s);
        let receipt = block.content.getReceipt(s);
        if (tx && receipt) {
            return { err: error_code_1.ErrorCode.RESULT_OK, block: block.header, tx, receipt };
        }
        assert(false, `transaction ${s} declared in ${ret.blockhash} but not found in block`);
        return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
    }
    addTransaction(tx) {
        return this._addTransaction(tx);
    }
    _getBlockHeaderType() {
        return block_1.BlockHeader;
    }
    _getTransactionType() {
        return block_1.Transaction;
    }
    _getReceiptType() {
        return block_1.Receipt;
    }
    getLastIrreversibleBlockNumber() {
        if (!this.m_tip || this.m_tip.number <= this._confirmDepth) {
            return 0;
        }
        return this.m_tip.number - this._confirmDepth;
    }
}
// 存储address入链的tx的最大nonce
Chain.dbSystem = '__system';
Chain.kvNonce = 'nonce'; // address<--->nonce
Chain.kvConfig = 'config';
Chain.dbUser = '__user';
Chain.s_dbFile = 'database';
exports.Chain = Chain;
class VerifyBlockWithRedoLogRoutine extends executor_routine_1.BlockExecutorRoutine {
    constructor(options) {
        super({
            name: options.name,
            block: options.block,
            storage: options.storage,
            logger: options.logger
        });
        this.m_redoLog = options.redoLog;
    }
    async execute() {
        return { err: error_code_1.ErrorCode.RESULT_NO_IMP };
    }
    async verify() {
        this.m_logger.info(`redo log, block[${this.block.number}, ${this.block.hash}]`);
        // 执行redolog
        let redoError = await this.m_redoLog.redoOnStorage(this.storage);
        if (redoError) {
            this.m_logger.error(`redo error ${redoError}`);
            return { err: error_code_1.ErrorCode.RESULT_OK, result: { err: redoError } };
        }
        // 获得storage的hash值
        let digestResult = await this.storage.messageDigest();
        if (digestResult.err) {
            this.m_logger.error(`redo log get storage messageDigest error`);
            return { err: error_code_1.ErrorCode.RESULT_OK, result: { err: digestResult.err } };
        }
        const valid = digestResult.value === this.block.header.storageHash ? error_code_1.ErrorCode.RESULT_OK : error_code_1.ErrorCode.RESULT_VERIFY_NOT_MATCH;
        // 当前的storage hash和header上的storageHash 比较 
        // 设置verify 结果, 后续流程需要使用 res.valid
        return { err: error_code_1.ErrorCode.RESULT_OK, result: { err: error_code_1.ErrorCode.RESULT_OK, valid } };
    }
    cancel() {
        // do nothing
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jaGFpbi9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQyxtQ0FBc0M7QUFDdEMsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxtQ0FBbUM7QUFDbkMsK0JBQStCO0FBQy9CLCtCQUEyRjtBQUUzRiw4Q0FBOEQ7QUFDOUQsb0RBQStFO0FBQy9FLG9EQUFnRDtBQUNoRCxrREFBK0M7QUFHL0Msb0NBQTJMO0FBQzNMLHdDQUFxSjtBQUNySix1REFBMEQ7QUFDMUQsMENBQWtJO0FBRWxJLHVDQUFnRDtBQUNoRCw2Q0FBK0U7QUFDL0UseURBQXdGO0FBc0J4RixJQUFLLFVBS0o7QUFMRCxXQUFLLFVBQVU7SUFDWCwyQ0FBUSxDQUFBO0lBQ1IsMkNBQVEsQ0FBQTtJQUNSLGlEQUFXLENBQUE7SUFDWCwrQ0FBVSxDQUFBO0FBQ2QsQ0FBQyxFQUxJLFVBQVUsS0FBVixVQUFVLFFBS2Q7QUE0Q0QsV0FBbUIsU0FBUSxxQkFBWTtJQVduQzs7OztPQUlHO0lBQ0gsWUFBWSxPQUE2QjtRQUNyQyxLQUFLLEVBQUUsQ0FBQztRQThDSixZQUFPLEdBQWUsVUFBVSxDQUFDLElBQUksQ0FBQztRQUV0QyxxQkFBZ0IsR0FBYSxFQUFFLENBQUM7UUFPaEMscUJBQWdCLEdBQThCLElBQUksS0FBSyxFQUFFLENBQUM7UUFDMUQsb0JBQWUsR0FJbkI7WUFDSSxNQUFNLEVBQUUsSUFBSSxHQUFHLEVBQUU7WUFDakIsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFO1NBQ3hCLENBQUM7UUFNRSxtQkFBYyxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLDBCQUFxQixHQUd6QixFQUFFLENBQUM7UUEyQkcsa0JBQWEsR0FBZ0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQW5HN0QsSUFBSSxDQUFDLFFBQVEsR0FBRyx3QkFBVSxDQUFDLE9BQU8sQ0FB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