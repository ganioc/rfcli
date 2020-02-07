"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const LRUCache_1 = require("../lib/LRUCache");
const chain_state_1 = require("./chain_state");
class DposChainTipStateCreator {
    createChainTipState(options) {
        return new chain_state_1.DposChainTipState(options);
    }
}
exports.DposChainTipStateCreator = DposChainTipStateCreator;
class DposChainTipStateManager {
    constructor(options) {
        this.m_tipStateCache = new LRUCache_1.LRUCache(DposChainTipStateManager.cacheSize);
        this.m_options = options;
        this.m_bestChainTipState = this.m_options.creator.createChainTipState(this.m_options);
        this.m_tipStateCache.set(this.m_options.libHeader.hash, this.m_bestChainTipState);
    }
    getBestChainState() {
        return this.m_bestChainTipState;
    }
    async init() {
        let tipNumber = this.m_options.chain.tipBlockHeader ? this.m_options.chain.tipBlockHeader.number : 0;
        if (tipNumber === 0) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        return await this.buildChainStateOnBest(tipNumber);
    }
    async updateBestChainTip(header) {
        // 可能分叉了 已经切换分支了，所以需要从fork上去bulid
        let hr = await this.buildChainStateOnFork(header);
        if (hr.err) {
            return hr;
        }
        this.m_bestChainTipState = hr.state;
        return hr;
    }
    async compareIrreversibleBlockNumer(compareHeader, specilHeader) {
        if (compareHeader.preBlockHash === specilHeader.hash) {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: 0 };
        }
        let hrSpecil = await this.buildChainStateOnFork(specilHeader);
        if (hrSpecil.err) {
            return { err: hrSpecil.err };
        }
        // compareHeader没有和specilHeader在specil的lib处相交，那么compareHeader的lib一定小于specilHeader的
        let prev = compareHeader.hash;
        let n = compareHeader.number;
        while (n >= hrSpecil.state.irreversible) {
            let hr = await this.m_options.chain.getHeader(prev);
            if (hr.err) {
                return { err: hr.err };
            }
            if (prev === hrSpecil.state.irreversibleHash) {
                break;
            }
            prev = hr.header.preBlockHash;
            n--;
        }
        if (n > hrSpecil.state.irreversible) {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: -1 };
        }
        let hrCompare = await this.buildChainStateOnFork(compareHeader);
        if (hrCompare.err) {
            return { err: hrCompare.err };
        }
        if (hrSpecil.state.irreversible === hrCompare.state.irreversible) {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: 0 };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, result: hrCompare.state.irreversible - hrSpecil.state.irreversible };
    }
    async buildChainStateOnBest(toIndex) {
        let state = this.m_bestChainTipState;
        let beginIndex = state.tip.number + 1;
        if (toIndex < beginIndex) {
            this.m_options.chain.logger.error(`buildChainStateOnBest param error according to number, toIndex ${toIndex} beginIndex ${beginIndex}`);
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        // header必须要通过number去getHeader一次，确保在bestchain上面
        for (let i = beginIndex; i <= toIndex; i++) {
            let hr = await this.m_options.chain.getHeader(i);
            if (hr.err) {
                this.m_options.chain.logger.error(`buildChainStateOnBest get header error according to number, err = ${hr.err}`);
                return hr.err;
            }
            let err = await state.updateTip(hr.header);
            if (err) {
                this.m_options.chain.logger.error(`buildChainStateOnBest updateTip error according to number, err = ${err}`);
                return err;
            }
        }
        this.m_bestChainTipState = state;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async buildChainStateOnFork(header) {
        this.m_tipStateCache.set(this.m_bestChainTipState.tip.hash, this.m_bestChainTipState);
        let s = this.m_tipStateCache.get(header.hash);
        if (s) {
            return { err: error_code_1.ErrorCode.RESULT_OK, state: s }; // --------------------------------------------
        }
        // 可能冲best上面，也可能是重其他fork上面,只能按照hash查找
        let headers = [];
        // 分支一定是从当前链的最后一个不可逆点或者它之后的点开始复制的，否则不需要创建
        let newState = this.m_options.creator.createChainTipState(this.m_options);
        while (true) {
            if (header.number < this.m_bestChainTipState.irreversible) {
                this.m_options.chain.logger.error(`buildChainStateOnFork failed, for the fork and best's crossed block number is less than the best's irreversible`);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            let cacheState = this.m_tipStateCache.get(header.hash);
            if (cacheState) { // 需要确认相交点
                this.m_tipStateCache.remove(header.hash);
                newState = cacheState;
                break;
            }
            if (header.number === this.m_bestChainTipState.irreversible && header.hash === this.m_bestChainTipState.irreversibleHash) {
                let hr1 = await this.m_options.chain.getHeader(this.m_bestChainTipState.irreversibleHash);
                if (hr1.err) {
                    this.m_options.chain.logger.error(`buildChainStateOnFork failed, get header failed,errcode=${hr1.err},hash=${this.m_bestChainTipState.irreversibleHash}`);
                    return { err: hr1.err };
                }
                let hr2 = await this.m_options.chain.getMiners(hr1.header);
                if (hr2.err) {
                    this.m_options.chain.logger.error(`buildChainStateOnFork failed, get miners failed,errcode=${hr2.err}, hash=${this.m_bestChainTipState.irreversibleHash}`);
                    return { err: hr2.err };
                }
                newState = this.m_options.creator.createChainTipState({ libHeader: hr1.header, libMiners: hr2.creators, chain: this.m_options.chain, globalOptions: this.m_options.globalOptions });
                break;
            }
            headers.unshift(header);
            let hr = await this.m_options.chain.getHeader(header.preBlockHash);
            if (hr.err) {
                this.m_options.chain.logger.error(`buildChainState get header error according to hash, err = ${hr.err}`);
                return { err: hr.err };
            }
            header = hr.header;
        }
        for (let h of headers) {
            let err = await newState.updateTip(h);
            if (err) {
                this.m_options.chain.logger.error(`buildChainState updateTip error according to number, err = ${err}`);
                return { err };
            }
        }
        this.m_tipStateCache.set(header.hash, newState);
        return { err: error_code_1.ErrorCode.RESULT_OK, state: newState };
    }
}
DposChainTipStateManager.cacheSize = 500;
exports.DposChainTipStateManager = DposChainTipStateManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fc3RhdGVfbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Rwb3NfY2hhaW4vY2hhaW5fc3RhdGVfbWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUN4Qyw4Q0FBeUM7QUFDekMsK0NBQTBFO0FBRzFFO0lBQ1csbUJBQW1CLENBQUMsT0FBaUM7UUFDeEQsT0FBTyxJQUFJLCtCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSjtBQUpELDREQUlDO0FBTUQ7SUFNSSxZQUFZLE9BQXdDO1FBSDFDLG9CQUFlLEdBQXdDLElBQUksbUJBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUk5RyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUN6QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDO0lBQ3BDLENBQUM7SUFFTSxLQUFLLENBQUMsSUFBSTtRQUNiLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsY0FBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtZQUNqQixPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO1NBQzlC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