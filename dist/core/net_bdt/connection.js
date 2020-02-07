"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const net_1 = require("../net");
const assert = require("assert");
const { P2P } = require('bdt-p2p');
class BdtConnection extends net_1.IConnection {
    constructor(options) {
        super();
        this.m_nTimeDelta = 0;
        assert(options.bdt_connection);
        this.m_bdt_connection = options.bdt_connection;
        this.m_bdt_connection.on(P2P.Connection.EVENT.drain, () => {
            this.emit('drain');
        });
        this.m_bdt_connection.on(P2P.Connection.EVENT.data, (data) => {
            this.emit('data', data);
        });
        this.m_bdt_connection.on(P2P.Connection.EVENT.error, () => {
            if (this.listenerCount('error')) {
                this.emit('error', this, error_code_1.ErrorCode.RESULT_EXCEPTION);
            }
        });
        this.m_bdt_connection.on(P2P.Connection.EVENT.end, () => {
            // 对端主动关闭了连接，这里先当break一样处理
            if (this.listenerCount('error')) {
                this.emit('error', this, error_code_1.ErrorCode.RESULT_EXCEPTION);
            }
        });
        this.m_bdt_connection.on(P2P.Connection.EVENT.close, () => {
            this.emit('close', this);
        });
        this.m_remote = options.remote;
    }
    send(data) {
        if (this.m_bdt_connection) {
            return this.m_bdt_connection.send(data);
        }
        return -1;
    }
    close() {
        if (this.m_bdt_connection) {
            this.m_bdt_connection.removeAllListeners('drain');
            this.m_bdt_connection.removeAllListeners('data');
            this.m_bdt_connection.removeAllListeners('error');
            this.m_bdt_connection.close();
            delete this.m_bdt_connection;
        }
        return Promise.resolve(error_code_1.ErrorCode.RESULT_OK);
    }
    destroy() {
        if (this.m_bdt_connection) {
            this.m_bdt_connection.removeAllListeners('drain');
            this.m_bdt_connection.removeAllListeners('data');
            this.m_bdt_connection.removeAllListeners('error');
            this.m_bdt_connection.close(true);
            delete this.m_bdt_connection;
        }
        return Promise.resolve();
    }
    get remote() {
        return this.m_remote;
    }
    set remote(s) {
        this.m_remote = s;
    }
    get network() {
        return this.m_network;
    }
    set network(s) {
        this.m_network = s;
    }
    getTimeDelta() {
        return this.m_nTimeDelta;
    }
    setTimeDelta(n) {
        this.m_nTimeDelta = n;
    }
}
exports.BdtConnection = BdtConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldF9iZHQvY29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUN4QyxnQ0FBbUM7QUFDbkMsaUNBQWlDO0FBRWpDLE1BQU0sRUFBQyxHQUFHLEVBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakMsbUJBQTJCLFNBQVEsaUJBQVc7SUFLMUMsWUFBWSxPQUE4QztRQUN0RCxLQUFLLEVBQUUsQ0FBQztRQUZGLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBRy9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFFL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQWMsRUFBRSxFQUFFO1lBQ25FLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ3RELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFF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