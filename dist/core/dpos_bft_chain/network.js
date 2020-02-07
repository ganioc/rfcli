"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random_outbound_network_1 = require("../block/random_outbound_network");
class DposBftNetwork extends random_outbound_network_1.RandomOutNetwork {
    constructor() {
        super(...arguments);
        this.m_validators = [];
    }
    setValidators(validators) {
        this.m_validators = [];
        this.m_validators.push(...validators);
    }
    getValidators() {
        const v = this.m_validators;
        return v;
    }
    uninit() {
        if (this.m_checkMinerOutboundTimer) {
            clearInterval(this.m_checkMinerOutboundTimer);
            delete this.m_checkMinerOutboundTimer;
        }
        return super.uninit();
    }
    async initialOutbounds() {
        let err = await super.initialOutbounds();
        this._checkConnections();
        this.m_checkMinerOutboundTimer = setInterval(() => {
            this._checkConnections();
        }, 1000);
        return err;
    }
    _checkConnections() {
        let willConn = new Set();
        for (let v of this.m_validators) {
            if (this._onWillConnectTo(v)) {
                willConn.add(v);
            }
        }
        this._connectTo(willConn);
    }
    broadcastToValidators(writer) {
        let validators = new Set(this.m_validators);
        return this.m_node.broadcast(writer, { count: validators.size, filter: (conn) => {
                return validators.has(conn.remote);
            } });
    }
}
exports.DposBftNetwork = DposBftNetwork;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0d29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Rwb3NfYmZ0X2NoYWluL25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw4RUFBa0U7QUFHbEUsb0JBQTRCLFNBQVEsMENBQWdCO0lBQXBEOztRQUNjLGlCQUFZLEdBQWEsRUFBRSxDQUFDO0lBaUQxQyxDQUFDO0lBOUNHLGFBQWEsQ0FBQyxVQUFvQjtRQUM5QixJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxhQUFhO1FBQ1QsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUM1QixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFTSxNQUFNO1FBQ1QsSUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7WUFDaEMsYUFBYSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDO1NBQ3pDO1FBRUQsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxnQkFBZ0I7UUFDekIsSUFBSSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUV6QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMseUJBQXlCLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUM5QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFVCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFUyxpQkFBaUI7UUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUN6QixLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDN0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzFCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkI7U0FDSjtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLHFCQUFxQixDQUFDLE1BQTJCO1FBQ3BELElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQW9CLEVBQUUsRUFBRTtnQkFDM0YsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFPLENBQUMsQ0FBQztZQUN4QyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNKO0FBbERELHdDQWtEQyJ9