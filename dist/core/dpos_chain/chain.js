"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
const block_1 = require("./block");
const consensus = require("./consensus");
const ValueContext = require("../value_chain/context");
const executor_1 = require("./executor");
const chain_state_manager_1 = require("./chain_state_manager");
const initMinersSql = 'CREATE TABLE IF NOT EXISTS "miners"("hash" CHAR(64) PRIMARY KEY NOT NULL UNIQUE, "miners" TEXT NOT NULL);';
const updateMinersSql = 'REPLACE INTO miners (hash, miners) values ($hash, $miners)';
const getMinersSql = 'SELECT miners FROM miners WHERE hash=$hash';
class DposChain extends value_chain_1.ValueChain {
    constructor(options) {
        super(options);
        this.m_epochTime = 0;
    }
    get epochTime() {
        return this.m_epochTime;
    }
    get stateManager() {
        return this.m_stateManager;
    }
    get chainTipState() {
        return this.m_stateManager.getBestChainState();
    }
    // DPOS中，只广播tipheader
    get _broadcastDepth() {
        return 0;
    }
    get _ignoreVerify() {
        return true;
    }
    createChainTipStateCreator() {
        return new chain_state_manager_1.DposChainTipStateCreator();
    }
    async initialize(instanceOptions) {
        let err = await super.initialize(instanceOptions);
        if (err) {
            return err;
        }
        let hr = await this.getHeader(0);
        if (hr.err) {
            return hr.err;
        }
        this.m_epochTime = hr.header.timestamp;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async initComponents(options) {
        let err = await super.initComponents(options);
        if (err) {
            return err;
        }
        const readonly = options && options.readonly;
        if (!readonly) {
            try {
                await this.m_db.run(initMinersSql);
            }
            catch (e) {
                this.logger.error(e);
                return error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
        }
        let hr = await this.getHeader(0);
        if (!hr.err) {
            let hr1 = await this.getMiners(hr.header);
            if (!hr1.err) {
                this.m_stateManager = new chain_state_manager_1.DposChainTipStateManager({
                    libHeader: hr.header,
                    libMiners: hr1.creators,
                    chain: this,
                    globalOptions: this.globalOptions,
                    creator: this.createChainTipStateCreator()
                });
                return await this.m_stateManager.init();
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async prepareExternParams(block, storage) {
        this.m_logger.debug(`begin prepare executor extern params for ${block.hash}`);
        // Added by Yang Jun 2018-12-25
        if (block.number === 0) {
            return { err: error_code_1.ErrorCode.RESULT_OK, params: [] };
        }
        const csr = await this.executorParamCreator.createStorage({
            storageManager: this.storageManager,
            blockHash: this.chainTipState.irreversibleHash
        });
        if (csr.err) {
            return { err: csr.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, params: [csr.param] };
    }
    async _newBlockExecutor(block, storage, externParams) {
        let kvBalance = (await storage.getKeyValue(value_chain_1.Chain.dbSystem, value_chain_1.ValueChain.kvBalance)).kv;
        let ve = new ValueContext.Context(kvBalance);
        let externalContext = Object.create(null);
        externalContext.getBalance = async (address) => {
            return await ve.getBalance(address);
        };
        externalContext.transferTo = async (address, amount) => {
            return await ve.transferTo(value_chain_1.ValueChain.sysAddress, address, amount);
        };
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            return { err: dbr.err };
        }
        let de = new consensus.Context({ currDatabase: dbr.value, globalOptions: this.globalOptions, logger: this.m_logger });
        externalContext.vote = async (from, candiates) => {
            let vr = await de.vote(from, candiates);
            if (vr.err) {
                throw new Error();
            }
            return vr.returnCode;
        };
        externalContext.mortgage = async (from, amount) => {
            let mr = await de.mortgage(from, amount);
            if (mr.err) {
                throw new Error();
            }
            return mr.returnCode;
        };
        externalContext.unmortgage = async (from, amount) => {
            let mr = await de.unmortgage(from, amount);
            if (mr.err) {
                throw new Error();
            }
            return mr.returnCode;
        };
        externalContext.register = async (from) => {
            let mr = await de.registerToCandidate(from);
            if (mr.err) {
                throw new Error();
            }
            return mr.returnCode;
        };
        externalContext.getVote = async () => {
            let gvr = await de.getVote();
            if (gvr.err) {
                throw new Error();
            }
            return gvr.vote;
        };
        externalContext.getStake = async (address) => {
            let gsr = await de.getStake(address);
            if (gsr.err) {
                throw new Error();
            }
            return gsr.stake;
        };
        externalContext.getCandidates = async () => {
            let gc = await de.getCandidates();
            if (gc.err) {
                throw Error();
            }
            return gc.candidates;
        };
        externalContext.getMiners = async () => {
            let gm = await de.getNextMiners();
            if (gm.err) {
                throw Error();
            }
            return gm.creators;
        };
        let options = {
            logger: this.logger,
            block,
            storage,
            handler: this.m_handler,
            externContext: externalContext,
            globalOptions: this.m_globalOptions,
            externParams
        };
        let executor = new executor_1.DposBlockExecutor(options);
        return { err: error_code_1.ErrorCode.RESULT_OK, executor: executor };
    }
    async newViewExecutor(header, storage, method, param) {
        let nvex = await super.newViewExecutor(header, storage, method, param);
        let externalContext = nvex.executor.externContext;
        let dbr = await storage.getReadableDataBase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            return { err: dbr.err };
        }
        let de = new consensus.ViewContext({ currDatabase: dbr.value, globalOptions: this.m_globalOptions, logger: this.logger });
        externalContext.getVote = async () => {
            let gvr = await de.getVote();
            if (gvr.err) {
                throw new Error();
            }
            return gvr.vote;
        };
        externalContext.getStake = async (address) => {
            let gsr = await de.getStake(address);
            if (gsr.err) {
                throw new Error();
            }
            return gsr.stake;
        };
        externalContext.getCandidates = async () => {
            let gc = await de.getCandidates();
            if (gc.err) {
                throw Error();
            }
            return gc.candidates;
        };
        externalContext.getMiners = async () => {
            let gm = await de.getNextMiners();
            if (gm.err) {
                throw Error();
            }
            return gm.creators;
        };
        return nvex;
    }
    async _verifyAndSaveHeaders(headers) {
        if (headers.length === 0) {
            return await super._verifyAndSaveHeaders(headers);
        }
        let header = headers[headers.length - 1];
        let now = Math.ceil(Date.now() / 1000);
        if (header.timestamp > now) {
            this.logger.error(`dpos chain _verifyAndSaveHeaders last block time ${header.timestamp} must small now ${now}`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
        }
        let hr = await this.getHeader(headers[0].preBlockHash);
        if (hr.err) {
            this.logger.warn(`dpos chain _verifyAndSaveHeaders get prev header failed prevhash=${headers[0].preBlockHash} hash=${headers[0].hash}`);
            return { err: hr.err };
        }
        if (headers[0].timestamp - hr.header.timestamp < this.globalOptions.blockInterval) {
            this.logger.error(`1 dpos chain _verifyAndSaveHeaders curr block time ${headers[0].timestamp} - prevtime ${hr.header.timestamp} small blockinterval ${this.globalOptions.blockInterval}`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
        }
        for (let i = 1; i < headers.length; i++) {
            if (headers[i].timestamp - headers[i - 1].timestamp < this.globalOptions.blockInterval) {
                this.logger.error(`2 dpos chain _verifyAndSaveHeaders curr block time ${headers[i].timestamp} - prevtime ${headers[i - 1].timestamp} small blockinterval ${this.globalOptions.blockInterval}`);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_BLOCK };
            }
        }
        return await super._verifyAndSaveHeaders(headers);
    }
    async _compareWork(comparedHeader, bestChainTip) {
        let hr = await this.m_stateManager.compareIrreversibleBlockNumer(comparedHeader, bestChainTip);
        if (hr.err) {
            return { err: hr.err };
        }
        if (hr.result !== 0) {
            return hr;
        }
        // 不可逆点相同，更长的链优先
        let height = comparedHeader.number - bestChainTip.number;
        if (height !== 0) {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: height };
        }
        // 高度相同更晚的优先
        let leftIndex = comparedHeader.getTimeIndex(this);
        let rightIndex = bestChainTip.getTimeIndex(this);
        let time = leftIndex - rightIndex;
        if (time !== 0) {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: time };
        }
        // 时间戳都相同， 就算了， 很罕见吧， 随缘
        return { err: error_code_1.ErrorCode.RESULT_OK, result: time };
    }
    async _calcuteReqLimit(fromHeader, limit) {
        let hr = await this.getHeader(fromHeader);
        let reSelectionBlocks = this.globalOptions.reSelectionBlocks;
        return reSelectionBlocks - (hr.header.number % reSelectionBlocks);
    }
    async _onMorkSnapshot(options) {
        // TODO: add irrerveriable 
        options.toMork.add(this.chainTipState.irreversibleHash);
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    async getMiners(header) {
        let en = consensus.ViewContext.getElectionBlockNumber(this.globalOptions, header.number);
        let electionHeader;
        if (header.number === en) {
            electionHeader = header;
        }
        else {
            let hr = await this.getHeader(header.preBlockHash, en - header.number + 1);
            if (hr.err) {
                this.logger.error(`get electionHeader error,number=${header.number},prevblockhash=${header.preBlockHash}`);
                return { err: hr.err };
            }
            electionHeader = hr.header;
        }
        try {
            const gm = await this.m_db.get(getMinersSql, { $hash: electionHeader.hash });
            if (!gm || !gm.miners) {
                this.logger.error(`getMinersSql error,election block hash=${electionHeader.hash},en=${en},header.height=${header.number}`);
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, header: electionHeader, creators: JSON.parse(gm.miners) };
        }
        catch (e) {
            this.logger.error(e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async _onVerifiedBlock(block) {
        let err = await this.saveMiners(block);
        if (err) {
            return err;
        }
        if (block.number === 0) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        let hr = await this.m_stateManager.updateBestChainTip(block.header);
        if (hr.err) {
            return hr.err;
        }
        this.logger.info(`==========dpos chain state=${this.chainTipState.dump()}`);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onForkedBlock(block) {
        return await this.saveMiners(block);
    }
    async saveMiners(block) {
        if (block.number !== 0 && block.number % this.globalOptions.reSelectionBlocks !== 0) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        let gs = await this.storageManager.getSnapshotView(block.hash);
        if (gs.err) {
            return gs.err;
        }
        let dbr = await gs.storage.getReadableDataBase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            return dbr.err;
        }
        let viewDenv = new consensus.ViewContext({ currDatabase: dbr.value, globalOptions: this.globalOptions, logger: this.m_logger });
        let minersInfo = await viewDenv.getNextMiners();
        this.storageManager.releaseSnapshotView(block.hash);
        if (minersInfo.err) {
            return minersInfo.err;
        }
        try {
            await this.m_db.run(updateMinersSql, { $hash: block.hash, $miners: JSON.stringify(minersInfo.creators) });
            return error_code_1.ErrorCode.RESULT_OK;
        }
        catch (e) {
            this.logger.error(e);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
    }
    _onCheckGlobalOptions(globalOptions) {
        if (!super._onCheckGlobalOptions(globalOptions)) {
            return false;
        }
        return consensus.onCheckGlobalOptions(globalOptions);
    }
    _getBlockHeaderType() {
        return block_1.DposBlockHeader;
    }
    _onCheckTypeOptions(typeOptions) {
        return typeOptions.consensus === 'dpos';
    }
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let err = await super.onCreateGenesisBlock(block, storage, genesisOptions);
        if (err) {
            return err;
        }
        let gkvr = await storage.getKeyValue(value_chain_1.Chain.dbSystem, value_chain_1.Chain.kvConfig);
        if (gkvr.err) {
            return gkvr.err;
        }
        let rpr = await gkvr.kv.set('consensus', 'dpos');
        if (rpr.err) {
            return rpr.err;
        }
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            return dbr.err;
        }
        // storage的键值对要在初始化的时候就建立好
        let kvr = await dbr.value.createKeyValue(consensus.ViewContext.kvDPOS);
        if (kvr.err) {
            return kvr.err;
        }
        let denv = new consensus.Context({ currDatabase: dbr.value, globalOptions: this.globalOptions, logger: this.m_logger });
        let ir = await denv.init(genesisOptions.candidates, genesisOptions.miners);
        if (ir.err) {
            return ir.err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    getLastIrreversibleBlockNumber() {
        return this.chainTipState.irreversible;
    }
}
exports.DposChain = DposChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2NoYWluL2NoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsOENBQTBDO0FBQzFDLGdEQUFtUjtBQUVuUixtQ0FBMEM7QUFDMUMseUNBQXlDO0FBQ3pDLHVEQUF1RDtBQUN2RCx5Q0FBeUU7QUFFekUsK0RBQXlGO0FBK0J6RixNQUFNLGFBQWEsR0FBRywyR0FBMkcsQ0FBQztBQUNsSSxNQUFNLGVBQWUsR0FBRyw0REFBNEQsQ0FBQztBQUNyRixNQUFNLFlBQVksR0FBRyw0Q0FBNEMsQ0FBQztBQUVsRSxlQUF1QixTQUFRLHdCQUFVO0lBSXJDLFlBQVksT0FBNkI7UUFDckMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBSlQsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFLbEMsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ1osT0FBTyxJQUFJLENBQUMsY0FBZSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxjQUFlLENBQUMsaUJBQWlCLEVBQUcsQ0FBQztJQUNyRCxDQUFDO0lBQ0QscUJBQXFCO0lBQ3JCLElBQWMsZUFBZTtRQUN6QixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxJQUFjLGFBQWE7UUFDdkIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVTLDBCQUEwQjtRQUNoQyxPQUFPLElBQUksOENBQXdCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxlQUFxQztRQUN6RCxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbEQsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEdBQUcsQ0FB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