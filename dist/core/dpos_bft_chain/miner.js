"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const dpos_chain_1 = require("../dpos_chain");
const chain_1 = require("./chain");
const dpos_bft_node_1 = require("./dpos_bft_node");
const block_1 = require("./block");
const libAddress = require("../address");
class DposBftMiner extends dpos_chain_1.DposMiner {
    constructor() {
        super(...arguments);
        this.m_minerSigns = new Map();
        this.m_checkTimes = 0;
        this.m_libOnBest = -1;
    }
    _chainInstance() {
        return new chain_1.DposBftMinerChain(this.m_constructOptions);
    }
    createHeader() {
        return new block_1.DposBftBlockHeader();
    }
    async _createBlock(header) {
        let cts = this.chain.chainTipState;
        if (cts.irreversible >= cts.bftIrreversibleBlockNum) {
            header.bftSigns = cts.bftSigns;
        }
        return await super._createBlock(header);
    }
    maybeNewBftIrreversibleNumber() {
        let checkImpl = async () => {
            let signs = [];
            for (let [_, entry] of this.m_minerSigns) {
                if (entry.bInBestChain) {
                    signs.push(entry.sign);
                }
            }
            let err = await this.chain.chainTipState.maybeNewBftIrreversibleNumber(signs);
            if (err) {
                return;
            }
            let lib = this.chain.chainTipState.irreversible;
            let temp = this.m_minerSigns;
            for (let [m, entry] of temp) {
                if (entry.number > lib) {
                    this.m_minerSigns.set(m, entry);
                }
            }
            if (this.m_libOnBest !== lib) {
                this.m_libOnBest = lib;
                await this.sendSign();
            }
            this.m_logger.info(`---------------------checkImpl end  bftLib=${this.chain.chainTipState.bftIrreversibleBlockNum} dposLib=${this.chain.chainTipState.dposIrreversibleBlockNum}`);
        };
        let check = async () => {
            if (this.m_checkTimes > 0) {
                this.m_checkTimes++;
                return;
            }
            this.m_checkTimes = 1;
            await checkImpl();
            this.m_checkTimes--;
            if (this.m_checkTimes > 0) {
                this.m_checkTimes = 0;
                this.maybeNewBftIrreversibleNumber();
            }
        };
        check();
    }
    async initialize(options) {
        let err = await super.initialize(options);
        if (err) {
            this.m_logger.error(`dbft miner super initialize failed, errcode ${err}`);
            return err;
        }
        this.m_pubkey = libAddress.publicKeyFromSecretKey(this.m_secret);
        this.m_bftNode = new dpos_bft_node_1.DposBftChainNode({
            network: this.m_chain.node.getNetwork(),
            globalOptions: this.m_chain.globalOptions,
            secret: this.m_secret
        });
        this.m_bftNode.on('tipSign', async (sign) => {
            let address = libAddress.addressFromPublicKey(sign.pubkey);
            this.m_logger.info(`===============tipSign from ${address} hash=${sign.hash}`);
            let entry = { number: -1, bInBestChain: false, sign };
            let hr = await this.chain.getHeader(sign.hash);
            if (!hr.err) {
                if (hr.header.number <= this.chain.chainTipState.bftIrreversibleBlockNum) {
                    return;
                }
                entry.number = hr.header.number;
                hr = await this.chain.getHeader(hr.header.number);
                if (!hr.err) {
                    entry.bInBestChain = true;
                }
            }
            this.m_minerSigns.set(address, entry);
            this.maybeNewBftIrreversibleNumber();
        });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async sendSign() {
        if (this.chain.tipBlockHeader.hash === this.chain.chainTipState.irreversibleHash) {
            return;
        }
        let hr = await this.chain.getHeader(this.chain.chainTipState.irreversible + 1);
        if (hr.err) {
            return;
        }
        const sign = libAddress.sign(hr.header.hash, this.m_secret);
        this.m_bftNode.broadcastTip(this.m_pubkey, sign, hr.header);
        let entry = { number: hr.header.number, bInBestChain: true, sign: { hash: hr.header.hash, pubkey: this.m_pubkey, sign } };
        this.m_minerSigns.set(this.address, entry);
        this.maybeNewBftIrreversibleNumber();
    }
    async _onTipBlock(chain, tipBlock) {
        // 处理bInBestChain
        for (let [_, entry] of this.m_minerSigns) {
            if (entry.sign.hash === tipBlock.hash) {
                entry.bInBestChain = true;
                entry.number = tipBlock.number;
            }
        }
        await super._onTipBlock(chain, tipBlock);
        await this.sendSign();
        // miners得更新会延迟一个块
        let gm = await this.chain.getMiners(tipBlock);
        if (gm.err) {
            this.m_logger.error(`dpos_bft_chain getminers error`);
            return;
        }
        this.m_chain.node.getNetwork().setValidators(gm.creators);
    }
}
exports.DposBftMiner = DposBftMiner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2JmdF9jaGFpbi9taW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUN4Qyw4Q0FBa0U7QUFDbEUsbUNBQXdEO0FBQ3hELG1EQUFpRDtBQUVqRCxtQ0FBd0U7QUFDeEUseUNBQXlDO0FBU3pDLGtCQUEwQixTQUFRLHNCQUFTO0lBQTNDOztRQUVZLGlCQUFZLEdBQWtDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFeEQsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFDekIsZ0JBQVcsR0FBVyxDQUFDLENBQUMsQ0FBQztJQXlJckMsQ0FBQztJQXZJYSxjQUFjO1FBQ3BCLE9BQU8sSUFBSSx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRVMsWUFBWTtRQUNsQixPQUFPLElBQUksMEJBQWtCLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRVMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUEwQjtRQUNuRCxJQUFJLEdBQUcsR0FBeUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFxQyxDQUFDO1FBQ2pGLElBQUksR0FBRyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsdUJBQXVCLEVBQUU7WUFDakQsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1NBQ2xDO1FBRUQsT0FBTyxNQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVTLDZCQUE2QjtRQUNuQyxJQUFJLFNBQVMsR0FBRyxLQUFLLElBQUksRUFBRTtZQUN2QixJQUFJLEtBQUssR0FBa0MsRUFBRSxDQUFDO1lBQzlDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVB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