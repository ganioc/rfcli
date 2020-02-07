"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const net_1 = require("net");
const net_2 = require("../net");
const connection_1 = require("./connection");
class TcpNode extends net_2.INode {
    constructor(options) {
        super({ network: options.network, peerid: options.peerid, logger: options.logger, loggerOptions: options.loggerOptions });
        this.m_options = Object.create(null);
        Object.assign(this.m_options, options);
        this.m_server = new net_1.Server();
    }
    async _peeridToIpAddress(peerid) {
        return { err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT };
    }
    async _connectTo(peerid) {
        let par = await this._peeridToIpAddress(peerid);
        if (par.err) {
            return { err: par.err };
        }
        let tcp = new net_1.Socket();
        return new Promise((resolve, reject) => {
            tcp.once('error', (e) => {
                tcp.removeAllListeners('connect');
                resolve({ err: error_code_1.ErrorCode.RESULT_EXCEPTION });
            });
            tcp.connect(par.ip);
            tcp.once('connect', () => {
                let connNodeType = this._nodeConnectionType();
                let connNode = (new connNodeType(this, { socket: tcp, remote: peerid }));
                tcp.removeAllListeners('error');
                tcp.on('error', (e) => {
                    this.emit('error', connNode, error_code_1.ErrorCode.RESULT_EXCEPTION);
                });
                resolve({ err: error_code_1.ErrorCode.RESULT_OK, conn: connNode });
            });
        });
    }
    _connectionType() {
        return connection_1.TcpConnection;
    }
    uninit() {
        let closeServerOp;
        if (this.m_server) {
            closeServerOp = new Promise((resolve) => {
                this.m_server.close(resolve);
            });
        }
        if (closeServerOp) {
            return Promise.all([closeServerOp, super.uninit()]);
        }
        else {
            return super.uninit();
        }
    }
    listen() {
        return new Promise((resolve, reject) => {
            this.m_server.listen(this.m_options.port, this.m_options.host);
            this.m_server.once('listening', () => {
                this.m_server.removeAllListeners('error');
                this.m_server.on('connection', (tcp) => {
                    let connNodeType = this._nodeConnectionType();
                    let connNode = (new connNodeType(this, { socket: tcp, remote: `${tcp.remoteAddress}:${tcp.remotePort}` }));
                    tcp.on('error', (e) => {
                        this.emit('error', connNode, error_code_1.ErrorCode.RESULT_EXCEPTION);
                    });
                    this._onInbound(connNode);
                });
                resolve(error_code_1.ErrorCode.RESULT_OK);
            });
            this.m_server.once('error', (e) => {
                this.m_server.removeAllListeners('listening');
                this.m_logger.error(`tcp listen on ${this.m_options.host}:${this.m_options.port} error `, e);
                resolve(error_code_1.ErrorCode.RESULT_EXCEPTION);
            });
        });
    }
}
exports.TcpNode = TcpNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldF90Y3Avbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUN4Qyw2QkFBbUM7QUFDbkMsZ0NBQTBEO0FBQzFELDZDQUEyQztBQUczQyxhQUFxQixTQUFRLFdBQUs7SUFJOUIsWUFBWSxPQUFzRjtRQUM5RixLQUFLLENBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUM7UUFDeEgsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksWUFBTSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVTLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFjO1FBQzdDLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxrQkFBa0IsRUFBQyxDQUFDO0lBQy9DLENBQUM7SUFFUyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWM7UUFDckMsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEQsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLFlBQU0sRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sSUFBSSxPQUFPLENBQTBDLENBQUMsT0FBTyxFQUFFLE1B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