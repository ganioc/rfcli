"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const assert = require('assert');
const error_code_1 = require("../error_code");
const writer_1 = require("../lib/writer");
const chain_1 = require("../chain");
const block_1 = require("./block");
const context_1 = require("./context");
const reader_1 = require("../lib/reader");
const libAddress = require("../address");
const digest = require('../lib/digest');
var DBFT_SYNC_CMD_TYPE;
(function (DBFT_SYNC_CMD_TYPE) {
    DBFT_SYNC_CMD_TYPE[DBFT_SYNC_CMD_TYPE["prepareRequest"] = 23] = "prepareRequest";
    DBFT_SYNC_CMD_TYPE[DBFT_SYNC_CMD_TYPE["prepareResponse"] = 24] = "prepareResponse";
    DBFT_SYNC_CMD_TYPE[DBFT_SYNC_CMD_TYPE["changeview"] = 25] = "changeview";
    DBFT_SYNC_CMD_TYPE[DBFT_SYNC_CMD_TYPE["end"] = 26] = "end";
})(DBFT_SYNC_CMD_TYPE = exports.DBFT_SYNC_CMD_TYPE || (exports.DBFT_SYNC_CMD_TYPE = {}));
var ConsensusState;
(function (ConsensusState) {
    ConsensusState[ConsensusState["none"] = 0] = "none";
    ConsensusState[ConsensusState["waitingCreate"] = 1] = "waitingCreate";
    ConsensusState[ConsensusState["waitingProposal"] = 2] = "waitingProposal";
    ConsensusState[ConsensusState["waitingVerify"] = 3] = "waitingVerify";
    ConsensusState[ConsensusState["waitingAgree"] = 4] = "waitingAgree";
    ConsensusState[ConsensusState["waitingBlock"] = 5] = "waitingBlock";
    ConsensusState[ConsensusState["changeViewSent"] = 10] = "changeViewSent";
    ConsensusState[ConsensusState["changeViewSucc"] = 11] = "changeViewSucc";
})(ConsensusState || (ConsensusState = {}));
class DbftConsensusNode extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_changeView = new Map();
        this.m_currView = 0;
        this.m_network = options.network;
        this.m_globalOptions = options.globalOptions;
        this.m_state = ConsensusState.none;
        this.m_secret = options.secret;
        this.m_address = libAddress.addressFromSecretKey(this.m_secret);
        this.m_pubkey = libAddress.publicKeyFromSecretKey(this.m_secret);
        let initBound = (conns) => {
            for (let conn of conns) {
                this._beginSyncWithNode(conn);
            }
        };
        let connOut = this.m_network.node.getOutbounds();
        initBound(connOut);
        let connIn = this.m_network.node.getInbounds();
        initBound(connIn);
        this.m_network.on('inbound', (conn) => {
            this._beginSyncWithNode(conn);
        });
        this.m_network.on('outbound', (conn) => {
            this._beginSyncWithNode(conn);
        });
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    get base() {
        return this.m_network;
    }
    get logger() {
        return this.m_network.logger;
    }
    async init() {
        // await this.m_node.init();
        let hr = await this.m_network.headerStorage.getHeader(0);
        if (hr.err) {
            this.logger.error(`dbft consensus node init failed for ${hr.err}`);
            return hr.err;
        }
        this.m_genesisTime = hr.header.timestamp;
        // let err = await this.m_node.initialOutbounds();
        // if (err) {
        //     this.logger.error(`dbft consensus node init failed for ${err}`);
        //     return err;
        // }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _cancel() {
        this.m_state = ConsensusState.none;
        this.m_context = undefined;
        this.m_changeView = new Map();
        this.m_currView = 0;
        this._resetTimer();
    }
    updateTip(header, nextMiners, totalView) {
        // TODO: 这里还需要比较两个header 的work，只有大的时候覆盖
        if (this.m_tip) {
            this.logger.info(`updateTip this.m_state=${this.m_state} totalView=${totalView} header_number=${header.number},${this.m_tip.header.hash} ${header.hash}`);
        }
        else {
            this.logger.info(`updateTip this.m_state=${this.m_state} ${totalView}`);
        }
        if (!this.m_tip || this.m_tip.header.hash !== header.hash) {
            this.m_tip = {
                header,
                nextMiners,
                totalView
            };
            this._cancel();
            this.m_network.setValidators(nextMiners);
        }
    }
    async agreeProposal(block) {
        if (this.m_state !== ConsensusState.waitingVerify) {
            this.logger.warn(`skip agreeProposal in state `, this.m_state);
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        let curContext = this.m_context;
        assert(curContext && curContext.block);
        if (!curContext || !curContext.block) {
            this.logger.error(`agreeProposal in invalid context `, curContext);
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        if (!this.m_tip.header.isPreBlock(block.header)) {
            this.logger.error(`agreeProposal block ${block.header.hash} ${block.number} in invalid context block ${this.m_tip.header.hash} ${this.m_tip.header.number}`);
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        this.m_state = ConsensusState.waitingAgree;
        let newContext = {
            curView: curContext.curView,
            block,
            signs: new Map()
        };
        // 可能已经收到了其他节点的验证信息
        for (let [k, v] of curContext.preSigns) {
            if (v.hash === block.hash) {
                newContext.signs.set(k, v.signInfo);
            }
        }
        this.m_context = newContext;
        const sign = libAddress.sign(block.hash, this.m_secret);
        this._sendPrepareResponse(block, sign);
        this._onPrepareResponse({ hash: block.hash, pubkey: this.m_pubkey, sign });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async newProposal(block) {
        assert(this.m_tip);
        if (!this.m_tip) {
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        if (this.m_state !== ConsensusState.waitingProposal) {
            this.logger.warn(`dbft conensus newProposal ${block.header.hash}  ${block.header.number} while not in blockCreated state`);
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        if (!this.m_tip.header.isPreBlock(block.header)) {
            this.logger.warn(`dbft conensus newProposal ${block.header.hash}  ${block.header.number} while in another context ${this.m_tip.header.hash} ${this.m_tip.header.number}`);
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        this.logger.info(`newProposal miners=${JSON.stringify(this.m_network.getValidators())}, blockhash=${block.hash}`);
        if (this.m_network.getValidators().length > 1) {
            let i = 0;
        }
        // 先对不完整的块进行签名，保证block的正常发送
        block.header.updateContent(block.content);
        let err = block.header.signBlock(this.m_secret);
        block.header.updateHash();
        if (err) {
            return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
        }
        this._sendPrepareRequest(block);
        this.m_state = ConsensusState.waitingVerify;
        let curContext = {
            curView: this.m_currView,
            block,
            preSigns: new Map()
        };
        this.m_context = curContext;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _resetTimer() {
        let tr = await this._nextTimeout();
        if (tr.err === error_code_1.ErrorCode.RESULT_SKIPPED) {
            return tr.err;
        }
        if (this.m_timer) {
            clearTimeout(this.m_timer);
            delete this.m_timer;
        }
        this.m_timer = setTimeout(async () => {
            delete this.m_timer;
            this._onTimeout();
            this._resetTimer();
        }, tr.timeout);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _isOneOfMiner() {
        return this.m_tip.nextMiners.indexOf(this.m_address) >= 0;
    }
    _onTimeout() {
        assert(this.m_tip);
        if (!this.m_tip) {
            this.logger.warn(`bdft consensus has no tip when time out`);
            return;
        }
        if (this.m_state === ConsensusState.waitingCreate) {
            this.m_state = ConsensusState.waitingProposal;
            let newContext = {
                curView: this.m_currView,
                preSigns: new Map()
            };
            this.m_context = newContext;
            let now = Date.now() / 1000;
            let blockHeader = new block_1.DbftBlockHeader();
            blockHeader.setPreBlock(this.m_tip.header);
            blockHeader.timestamp = now;
            blockHeader.view = this.m_currView;
            this.emit('createBlock', blockHeader);
        }
        else {
            // 超时，发起changeview
            let newView = 0;
            if (this.m_state === ConsensusState.changeViewSent) {
                newView = this.m_context.expectView + 1;
            }
            else {
                newView = this.m_currView + 1;
            }
            this.logger.debug(`${this.m_address} _onTimeout changeview ${newView}`);
            const sign = libAddress.sign(Buffer.from(digest.md5(Buffer.from(this.m_tip.header.hash + newView.toString(), 'hex')).toString('hex')), this.m_secret);
            this._sendChangeView(newView, sign);
            this.m_state = ConsensusState.changeViewSent;
            let newContext = {
                curView: this.m_currView,
                expectView: newView
            };
            this.m_context = newContext;
            this._onChangeView(newView, this.m_pubkey);
        }
    }
    async _sendPrepareRequest(block) {
        let writer = new writer_1.BufferWriter();
        let err = block.encode(writer);
        let data = writer.render();
        let pkg = chain_1.PackageStreamWriter.fromPackage(DBFT_SYNC_CMD_TYPE.prepareRequest, null, data.length).writeData(data);
        this.m_network.broadcastToValidators(pkg);
    }
    _sendPrepareResponse(block, sign) {
        let writer = new writer_1.BufferWriter();
        writer.writeBytes(this.m_pubkey);
        writer.writeBytes(sign);
        let data = writer.render();
        let pkg = chain_1.PackageStreamWriter.fromPackage(DBFT_SYNC_CMD_TYPE.prepareResponse, { hash: block.hash }, data.length).writeData(data);
        this.m_network.broadcastToValidators(pkg);
    }
    _sendChangeView(newView, sign) {
        let writer = new writer_1.BufferWriter();
        writer.writeBytes(this.m_pubkey);
        writer.writeBytes(sign);
        let data = writer.render();
        let pkg = chain_1.PackageStreamWriter.fromPackage(DBFT_SYNC_CMD_TYPE.changeview, { newView }, data.length).writeData(data);
        this.m_network.broadcastToValidators(pkg);
    }
    _beginSyncWithNode(conn) {
        conn.on('pkg', async (pkg) => {
            if (pkg.header.cmdType === DBFT_SYNC_CMD_TYPE.prepareRequest) {
                let block = this.base.newBlock();
                let reader = new reader_1.BufferReader(pkg.copyData());
                let err = block.decode(reader);
                if (err) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`recv invalid prepareRequest from `, conn.fullRemote);
                    return;
                }
                if (!block.header.verifySign()) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`recv invalid signature prepareRequest from `, conn.fullRemote);
                    return;
                }
                if (!block.verify()) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`recv invalid block in prepareRequest from `, conn.fullRemote);
                    return;
                }
                block.header.updateHash();
                this._onPrepareRequest({ block }, conn);
            }
            else if (pkg.header.cmdType === DBFT_SYNC_CMD_TYPE.prepareResponse) {
                const hash = pkg.body.hash;
                let reader = new reader_1.BufferReader(pkg.copyData());
                let pubkey;
                let sign;
                try {
                    pubkey = reader.readBytes(33);
                    sign = reader.readBytes(64);
                }
                catch (e) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`decode prepareResponse failed `, e);
                    return;
                }
                if (!libAddress.verify(hash, sign, pubkey)) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`prepareResponse verify sign invalid hash=${hash},pubkey=${pubkey.toString('hex')},sign=${sign.toString('hex')}`);
                    return;
                }
                if (libAddress.addressFromPublicKey(pubkey) === this.m_address) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`prepareResponse got my sign`);
                    return;
                }
                this._onPrepareResponse({ hash, pubkey, sign }, conn);
            }
            else if (pkg.header.cmdType === DBFT_SYNC_CMD_TYPE.changeview) {
                const newView = pkg.body.newView;
                let reader = new reader_1.BufferReader(pkg.copyData());
                let pubkey;
                let sign;
                try {
                    pubkey = reader.readBytes(33);
                    sign = reader.readBytes(64);
                }
                catch (e) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`decode changeView failed `, e);
                    return;
                }
                let viewBuf = Buffer.from(digest.md5(Buffer.from(this.m_tip.header.hash + newView.toString(), 'hex')).toString('hex'));
                if (!libAddress.verify(viewBuf, sign, pubkey)) {
                    // TODO: ban it
                    // this.base.banConnection();
                    this.logger.error(`changeView verify sign invalid`);
                    return;
                }
                this._onChangeView(newView, pubkey, conn);
                // this.emit('changeview', pkg.body);
            }
        });
    }
    _onChangeView(newView, pubkey, from) {
        let id = libAddress.addressFromPublicKey(pubkey);
        this.logger.info(`_onChangeView receive correct changview from ${id} newView=${newView}`);
        if (this.m_changeView.has(id)) {
            if (this.m_changeView.get(id) === newView) {
                // 多次发送同一个view的ChangeView消息，ban it ？
                return;
            }
        }
        this.m_changeView.set(id, newView);
        let viewCount = new Map();
        for (let [_key, view] of this.m_changeView) {
            viewCount.has(view) ? viewCount.set(view, viewCount.get(view) + 1) : viewCount.set(view, 1);
            if (context_1.DbftContext.isAgreeRateReached(this.m_globalOptions, this.m_tip.nextMiners.length, viewCount.get(view))) {
                this.m_changeView = new Map();
                this.m_currView = view;
                let newContext = {
                    curView: view
                };
                this.m_context = newContext;
                this.m_state = ConsensusState.changeViewSucc;
                this.logger.info(`_onChangeView enter ConsensusState.changeViewSucc view=${view}`);
                this._resetTimer();
                break;
            }
        }
    }
    _onPrepareRequest(pkg, from) {
        if (!this.m_tip) {
            this.logger.warn(`_onPrepareRequest while no tip`);
            return;
        }
        if (this.m_state === ConsensusState.waitingProposal) {
            assert(this.m_context);
            let curContext = this.m_context;
            if (!this.m_tip.header.isPreBlock(pkg.block.header)) {
                this.logger.error(`_onPrepareRequest got block ${pkg.block.header.hash} ${pkg.block.header.number} while tip is ${this.m_tip.header.hash} ${this.m_tip.header.number}`);
                return;
            }
            let header = pkg.block.header;
            if (curContext.curView !== header.view) {
                // 有可能漏了change view，两边view 不一致
                this.logger.error(`_onPrepareRequest got block ${header.hash} ${header.number} ${header.view} while cur view is ${curContext.curView}`);
                return;
            }
            let due = context_1.DbftContext.getDueNextMiner(this.m_globalOptions, this.m_tip.header, this.m_tip.nextMiners, curContext.curView);
            if (header.miner !== due) {
                // TODO: ban it
                // this.base.banConnection();
                this.logger.error(`_onPrepareRequest recv prepareRequest's block ${pkg.block.header.hash} number=${pkg.block.header.number} miner=${header.miner},pubkey=${header.pubkey.toString('hex')} not match due miner ${due}`);
                return;
            }
            this.m_state = ConsensusState.waitingVerify;
            let newContext = {
                curView: curContext.curView,
                block: pkg.block,
                preSigns: curContext.preSigns
            };
            this.m_context = newContext;
            this.logger.info(`_onPrepareRequest, bdft consensus enter waitingVerify ${header.hash} ${header.number}`);
            this.emit('verifyBlock', pkg.block);
        }
        else {
            // 其他状态都忽略
            this.logger.warn(`_onPrepareRequest in invalid state `, this.m_state);
        }
    }
    _onPrepareResponse(pkg, from) {
        if (!this.m_tip) {
            this.logger.warn(`_onPrepareResponse while no tip`);
            return;
        }
        if (this.m_state !== ConsensusState.waitingAgree
            && this.m_state !== ConsensusState.waitingProposal
            && this.m_state !== ConsensusState.waitingVerify) {
            this.logger.info(`_onPrepareResponse in invalid state `, this.m_state);
            return;
        }
        assert(this.m_context);
        const address = libAddress.addressFromPublicKey(pkg.pubkey);
        if (this.m_tip.nextMiners.indexOf(address) < 0) {
            this.logger.warn(`_onPrepareResponse got ${address} 's sign not in next miners`);
            return;
        }
        if (this.m_state !== ConsensusState.waitingAgree) {
            let curContext = this.m_context;
            if (curContext.preSigns.has(address)) {
                this.logger.warn(`_onPrepareResponse {not ConsensusState.waitingProposal} got ${address} 's duplicated sign`);
                return;
            }
            curContext.preSigns.set(address, { hash: pkg.hash, signInfo: { pubkey: pkg.pubkey, sign: pkg.sign } });
            this.logger.info(`_onPrepareResponse {not ConsensusState.waitingProposal} receive correct signed prepare response from ${address} hash=${pkg.hash}`);
        }
        else {
            let curContext = this.m_context;
            if (curContext.block.hash !== pkg.hash) {
                this.logger.warn(`_onPrepareResponse got ${pkg.hash} while waiting ${curContext.block.hash}`);
                return;
            }
            if (curContext.signs.has(address)) {
                this.logger.warn(`_onPrepareResponse got ${address} 's duplicated sign`);
                return;
            }
            this.logger.info(`_onPrepareResponse receive correct signed prepare response from ${address} hash=${pkg.hash}`);
            curContext.signs.set(address, { pubkey: pkg.pubkey, sign: pkg.sign });
            if (context_1.DbftContext.isAgreeRateReached(this.m_globalOptions, this.m_tip.nextMiners.length, curContext.signs.size)) {
                this.logger.info(`_onPrepareResponse bdft consensus node enter state waitingBlock miners=${this.m_tip.nextMiners.length}, ${curContext.block.hash} ${curContext.block.number}`);
                this.m_state = ConsensusState.waitingBlock;
                let signs = [];
                for (let s of curContext.signs.values()) {
                    signs.push(s);
                }
                this.emit('mineBlock', curContext.block, signs);
            }
        }
    }
    async _nextTimeout() {
        if (!this.m_tip) {
            return { err: error_code_1.ErrorCode.RESULT_SKIPPED };
        }
        if (!this._isOneOfMiner()) {
            return { err: error_code_1.ErrorCode.RESULT_SKIPPED };
        }
        // view=0  非miner timeout=base+ 2^1；miner timeout=base+2^0
        // view=1  非miner timeout=base+ 2^1+2^2；miner timeout=base+2^0+2^1
        // view=2  非miner timeout=base+ 2^1+2^2+2^3；miner timeout=base+2^0+2^1+2^2
        // view=n  非miner timeout=base+ 2^1+2^2+2^3+...+2^(n+1)次方；miner timeout=base+2^0+2^1+2^2+...+2^n
        // 非miner: 2^1+2^2+...+2^n = 2^(n+2)-2^1   miner: 2^0+2^1+2^2+...+2^n = 2^(n+1)-2^0
        while (true) {
            let due = context_1.DbftContext.getDueNextMiner(this.m_globalOptions, this.m_tip.header, this.m_tip.nextMiners, this.m_currView);
            if (this.m_state === ConsensusState.none || this.m_state === ConsensusState.changeViewSucc) {
                if (this.m_address === due) {
                    this.m_state = ConsensusState.waitingCreate;
                    let newContext = {
                        curView: this.m_currView
                    };
                    this.m_context = newContext;
                    this.logger.debug(`bdft consensus enter waitingCreate ,due=${due},tipnumber=${this.m_tip.header.number}`);
                }
                else {
                    this.m_state = ConsensusState.waitingProposal;
                    let newContext = {
                        curView: this.m_currView,
                        preSigns: new Map()
                    };
                    this.m_context = newContext;
                    this.logger.debug(`bdft consensus enter waitingProposal ,due=${due},tipnumber=${this.m_tip.header.number}`);
                }
            }
            let blockInterval = this.m_globalOptions.blockInterval;
            let intervalCount = this.m_tip.totalView;
            let contextView = 0;
            if (this.m_context) {
                contextView = this.m_context.curView;
            }
            if (due === this.m_address) {
                if (this.m_state === ConsensusState.waitingCreate) {
                    intervalCount += Math.pow(2, contextView + 1) - 1;
                }
                else {
                    // miner此时和非miner在同一个时刻触发timeout
                    intervalCount += Math.pow(2, contextView + 2) - 2;
                }
            }
            else {
                intervalCount += Math.pow(2, contextView + 2) - 2;
            }
            let nextTime = this.m_genesisTime + intervalCount * blockInterval;
            let now = Date.now() / 1000;
            if (nextTime > now) {
                this.logger.info(`_nextTimeout intervalCount=${intervalCount},totalView=${this.m_tip.totalView},contextView=${contextView},due=${due},tipnumber=${this.m_tip.header.number},timeout=${(nextTime - now) * 1000}`);
                return { err: error_code_1.ErrorCode.RESULT_OK, timeout: (nextTime - now) * 1000 };
            }
            else {
                // this.logger.debug(`_nextTimeout RESULT_SKIPPED intervalCount=${intervalCount},totalView=${this.m_tip.totalView},contextView=${contextView},due=${due},tipnumber=${this.m_tip.header.number},nextTime=${nextTime}, now=${now}`);
                // return {err: ErrorCode.RESULT_SKIPPED};
                this.logger.debug(`_nextTimeout RESULT_SKIPPED`);
                this.m_currView++;
                this.m_state = ConsensusState.none;
            }
        }
    }
}
exports.DbftConsensusNode = DbftConsensusNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc2Vuc3VzX25vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL2NvbnNlbnN1c19ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXNDO0FBQ3RDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw4Q0FBMEM7QUFFMUMsMENBQTZDO0FBQzdDLG9DQUEwRjtBQUkxRixtQ0FBa0U7QUFFbEUsdUNBQXdDO0FBQ3hDLDBDQUE2QztBQUM3Qyx5Q0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRXhDLElBQVksa0JBS1g7QUFMRCxXQUFZLGtCQUFrQjtJQUMxQixnRkFBc0MsQ0FBQTtJQUN0QyxrRkFBdUMsQ0FBQTtJQUN2Qyx3RUFBa0MsQ0FBQTtJQUNsQywwREFBMkIsQ0FBQTtBQUMvQixDQUFDLEVBTFcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFLN0I7QUFFRCxJQUFLLGNBU0o7QUFURCxXQUFLLGNBQWM7SUFDZixtREFBUSxDQUFBO0lBQ1IscUVBQWlCLENBQUE7SUFDakIseUVBQW1CLENBQUE7SUFDbkIscUVBQWlCLENBQUE7SUFDakIsbUVBQWdCLENBQUE7SUFDaEIsbUVBQWdCLENBQUE7SUFDaEIsd0VBQW1CLENBQUE7SUFDbkIsd0VBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQVRJLGNBQWMsS0FBZCxjQUFjLFFBU2xCO0FBMENELHVCQUErQixTQUFRLHFCQUFZO0lBQy9DLFlBQVksT0FBaUM7UUFDekMsS0FBSyxFQUFFLENBQUM7UUFrQ0YsaUJBQVksR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM5QyxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBbEM3QixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDakMsSUFBSSxDQUFDLGVBQWUs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