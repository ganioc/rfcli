"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("./chain");
const error_code_1 = require("../error_code");
const assert = require("assert");
const events_1 = require("events");
var MinerState;
(function (MinerState) {
    MinerState[MinerState["none"] = 0] = "none";
    MinerState[MinerState["init"] = 1] = "init";
    MinerState[MinerState["syncing"] = 2] = "syncing";
    MinerState[MinerState["idle"] = 3] = "idle";
    MinerState[MinerState["executing"] = 4] = "executing";
    MinerState[MinerState["mining"] = 5] = "mining";
})(MinerState = exports.MinerState || (exports.MinerState = {}));
class Miner extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_constructOptions = options;
        this.m_logger = options.logger;
        this.m_state = MinerState.none;
    }
    get chain() {
        return this.m_chain;
    }
    async initComponents() {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state > MinerState.none) {
            return error_code_1.ErrorCode.RESULT_OK;
        }
        this.m_chain = this._chainInstance();
        let err = await this.m_chain.initComponents();
        if (err) {
            this.m_logger.error(`miner initComponent failed for chain initComponent failed`, err);
            return err;
        }
        this.m_state = MinerState.init;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async uninitComponents() {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state !== MinerState.init) {
            return;
        }
        await this.m_chain.uninitComponents();
        delete this.m_chain;
        this.m_state = MinerState.none;
    }
    _chainInstance() {
        return new chain_1.Chain(this.m_constructOptions);
    }
    parseInstanceOptions(options) {
        const chainRet = this.m_chain.parseInstanceOptions(options);
        if (chainRet.err) {
            return chainRet;
        }
        let value = chainRet.value;
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    async initialize(options) {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state !== MinerState.init) {
            this.m_logger.error(`miner initialize failed hasn't initComponent`);
            return error_code_1.ErrorCode.RESULT_INVALID_STATE;
        }
        this.m_state = MinerState.syncing;
        let err = await this.m_chain.initialize(options);
        if (err) {
            this.m_logger.error(`miner initialize failed for chain initialize failed ${err}`);
            return err;
        }
        this.m_onTipBlockListener = this._onTipBlock.bind(this);
        this.m_chain.on('tipBlock', this.m_onTipBlockListener);
        this.m_state = MinerState.idle;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async uninitialize() {
        // 上层保证await调用别重入了, 不加入中间状态了
        if (this.m_state <= MinerState.init) {
            return;
        }
        this.m_chain.removeListener('tipBlock', this.m_onTipBlockListener);
        delete this.m_onTipBlockListener;
        await this.m_chain.uninitialize();
        this.m_state = MinerState.init;
    }
    async create(genesisOptions) {
        if (this.m_state !== MinerState.init) {
            this.m_logger.error(`miner create failed hasn't initComponent`);
            return error_code_1.ErrorCode.RESULT_INVALID_STATE;
        }
        let genesis = this.m_chain.newBlock();
        genesis.header.timestamp = Date.now() / 1000;
        let sr = await this.chain.storageManager.createStorage('genesis');
        if (sr.err) {
            return sr.err;
        }
        let err = error_code_1.ErrorCode.RESULT_OK;
        do {
            err = await this._decorateBlock(genesis);
            if (err) {
                break;
            }
            err = await this.chain.onCreateGenesisBlock(genesis, sr.storage, genesisOptions);
            if (err) {
                break;
            }
            let nber = await this.chain.newBlockExecutor({ block: genesis, storage: sr.storage });
            if (nber.err) {
                err = nber.err;
                break;
            }
            err = await nber.executor.execute();
            await nber.executor.finalize();
            if (err) {
                break;
            }
            let ssr = await this.chain.storageManager.createSnapshot(sr.storage, genesis.header.hash);
            if (ssr.err) {
                err = ssr.err;
                break;
            }
            assert(ssr.snapshot);
            err = await this.chain.onPostCreateGenesis(genesis, ssr.snapshot);
        } while (false);
        await sr.storage.remove();
        return err;
    }
    _setIdle(name) {
        if (this._checkCancel(name)) {
            return;
        }
        this.m_state = MinerState.idle;
        delete this.m_stateContext;
    }
    _checkCancel(name) {
        if (this.m_state <= MinerState.idle) {
            return true;
        }
        if (this.m_state > MinerState.idle) {
            if (this.m_stateContext.name !== name) {
                return true;
            }
        }
        return false;
    }
    _onCancel(state, context) {
        if (state === MinerState.executing) {
            if (context && context.routine) {
                context.routine.cancel();
            }
        }
    }
    async _createExecuteRoutine(block) {
        let name = `${Date.now()}${block.header.preBlockHash}`;
        if (this.m_state !== MinerState.idle) {
            if (this.m_state > MinerState.idle) {
                if (this.m_stateContext.name === name) {
                    return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE };
                }
                else {
                    let state = this.m_state;
                    let context = this.m_stateContext;
                    this.m_state = MinerState.idle;
                    delete this.m_stateContext;
                    this._onCancel(state, context);
                }
            }
            else {
                return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE };
            }
        }
        this.m_state = MinerState.executing;
        this.m_stateContext = Object.create(null);
        this.m_stateContext.name = name;
        let sr = await this.chain.storageManager.createStorage(name, block.header.preBlockHash);
        if (sr.err) {
            this._setIdle(name);
            return { err: sr.err };
        }
        sr.storage.createLogger();
        const crr = this.chain.routineManager.create({ name, block, storage: sr.storage });
        if (crr.err) {
            this._setIdle(name);
            await sr.storage.remove();
            return { err: crr.err };
        }
        const routine = crr.routine;
        this.m_stateContext.routine = crr.routine;
        const next = async () => {
            let err;
            do {
                const rer = await routine.execute();
                err = rer.err;
                if (err) {
                    this.m_logger.error(`${routine.name} block execute failed! ret ${err}`);
                    break;
                }
                err = rer.result.err;
                if (err) {
                    this.m_logger.error(`${routine.name} block execute failed! ret ${err}`);
                    break;
                }
                if (this._checkCancel(routine.name)) {
                    err = error_code_1.ErrorCode.RESULT_CANCELED;
                    this.m_logger.error(`${routine.name} block execute canceled! ret ${err}`);
                    break;
                }
                this.m_state = MinerState.mining;
                delete this.m_stateContext.routine;
                err = await this._mineBlock(routine.block);
                if (err) {
                    this.m_logger.error(`mine block failed! ret ${err}`);
                    break;
                }
                if (this._checkCancel(routine.name)) {
                    err = error_code_1.ErrorCode.RESULT_CANCELED;
                    this.m_logger.error(`${name} block execute canceled! ret ${err}`);
                    break;
                }
            } while (false);
            this._setIdle(routine.name);
            if (err) {
                await routine.storage.remove();
                return { err };
            }
            let ssr = await this.chain.storageManager.createSnapshot(routine.storage, routine.block.hash, true);
            if (ssr.err) {
                return { err: ssr.err };
            }
            await this.chain.addMinedBlock(routine.block, ssr.snapshot);
            this.m_logger.info(`finish mine a block on block hash: ${this.chain.tipBlockHeader.hash} number: ${this.chain.tipBlockHeader.number}`);
            return { err: error_code_1.ErrorCode.RESULT_OK, block: routine.block };
        };
        return { err: error_code_1.ErrorCode.RESULT_OK, routine, next };
    }
    async _createBlock(header) {
        let block = this.chain.newBlock(header);
        this._collectTransactions(block);
        await this._decorateBlock(block);
        const cer = await this._createExecuteRoutine(block);
        if (cer.err) {
            return { err: cer.err };
        }
        return cer.next();
    }
    _collectTransactions(block) {
        let tx = this.chain.pending.popTransaction();
        while (tx) {
            block.content.addTransaction(tx);
            tx = this.chain.pending.popTransaction();
        }
    }
    /**
     * virtual
     * @param chain
     * @param tipBlock
     */
    async _onTipBlock(chain, tipBlock) {
    }
    /**
     * virtual
     * @param block
     */
    async _mineBlock(block) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _decorateBlock(block) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.Miner = Miner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jaGFpbi9taW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE4RjtBQUU5Riw4Q0FBd0M7QUFDeEMsaUNBQWlDO0FBRWpDLG1DQUFzQztBQU90QyxJQUFZLFVBT1g7QUFQRCxXQUFZLFVBQVU7SUFDbEIsMkNBQVEsQ0FBQTtJQUNSLDJDQUFRLENBQUE7SUFDUixpREFBVyxDQUFBO0lBQ1gsMkNBQVEsQ0FBQTtJQUNSLHFEQUFhLENBQUE7SUFDYiwrQ0FBVSxDQUFBO0FBQ2QsQ0FBQyxFQVBXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBT3JCO0FBRUQsV0FBbUIsU0FBUSxxQkFBWTtJQVFuQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBRW5DLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxPQUFRLENBQUM7SUFDekIsQ0FBQztJQUVNLEtBQUssQ0FBQyxjQUFjO1FBQ3RCLDRCQUE0QjtRQUM3QixJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRTtZQUNoQyxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO1NBQzlCO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDckMsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQy9DLElBQUksR0FBRyxFQUFFO1lBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsMkRBQTJELEVB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