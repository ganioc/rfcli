"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const connection_1 = require("./connection");
const writer_1 = require("./writer");
const reader_1 = require("./reader");
const events_1 = require("events");
let assert = require('assert');
const version_1 = require("./version");
const reader_2 = require("../lib/reader");
const writer_2 = require("../lib/writer");
const logger_util_1 = require("../lib/logger_util");
const util_1 = require("util");
var CMD_TYPE;
(function (CMD_TYPE) {
    CMD_TYPE[CMD_TYPE["version"] = 1] = "version";
    CMD_TYPE[CMD_TYPE["versionAck"] = 2] = "versionAck";
    CMD_TYPE[CMD_TYPE["userCmd"] = 16] = "userCmd";
})(CMD_TYPE = exports.CMD_TYPE || (exports.CMD_TYPE = {}));
class INode extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_inConn = [];
        this.m_outConn = [];
        this.m_remoteMap = new Map();
        this.m_peerid = options.peerid;
        this.m_network = options.network;
        this.m_logger = logger_util_1.initLogger(options);
    }
    async randomPeers(count, excludes) {
        return { err: error_code_1.ErrorCode.RESULT_NO_IMP, peers: [] };
    }
    static isValidPeerid(peerid) {
        return -1 === peerid.indexOf('^');
    }
    static isValidNetwork(network) {
        return -1 === network.indexOf('^');
    }
    static fullPeerid(network, peerid) {
        return `${network}^${peerid}`;
    }
    static splitFullPeerid(fpeerid) {
        const spliter = fpeerid.indexOf('^');
        if (-1 === spliter) {
            return undefined;
        }
        const parts = fpeerid.split('^');
        return { network: parts[0], peerid: parts[1] };
    }
    set genesisHash(genesis_hash) {
        this.m_genesis = genesis_hash;
    }
    set logger(logger) {
        this.m_logger = logger;
    }
    get logger() {
        return this.m_logger;
    }
    get peerid() {
        return this.m_peerid;
    }
    get network() {
        return this.m_network;
    }
    async init() {
    }
    dumpConns() {
        let ret = [];
        this.m_inConn.forEach((element) => {
            ret.push(` <= ${element.remote}`);
        });
        this.m_outConn.forEach((element) => {
            ret.push(` => ${element.remote}`);
        });
        return ret;
    }
    uninit() {
        this.removeAllListeners('inbound');
        this.removeAllListeners('error');
        this.removeAllListeners('ban');
        let ops = [];
        for (let conn of this.m_inConn) {
            ops.push(conn.destroy());
        }
        for (let conn of this.m_outConn) {
            ops.push(conn.destroy());
        }
        this.m_inConn = [];
        this.m_outConn = [];
        this.m_remoteMap.clear();
        return Promise.all(ops);
    }
    async listen() {
        return error_code_1.ErrorCode.RESULT_NO_IMP;
    }
    async connectTo(peerid) {
        let result = await this._connectTo(peerid);
        if (!result.conn) {
            return { err: result.err, peerid };
        }
        let conn = result.conn;
        conn.remote = peerid;
        conn.network = this.network;
        let ver = new version_1.Version();
        conn.version = ver;
        if (!this.m_genesis || !this.m_peerid) {
            this.m_logger.error(`connectTo failed for genesis or peerid not set`);
            assert(false, `${this.m_peerid} has not set genesis`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE, peerid };
        }
        ver.genesis = this.m_genesis;
        ver.peerid = this.m_peerid;
        let err = await new Promise((resolve) => {
            conn.once('pkg', (pkg) => {
                conn.removeListener('error', fn);
                if (pkg.header.cmdType === CMD_TYPE.versionAck) {
                    if (pkg.body.isSupport) {
                        // 忽略网络传输时间
                        let nTimeDelta = pkg.body.timestamp - Date.now();
                        conn.setTimeDelta(nTimeDelta);
                        resolve(error_code_1.ErrorCode.RESULT_OK);
                    }
                    else {
                        this.logger.warn(`close conn to ${peerid} by unSupport`);
                        conn.destroy();
                        resolve(error_code_1.ErrorCode.RESULT_VER_NOT_SUPPORT);
                    }
                }
                else {
                    this.logger.warn(`close conn to ${peerid} by non versionAck pkg`);
                    conn.destroy();
                    resolve(error_code_1.ErrorCode.RESULT_INVALID_STATE);
                }
            });
            let writer = new writer_2.BufferWriter();
            let encodeErr = ver.encode(writer);
            if (encodeErr) {
                this.m_logger.error(`version instance encode failed `, ver);
                resolve(encodeErr);
                return;
            }
            let buf = writer.render();
            let verWriter = writer_1.PackageStreamWriter.fromPackage(CMD_TYPE.version, {}, buf.length).writeData(buf);
            conn.addPendingWriter(verWriter);
            let fn = (_conn, _err) => {
                _conn.close();
                resolve(_err);
            };
            conn.once('error', fn);
        });
        if (err) {
            return { err, peerid };
        }
        let other = this.getConnection(peerid);
        if (other) {
            if (conn.version.compare(other.version) > 0) {
                this.logger.warn(`close conn to ${peerid} by already exist conn`);
                conn.destroy();
                return { err: error_code_1.ErrorCode.RESULT_ALREADY_EXIST, peerid };
            }
            else {
                this.logger.warn(`close other conn to ${peerid} by already exist conn`);
                this.closeConnection(other, true);
            }
        }
        this.m_outConn.push(result.conn);
        this.m_remoteMap.set(peerid, result.conn);
        conn.on('error', (_conn, _err) => {
            this.closeConnection(result.conn);
            this.emit('error', result.conn, _err);
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, peerid, conn };
    }
    async broadcast(writer, options) {
        let nSend = 0;
        let nMax = 999999999;
        if (options && !util_1.isNullOrUndefined(options.count)) {
            if (!options.count) {
                return { err: error_code_1.ErrorCode.RESULT_OK, count: 0 };
            }
            nMax = options.count;
        }
        let conns = this.m_inConn.slice(0);
        conns.push(...this.m_outConn);
        if (!conns.length) {
            return { err: error_code_1.ErrorCode.RESULT_OK, count: 0 };
        }
        let rstart = Math.floor(Math.random() * (conns.length - 1));
        for (let i = rstart; i < conns.length; ++i) {
            const conn = conns[i];
            if (nSend === nMax) {
                return { err: error_code_1.ErrorCode.RESULT_OK, count: nSend };
            }
            if (!options || !options.filter || options.filter(conn)) {
                conn.addPendingWriter(writer.clone());
                nSend++;
            }
        }
        for (let i = 0; i < rstart; ++i) {
            const conn = conns[i];
            if (nSend === nMax) {
                return { err: error_code_1.ErrorCode.RESULT_OK, count: nSend };
            }
            if (!options || !options.filter || options.filter(conn)) {
                conn.addPendingWriter(writer.clone());
                nSend++;
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, count: nSend };
    }
    isInbound(conn) {
        for (let c of this.m_inConn) {
            if (c === conn) {
                return true;
            }
        }
        return false;
    }
    getOutbounds() {
        const c = this.m_outConn;
        return c;
    }
    getInbounds() {
        const c = this.m_inConn;
        return c;
    }
    getConnnectionCount() {
        return this.m_outConn.length + this.m_inConn.length;
    }
    getConnection(remote) {
        return this.m_remoteMap.get(remote);
    }
    isOutbound(conn) {
        for (let c of this.m_outConn) {
            if (c === conn) {
                return true;
            }
        }
        return false;
    }
    banConnection(remote) {
        let conn = this.m_remoteMap.get(remote);
        if (conn) {
            this.closeConnection(conn, true);
        }
    }
    closeConnection(conn, destroy = false) {
        conn.removeAllListeners('error');
        conn.removeAllListeners('pkg');
        let index = 0;
        do {
            for (let c of this.m_outConn) {
                if (c === conn) {
                    this.m_outConn.splice(index, 1);
                    break;
                }
                index++;
            }
            index = 0;
            for (let c of this.m_inConn) {
                if (c === conn) {
                    this.m_inConn.splice(index, 1);
                    break;
                }
                index++;
            }
        } while (false);
        this.m_remoteMap.delete(conn.remote);
        if (destroy) {
            conn.destroy();
        }
        else {
            conn.close();
        }
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    _onInbound(inbound) {
        inbound.once('pkg', (pkg) => {
            inbound.removeListener('error', fn);
            if (pkg.header.cmdType === CMD_TYPE.version) {
                let buff = pkg.data[0];
                let dataReader = new reader_2.BufferReader(buff);
                let ver = new version_1.Version();
                inbound.version = ver;
                let err = ver.decode(dataReader);
                if (err) {
                    this.m_logger.warn(`recv version in invalid format from ${inbound.remote} `);
                    inbound.destroy();
                    return;
                }
                // 检查对方包里的genesis_hash是否对应得上
                if (ver.genesis !== this.m_genesis) {
                    this.m_logger.warn(`recv version genesis ${ver.genesis} not match ${this.m_genesis} from ${inbound.remote} `);
                    inbound.destroy();
                    return;
                }
                // 忽略网络传输时间
                let nTimeDelta = ver.timestamp - Date.now();
                inbound.remote = ver.peerid;
                inbound.network = this.network;
                inbound.setTimeDelta(nTimeDelta);
                let isSupport = true;
                let ackWriter = writer_1.PackageStreamWriter.fromPackage(CMD_TYPE.versionAck, { isSupport, timestamp: Date.now() }, 0);
                inbound.addPendingWriter(ackWriter);
                if (!isSupport) {
                    this.m_logger.warn(`close inbound conn to ${inbound.fullRemote} by unSupport`);
                    inbound.destroy();
                    return;
                }
                let other = this.getConnection(inbound.remote);
                if (other) {
                    if (inbound.version.compare(other.version) > 0) {
                        this.m_logger.warn(`close inbound conn to ${inbound.fullRemote} by already exist`);
                        inbound.destroy();
                        return;
                    }
                    else {
                        this.m_logger.warn(`close other conn to ${inbound.fullRemote} by already exist`);
                        this.closeConnection(other, true);
                    }
                }
                this.m_inConn.push(inbound);
                this.m_remoteMap.set(ver.peerid, inbound);
                inbound.on('error', (conn, _err) => {
                    this.closeConnection(inbound);
                    this.emit('error', inbound, _err);
                });
                this.emit('inbound', inbound);
            }
            else {
                this.m_logger.warn(`close inbound conn to ${inbound.fullRemote} by non version pkg`);
                inbound.destroy();
            }
        });
        let fn = () => {
            inbound.close();
        };
        inbound.once('error', fn);
    }
    async _connectTo(peerid) {
        return { err: error_code_1.ErrorCode.RESULT_NO_IMP };
    }
    _connectionType() {
        return connection_1.IConnection;
    }
    _nodeConnectionType() {
        let superClass = this._connectionType();
        return class extends superClass {
            constructor(...args) {
                assert(args.length);
                let thisNode = args[0];
                super(...(args.slice(1)));
                this.m_pendingWriters = [];
                this.m_reader = new reader_1.PackageStreamReader();
                this.m_reader.start(this);
                this.m_reader.on('pkg', (pkg) => {
                    super.emit('pkg', pkg);
                });
                // 接收到 reader的传出来的error 事件后, emit ban事件, 给上层的chain_node去做处理
                // 这里只需要emit给上层, 最好不要处理其他逻辑
                this.m_reader.on('error', (err, column) => {
                    let remote = this.remote;
                    thisNode.emit('ban', remote);
                });
            }
            get fullRemote() {
                return INode.fullPeerid(this.network, this.remote);
            }
            addPendingWriter(writer) {
                let onFinish = () => {
                    let _writer = this.m_pendingWriters.splice(0, 1)[0];
                    _writer.close();
                    if (this.m_pendingWriters.length) {
                        this.m_pendingWriters[0].on(writer_1.WRITER_EVENT.finish, onFinish);
                        this.m_pendingWriters[0].on(writer_1.WRITER_EVENT.error, onFinish);
                        this.m_pendingWriters[0].bind(this);
                    }
                };
                if (!this.m_pendingWriters.length) {
                    writer.on(writer_1.WRITER_EVENT.finish, onFinish);
                    writer.on(writer_1.WRITER_EVENT.error, onFinish);
                    writer.bind(this);
                }
                this.m_pendingWriters.push(writer);
            }
            async close() {
                for (let w of this.m_pendingWriters) {
                    w.close();
                }
                this.m_pendingWriters = [];
                return await super.close();
            }
        };
    }
}
exports.INode = INode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldC9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTBDO0FBQzFDLDZDQUEyQztBQUUzQyxxQ0FBNkQ7QUFDN0QscUNBQStDO0FBQy9DLG1DQUFzQztBQUN0QyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsdUNBQWtDO0FBQ2xDLDBDQUE2QztBQUM3QywwQ0FBNkM7QUFDN0Msb0RBQTZFO0FBQzdFLCtCQUF5QztBQUV6QyxJQUFZLFFBS1g7QUFMRCxXQUFZLFFBQVE7SUFDaEIsNkNBQWEsQ0FBQTtJQUNiLG1EQUFpQixDQUFBO0lBRWpCLDhDQUFjLENBQUE7QUFDbEIsQ0FBQyxFQUxXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBS25CO0FBV0QsV0FBbUIsU0FBUSxxQkFBWTtJQW9DbkMsWUFBWSxPQUEwRDtRQUNsRSxLQUFLLEVBQUUsQ0FBQztRQU5GLGFBQVEsR0FBcUIsRUFBRSxDQUFDO1FBQ2hDLGNBQVMsR0FBcUIsRUFBRSxDQUFDO1FBQ2pDLGdCQUFXLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUM7UUFLM0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLHdCQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQXhDTSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQWEsRUFBRSxRQUFrQjtRQUN0RCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFjO1FBQy9CLE9BQU8sQ0FBQyxD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