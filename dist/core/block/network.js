"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const events_1 = require("events");
const error_code_1 = require("../error_code");
const node_storage_1 = require("./node_storage");
const block_1 = require("./block");
const util_1 = require("util");
const { LogShim } = require('../lib/log_shim');
var BAN_LEVEL;
(function (BAN_LEVEL) {
    BAN_LEVEL[BAN_LEVEL["minute"] = 1] = "minute";
    BAN_LEVEL[BAN_LEVEL["hour"] = 60] = "hour";
    BAN_LEVEL[BAN_LEVEL["day"] = 1440] = "day";
    BAN_LEVEL[BAN_LEVEL["month"] = 43200] = "month";
    BAN_LEVEL[BAN_LEVEL["forever"] = 0] = "forever";
})(BAN_LEVEL = exports.BAN_LEVEL || (exports.BAN_LEVEL = {}));
var NetworkBroadcastStrategy;
(function (NetworkBroadcastStrategy) {
    NetworkBroadcastStrategy[NetworkBroadcastStrategy["transaction"] = 1] = "transaction";
    NetworkBroadcastStrategy[NetworkBroadcastStrategy["headers"] = 2] = "headers";
})(NetworkBroadcastStrategy = exports.NetworkBroadcastStrategy || (exports.NetworkBroadcastStrategy = {}));
class Network extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_connecting = new Set();
        this.m_ignoreBan = false;
        this.m_broadcastStrategies = new Map();
        this.m_node = options.node;
        this.m_node.logger = options.logger;
        this.m_logger = new LogShim(options.logger).bind(`[network: ${this.name} peerid: ${this.peerid}]`, true).log;
        this.m_dataDir = options.dataDir;
        this.m_blockHeaderType = options.blockHeaderType;
        this.m_transactionType = options.transactionType;
        this.m_receiptType = options.receiptType;
        this.m_headerStorage = options.headerStorage;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    prependListener(event, listener) {
        return super.prependListener(event, listener);
    }
    prependOnceListener(event, listener) {
        return super.prependOnceListener(event, listener);
    }
    parseInstanceOptions(options) {
        let value = Object.create(null);
        value.ignoreBan = options.origin.get('ignoreBan');
        value.nodeCacheSize = options.origin.get('nodeCacheSize');
        let strategyOptNames = {
            broadcast_limit_transaction: NetworkBroadcastStrategy.transaction,
            broadcast_limit_headers: NetworkBroadcastStrategy.headers
        };
        value.strategy = new Map();
        for (const [n, s] of Object.entries(strategyOptNames)) {
            const ss = options.origin.get(n);
            if (ss) {
                let count;
                count = Number.parseInt(ss);
                let filter;
                if (isNaN(count)) {
                    const address = ss.split(',');
                    count = address.length;
                    filter = (conn) => address.indexOf(conn.remote) !== -1;
                }
                value.strategy.set(s, { count, filter });
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    setInstanceOptions(options) {
        this.m_ignoreBan = !!options.ignoreBan;
        this.m_nodeStorage = new node_storage_1.NodeStorage({
            count: options.nodeCacheSize ? options.nodeCacheSize : 50,
            dataDir: this.m_dataDir,
            logger: this.m_logger
        });
        for (const [n, s] of options.strategy) {
            this.addBroadcastStrategy(n, s);
        }
    }
    async init() {
        this.m_node.on('error', (conn, err) => {
            this.emit('error', conn.remote);
        });
        // 收到net/node的ban事件, 调用 ChainNode的banConnection方法做封禁处理
        // 日期先设置为按天
        this.m_node.on('ban', (remote) => {
            this.banConnection(remote, BAN_LEVEL.day);
        });
        // 读取创始块的hash值， 并将其传入 net/node
        const result = await this.m_headerStorage.getHeader(0);
        const genesis_hash = result.header.hash;
        this.m_node.genesisHash = genesis_hash;
        await this.m_node.init();
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        return this.m_node.uninit();
    }
    newTransaction() {
        return new this.m_transactionType();
    }
    newBlockHeader() {
        return new this.m_blockHeaderType();
    }
    newBlock(header) {
        let block = new block_1.Block({
            header,
            headerType: this.m_blockHeaderType,
            transactionType: this.m_transactionType,
            receiptType: this.m_receiptType
        });
        return block;
    }
    async initialOutbounds() {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    get logger() {
        return this.m_logger;
    }
    get node() {
        return this.m_node;
    }
    get peerid() {
        return this.m_node.peerid;
    }
    get name() {
        return this.m_node.network;
    }
    get headerStorage() {
        return this.m_headerStorage;
    }
    async _connectTo(willConn, callback) {
        if (!willConn.size) {
            if (callback) {
                callback(0);
            }
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        let ops = [];
        for (let peer of willConn) {
            if (this._onWillConnectTo(peer)) {
                this.m_connecting.add(peer);
                ops.push(this.m_node.connectTo(peer));
            }
        }
        if (ops.length === 0) {
            if (callback) {
                callback(0);
            }
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        Promise.all(ops).then((results) => {
            let connCount = 0;
            for (let r of results) {
                this.m_connecting.delete(r.peerid);
                this.logger.debug(`connect to ${r.peerid} err: `, r.err);
                if (r.conn) {
                    this.m_nodeStorage.add(r.conn.remote);
                    this.emit('outbound', r.conn);
                    ++connCount;
                }
                else {
                    if (r.err !== error_code_1.ErrorCode.RESULT_ALREADY_EXIST) {
                        this.m_nodeStorage.remove(r.peerid);
                    }
                    if (r.err === error_code_1.ErrorCode.RESULT_VER_NOT_SUPPORT) {
                        this.m_nodeStorage.ban(r.peerid, BAN_LEVEL.month);
                    }
                }
            }
            if (callback) {
                callback(connCount);
            }
        });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _isBan(peerid) {
        if (this.m_ignoreBan) {
            return false;
        }
        return this.m_nodeStorage.isBan(peerid);
    }
    async listen() {
        this.m_node.on('inbound', (inbound) => {
            if (this._isBan(inbound.remote)) {
                this.logger.warn(`new inbound from ${inbound.remote} ignored for ban`);
                this.m_node.closeConnection(inbound);
            }
            else {
                this.logger.info(`new inbound from `, inbound.remote);
                this.emit('inbound', inbound);
            }
        });
        return await this.m_node.listen();
    }
    banConnection(remote, level) {
        if (this.m_ignoreBan) {
            return;
        }
        this.m_logger.warn(`banned peer ${remote} for ${level}`);
        this.m_nodeStorage.ban(remote, level);
        this.m_node.banConnection(remote);
        this.emit('ban', remote);
    }
    _onWillConnectTo(peerid) {
        if (this._isBan(peerid)) {
            return false;
        }
        if (this.m_node.getConnection(peerid)) {
            return false;
        }
        if (this.m_connecting.has(peerid)) {
            return false;
        }
        if (this.m_node.peerid === peerid) {
            return false;
        }
        return true;
    }
    broadcast(writer, options) {
        let bopt = Object.create(null);
        if (options) {
            bopt.count = options.count;
            bopt.filter = options.filter;
            if (!util_1.isNullOrUndefined(options.strategy)) {
                const s = this.m_broadcastStrategies.get(options.strategy);
                if (s) {
                    if (!util_1.isNullOrUndefined(s.count)) {
                        bopt.count = util_1.isNullOrUndefined(bopt.count) ? s.count : Math.min(bopt.count, s.count);
                    }
                    if (s.filter) {
                        if (bopt.filter) {
                            let srcFilter = bopt.filter;
                            bopt.filter = (conn) => srcFilter(conn) && s.filter(conn);
                        }
                        else {
                            bopt.filter = s.filter;
                        }
                    }
                }
            }
        }
        return this.m_node.broadcast(writer, bopt);
    }
    addBroadcastStrategy(strategy, options) {
        this.m_broadcastStrategies.set(strategy, { count: options.count, filter: options.filter });
    }
}
exports.Network = Network;
class NetworkCreator {
    constructor(options) {
        this.m_network = new Map();
        this.m_node = new Map();
        this.m_logger = options.logger;
    }
    create(options) {
        let pnr = this._parseNetwork(options);
        if (pnr.err) {
            this.m_logger.error(`parseNetwork failed, err ${pnr.err}`);
            return { err: pnr.err };
        }
        const network = pnr.network;
        return { err: error_code_1.ErrorCode.RESULT_OK, network };
    }
    registerNetwork(type, instance) {
        this.m_network.set(type, instance);
    }
    _parseNetwork(options) {
        const { parsed } = options;
        if (!parsed.dataDir
            || !parsed.blockHeaderType
            || !parsed.headerStorage
            || !parsed.receiptType
            || !parsed.transactionType
            || !parsed.logger) {
            this.m_logger.error(`parsed should has contructor options`);
            return { err: error_code_1.ErrorCode.RESULT_PARSE_ERROR };
        }
        let type = options.parsed.netType;
        if (!type) {
            type = options.origin.get('netType');
        }
        if (!type) {
            this.m_logger.error(`parse network failed for netype missing`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        let node = options.parsed.node;
        if (!node) {
            const pr = this._parseNode(options.origin);
            if (pr.err) {
                this.m_logger.error(`parseNode failed, err ${pr.err}`);
                return { err: pr.err };
            }
            node = pr.node;
        }
        const instance = this.m_network.get(type);
        if (!instance) {
            this.m_logger.error(`parse network failed for invalid netType ${type}`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        let ops = Object.create(parsed);
        ops.node = node;
        ops.logger = this.m_logger;
        const ins = new instance(ops);
        return { err: error_code_1.ErrorCode.RESULT_OK, network: ins };
    }
    registerNode(type, instance) {
        this.m_node.set(type, instance);
    }
    _parseNode(commandOptions) {
        const type = commandOptions.get('net');
        if (type) {
            let ni = this.m_node.get(type);
            if (!ni) {
                this.m_logger.error(`parse node failed for invalid node ${type}`);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, node: ni(commandOptions) };
        }
        else {
            this.m_logger.error(`parse node failed for node missing`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
    }
}
exports.NetworkCreator = NetworkCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Jsb2NrL25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakMsbUNBQW9DO0FBRXBDLDhDQUF3QztBQUV4QyxpREFBK0Q7QUFDL0QsbUNBQTJDO0FBSzNDLCtCQUF5QztBQUN6QyxNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFpQjdDLElBQVksU0FNWDtBQU5ELFdBQVksU0FBUztJQUNqQiw2Q0FBVSxDQUFBO0lBQ1YsMENBQVMsQ0FBQTtJQUNULDBDQUFhLENBQUE7SUFDYiwrQ0FBb0IsQ0FBQTtJQUNwQiwrQ0FBVyxDQUFBO0FBQ2YsQ0FBQyxFQU5XLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBTXBCO0FBRUQsSUFBWSx3QkFHWDtBQUhELFdBQVksd0JBQXdCO0lBQ2hDLHFGQUFlLENBQUE7SUFDZiw2RUFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUhXLHdCQUF3QixHQUF4QixnQ0FBd0IsS0FBeEIsZ0NBQXdCLFFBR25DO0FBRUQsYUFBcUIsU0FBUSxxQkFBWTtJQUNyQyxZQUFZLE9BQXVCO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBY0YsaUJBQVksR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQVF4QyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQTJRN0IsMEJBQXFCLEdBQThFLElBQUksR0FBRyxFQUFFLENBQUM7UUEvUmpILElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FB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