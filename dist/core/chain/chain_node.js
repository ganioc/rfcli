"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const events_1 = require("events");
const error_code_1 = require("../error_code");
const storage_1 = require("../storage");
const block_1 = require("../block");
const reader_1 = require("../lib/reader");
const writer_1 = require("../lib/writer");
const net_1 = require("../net");
var SYNC_CMD_TYPE;
(function (SYNC_CMD_TYPE) {
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["getHeader"] = 16] = "getHeader";
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["header"] = 17] = "header";
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["getBlock"] = 18] = "getBlock";
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["block"] = 19] = "block";
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["tx"] = 21] = "tx";
    SYNC_CMD_TYPE[SYNC_CMD_TYPE["end"] = 22] = "end";
})(SYNC_CMD_TYPE = exports.SYNC_CMD_TYPE || (exports.SYNC_CMD_TYPE = {}));
class ChainNode extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_requestingBlock = {
            connMap: new Map(),
            hashMap: new Map()
        };
        this.m_pendingBlock = { hashes: new Set(), sequence: new Array() };
        this.m_blockFromMap = new Map();
        this.m_requestingHeaders = new Map();
        this.m_cc = {
            onRecvBlock(node, block, from) {
                from.wnd += 1;
                from.wnd = from.wnd > 3 * node.m_initBlockWnd ? 3 * node.m_initBlockWnd : from.wnd;
            },
            onBlockTimeout(node, hash, from) {
                from.wnd = Math.floor(from.wnd / 2);
            }
        };
        // net/node
        this.m_logger = options.logger;
        this.m_networks = options.networks.slice();
        this.m_blockStorage = options.blockStorage;
        this.m_storageManager = options.storageManager;
        this.m_blockWithLog = options.blockWithLog;
        this.m_initBlockWnd = options.initBlockWnd ? options.initBlockWnd : 10;
        this.m_blockTimeout = options.blockTimeout ? options.blockTimeout : 10000;
        this.m_headersTimeout = options.headersTimeout ? options.headersTimeout : 30000;
        this.m_reqTimeoutTimer = setInterval(() => {
            this._onReqTimeoutTimer(Date.now() / 1000);
        }, 1000);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    async init() {
        let inits = [];
        for (const network of this.m_networks) {
            network.on('inbound', (conn) => {
                this._beginSyncWithNode(network, conn);
                this.emit('inbound', conn);
            });
            network.on('outbound', (conn) => {
                this._beginSyncWithNode(network, conn);
                this.emit('outbound', conn);
            });
            network.on('error', (remote, err) => {
                const fullRemote = net_1.INode.fullPeerid(network.name, remote);
                this._onConnectionError(fullRemote);
                this.emit('error', fullRemote);
            });
            network.on('ban', (remote) => {
                const fullRemote = net_1.INode.fullPeerid(network.name, remote);
                this._onRemoveConnection(fullRemote);
                this.emit('ban', fullRemote);
            });
            inits.push(network.init());
        }
        let results = await Promise.all(inits);
        if (results[0]) {
            return results[0];
        }
        let initOutbounds = [];
        for (const network of this.m_networks) {
            initOutbounds.push(network.initialOutbounds());
        }
        results = await Promise.all(initOutbounds);
        return results[0];
    }
    uninit() {
        this.removeAllListeners('blocks');
        this.removeAllListeners('headers');
        this.removeAllListeners('transactions');
        let uninits = [];
        for (const network of this.m_networks) {
            uninits.push(network.uninit());
        }
        return Promise.all(uninits);
    }
    get logger() {
        return this.m_logger;
    }
    async listen() {
        let listens = [];
        for (const network of this.m_networks) {
            listens.push(network.listen());
        }
        const results = await Promise.all(listens);
        for (const err of results) {
            if (err) {
                return err;
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    getNetwork(_network) {
        if (_network) {
            for (const network of this.m_networks) {
                if (network.name === _network) {
                    return network;
                }
            }
            return undefined;
        }
        else {
            return this.m_networks[0];
        }
    }
    getConnection(fullremote) {
        const { network, peerid } = net_1.INode.splitFullPeerid(fullremote);
        const node = this.getNetwork(network);
        if (!node) {
            return;
        }
        return node.node.getConnection(peerid);
    }
    getOutbounds() {
        let arr = [];
        for (const network of this.m_networks) {
            arr.push(...network.node.getOutbounds());
        }
        return arr;
    }
    broadcast(content, options) {
        if (!content.length) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        let pwriter;
        let strategy;
        if (content[0] instanceof block_1.BlockHeader) {
            let hwriter = new writer_1.BufferWriter();
            for (let header of content) {
                let err = header.encode(hwriter);
                if (err) {
                    this.logger.error(`encode header ${header.hash} failed`);
                    return err;
                }
            }
            let raw = hwriter.render();
            pwriter = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.header, { count: content.length }, raw.length);
            pwriter.writeData(raw);
            strategy = block_1.NetworkBroadcastStrategy.headers;
        }
        else if (content[0] instanceof block_1.Transaction) {
            let hwriter = new writer_1.BufferWriter();
            for (let tx of content) {
                let err = tx.encode(hwriter);
                if (err) {
                    this.logger.error(`encode transaction ${tx.hash} failed`);
                    return err;
                }
            }
            let raw = hwriter.render();
            pwriter = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.tx, { count: content.length }, raw.length);
            pwriter.writeData(raw);
            strategy = block_1.NetworkBroadcastStrategy.transaction;
        }
        assert(pwriter);
        for (const network of this.m_networks) {
            const opt = Object.create(options ? options : null);
            opt.strategy = strategy;
            network.broadcast(pwriter, opt);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _beginSyncWithNode(network, conn) {
        // TODO: node 层也要做封禁，比如发送无法解析的pkg， 过大， 过频繁的请求等等
        conn.on('pkg', async (pkg) => {
            if (pkg.header.cmdType === SYNC_CMD_TYPE.tx) {
                let buffer = pkg.copyData();
                let txReader = new reader_1.BufferReader(buffer);
                let txes = [];
                let err = error_code_1.ErrorCode.RESULT_OK;
                for (let ix = 0; ix < pkg.body.count; ++ix) {
                    let tx = network.newTransaction();
                    if (tx.decode(txReader) !== error_code_1.ErrorCode.RESULT_OK) {
                        this.logger.warn(`receive invalid format transaction from ${conn.fullRemote}`);
                        err = error_code_1.ErrorCode.RESULT_INVALID_PARAM;
                        break;
                    }
                    if (!tx.verifySignature()) {
                        this.logger.warn(`receive invalid signature transaction ${tx.hash} from ${conn.fullRemote}`);
                        err = error_code_1.ErrorCode.RESULT_INVALID_TOKEN;
                        break;
                    }
                    txes.push(tx);
                }
                if (err) {
                    network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
                }
                else {
                    if (txes.length) {
                        let hashs = [];
                        for (let tx of txes) {
                            hashs.push(tx.hash);
                        }
                        this.logger.debug(`receive transaction from ${conn.fullRemote} ${JSON.stringify(hashs)}`);
                        this.emit('transactions', conn, txes);
                    }
                }
            }
            else if (pkg.header.cmdType === SYNC_CMD_TYPE.header) {
                let time = Date.now() / 1000;
                let buffer = pkg.copyData();
                let headerReader = new reader_1.BufferReader(buffer);
                let headers = [];
                if (!pkg.body.error) {
                    let err = error_code_1.ErrorCode.RESULT_OK;
                    let preHeader;
                    for (let ix = 0; ix < pkg.body.count; ++ix) {
                        let header = network.newBlockHeader();
                        if (header.decode(headerReader) !== error_code_1.ErrorCode.RESULT_OK) {
                            this.logger.warn(`receive invalid format header from ${conn.fullRemote}`);
                            err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                            break;
                        }
                        if (!pkg.body.request || pkg.body.request.from) {
                            // 广播或者用from请求的header必须连续
                            if (preHeader) {
                                if (!preHeader.isPreBlock(header)) {
                                    this.logger.warn(`receive headers not in sequence from ${conn.fullRemote}`);
                                    err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                                    break;
                                }
                            }
                            preHeader = header;
                        }
                        headers.push(header);
                    }
                    if (err) {
                        // 发错的header的peer怎么处理
                        network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
                        return;
                    }
                    // 用from请求的返回的第一个跟from不一致
                    if (headers.length && pkg.body.request && headers[0].preBlockHash !== pkg.body.request.from) {
                        this.logger.warn(`receive headers ${headers[0].preBlockHash} not match with request ${pkg.body.request.from} from ${conn.fullRemote}`);
                        network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
                        return;
                    }
                    // 任何返回 gensis 的都不对
                    if (headers.length) {
                        if (headers[0].number === 0) {
                            this.logger.warn(`receive genesis header from ${conn.fullRemote}`);
                            network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
                            return;
                        }
                    }
                }
                else if (pkg.body.error === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    let ghr = await network.headerStorage.getHeader(0);
                    if (ghr.err) {
                        return;
                    }
                    // from用gensis请求的返回没有
                    if (pkg.body.request && pkg.body.request.from === ghr.header.hash) {
                        this.logger.warn(`receive can't get genesis header ${pkg.body.request.from} from ${conn.fullRemote}`);
                        network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
                        return;
                    }
                }
                if (!this._onRecvHeaders(conn.fullRemote, time, pkg.body.request)) {
                    return;
                }
                this.emit('headers', { from: conn.fullRemote, headers, request: pkg.body.request, error: pkg.body.error });
            }
            else if (pkg.header.cmdType === SYNC_CMD_TYPE.getHeader) {
                this._responseHeaders(conn, pkg.body);
            }
            else if (pkg.header.cmdType === SYNC_CMD_TYPE.block) {
                this._handlerBlockPackage(network, conn, pkg);
            }
            else if (pkg.header.cmdType === SYNC_CMD_TYPE.getBlock) {
                this._responseBlocks(conn, pkg.body);
            }
        });
    }
    // 处理通过网络请求获取的block package
    // 然后emit到chain层
    // @param conn 网络连接
    // @param pgk  block 数据包
    _handlerBlockPackage(network, conn, pkg) {
        let buffer = pkg.copyData();
        let blockReader;
        let redoLogReader;
        let redoLog;
        // check body buffer 中是否包含了redoLog
        // 如果包含了redoLog 需要切割buffer
        if (pkg.body.redoLog) {
            // 由于在传输时, redolog和block都放在package的data属性里（以合并buffer形式）
            // 所以需要根据body中的length 分配redo和block的buffer
            let blockBuffer = buffer.slice(0, pkg.body.blockLength);
            let redoLogBuffer = buffer.slice(pkg.body.blockLength, buffer.length);
            // console.log(pkg.body.blockLength, blockBuffer.length, pkg.body.redoLogLength, redoLogBuffer.length)
            // console.log('------------------')
            blockReader = new reader_1.BufferReader(blockBuffer);
            redoLogReader = new reader_1.BufferReader(redoLogBuffer);
            // 构造redo log 对象
            redoLog = new storage_1.JStorageLogger();
            let redoDecodeError = redoLog.decode(redoLogReader);
            if (redoDecodeError) {
                return;
            }
        }
        else {
            blockReader = new reader_1.BufferReader(buffer);
        }
        if (pkg.body.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
            // 请求的block肯定已经从header里面确定remote有，直接禁掉
            network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
            return;
        }
        // 构造block对象
        let block = network.newBlock();
        if (block.decode(blockReader) !== error_code_1.ErrorCode.RESULT_OK) {
            this.logger.warn(`receive block invalid format from ${conn.fullRemote}`);
            network.banConnection(conn.remote, block_1.BAN_LEVEL.forever);
            return;
        }
        if (!block.verify()) {
            this.logger.warn(`receive block not match header ${block.header.hash} from ${conn.fullRemote}`);
            network.banConnection(conn.remote, block_1.BAN_LEVEL.day); // 可能分叉？
            return;
        }
        const eventParams = { from: conn.fullRemote, block, redoLog };
        let err = this._onRecvBlock(eventParams);
        if (err) {
            return;
        }
        // 数据emit 到chain层
        this.emit('blocks', eventParams);
    }
    requestHeaders(from, options) {
        this.logger.debug(`request headers from  with options ${from.fullRemote}`, options);
        if (this.m_requestingHeaders.get(from.fullRemote)) {
            this.logger.warn(`request headers ${options} from ${from.fullRemote} skipped for former headers request existing`);
            return error_code_1.ErrorCode.RESULT_ALREADY_EXIST;
        }
        this.m_requestingHeaders.set(from.fullRemote, {
            time: Date.now() / 1000,
            req: Object.assign(Object.create(null), options)
        });
        let writer = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.getHeader, options);
        from.addPendingWriter(writer);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    // 这里必须实现成同步的
    requestBlocks(from, options) {
        this.logger.debug(`request blocks from ${from} with options `, options);
        let connRequesting = this._getConnRequesting(from);
        if (!connRequesting) {
            this.logger.debug(`request blocks from ${from} skipped for connection not found with options `, options);
            return error_code_1.ErrorCode.RESULT_NOT_FOUND;
        }
        let requests = [];
        let addRequesting = (header) => {
            if (this.m_blockStorage.has(header.hash)) {
                let block = this.m_blockStorage.get(header.hash);
                assert(block, `block storage load block ${header.hash} failed while file exists`);
                if (block) {
                    if (this.m_blockWithLog) {
                        if (this.m_storageManager.hasRedoLog(header.hash)) {
                            let redoLog = this.m_storageManager.getRedoLog(header.hash);
                            if (redoLog) {
                                setImmediate(() => {
                                    this.emit('blocks', { block, redoLog });
                                });
                            }
                            else {
                                setImmediate(() => {
                                    this.emit('blocks', { block });
                                });
                            }
                        }
                        else {
                            setImmediate(() => {
                                this.emit('blocks', { block });
                            });
                        }
                    }
                    else {
                        setImmediate(() => {
                            this.emit('blocks', { block });
                        });
                    }
                    return false;
                }
            }
            let sources = this.m_blockFromMap.get(header.hash);
            if (!sources) {
                sources = new Set();
                this.m_blockFromMap.set(header.hash, sources);
            }
            if (sources.has(from)) {
                return false;
            }
            sources.add(from);
            if (this.m_requestingBlock.hashMap.has(header.hash)) {
                return false;
            }
            requests.push(header.hash);
            return true;
        };
        if (options.headers) {
            for (let header of options.headers) {
                addRequesting(header);
            }
        }
        else {
            assert(false, `invalid block request ${options}`);
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        for (let hash of requests) {
            this._addToPendingBlocks(hash);
        }
        this._onFreeBlockWnd(connRequesting);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _tryRequestBlockFromConnection(hash, from) {
        if (from.wnd - from.hashes.size > 0) {
            this._requestBlockFromConnection(hash, from);
            this._removeFromPendingBlocks(hash);
            return true;
        }
        return false;
    }
    _addToPendingBlocks(hash, head = false) {
        if (!this.m_pendingBlock.hashes.has(hash)) {
            this.m_pendingBlock.hashes.add(hash);
            if (head) {
                this.m_pendingBlock.sequence.unshift(hash);
            }
            else {
                this.m_pendingBlock.sequence.push(hash);
            }
        }
    }
    _removeFromPendingBlocks(hash) {
        if (this.m_pendingBlock.hashes.has(hash)) {
            this.m_pendingBlock.hashes.delete(hash);
            this.m_pendingBlock.sequence.splice(this.m_pendingBlock.sequence.indexOf(hash), 1);
        }
    }
    _getConnRequesting(fpid) {
        let connRequesting = this.m_requestingBlock.connMap.get(fpid);
        if (!connRequesting) {
            const { network, peerid } = net_1.INode.splitFullPeerid(fpid);
            const node = this.getNetwork(network);
            if (!node) {
                return;
            }
            let conn = node.node.getConnection(peerid);
            // TODO: 取不到这个conn的时候要处理
            // assert(conn, `no connection to ${remote}`);
            this.logger.error(`non connection to ${fpid}`);
            if (!conn) {
                return;
            }
            connRequesting = { hashes: new Set(), wnd: this.m_initBlockWnd, conn: conn };
            this.m_requestingBlock.connMap.set(fpid, connRequesting);
        }
        return connRequesting;
    }
    _requestBlockFromConnection(hash, connRequesting) {
        this.logger.debug(`request block ${hash} from ${connRequesting.conn.fullRemote}`);
        let writer = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.getBlock, { hash, redoLog: this.m_blockWithLog ? 1 : 0 });
        connRequesting.conn.addPendingWriter(writer);
        connRequesting.hashes.add(hash);
        this.m_requestingBlock.hashMap.set(hash, { remote: connRequesting.conn.fullRemote, time: Date.now() / 1000 });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _onFreeBlockWnd(connRequesting) {
        let pending = this.m_pendingBlock;
        let index = 0;
        do {
            if (!pending.sequence.length
                || index >= pending.sequence.length) {
                break;
            }
            let hash = pending.sequence[index];
            let sources = this.m_blockFromMap.get(hash);
            assert(sources, `to request block ${hash} from unknown source`);
            if (!sources) {
                return error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
            if (sources.has(connRequesting.conn.fullRemote)) {
                this._requestBlockFromConnection(hash, connRequesting);
                pending.sequence.splice(index, 1);
                pending.hashes.delete(hash);
                if (connRequesting.wnd <= connRequesting.hashes.size) {
                    break;
                }
                else {
                    continue;
                }
            }
            ++index;
        } while (true);
    }
    _onRecvHeaders(fpid, time, request) {
        let valid = true;
        if (request) {
            // 返回没有请求过的headers， 要干掉
            let rh = this.m_requestingHeaders.get(fpid);
            if (rh) {
                for (let key of Object.keys(request)) {
                    if (request[key] !== rh.req[key]) {
                        valid = false;
                        break;
                    }
                }
            }
            else {
                // TODO: 如果request header之后connection失效， 会从requesting headers 中移除；
                // 因为回调处理基本都是异步的，可能是会出现同时进入receive header的回调和connection error的回调；
                // 此时这段分支会导致header被置为invalid；相比不停返回header的ddos攻击行为是有区别的；
                // ban的策略也应该有区别；
                valid = false;
            }
            if (valid) {
                this.m_requestingHeaders.delete(fpid);
            }
        }
        else {
            // TODO: 过频繁的广播header, 要干掉
        }
        if (!valid) {
            this._banConnection(fpid, block_1.BAN_LEVEL.forever);
        }
        return valid;
    }
    _onRecvBlock(params) {
        let connRequesting = this.m_requestingBlock.connMap.get(params.from);
        if (!connRequesting) {
            this.logger.error(`requesting info on ${params.from} missed, skip it`);
            return error_code_1.ErrorCode.RESULT_NOT_FOUND;
        }
        let stub = this.m_requestingBlock.hashMap.get(params.block.hash);
        assert(stub, `recv block ${params.block.hash} from ${params.from} that never request`);
        if (!stub) {
            this._banConnection(params.from, block_1.BAN_LEVEL.day);
            return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
        }
        this.logger.debug(`recv block hash: ${params.block.hash} number: ${params.block.number} from ${params.from}`);
        this.m_blockStorage.add(params.block);
        if (params.redoLog) {
            this.m_storageManager.addRedoLog(params.block.hash, params.redoLog);
        }
        assert(stub.remote === params.from, `request ${params.block.hash} from ${stub.remote} while recv from ${params.from}`);
        this.m_requestingBlock.hashMap.delete(params.block.hash);
        connRequesting.hashes.delete(params.block.hash);
        this.m_blockFromMap.delete(params.block.hash);
        this.m_cc.onRecvBlock(this, params.block, connRequesting);
        this._onFreeBlockWnd(connRequesting);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _onConnectionError(fullRemote) {
        this.logger.warn(`connection from ${fullRemote} break, close it.`);
        this._onRemoveConnection(fullRemote);
    }
    /*must not async*/
    _onRemoveConnection(fullRemote) {
        this.logger.info(`removing ${fullRemote} from block requesting source`);
        let connRequesting = this.m_requestingBlock.connMap.get(fullRemote);
        if (connRequesting) {
            for (let hash of connRequesting.hashes) {
                this.logger.debug(`change block ${hash} from requesting to pending`);
                this.m_requestingBlock.hashMap.delete(hash);
                this._addToPendingBlocks(hash, true);
            }
        }
        this.m_requestingBlock.connMap.delete(fullRemote);
        for (let hash of this.m_blockFromMap.keys()) {
            let sources = this.m_blockFromMap.get(hash);
            if (sources.has(fullRemote)) {
                sources.delete(fullRemote);
                if (!sources.size) {
                    this.logger.debug(`remove block ${hash} from pending blocks for all source removed`);
                    // this._removeFromPendingBlocks(hash);
                }
                else {
                    for (let from of sources) {
                        let fromRequesting = this.m_requestingBlock.connMap.get(from);
                        assert(fromRequesting, `block requesting connection ${from} not exists`);
                        if (this._tryRequestBlockFromConnection(hash, fromRequesting)) {
                            break;
                        }
                    }
                }
            }
        }
        this.m_requestingHeaders.delete(fullRemote);
    }
    banConnection(fullRemote, level) {
        return this._banConnection(fullRemote, level);
    }
    _banConnection(fullRemote, level) {
        const { network, peerid } = net_1.INode.splitFullPeerid(fullRemote);
        const node = this.getNetwork(network);
        if (node) {
            node.banConnection(peerid, level);
        }
    }
    _onReqTimeoutTimer(now) {
        for (let hash of this.m_requestingBlock.hashMap.keys()) {
            let stub = this.m_requestingBlock.hashMap.get(hash);
            let fromRequesting = this.m_requestingBlock.connMap.get(stub.remote);
            if (now - stub.time > this.m_blockTimeout) {
                this.m_cc.onBlockTimeout(this, hash, fromRequesting);
                // close it 
                if (fromRequesting.wnd < 1) {
                    this._banConnection(stub.remote, block_1.BAN_LEVEL.hour);
                }
            }
        }
        // 返回headers超时
        for (let fullRemote of this.m_requestingHeaders.keys()) {
            let rh = this.m_requestingHeaders.get(fullRemote);
            if (now - rh.time > this.m_headersTimeout) {
                this.logger.debug(`header request timeout from ${fullRemote} timeout with options `, rh.req);
                this._banConnection(fullRemote, block_1.BAN_LEVEL.hour);
            }
        }
    }
    async _responseBlocks(conn, req) {
        assert(this.m_blockStorage);
        this.logger.info(`receive block request from ${conn.fullRemote} with ${JSON.stringify(req)}`);
        let bwriter = new writer_1.BufferWriter();
        let block = this.m_blockStorage.get(req.hash);
        if (!block) {
            this.logger.crit(`cannot get Block ${req.hash} from blockStorage`);
            const node = this.getNetwork(conn.network);
            assert(false, `${conn.fullRemote} cannot get Block ${req.hash} from blockStorage`);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        let err = block.encode(bwriter);
        if (err) {
            this.logger.error(`encode block ${block.hash} failed`);
            return err;
        }
        let rawBlocks = bwriter.render();
        let redoLogRaw;
        // 如果请求参数里设置了redoLog,  则读取redoLog, 合并在返回的包里
        if (req.redoLog === 1) {
            do {
                let redoLogWriter = new writer_1.BufferWriter();
                // 从本地文件中读取redoLog, 处理raw 拼接在block后
                let redoLog = this.m_storageManager.getRedoLog(req.hash);
                if (!redoLog) {
                    this.logger.error(`${req.hash} redo log missing`);
                    break;
                }
                err = redoLog.encode(redoLogWriter);
                if (err) {
                    this.logger.error(`encode redolog ${req.hash} failed`);
                    break;
                }
                redoLogRaw = redoLogWriter.render();
            } while (false);
        }
        if (redoLogRaw) {
            let dataLength = rawBlocks.length + redoLogRaw.length;
            let pwriter = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.block, {
                blockLength: rawBlocks.length,
                redoLogLength: redoLogRaw.length,
                redoLog: 1,
            }, dataLength);
            pwriter.writeData(rawBlocks);
            pwriter.writeData(redoLogRaw);
            conn.addPendingWriter(pwriter);
        }
        else {
            let pwriter = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.block, { redoLog: 0 }, rawBlocks.length);
            pwriter.writeData(rawBlocks);
            conn.addPendingWriter(pwriter);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _responseHeaders(conn, req) {
        const node = this.getNetwork(conn.network);
        this.logger.info(`receive header request from ${conn.fullRemote} with ${JSON.stringify(req)}`);
        if (req.from) {
            let hwriter = new writer_1.BufferWriter();
            let respErr = error_code_1.ErrorCode.RESULT_OK;
            let headerCount = 0;
            do {
                let tipResult = await node.headerStorage.getHeader('latest');
                if (tipResult.err) {
                    return tipResult.err;
                }
                let heightResult = await node.headerStorage.getHeightOnBest(req.from);
                if (heightResult.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    respErr = error_code_1.ErrorCode.RESULT_NOT_FOUND;
                    break;
                }
                assert(tipResult.header);
                if (tipResult.header.hash === req.from) {
                    // 没有更多了
                    respErr = error_code_1.ErrorCode.RESULT_SKIPPED;
                    break;
                }
                if (!req.limit || heightResult.height + req.limit > tipResult.header.number) {
                    headerCount = tipResult.header.number - heightResult.height;
                }
                else {
                    headerCount = req.limit;
                }
                let hr = await node.headerStorage.getHeader(heightResult.height + headerCount);
                if (hr.err) {
                    // 中间changeBest了，返回not found
                    if (hr.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                        respErr = error_code_1.ErrorCode.RESULT_NOT_FOUND;
                        break;
                    }
                    else {
                        return hr.err;
                    }
                }
                let hsr = await node.headerStorage.getHeader(hr.header.hash, -headerCount + 1);
                if (hsr.err) {
                    return hsr.err;
                }
                if (hsr.headers[0].preBlockHash !== req.from) {
                    // 中间changeBest了，返回not found
                    respErr = error_code_1.ErrorCode.RESULT_NOT_FOUND;
                    break;
                }
                for (let h of hsr.headers) {
                    let err = h.encode(hwriter);
                    if (err) {
                        this.logger.error(`encode header ${h.hash} failed`);
                        respErr = error_code_1.ErrorCode.RESULT_NOT_FOUND;
                    }
                }
            } while (false);
            let rawHeaders = hwriter.render();
            let pwriter = net_1.PackageStreamWriter.fromPackage(SYNC_CMD_TYPE.header, { count: headerCount, request: req, error: respErr }, rawHeaders.length);
            pwriter.writeData(rawHeaders);
            conn.addPendingWriter(pwriter);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        else {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
    }
}
exports.ChainNode = ChainNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NoYWluL2NoYWluX25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFDakMsbUNBQW9DO0FBRXBDLDhDQUF3QztBQUV4Qyx3Q0FBZ0c7QUFFaEcsb0NBQXFIO0FBRXJILDBDQUE2QztBQUM3QywwQ0FBNkM7QUFFN0MsZ0NBQXFGO0FBRXJGLElBQVksYUFPWDtBQVBELFdBQVksYUFBYTtJQUNyQiw0REFBZ0MsQ0FBQTtJQUNoQyxzREFBNkIsQ0FBQTtJQUM3QiwwREFBK0IsQ0FBQTtJQUMvQixvREFBNEIsQ0FBQTtJQUM1Qiw4Q0FBeUIsQ0FBQTtJQUN6QixnREFBMEIsQ0FBQTtBQUM5QixDQUFDLEVBUFcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFPeEI7QUFpQ0QsZUFBdUIsU0FBUSxxQkFBWTtJQUN2QyxZQUFZLE9BQXlCO1FBQ2pDLEtBQUssRUFBRSxDQUFDO1FBcWRGLHNCQUFpQixHQUd0QjtZQUNBLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBRTtZQUNsQixPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUU7U0FDckIsQ0FBQztRQUNPLG1CQUFjLEdBQW1ELEVBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksS0FBSyxFQUFFLEVBQUMsQ0FBQztRQUM1RyxtQkFBYyxHQUE2QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JELHdCQUFtQixHQUd4QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBS0wsU0FBSSxHQUFHO1lBQ2IsV0FBVyxDQUFDLElBQWUsRUFBRSxLQUFZLEVBQUUsSUFBK0I7Z0JBQ3RFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMs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