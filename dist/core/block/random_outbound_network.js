"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const network_1 = require("./network");
// import { parseCommand } from '../../client';
const util_1 = require("util");
const DEFAULT_MIN_OUTBOUND = 8;
class RandomOutNetwork extends network_1.Network {
    constructor(options) {
        super(options);
    }
    setInstanceOptions(options) {
        super.setInstanceOptions(options);
        this.m_minOutbound = options.minOutbound;
        this.m_checkCycle = options.checkCycle ? options.checkCycle : 1000;
    }
    parseInstanceOptions(options) {
        let por = super.parseInstanceOptions(options);
        if (por.err) {
            return { err: por.err };
        }
        let value = Object.create(por.value);
        if (!util_1.isNullOrUndefined(options.parsed.minOutbound)) {
            value.minOutbound = options.parsed.minOutbound;
        }
        else if (options.origin.has('minOutbound')) {
            value.minOutbound = parseInt(options.origin.get('minOutbound'));
        }
        else {
            value.minOutbound = DEFAULT_MIN_OUTBOUND;
        }
        if (!util_1.isNullOrUndefined(options.parsed.checkCycle)) {
            value.checkCycle = options.parsed.checkCycle;
        }
        else if (options.origin.has('checkCycle')) {
            value.checkCycle = parseInt(options.origin.get('checkCycle'));
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    uninit() {
        if (this.m_checkOutboundTimer) {
            clearInterval(this.m_checkOutboundTimer);
            delete this.m_checkOutboundTimer;
        }
        return super.uninit();
    }
    async initialOutbounds() {
        this.logger.debug(`initialOutbounds`);
        if (this.m_minOutbound === 0) {
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        let err = await this._newOutbounds(this.m_minOutbound);
        if (err && err !== error_code_1.ErrorCode.RESULT_SKIPPED) {
            return err;
        }
        this.m_checkOutboundTimer = setInterval(() => {
            let next = this.m_minOutbound - (this.m_connecting.size + this.m_node.getConnnectionCount());
            if (next > 0) {
                this.logger.debug(`node need more ${next} connection, call  _newOutbounds`);
                this._newOutbounds(next);
            }
        }, this.m_checkCycle);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _newOutbounds(count, callback) {
        let peerids = this.m_nodeStorage.get('all');
        let willConn = new Set();
        peerids.forEach((pid) => {
            willConn.add(pid);
        });
        this.logger.debug(`will connect to peers from node storage: `, willConn);
        if (willConn.size < count) {
            let excludes = [];
            for (const pid of this.m_connecting) {
                excludes.push(pid);
            }
            for (const pid of willConn) {
                excludes.push(pid);
            }
            for (const ib of this.node.getInbounds()) {
                excludes.push(ib.remote);
            }
            for (const ob of this.node.getOutbounds()) {
                excludes.push(ob.remote);
            }
            let result = await this.m_node.randomPeers(count, excludes);
            if (result.peers.length === 0) {
                result.peers = this.m_nodeStorage.staticNodes.filter((value) => !excludes.includes(value));
                result.err = result.peers.length > 0 ? error_code_1.ErrorCode.RESULT_OK : error_code_1.ErrorCode.RESULT_SKIPPED;
            }
            if (result.err === error_code_1.ErrorCode.RESULT_OK) {
                this.logger.debug(`will connect to peers from random peers: `, result.peers);
                for (let pid of result.peers) {
                    willConn.add(pid);
                }
            }
            else if (result.err === error_code_1.ErrorCode.RESULT_SKIPPED) {
                this.logger.debug(`cannot find any new peers from randomPeers`);
            }
            else {
                this.logger.error(`random peers failed for : `, result.err);
            }
        }
        return await this._connectTo(willConn, callback);
    }
}
exports.RandomOutNetwork = RandomOutNetwork;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tX291dGJvdW5kX25ldHdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9ibG9jay9yYW5kb21fb3V0Ym91bmRfbmV0d29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwQztBQUMxQyx1Q0FBNEU7QUFDNUUsK0NBQStDO0FBQy9DLCtCQUF5QztBQUd6QyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUMvQixzQkFBOEIsU0FBUSxpQkFBTztJQUN6QyxZQUFZLE9BQXVCO1FBQy9CLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBTUQsa0JBQWtCLENBQUMsT0FBWTtRQUMzQixLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxPQUFrRDtRQUNuRSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDM0I7UUFDRCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsd0JBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUNoRCxLQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1NBQ2xEO2FB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