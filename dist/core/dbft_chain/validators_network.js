"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const error_code_1 = require("../error_code");
const chain_1 = require("../chain");
class ValidatorsNetwork extends chain_1.Network {
    constructor(options) {
        super(options);
        this.m_validators = [];
    }
    setInstanceOptions(options) {
        super.setInstanceOptions(options);
        this.m_minConnectionRate = options.minConnectionRate;
        this.setValidators([options.initialValidator]);
    }
    parseInstanceOptions(options) {
        let por = super.parseInstanceOptions(options);
        if (por.err) {
            return { err: por.err };
        }
        let value = Object.create(por.value);
        if (!util_1.isNullOrUndefined(options.parsed.minConnectionRate)) {
            value.minConnectionRate = options.parsed.minConnectionRate;
        }
        else if (options.origin.has('minConnectionRate')) {
            value.minConnectionRate = parseInt(options.origin.get('minConnectionRate'));
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (!util_1.isNullOrUndefined(options.parsed.initialValidator)) {
            value.initialValidator = options.parsed.initialValidator;
        }
        else if (options.origin.has('initialValidator')) {
            value.initialValidator = options.origin.get('initialValidator');
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    setValidators(validators) {
        this.m_validators = [];
        this.m_validators.push(...validators);
    }
    getValidators() {
        const v = this.m_validators;
        return v;
    }
    _getMinOutbound() {
        return Math.ceil(this.m_validators.length * this.m_minConnectionRate);
    }
    async initialOutbounds() {
        this._checkConnections();
        this.m_checkOutboundTimer = setInterval(() => {
            this._checkConnections();
        }, 1000);
        let bSelf = false;
        for (let v of this.m_validators) {
            if (v === this.node.peerid) {
                bSelf = true;
                break;
            }
        }
        if (this.m_validators.length === 0 || (bSelf && this.m_validators.length === 1)) {
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        if (this.m_checkOutboundTimer) {
            clearInterval(this.m_checkOutboundTimer);
            delete this.m_checkOutboundTimer;
        }
        return super.uninit();
    }
    _checkConnections() {
        let connectionCount = 0;
        for (let v of this.m_validators) {
            if (this.node.getConnection(v) || this.m_connecting.has(v)) {
                ++connectionCount;
            }
        }
        let willConn = new Set();
        if (connectionCount < this._getMinOutbound()) {
            for (let v of this.m_validators) {
                if (this._onWillConnectTo(v)) {
                    willConn.add(v);
                }
            }
            this._connectTo(willConn);
        }
    }
    broadcastToValidators(writer) {
        let validators = new Set(this.m_validators);
        return this.m_node.broadcast(writer, { count: validators.size, filter: (conn) => {
                return validators.has(conn.remote);
            } });
    }
}
exports.ValidatorsNetwork = ValidatorsNetwork;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9yc19uZXR3b3JrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvZGJmdF9jaGFpbi92YWxpZGF0b3JzX25ldHdvcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBdUM7QUFDdkMsOENBQXdDO0FBQ3hDLG9DQUE4RztBQUk5Ryx1QkFBK0IsU0FBUSxlQUFPO0lBRzFDLFlBQVksT0FBdUI7UUFDL0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBSFgsaUJBQVksR0FBYSxFQUFFLENBQUM7SUFJcEMsQ0FBQztJQUVELGtCQUFrQixDQUFDLE9BQVk7UUFDM0IsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUM7UUFDckQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELG9CQUFvQixDQUFDLE9BQWdEO1FBQ2pFLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyx3QkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDdEQsS0FBSyxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUM7U0FDOUQ7YUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFD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