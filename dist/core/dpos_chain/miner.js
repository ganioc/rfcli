"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const error_code_1 = require("../error_code");
const address_1 = require("../address");
const value_chain_1 = require("../value_chain");
const block_1 = require("./block");
const chain_1 = require("./chain");
const Address = require("../address");
class InnerChain extends chain_1.DposChain {
    get _ignoreVerify() {
        return false;
    }
}
class DposMiner extends value_chain_1.ValueMiner {
    constructor() {
        super(...arguments);
        this.m_nowSlot = 0;
        this.m_epochTime = 0;
    }
    get chain() {
        return this.m_chain;
    }
    get address() {
        return this.m_address;
    }
    _chainInstance() {
        return new InnerChain(this.m_constructOptions);
    }
    parseInstanceOptions(options) {
        let { err, value } = super.parseInstanceOptions(options);
        if (err) {
            return { err };
        }
        if (!options.origin.get('minerSecret')) {
            this.m_logger.error(`invalid instance options not minerSecret`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        value.secret = Buffer.from(options.origin.get('minerSecret'), 'hex');
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    async initialize(options) {
        this.m_secret = options.secret;
        this.m_address = address_1.addressFromSecretKey(this.m_secret);
        if (!this.m_address) {
            this.m_logger.error(`dpos miner init failed for invalid secret`);
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        if (!options.coinbase) {
            this.coinbase = this.m_address;
        }
        assert(this.coinbase, `secret key failed`);
        if (!this.m_address) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        let err = await super.initialize(options);
        if (err) {
            return err;
        }
        let hr = await this.m_chain.getHeader(0);
        if (hr.err) {
            return hr.err;
        }
        this.m_epochTime = hr.header.timestamp;
        let now = Date.now() / 1000;
        let blockInterval = this.m_chain.globalOptions.blockInterval;
        this.m_nowSlot = Math.floor((now - this.m_epochTime) / blockInterval) + 1;
        this.m_logger.info(`begin Mine...`);
        this._resetTimer();
        return error_code_1.ErrorCode.RESULT_OK;
    }
    createHeader() {
        return new block_1.DposBlockHeader();
    }
    async _resetTimer() {
        let tr = await this._nextBlockTimeout();
        if (tr.err) {
            return tr.err;
        }
        if (this.m_timer) {
            clearTimeout(this.m_timer);
            delete this.m_timer;
        }
        this.m_timer = setTimeout(async () => {
            delete this.m_timer;
            let now = Date.now() / 1000;
            if (now >= this.m_nowSlot * this.m_chain.globalOptions.blockInterval + this.m_epochTime) {
                // 都到了当前slot的右边缘时间（下个slot的开始时间）了才执行，难道是程序太卡导致timer延后了，不管如何不出块
                this._resetTimer();
                return;
            }
            let tip = this.m_chain.tipBlockHeader;
            let blockHeader = this.createHeader();
            blockHeader.setPreBlock(tip);
            // 都以当前slot的左边缘时间为块的时间,便于理解和计算。
            blockHeader.timestamp = this.m_epochTime + (this.m_nowSlot - 1) * this.m_chain.globalOptions.blockInterval;
            blockHeader.pubkey = Address.publicKeyFromSecretKey(this.m_secret);
            let dmr = await blockHeader.getDueMiner(this.m_chain);
            if (dmr.err) {
                return;
            }
            this.m_logger.info(`calcuted block ${blockHeader.number} creator: ${dmr.miner}`);
            if (!dmr.miner) {
                assert(false, 'calcuted undefined block creator!!');
                process.exit(1);
            }
            if (this.m_address === dmr.miner) {
                await this._createBlock(blockHeader);
            }
            this._resetTimer();
        }, tr.timeout);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _mineBlock(block) {
        // 只需要给block签名
        this.m_logger.info(`create block, sign ${this.m_address}`);
        block.header.signBlock(this.m_secret);
        block.header.updateHash();
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _nextBlockTimeout() {
        let blockInterval = this.m_chain.globalOptions.blockInterval;
        do {
            this.m_nowSlot++;
            let nowSlotBeginTimeOffset = (this.m_nowSlot - 1) * blockInterval;
            let now = Date.now() / 1000;
            if (this.m_epochTime + nowSlotBeginTimeOffset > now) {
                let ret = { err: error_code_1.ErrorCode.RESULT_OK, timeout: (this.m_epochTime + nowSlotBeginTimeOffset - now) * 1000 };
                this.m_logger.debug(`dpos _nextTimeout nowslot=${this.m_nowSlot}, timeout=${ret.timeout}`);
                return ret;
            }
        } while (true);
    }
}
exports.DposMiner = DposMiner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2NoYWluL21pbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWlDO0FBRWpDLDhDQUEwQztBQUMxQyx3Q0FBa0Q7QUFFbEQsZ0RBQTRHO0FBQzVHLG1DQUEwQztBQUMxQyxtQ0FBa0M7QUFHbEMsc0NBQXNDO0FBSXRDLGdCQUFpQixTQUFRLGlCQUFTO0lBQzlCLElBQWMsYUFBYTtRQUN2QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0o7QUFFRCxlQUF1QixTQUFRLHdCQUFVO0lBQXpDOztRQUljLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFxSXRDLENBQUM7SUFuSUcsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBb0IsQ0FBQztJQUNyQyxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1AsT0FBTyxJQUFJLENBQUMsU0FBVSxDQUFDO0lBQzNCLENBQUM7SUFFUyxjQUFjO1FBQ3BCLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVNLG9CQUFvQixDQUFDLE9BRzNCO1FBQ0csSUFBSSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEVBQUMsR0FBRyxFQUFDLENBQUM7U0FDaEI7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUNoRSxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUMsQ0FBQztTQUNo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