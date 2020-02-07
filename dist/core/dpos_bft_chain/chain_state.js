"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const dpos_chain_1 = require("../dpos_chain");
const libAddress = require("../address");
const LRUCache_1 = require("../lib/LRUCache");
class DposBftChainTipState extends dpos_chain_1.DposChainTipState {
    constructor(options) {
        super(options);
        this.m_bftLibSigns = [];
        this.m_bftIrreversibleBlocknum = 0;
        this.m_hashMinerCache = new LRUCache_1.LRUCache(10);
        this.m_bftIrreversibleBlocknum = options.libHeader.number;
        this.m_bftIrreversibleBlockHash = options.libHeader.hash;
    }
    get bftIrreversibleBlockNum() {
        return this.m_bftIrreversibleBlocknum;
    }
    get dposIrreversibleBlockNum() {
        return super.irreversible;
    }
    get irreversible() {
        return this.m_bftIrreversibleBlocknum > this.m_irreversibleBlocknum ? this.m_bftIrreversibleBlocknum : this.m_irreversibleBlocknum;
    }
    get irreversibleHash() {
        return this.m_bftIrreversibleBlocknum > this.m_irreversibleBlocknum ? this.m_bftIrreversibleBlockHash : this.m_irreversibleBlockHash;
    }
    get bftSigns() {
        return this.m_bftLibSigns;
    }
    async updateTip(header) {
        let err = await super.updateTip(header);
        if (err) {
            return err;
        }
        await this.maybeNewBftIrreversibleNumber(header.bftSigns);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async maybeNewBftIrreversibleNumber(minerSigns) {
        let hr = await this._maybeNewBftIrreversibleNumber(minerSigns);
        if (hr.err) {
            return hr.err;
        }
        if (hr.blib > this.m_bftIrreversibleBlocknum) {
            this.m_bftIrreversibleBlocknum = hr.blib;
            this.m_bftLibSigns = hr.signs;
            this.m_bftIrreversibleBlockHash = hr.hash;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _maybeNewBftIrreversibleNumber(signs) {
        let hashCount = new Map();
        let maxCount = -1;
        let maxCountHeader;
        for (let sign of signs) {
            let hr = await this.m_chain.getHeader(sign.hash);
            if (hr.err) {
                this.logger.info(`dpos_bft _maybeNewBftIrreversibleNumber get header failed errcode=${error_code_1.stringifyErrorCode(hr.err)}`);
                return { err: hr.err };
            }
            // if (hr.header!.preBlockHash !== this.irreversibleHash) {
            //     continue;
            // }
            let count = hashCount.get(sign.hash);
            if (!count) {
                count = 0;
            }
            count++;
            hashCount.set(sign.hash, count);
            if (count > maxCount) {
                maxCount = count;
                maxCountHeader = hr.header;
            }
        }
        if (!maxCountHeader) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        let miners = this.m_hashMinerCache.get(maxCountHeader.hash);
        if (!miners) {
            let hr1 = await this.m_chain.getMiners(maxCountHeader);
            if (hr1.err) {
                this.logger.info(`dpos_bft _maybeNewBftIrreversibleNumber get miners failed errcode=${error_code_1.stringifyErrorCode(hr1.err)}`);
                return { err: hr1.err };
            }
            miners = hr1.creators;
        }
        let minersSet = new Set(miners);
        let validSigns = [];
        for (let sign of signs) {
            let address = libAddress.addressFromPublicKey(sign.pubkey);
            if (sign.hash === maxCountHeader.hash && minersSet.has(address)) {
                validSigns.push(sign);
            }
        }
        let needConfireCount = Math.ceil(miners.length * 2 / 3);
        if (validSigns.length < needConfireCount) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_ENOUGH };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, blib: maxCountHeader.number, hash: maxCountHeader.hash, signs: validSigns };
    }
    toJsonData() {
        let d = super.toJsonData();
        d.bft_irreversible_blocknum = this.m_bftIrreversibleBlocknum;
        return d;
    }
}
exports.DposBftChainTipState = DposBftChainTipState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2JmdF9jaGFpbi9jaGFpbl9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUE4RDtBQUM5RCw4Q0FBMkY7QUFFM0YseUNBQXlDO0FBQ3pDLDhDQUF5QztBQUV6QywwQkFBa0MsU0FBUSw4QkFBaUI7SUFNdkQsWUFBWSxPQUFpQztRQUN6QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFOVCxrQkFBYSxHQUFrQyxFQUFFLENBQUM7UUFDbEQsOEJBQXlCLEdBQVcsQ0FBQyxDQUFDO1FBRXRDLHFCQUFnQixHQUErQixJQUFJLG1CQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFJdEUsSUFBSSxDQUFDLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQzFELElBQUksQ0FBQywwQkFBMEIsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRUQsSUFBSSx1QkFBdUI7UUFDdkIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7SUFDMUMsQ0FBQztJQUVELElBQUksd0JBQXdCO1FBQ3hCLE9BQU8sS0FBSyxDQUFDLFlBQVksQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztJQUN2SSxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsT0FBTyxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztJQUN6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