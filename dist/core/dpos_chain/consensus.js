"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const error_code_1 = require("../error_code");
const bignumber_js_1 = require("bignumber.js");
const assert = require("assert");
// DPOS的节点会定时出块，如果时间间隔已到，指定节点还未出块的话，就跳过这个节点，下一个节点出块
// 出块间隔时间必须远小于创建并广播块到所有DPOS出块节点的时间
// 所有time单位均为seconds
// 出块间隔时间
// export const blockInterval = 10
// 出块间隔允许的最大误差
// export const maxBlockIntervalOffset = 1
// //重新选举的块时间，暂时设定成每10块选举一次
// export const reSelectionBlocks = 10
// //最大出块者总数，先定成21
// export const maxCreator = 21;
// //最小出块者总数，先定成2
// export const minCreator = 2;
// //每个节点最多可以投的producer数量
// export const dposVoteMaxProducers = 30;
// //超过该时间不出块就将被封禁
// export const timeOffsetToLastBlock = 60 * 60 * 24;
// //封禁时长
// export const timeBan = 30 * timeOffsetToLastBlock;
// //每unbanBlocks个块后进行一次解禁计算
// export const unbanBlocks = reSelectionBlocks * 2;
function onCheckGlobalOptions(globalOptions) {
    if (util_1.isNullOrUndefined(globalOptions.minCreateor)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.maxCreateor)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.reSelectionBlocks)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.blockInterval)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.timeOffsetToLastBlock)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.timeBan)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.unbanBlocks)) {
        return false;
    }
    if (util_1.isNullOrUndefined(globalOptions.dposVoteMaxProducers)) {
        return false;
    }
    return true;
}
exports.onCheckGlobalOptions = onCheckGlobalOptions;
var BanStatus;
(function (BanStatus) {
    BanStatus[BanStatus["NoBan"] = 0] = "NoBan";
    BanStatus[BanStatus["Delay"] = 1] = "Delay";
    BanStatus[BanStatus["Ban"] = 2] = "Ban";
})(BanStatus || (BanStatus = {}));
class ViewContext {
    constructor(options) {
        this.m_currDatabase = options.currDatabase;
        this.m_globalOptions = options.globalOptions;
        this.m_logger = options.logger;
    }
    get currDatabase() {
        return this.m_currDatabase;
    }
    static getElectionBlockNumber(globalOptions, _number) {
        if (_number === 0) {
            return 0;
        }
        return Math.floor((_number - 1) / globalOptions.reSelectionBlocks) * globalOptions.reSelectionBlocks;
    }
    async getNextMiners() {
        let kvElectionDPOS = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let llr = await kvElectionDPOS.llen(ViewContext.keyNextMiners);
        if (llr.err) {
            return { err: llr.err };
        }
        let lrr = await kvElectionDPOS.lrange(ViewContext.keyNextMiners, 0, llr.value);
        if (lrr.err) {
            return { err: lrr.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, creators: lrr.value };
    }
    async getProposeMiners() {
        let kvElectionDPOS = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let llr = await kvElectionDPOS.llen(ViewContext.keyProposeMiners);
        if (llr.err) {
            return { err: llr.err };
        }
        let lrr = await kvElectionDPOS.lrange(ViewContext.keyProposeMiners, 0, llr.value);
        if (lrr.err) {
            return { err: lrr.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, creators: lrr.value };
    }
    async getStake(address) {
        let kvCurDPOS = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        // 如果投票者的权益不够，则返回
        let her = await kvCurDPOS.hget(ViewContext.keyStake, address);
        if (her.err) {
            return { err: her.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, stake: her.value };
    }
    async getVote() {
        let kvCurDPOS = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let gr = await kvCurDPOS.hgetall(ViewContext.keyVote);
        if (gr.err) {
            return { err: gr.err };
        }
        let cans = await this.getValidCandidates();
        if (cans.err) {
            return { err: cans.err };
        }
        cans.candidates.sort();
        let isValid = (s) => {
            for (let c of cans.candidates) {
                if (c === s) {
                    return true;
                }
                else if (c > s) {
                    return false;
                }
            }
            return false;
        };
        let vote = new Map();
        for (let v of gr.value) {
            if (isValid(v.key)) {
                vote.set(v.key, v.value);
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, vote };
    }
    async getCandidates() {
        let kvDPos = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let gr = await this.getValidCandidates();
        if (gr.err) {
            return { err: gr.err };
        }
        let gv = await kvDPos.hgetall(ViewContext.keyVote);
        if (gv.err) {
            return { err: gv.err };
        }
        let vote = new Map();
        for (let v of gv.value) {
            vote.set(v.key, v.value);
        }
        gr.candidates.sort((a, b) => {
            if (vote.has(a) && vote.has(b)) {
                if (vote.get(a).eq(vote.get(b))) {
                    return 0;
                }
                return vote.get(a).gt(vote.get(b)) ? -1 : 1;
            }
            if (!vote.has(a) && !vote.has(b)) {
                return 0;
            }
            if (vote.has(a)) {
                return -1;
            }
            return 1;
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, candidates: gr.candidates };
    }
    async getValidCandidates() {
        let kvDPos = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let gr = await kvDPos.hgetall(ViewContext.keyCandidate);
        if (gr.err) {
            return { err: gr.err };
        }
        let candidates = [];
        for (let v of gr.value) {
            if (v.value >= BanStatus.NoBan) {
                candidates.push(v.key);
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, candidates };
    }
    async isBan(address) {
        let kvDPos = (await this.currDatabase.getReadableKeyValue(ViewContext.kvDPOS)).kv;
        let timeInfo = await kvDPos.hget(ViewContext.keyCandidate, address);
        if (timeInfo.err) {
            return { err: error_code_1.ErrorCode.RESULT_OK, ban: false };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, ban: timeInfo.value >= BanStatus.Ban ? true : false };
    }
}
ViewContext.kvDPOS = 'dpos';
ViewContext.keyCandidate = 'candidate'; // 总的候选人
ViewContext.keyVote = 'vote';
ViewContext.keyStake = 'stake';
ViewContext.keyNextMiners = 'miner';
// 每个代表投票的那些人
ViewContext.keyProducers = 'producers';
// 生产者最后一次出块时间
ViewContext.keyNewBlockTime = 'newblocktime';
// 提议miners,成为提议miner后未必能进入出块序列，成为提议后这个块成为不可逆后才能成为真正miners
ViewContext.keyProposeMiners = 'proposeminer';
exports.ViewContext = ViewContext;
class Context extends ViewContext {
    constructor(options) {
        super(options);
    }
    get currDatabase() {
        return this.m_currDatabase;
    }
    removeDuplicate(s) {
        let s1 = [];
        let bit = new Map();
        for (let v of s) {
            if (!bit.has(v)) {
                s1.push(v);
                bit.set(v, 1);
            }
        }
        return s1;
    }
    async init(candidates, miners) {
        candidates = this.removeDuplicate(candidates);
        miners = this.removeDuplicate(miners);
        let kvCurDPOS = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let candiateValues = candidates.map(() => {
            return BanStatus.NoBan;
        });
        let hmr = await kvCurDPOS.hmset(Context.keyCandidate, candidates, candiateValues);
        if (hmr.err) {
            return hmr;
        }
        let rpr = await kvCurDPOS.rpushx(Context.keyNextMiners, miners);
        if (rpr.err) {
            return rpr;
        }
        rpr = await kvCurDPOS.rpushx(Context.keyProposeMiners, miners);
        if (rpr.err) {
            return rpr;
        }
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    async finishElection(libDatabase, shuffleFactor) {
        let kvCurDPOS = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let gvr = await this.getVote();
        if (gvr.err) {
            this.m_logger.error(`finishElection, getvote failde,errcode=${gvr.err}`);
            return { err: gvr.err };
        }
        let election = new Array();
        for (let address of gvr.vote.keys()) {
            election.push({ address, vote: gvr.vote.get(address) });
        }
        // 按照投票权益排序
        election.sort((l, r) => {
            if (l.vote.eq(r.vote)) {
                return 0;
            }
            else {
                return (l.vote.gt(r.vote) ? -1 : 1);
            }
        });
        let creators = election.slice(0, this.m_globalOptions.maxCreator).map((x) => {
            return x.address;
        });
        if (creators.length === 0) {
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        let minersInfo = await this.getProposeMiners();
        if (minersInfo.err) {
            this.m_logger.error(`finishElection getNextMiners failed,errcode=${minersInfo.err}`);
            return minersInfo;
        }
        if (creators.length < this.m_globalOptions.minCreator) {
            this.m_logger.warn(`finishElection not update propose miners,for new miners count (${creators.length}) less than minCreateor(${this.m_globalOptions.minCreator})`);
            // 总的个数比最小要求的个数还少也不补
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        if (creators.length < minersInfo.creators.length) {
            this.m_logger.warn(`finishElection not update propose miners,for new miners count (${creators.length}) less than prev propse miners count(${minersInfo.creators.length})`);
            // 每次更新miner的时候，总的个数不能少于上一轮的个数，否则不补
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        this._shuffle(shuffleFactor, creators);
        this.m_logger.info(`finishElection propose miners,${JSON.stringify(creators)}`);
        // 这里选举得写进提议miners
        let llr = await kvCurDPOS.llen(ViewContext.keyProposeMiners);
        if (llr.err) {
            return { err: llr.err };
        }
        for (let ix = llr.value - 1; ix >= 0; ix--) {
            let lrr = await kvCurDPOS.lremove(ViewContext.keyProposeMiners, ix);
            if (lrr.err) {
                return { err: lrr.err };
            }
        }
        let lpr = await kvCurDPOS.rpushx(ViewContext.keyProposeMiners, creators);
        if (lpr.err) {
            return { err: lpr.err };
        }
        // 把最近不可逆块得keyProposeMiners更新到keyNextMiners作为当前miners
        let libDev = new ViewContext({ currDatabase: libDatabase, globalOptions: this.m_globalOptions, logger: this.m_logger });
        let hr = await libDev.getProposeMiners();
        if (hr.err) {
            return hr;
        }
        this.m_logger.info(`finishElection miners,${JSON.stringify(hr.creators)}`);
        llr = await kvCurDPOS.llen(ViewContext.keyNextMiners);
        if (llr.err) {
            return { err: llr.err };
        }
        for (let ix = llr.value - 1; ix >= 0; ix--) {
            let lrr = await kvCurDPOS.lremove(ViewContext.keyNextMiners, ix);
            if (lrr.err) {
                return { err: lrr.err };
            }
        }
        lpr = await kvCurDPOS.rpushx(ViewContext.keyNextMiners, hr.creators);
        if (lpr.err) {
            return { err: lpr.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    async mortgage(from, amount) {
        assert(amount.gt(0), 'amount must positive');
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let stakeInfo = await kvDPos.hget(ViewContext.keyStake, from);
        let stake = stakeInfo.err === error_code_1.ErrorCode.RESULT_OK ? stakeInfo.value : new bignumber_js_1.BigNumber(0);
        await kvDPos.hset(ViewContext.keyStake, from, stake.plus(amount));
        await this._updatevote(from, amount);
        return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
    }
    async unmortgage(from, amount) {
        assert(amount.gt(0), 'amount must positive');
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let stakeInfo = await kvDPos.hget(ViewContext.keyStake, from);
        if (stakeInfo.err) {
            return { err: stakeInfo.err };
        }
        let stake = stakeInfo.value;
        if (stake.lt(amount)) {
            return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_NOT_ENOUGH };
        }
        if (stake.isEqualTo(amount)) {
            await kvDPos.hdel(ViewContext.keyStake, from);
        }
        else {
            await kvDPos.hset(ViewContext.keyStake, from, stake.minus(amount));
        }
        await this._updatevote(from, (new bignumber_js_1.BigNumber(0)).minus(amount));
        if (stake.isEqualTo(amount)) {
            await kvDPos.hdel(ViewContext.keyProducers, from);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
    }
    async vote(from, candidates) {
        candidates = this.removeDuplicate(candidates);
        assert(candidates.length > 0 && candidates.length <= this.m_globalOptions.dposVoteMaxProducers, 'candidates.length must right');
        let cans = await this.getValidCandidates();
        if (cans.err) {
            return { err: cans.err };
        }
        cans.candidates.sort();
        let isValid = (s) => {
            for (let c of cans.candidates) {
                if (c === s) {
                    return true;
                }
                else if (c > s) {
                    return false;
                }
            }
            return false;
        };
        for (let p of candidates) {
            if (!isValid(p)) {
                return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
        }
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let stakeInfo = await kvDPos.hget(ViewContext.keyStake, from);
        if (stakeInfo.err) {
            return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_NOT_ENOUGH };
        }
        let stake = stakeInfo.value;
        let producerInfo = await kvDPos.hget(ViewContext.keyProducers, from);
        if (producerInfo.err === error_code_1.ErrorCode.RESULT_OK) {
            let producers = producerInfo.value;
            if (producers.length === candidates.length) {
                producers.sort();
                candidates.sort();
                let i = 0;
                for (i = 0; i < producers.length; i++) {
                    if (producers[i] !== candidates[i]) {
                        break;
                    }
                }
                if (i === producers.length) {
                    return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
                }
            }
            // 取消投给先前的那些人
            await this._updatevote(from, new bignumber_js_1.BigNumber(0).minus(stake));
        }
        // 设置新的投票对象
        await kvDPos.hset(ViewContext.keyProducers, from, candidates);
        // 计票
        await this._updatevote(from, stake);
        return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
    }
    async registerToCandidate(candidate) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let her = await kvDPos.hexists(ViewContext.keyCandidate, candidate);
        if (her.err) {
            return { err: her.err };
        }
        if (her.value) {
            return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
        }
        await kvDPos.hset(ViewContext.keyCandidate, candidate, BanStatus.NoBan);
        return { err: error_code_1.ErrorCode.RESULT_OK, returnCode: error_code_1.ErrorCode.RESULT_OK };
    }
    async unbanProducer(timestamp) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        // 解禁
        let candidateInfo = await kvDPos.hgetall(ViewContext.keyCandidate);
        for (let c of candidateInfo.value) {
            if (c.value >= BanStatus.Ban && c.value <= timestamp) {
                await kvDPos.hset(ViewContext.keyCandidate, c.key, BanStatus.NoBan);
            }
        }
    }
    async checkIfNeedBan(timestamp) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let minersInfo = await this.getNextMiners();
        if (minersInfo.err) {
            return;
        }
        for (let m of minersInfo.creators) {
            let hr = await kvDPos.hget(ViewContext.keyNewBlockTime, m);
            if (hr.err) {
                return;
            }
            if (timestamp - hr.value >= this.m_globalOptions.timeOffsetToLastBlock) {
                await kvDPos.hset(ViewContext.keyCandidate, m, BanStatus.Delay);
            }
        }
    }
    async banProducer(timestamp) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let hr = await this.getNextMiners();
        if (hr.err) {
            return;
        }
        // 只会是当前得miner能出现BanStatus.Delay状态，全部给ban了
        for (let m of hr.creators) {
            let candidateInfo = await kvDPos.hget(ViewContext.keyCandidate, m);
            if (candidateInfo.err) {
                return;
            }
            if (candidateInfo.value === BanStatus.Delay) {
                await kvDPos.hset(ViewContext.keyCandidate, m, timestamp + this.m_globalOptions.timeBan);
            }
        }
    }
    async updateProducerTime(producer, timestamp) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        await kvDPos.hset(ViewContext.keyNewBlockTime, producer, timestamp);
    }
    async maintain_producer(timestamp) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let minersInfo = await this.getNextMiners();
        assert(minersInfo.err === error_code_1.ErrorCode.RESULT_OK);
        for (let m of minersInfo.creators) {
            let her = await kvDPos.hexists(ViewContext.keyNewBlockTime, m);
            if (her.err) {
                return her.err;
            }
            if (!her.value) {
                // 可能是新进入序列，默认把当前block的时间当作它的初始出块时间
                await kvDPos.hset(ViewContext.keyNewBlockTime, m, timestamp);
            }
        }
        // 已经被剔除出块序列了，清理它的计时器
        let allTimeInfo = await kvDPos.hgetall(ViewContext.keyNewBlockTime);
        for (let p of allTimeInfo.value) {
            let i = 0;
            for (i = 0; i < minersInfo.creators.length; i++) {
                if (p.key === minersInfo.creators[i]) {
                    break;
                }
            }
            if (i === minersInfo.creators.length) {
                let her = await kvDPos.hexists(ViewContext.keyNewBlockTime, p.key);
                if (her.err) {
                    return her.err;
                }
                if (her.value) {
                    await kvDPos.hdel(ViewContext.keyNewBlockTime, p.key);
                }
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _updatevote(voteor, amount) {
        let kvDPos = (await this.currDatabase.getReadWritableKeyValue(ViewContext.kvDPOS)).kv;
        let producerInfo = await kvDPos.hget(ViewContext.keyProducers, voteor);
        if (producerInfo.err === error_code_1.ErrorCode.RESULT_OK) {
            let producers = producerInfo.value;
            for (let p of producers) {
                let voteInfo = await kvDPos.hget(ViewContext.keyVote, p);
                if (voteInfo.err === error_code_1.ErrorCode.RESULT_OK) {
                    let vote = voteInfo.value.plus(amount);
                    if (vote.eq(0)) {
                        await kvDPos.hdel(ViewContext.keyVote, p);
                    }
                    else {
                        await kvDPos.hset(ViewContext.keyVote, p, vote);
                    }
                }
                else {
                    assert(amount.gt(0), '_updatevote amount must positive');
                    await kvDPos.hset(ViewContext.keyVote, p, amount);
                }
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _shuffle(shuffle_factor, producers) {
        let buf = Buffer.from(shuffle_factor);
        let total = 0;
        for (let i = 0; i < buf.length; i++) {
            total = total + buf[i];
        }
        for (let i = 0; i < producers.length; ++i) {
            let k = total + i * 2685821657736338717;
            k ^= (k >> 12);
            k ^= (k << 25);
            k ^= (k >> 27);
            k *= 2685821657736338717;
            let jmax = producers.length - i;
            let j = i + k % jmax;
            let temp = producers[i];
            producers[i] = producers[j];
            producers[j] = temp;
        }
    }
}
exports.Context = Context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc2Vuc3VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvZHBvc19jaGFpbi9jb25zZW5zdXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBeUM7QUFDekMsOENBQXdDO0FBRXhDLCtDQUF1QztBQUN2QyxpQ0FBaUM7QUFHakMsbURBQW1EO0FBQ25ELGtDQUFrQztBQUNsQyxvQkFBb0I7QUFFcEIsU0FBUztBQUNULGtDQUFrQztBQUVsQyxjQUFjO0FBQ2QsMENBQTBDO0FBRTFDLDJCQUEyQjtBQUMzQixzQ0FBc0M7QUFFdEMsa0JBQWtCO0FBQ2xCLGdDQUFnQztBQUVoQyxpQkFBaUI7QUFDakIsK0JBQStCO0FBRS9CLHlCQUF5QjtBQUN6QiwwQ0FBMEM7QUFFMUMsa0JBQWtCO0FBQ2xCLHFEQUFxRDtBQUVyRCxTQUFTO0FBQ1QscURBQXFEO0FBRXJELDRCQUE0QjtBQUM1QixvREFBb0Q7QUFFcEQsOEJBQXFDLGFBQWtCO0lBQ25ELElBQUksd0JBQWlCLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQzlDLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsSUFBSSx3QkFBaUIsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDOUMsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLHdCQUFpQixDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3BELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsSUFBSSx3QkFBaUIsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDaEQsT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFDRCxJQUFJLHdCQUFpQixDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1FBQ3hELE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBQ0QsSUFBSSx3QkFBaUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDMUMsT0FBTyxL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