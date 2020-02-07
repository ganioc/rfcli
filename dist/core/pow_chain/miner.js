"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const assert = require("assert");
const error_code_1 = require("../error_code");
const workpool_1 = require("../lib/workpool");
const writer_1 = require("../lib/writer");
const value_chain_1 = require("../value_chain");
const block_1 = require("./block");
const consensus = require("./consensus");
const chain_1 = require("./chain");
class PowMiner extends value_chain_1.ValueMiner {
    constructor(options) {
        super(options);
        const filename = path.resolve(__dirname, '../../routine/pow_worker.js');
        this.workpool = new workpool_1.Workpool(filename, 1);
    }
    _chainInstance() {
        return new chain_1.PowChain(this.m_constructOptions);
    }
    get chain() {
        return this.m_chain;
    }
    _newHeader() {
        let tip = this.m_chain.tipBlockHeader;
        let blockHeader = new block_1.PowBlockHeader();
        blockHeader.setPreBlock(tip);
        blockHeader.timestamp = Date.now() / 1000;
        return blockHeader;
    }
    async initialize(options) {
        if (options.coinbase) {
            this.m_coinbase = options.coinbase;
        }
        let err = await super.initialize(options);
        if (err) {
            return err;
        }
        this._createBlock(this._newHeader());
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _mineBlock(block) {
        // 这里计算bits
        this.m_logger.info(`begin mine Block (${block.number})`);
        let tr = await consensus.getTarget(block.header, this.m_chain);
        if (tr.err) {
            return tr.err;
        }
        assert(tr.target !== undefined);
        if (tr.target === 0) {
            // console.error(`cannot get target bits for block ${block.number}`);
            return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
        }
        block.header.bits = tr.target;
        // 使用一个workerpool来计算正确的nonce
        let ret = await this._calcuteBlockHashWorkpool(block.header, { start: 0, end: consensus.INT32_MAX }, { start: 0, end: consensus.INT32_MAX });
        if (ret === error_code_1.ErrorCode.RESULT_OK) {
            block.header.updateHash();
            this.m_logger.info(`mined Block (${block.number}) target ${block.header.bits} : ${block.header.hash}`);
        }
        return ret;
    }
    /**
     * virtual
     * @param chain
     * @param tipBlock
     */
    async _onTipBlock(chain, tipBlock) {
        this.m_logger.info(`onTipBlock ${tipBlock.number} : ${tipBlock.hash}`);
        setTimeout(() => {
            this._createBlock(this._newHeader());
        }, this.m_chain.globalOptions.targetTimespan * 1000 / 4);
    }
    _onCancel(state, context) {
        super._onCancel(state, context);
        if (state === value_chain_1.MinerState.mining) {
            this.m_logger.info(`cancel mining`);
            this.workpool.stop();
        }
    }
    async _calcuteBlockHashWorkpool(blockHeader, nonceRange, nonce1Range) {
        return new Promise((reslove, reject) => {
            let writer = new writer_1.BufferWriter();
            let err = blockHeader.encode(writer);
            if (err) {
                this.m_logger.error(`header encode failed `, blockHeader);
                reslove(err);
                return;
            }
            let buffer = writer.render();
            this.workpool.push({ data: buffer, nonce: nonceRange, nonce1: nonce1Range }, (code, signal, ret) => {
                if (code === 0) {
                    let result = JSON.parse(ret);
                    blockHeader.nonce = result['nonce'];
                    blockHeader.nonce1 = result['nonce1'];
                    assert(blockHeader.verifyPOW());
                    reslove(error_code_1.ErrorCode.RESULT_OK);
                }
                else if (signal === 'SIGTERM') {
                    reslove(error_code_1.ErrorCode.RESULT_CANCELED);
                }
                else {
                    this.m_logger.error(`worker error! code: ${code}, ret: ${ret}`);
                    reslove(error_code_1.ErrorCode.RESULT_FAILED);
                }
            });
        });
    }
}
exports.PowMiner = PowMiner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9wb3dfY2hhaW4vbWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBRWpDLDhDQUEwQztBQUMxQyw4Q0FBeUM7QUFDekMsMENBQTZDO0FBRTdDLGdEQUE4STtBQUU5SSxtQ0FBeUM7QUFDekMseUNBQXlDO0FBQ3pDLG1DQUFtQztBQUtuQyxjQUFzQixTQUFRLHdCQUFVO0lBR3BDLFlBQVksT0FBNkI7UUFDckMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVTLGNBQWM7UUFDcEIsT0FBTyxJQUFJLGdCQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE9BQW1CLENBQUM7SUFDcEMsQ0FBQztJQUVPLFVBQVU7UUFDZCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBUSxDQUFDLGNBQWlDLENBQUM7UUFDMUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxzQkFBYyxFQUFFLENBQUM7UUFDdkMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixXQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDMUMsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZ0M7UUFDcEQsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FB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