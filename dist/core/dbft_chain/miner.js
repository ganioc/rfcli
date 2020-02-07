"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const error_code_1 = require("../error_code");
const address_1 = require("../address");
const value_chain_1 = require("../value_chain");
const chain_1 = require("./chain");
const consensus_node_1 = require("./consensus_node");
class DbftMinerChain extends chain_1.DbftChain {
    _defaultNetworkOptions() {
        return {
            netType: 'validators',
            initialValidator: this.globalOptions.superAdmin,
            minConnectionRate: this.globalOptions.agreeRateNumerator / this.globalOptions.agreeRateDenominator,
        };
    }
    get headerStorage() {
        return this.m_headerStorage;
    }
    async _calcuteReqLimit(fromHeader, limit) {
        let hr = await this.getHeader(fromHeader);
        let reSelectionBlocks = this.globalOptions.reSelectionBlocks;
        return reSelectionBlocks - (hr.header.number % reSelectionBlocks);
    }
}
class DbftMiner extends value_chain_1.ValueMiner {
    constructor(options) {
        super(options);
        this.m_miningBlocks = new Map();
    }
    get chain() {
        return this.m_chain;
    }
    get address() {
        return this.m_address;
    }
    _chainInstance() {
        return new DbftMinerChain(this.m_constructOptions);
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
        value.minerSecret = Buffer.from(options.origin.get('minerSecret'), 'hex');
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    async _createBlock(header) {
        const block = this.chain.newBlock(header);
        this._collectTransactions(block);
        await this._decorateBlock(block);
        const cer = await this._createExecuteRoutine(block);
        if (cer.err) {
            return { err: cer.err };
        }
        // first broadcast，then execute
        const err = await this.m_consensusNode.newProposal(cer.routine.block);
        if (err) {
            this._setIdle(cer.routine.name);
            return { err };
        }
        return cer.next();
    }
    async initialize(options) {
        this.m_secret = options.minerSecret;
        this.m_address = address_1.addressFromSecretKey(this.m_secret);
        if (!options.coinbase) {
            this.coinbase = this.m_address;
        }
        let err = await super.initialize(options);
        if (err) {
            this.m_logger.error(`dbft miner super initialize failed, errcode ${err}`);
            return err;
        }
        this.m_consensusNode = new consensus_node_1.DbftConsensusNode({
            network: this.m_chain.node.getNetwork(),
            globalOptions: this.m_chain.globalOptions,
            secret: this.m_secret
        });
        err = await this.m_consensusNode.init();
        if (err) {
            this.m_logger.error(`dbft miner consensus node init failed, errcode ${err}`);
            return err;
        }
        let tip = this.chain.tipBlockHeader;
        err = await this._updateTip(tip);
        if (err) {
            this.m_logger.error(`dbft miner initialize failed, errcode ${err}`);
            return err;
        }
        this.m_consensusNode.on('createBlock', async (header) => {
            if (header.preBlockHash !== this.chain.tipBlockHeader.hash) {
                this.m_logger.warn(`mine block skipped`);
                return;
            }
            this.m_logger.info(`begin create block ${header.hash} ${header.number} ${header.view}`);
            let cbr = await this._createBlock(header);
            if (cbr.err) {
                this.m_logger.error(`create block failed `, cbr.err);
            }
            else {
                this.m_logger.info(`create block finsihed `);
            }
        });
        this.m_consensusNode.on('verifyBlock', async (block) => {
            this.m_logger.info(`begin verify block ${block.hash} ${block.number}`);
            const cer = await this._createExecuteRoutine(block);
            if (cer.err) {
                this.m_logger.error(`dbft verify block failed `, cer.err);
                return;
            }
            const nr = await cer.next();
            if (nr.err) {
                this.m_logger.error(`dbft verify block failed `, nr.err);
                return;
            }
        });
        this.m_consensusNode.on('mineBlock', async (block, signs) => {
            block.header.setSigns(signs);
            assert(this.m_miningBlocks.has(block.hash));
            const resolve = this.m_miningBlocks.get(block.hash);
            resolve(error_code_1.ErrorCode.RESULT_OK);
        });
        return err;
    }
    async _updateTip(tip) {
        let gnmr = await this.chain.dbftHeaderStorage.getNextMiners(tip);
        if (gnmr.err) {
            this.m_logger.error(`dbft miner initialize failed for `, gnmr.err);
            return gnmr.err;
        }
        let gtvr = await this.chain.dbftHeaderStorage.getTotalView(tip);
        if (gtvr.err) {
            this.m_logger.error(`dbft miner initialize failed for `, gtvr.err);
            return gnmr.err;
        }
        this.m_consensusNode.updateTip(tip, gnmr.miners, gtvr.totalView);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onTipBlock(chain, tipBlock) {
        await this._updateTip(tipBlock);
    }
    async _mineBlock(block) {
        this.m_logger.info(`create block, sign ${this.m_address}`);
        block.header.updateHash();
        return new Promise((resolve) => {
            if (this.m_miningBlocks.has(block.hash)) {
                resolve(error_code_1.ErrorCode.RESULT_SKIPPED);
                return;
            }
            this.m_miningBlocks.set(block.hash, resolve);
            this.m_consensusNode.agreeProposal(block);
        });
    }
}
exports.DbftMiner = DbftMiner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL21pbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLDhDQUE4RDtBQUU5RCx3Q0FBa0Q7QUFDbEQsZ0RBQWlKO0FBR2pKLG1DQUFvQztBQUVwQyxxREFBcUQ7QUFFckQsb0JBQXFCLFNBQVEsaUJBQVM7SUFDeEIsc0JBQXNCO1FBQzVCLE9BQU87WUFDSCxPQUFPLEVBQUUsWUFBWTtZQUNyQixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVU7WUFDL0MsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQjtTQUNyRyxDQUFDO0lBQ04sQ0FBQztJQUVELElBQUksYUFBYTtRQUNiLE9BQU8sSUFBSSxDQUFDLGVBQWdCLENBQUM7SUFDakMsQ0FBQztJQUVTLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFrQixFQUFFLEtBQWE7UUFDOUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGFBQWMsQ0FBQyxpQkFBaUIsQ0FBQztRQUM5RCxPQUFPLGlCQUFpQixHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU8sQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztJQUN2RSxDQUFDO0NBQ0o7QUFJRCxlQUF1QixTQUFRLHdCQUFVO0lBbUJyQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQWhCWCxtQkFBYyxHQUEwQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBaUIxRSxDQUFDO0lBZEQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJ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