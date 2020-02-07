"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const assert = require('assert');
class DposChainTipState {
    constructor(options) {
        // 当前节点计算出的候选不可逆区块number
        this.m_proposedIrreversibleBlocknum = 0;
        // 不可逆区块number
        this.m_irreversibleBlocknum = 0;
        // 各生产者确认的候选不可逆区块number
        this.m_producerToLastImpliedIrb = new Map();
        // 各生产者上次出块的块number
        this.m_producerToLastProduced = new Map();
        // 待确认区块信息
        this.m_confirmInfo = [];
        this.m_libHeader = options.libHeader;
        this.m_libMiners = [];
        this.m_libMiners = [...options.libMiners];
        this.m_chain = options.chain;
        this.m_globalOptions = options.globalOptions;
        this.m_irreversibleBlocknum = 0;
        this.m_irreversibleBlockHash = this.m_libHeader.hash;
        this.m_tip = options.libHeader;
    }
    get irreversible() {
        return this.m_irreversibleBlocknum;
    }
    get irreversibleHash() {
        return this.m_irreversibleBlockHash;
    }
    get logger() {
        return this.m_chain.logger;
    }
    get tip() {
        return this.m_tip;
    }
    async updateTip(header) {
        if (header.preBlockHash !== this.m_tip.hash || header.number !== this.m_tip.number + 1) {
            this.logger.info(`updateTip failed for header error, header.number ${header.number} should equal tip.number+1 ${this.m_tip.number + 1}, header.preBlockHash '${header.preBlockHash}' should equal tip.hash ${this.m_tip.hash} headerhash=${header.hash}`);
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        let gm = await this.m_chain.getMiners(header);
        if (gm.err) {
            this.logger.info(`get miners failed errcode=${error_code_1.stringifyErrorCode(gm.err)}, state=${this.dump()}`);
            return gm.err;
        }
        let numPreBlocks = this.getNumberPrevBlocks(header);
        this.m_producerToLastProduced.set(header.miner, header.number);
        let needConfireCount = Math.ceil(gm.creators.length * 2 / 3);
        this.m_confirmInfo.push({ number: header.number, hash: header.hash, miner: header.miner, count: needConfireCount });
        let index = this.m_confirmInfo.length - 1;
        while (index >= 0 && numPreBlocks !== 0) {
            let entry = this.m_confirmInfo[index];
            entry.count--;
            if (entry.count === 0) {
                this.m_proposedIrreversibleBlocknum = entry.number;
                this.m_producerToLastImpliedIrb.set(entry.miner, { number: entry.number, hash: entry.hash });
                // 当前block为候选不可逆块,需要做：1.清理之前的entry
                this.m_confirmInfo = this.m_confirmInfo.slice(index + 1);
                // 2.计算是否会产生不可逆块
                this.calcIrreversibleNumber();
                break;
            }
            else if (numPreBlocks > 0) {
                numPreBlocks--;
            }
            index--;
        }
        if (numPreBlocks === 0 || index === 0) {
            // 清除重复
            let i = 0;
            for (i = 0; i < this.m_confirmInfo.length - 1; i++) {
                if (this.m_confirmInfo[i].count !== this.m_confirmInfo[i + 1].count && this.m_confirmInfo[i].count === this.m_confirmInfo[0].count) {
                    break;
                }
            }
            if (i > 0) {
                this.m_confirmInfo = this.m_confirmInfo.slice(i);
            }
        }
        if (this.m_confirmInfo.length > this.m_globalOptions.maxCreateor * 2) {
            this.m_confirmInfo.unshift();
        }
        this.m_tip = header;
        if (header.number === 0 || header.number % this.m_globalOptions.reSelectionBlocks === 0) {
            this.promote(gm.creators);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    dump() {
        let data = this.toJsonData();
        return JSON.stringify(data, null, '\t');
    }
    toJsonData() {
        let data = {};
        data.producer_to_last_implied_irb = [];
        for (let [miner, number] of this.m_producerToLastImpliedIrb) {
            data.producer_to_last_implied_irb.push({ miner, number });
        }
        data.producer_to_last_produced = [];
        for (let [miner, number] of this.m_producerToLastProduced) {
            data.producer_to_last_produced.push({ miner, number });
        }
        data.confire_info = this.m_confirmInfo;
        data.tip = {};
        if (this.m_tip) {
            data.tip.tipnumber = this.m_tip.number;
            data.tip.tipminer = this.m_tip.miner;
            data.tip.tiphash = this.m_tip.hash;
        }
        data.proposed_irreversible_blocknum = this.m_proposedIrreversibleBlocknum;
        data.irreversible_blocknum = this.m_irreversibleBlocknum;
        return data;
    }
    getNumberPrevBlocks(header) {
        let number = this.m_producerToLastProduced.get(header.miner);
        if (!number) {
            return -1;
        }
        return header.number > number ? header.number - number : 0;
    }
    calcIrreversibleNumber() {
        let numbers = new Array();
        for (let [_, info] of this.m_producerToLastImpliedIrb) {
            numbers.push(info.number);
        }
        if (numbers.length > 0) {
            numbers.sort();
            // 2/3的人推荐某个block成为候选不可逆block，那么这个块才能成为不可逆，那么上一个不可逆块号就是1/3中最大的
            let n = Math.floor((numbers.length - 1) / 3);
            this.m_irreversibleBlocknum = numbers[n];
            for (let [_, info] of this.m_producerToLastImpliedIrb) {
                if (this.m_irreversibleBlocknum === info.number) {
                    this.m_irreversibleBlockHash = info.hash;
                }
            }
        }
    }
    promote(miners) {
        let newImpliedIrb = new Map();
        let newProduced = new Map();
        for (let m of miners) {
            let irb = this.m_producerToLastImpliedIrb.get(m);
            newImpliedIrb.set(m, irb ? irb : { number: this.m_irreversibleBlocknum, hash: this.m_irreversibleBlockHash });
            let pr = this.m_producerToLastProduced.get(m);
            newProduced.set(m, pr ? pr : this.m_irreversibleBlocknum);
        }
        this.m_producerToLastImpliedIrb = newImpliedIrb;
        this.m_producerToLastProduced = newProduced;
    }
}
exports.DposChainTipState = DposChainTipState;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fc3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2NoYWluL2NoYWluX3N0YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTZEO0FBRzdELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUtqQztJQW9CSSxZQUFZLE9BQWlDO1FBbkI3Qyx3QkFBd0I7UUFDZCxtQ0FBOEIsR0FBVyxDQUFDLENBQUM7UUFDckQsY0FBYztRQUNKLDJCQUFzQixHQUFXLENBQUMsQ0FBQztRQUU3Qyx1QkFBdUI7UUFDYiwrQkFBMEIsR0FBZ0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM5RixtQkFBbUI7UUFDVCw2QkFBd0IsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwRSxVQUFVO1FBQ0Esa0JBQWEsR0FBbUIsRUFBRSxDQUFDO1FBVXpDLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUM3QyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUNyRCxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtR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