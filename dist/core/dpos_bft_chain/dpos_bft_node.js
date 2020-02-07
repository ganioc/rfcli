"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const net_1 = require("../net");
const reader_1 = require("../lib/reader");
const writer_1 = require("../lib/writer");
const libAddress = require("../address");
var DPOS_BFT_SYNC_CMD_TYPE;
(function (DPOS_BFT_SYNC_CMD_TYPE) {
    DPOS_BFT_SYNC_CMD_TYPE[DPOS_BFT_SYNC_CMD_TYPE["tipSign"] = 23] = "tipSign";
    DPOS_BFT_SYNC_CMD_TYPE[DPOS_BFT_SYNC_CMD_TYPE["end"] = 24] = "end";
})(DPOS_BFT_SYNC_CMD_TYPE = exports.DPOS_BFT_SYNC_CMD_TYPE || (exports.DPOS_BFT_SYNC_CMD_TYPE = {}));
class DposBftChainNode extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_network = options.network;
        this.m_globalOptions = options.globalOptions;
        this.m_secret = options.secret;
        this.m_pubkey = libAddress.publicKeyFromSecretKey(this.m_secret);
        let initBound = (conns) => {
            for (let conn of conns) {
                this._beginSyncWithNode(conn);
            }
        };
        let connOut = this.m_network.node.getOutbounds();
        initBound(connOut);
        let connIn = this.m_network.node.getInbounds();
        initBound(connIn);
        this.m_network.on('inbound', (conn) => {
            this._beginSyncWithNode(conn);
        });
        this.m_network.on('outbound', (conn) => {
            this._beginSyncWithNode(conn);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    get logger() {
        return this.m_network.logger;
    }
    _beginSyncWithNode(conn) {
        conn.on('pkg', async (pkg) => {
            if (pkg.header.cmdType === DPOS_BFT_SYNC_CMD_TYPE.tipSign) {
                let reader = new reader_1.BufferReader(pkg.copyData());
                try {
                    let pubkey = reader.readBytes(33);
                    let sign = reader.readBytes(64);
                    let hash = reader.readHash().toString('hex');
                    this.emit('tipSign', { hash, pubkey, sign });
                }
                catch (e) {
                    this.logger.error(`dpos_bft decode tipSign failed `, e);
                    return;
                }
            }
        });
    }
    broadcastTip(pubkey, sign, header) {
        let writer = new writer_1.BufferWriter();
        writer.writeBytes(this.m_pubkey);
        writer.writeBytes(sign);
        writer.writeHash(header.hash);
        let data = writer.render();
        let pkg = net_1.PackageStreamWriter.fromPackage(DPOS_BFT_SYNC_CMD_TYPE.tipSign, null, data.length).writeData(data);
        this.m_network.broadcastToValidators(pkg);
    }
}
exports.DposBftChainNode = DposBftChainNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHBvc19iZnRfbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Rwb3NfYmZ0X2NoYWluL2Rwb3NfYmZ0X25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBc0M7QUFHdEMsZ0NBQThFO0FBRzlFLDBDQUE2QztBQUM3QywwQ0FBNkM7QUFDN0MseUNBQXlDO0FBRXpDLElBQVksc0JBR1g7QUFIRCxXQUFZLHNCQUFzQjtJQUM5QiwwRUFBK0IsQ0FBQTtJQUMvQixrRUFBMkIsQ0FBQTtBQUMvQixDQUFDLEVBSFcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFHakM7QUFRRCxzQkFBOEIsU0FBUSxxQkFBWTtJQU05QyxZQUFZLE9BQTJCO1FBQ25DLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDO1FBQ2xFLElBQUksU0FBUyxHQUFHLENBQUMsS0FBdUIsRUFBRSxFQUFFO1lBQ3hDLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUNwQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDakM7UUFDTCxDQUFDLENBQUM7UUFDRixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNqRCxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxF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