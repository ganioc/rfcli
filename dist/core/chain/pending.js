"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("./chain");
const error_code_1 = require("../error_code");
const events_1 = require("events");
const LRUCache_1 = require("../lib/LRUCache");
var SyncOptType;
(function (SyncOptType) {
    SyncOptType[SyncOptType["updateTip"] = 0] = "updateTip";
    SyncOptType[SyncOptType["popTx"] = 1] = "popTx";
    SyncOptType[SyncOptType["addTx"] = 2] = "addTx";
})(SyncOptType || (SyncOptType = {}));
class PendingTransactions extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.m_queueOpt = [];
        this.m_transactions = [];
        this.m_orphanTx = new Map();
        this.m_mapNonce = new Map();
        this.m_logger = options.logger;
        this.m_storageManager = options.storageManager;
        this.m_txLiveTime = options.overtime;
        this.m_handler = options.handler;
        this.m_maxPengdingCount = options.maxCount;
        this.m_warnPendingCount = options.warnCount;
        this.m_txRecord = new LRUCache_1.LRUCache(this.m_maxPengdingCount);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    async addTransaction(tx) {
        this.m_logger.debug(`addTransaction, txhash=${tx.hash}, nonce=${tx.nonce}, address=${tx.address}`);
        const checker = this.m_handler.getTxPendingChecker(tx.method);
        if (!checker) {
            this.m_logger.error(`txhash=${tx.hash} method=${tx.method} has no match listener`);
            return error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR;
        }
        const err = checker(tx);
        if (err) {
            this.m_logger.error(`txhash=${tx.hash} checker error ${err}`);
            return error_code_1.ErrorCode.RESULT_TX_CHECKER_ERROR;
        }
        let nCount = this._getPendingCount() + this.m_queueOpt.length;
        if (nCount >= this.m_maxPengdingCount) {
            this.m_logger.warn(`pengding count ${nCount}, maxPengdingCount ${this.m_maxPengdingCount}`);
            return error_code_1.ErrorCode.RESULT_OUT_OF_MEMORY;
        }
        let latest = this.m_txRecord.get(tx.hash);
        if (latest && Date.now() - latest < 2 * 60 * 1000) {
            this.m_logger.warn(`addTransaction failed, add too frequently,hash=${tx.hash}`);
            return error_code_1.ErrorCode.RESULT_TX_EXIST;
        }
        this.m_txRecord.set(tx.hash, Date.now());
        if (this._isExist(tx)) {
            this.m_logger.warn(`addTransaction failed, tx exist,hash=${tx.hash}`);
            return error_code_1.ErrorCode.RESULT_TX_EXIST;
        }
        let opt = { _type: SyncOptType.addTx, param: { tx, ct: Date.now() } };
        this._addPendingOpt(opt);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    popTransaction() {
        if (this.m_transactions.length > 0) {
            return this.m_transactions[0].tx;
        }
        else {
            return undefined;
        }
    }
    async updateTipBlock(header) {
        let svr = await this.m_storageManager.getSnapshotView(header.hash);
        if (svr.err) {
            this.m_logger.error(`updateTipBlock getSnapshotView failed, errcode=${svr.err},hash=${header.hash},number=${header.number}`);
            return svr.err;
        }
        if (this.m_curHeader) {
            this.m_storageManager.releaseSnapshotView(this.m_curHeader.hash);
        }
        this.m_curHeader = header;
        this.m_storageView = svr.storage;
        this._addPendingOpt({ _type: SyncOptType.updateTip, param: undefined });
        return error_code_1.ErrorCode.RESULT_OK;
    }
    init() {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        if (this.m_curHeader) {
            this.m_storageManager.releaseSnapshotView(this.m_curHeader.hash);
            delete this.m_storageView;
            delete this.m_curHeader;
        }
        this.m_mapNonce.clear();
    }
    _isExist(tx) {
        for (let t of this.m_transactions) {
            if (t.tx.hash === tx.hash) {
                return true;
            }
        }
        if (!this.m_orphanTx.get(tx.address)) {
            return false;
        }
        for (let orphan of this.m_orphanTx.get(tx.address)) {
            if (tx.hash === orphan.tx.hash) {
                return true;
            }
        }
        return false;
    }
    async _addPendingOpt(opt) {
        if (opt._type === SyncOptType.updateTip) {
            for (let i = 0; i < this.m_queueOpt.length; i++) {
                if (this.m_queueOpt[i]._type === SyncOptType.addTx) {
                    break;
                }
                else if (this.m_queueOpt[i]._type === SyncOptType.updateTip) {
                    this.m_queueOpt.splice(i, 1);
                    break;
                }
            }
            this.m_queueOpt.unshift(opt);
        }
        else if (opt._type === SyncOptType.addTx) {
            this.m_queueOpt.push(opt);
        }
        if (this.m_currAdding) {
            return;
        }
        while (this.m_queueOpt.length > 0) {
            this.m_currAdding = this.m_queueOpt.shift();
            if (this.m_currAdding._type === SyncOptType.updateTip) {
                let pos = 0;
                for (pos = 0; pos < this.m_queueOpt.length; pos++) {
                    if (this.m_queueOpt[pos]._type === SyncOptType.addTx) {
                        break;
                    }
                }
                for (let i = 0; i < this.m_transactions.length; i++) {
                    this.m_queueOpt.splice(i + pos, 0, { _type: SyncOptType.addTx, param: this.m_transactions[i] });
                }
                this.m_mapNonce = new Map();
                this.m_transactions = [];
            }
            else if (this.m_currAdding._type === SyncOptType.addTx) {
                await this._addTx(this.m_currAdding.param);
            }
            this.m_currAdding = undefined;
        }
    }
    async _onCheck(txTime, txOld) {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _onAddedTx(txTime, txOld) {
        if (!txOld) {
            this.m_mapNonce.set(txTime.tx.address, txTime.tx.nonce);
        }
        this.emit('txAdded', txTime.tx);
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _addTx(txTime) {
        if (this._isTimeout(txTime)) {
            this.m_logger.warn(`_addTx tx timeout, txhash=${txTime.tx.hash}`);
            return error_code_1.ErrorCode.RESULT_TIMEOUT;
        }
        let address = txTime.tx.address;
        let ret = await this.getStorageNonce(address);
        if (ret.err) {
            this.m_logger.error(`_addTx getNonce nonce error ${ret.err} address=${address}, txhash=${txTime.tx.hash}`);
            return ret.err;
        }
        if (ret.nonce + 1 > txTime.tx.nonce) {
            // this.m_logger.warn(`_addTx nonce small storagenonce=${ret.nonce!},txnonce=${txTime.tx.nonce}, txhash=${txTime.tx.hash}`);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        let { err, nonce } = await this.getNonce(address);
        this.m_logger.debug(`_addTx, nonce=${nonce}, txNonce=${txTime.tx.nonce}, txhash=${txTime.tx.hash}, address=${txTime.tx.address}`);
        if (nonce + 1 === txTime.tx.nonce) {
            let retCode = await this._onCheck(txTime);
            if (retCode) {
                return retCode;
            }
            this._addToQueue(txTime, -1);
            await this._onAddedTx(txTime);
            await this._scanOrphan(address);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        if (nonce + 1 < txTime.tx.nonce) {
            return await this._addToOrphanMayNonceExist(txTime);
        }
        return await this._addToQueueMayNonceExist(txTime);
    }
    // 同个address的两个相同nonce的tx存在，且先前的也还没有入链
    async _checkSmallNonceTx(txNew, txOld) {
        return error_code_1.ErrorCode.RESULT_ERROR_NONCE_IN_TX;
    }
    // 获取mem中的nonce值
    async getNonce(address) {
        if (this.m_mapNonce.has(address)) {
            return { err: error_code_1.ErrorCode.RESULT_OK, nonce: this.m_mapNonce.get(address) };
        }
        else {
            return await this.getStorageNonce(address);
        }
    }
    async getStorageNonce(s) {
        try {
            let dbr = await this.m_storageView.getReadableDataBase(chain_1.Chain.dbSystem);
            if (dbr.err) {
                this.m_logger.error(`get system database failed ${dbr.err}`);
                return { err: dbr.err };
            }
            let nonceTableInfo = await dbr.value.getReadableKeyValue(chain_1.Chain.kvNonce);
            if (nonceTableInfo.err) {
                this.m_logger.error(`getStorageNonce, getReadableKeyValue failed,errcode=${nonceTableInfo.err}`);
                return { err: nonceTableInfo.err };
            }
            let ret = await nonceTableInfo.kv.get(s);
            if (ret.err) {
                if (ret.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                    return { err: error_code_1.ErrorCode.RESULT_OK, nonce: -1 };
                }
                return { err: ret.err };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, nonce: ret.value };
        }
        catch (error) {
            this.m_logger.error(`getStorageNonce exception, error=${error},address=${s}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    _addToOrphan(txTime) {
        let s = txTime.tx.address;
        let l;
        if (this.m_orphanTx.has(s)) {
            l = this.m_orphanTx.get(s);
        }
        else {
            l = new Array();
            this.m_orphanTx.set(s, l);
        }
        if (l.length === 0) {
            l.push(txTime);
        }
        else {
            for (let i = 0; i < l.length; i++) {
                if (txTime.tx.nonce < l[i].tx.nonce) {
                    l.splice(i, 0, txTime);
                    return;
                }
            }
            l.push(txTime);
        }
    }
    async _scanOrphan(s) {
        if (!this.m_orphanTx.has(s)) {
            return;
        }
        let l = this.m_orphanTx.get(s);
        let { err, nonce } = await this.getNonce(s);
        while (true) {
            if (l.length === 0) {
                this.m_orphanTx.delete(s);
                break;
            }
            if (this._isTimeout(l[0])) {
                l.shift();
                continue;
            }
            if (nonce + 1 === l[0].tx.nonce) {
                let txTime = l.shift();
                this._addPendingOpt({ _type: SyncOptType.addTx, param: txTime });
            }
            break;
        }
    }
    _isTimeout(txTime) {
        return Date.now() >= txTime.ct + this.m_txLiveTime * 1000;
    }
    _addToQueue(txTime, pos) {
        if (pos === -1) {
            this.m_transactions.push(txTime);
        }
        else {
            this.m_transactions.splice(pos, 0, txTime);
        }
    }
    _getPendingCount() {
        let count = this.m_transactions.length;
        for (let [address, l] of this.m_orphanTx) {
            count += l.length;
        }
        return count;
    }
    async _addToQueueMayNonceExist(txTime) {
        for (let i = 0; i < this.m_transactions.length; i++) {
            if (this.m_transactions[i].tx.address === txTime.tx.address && this.m_transactions[i].tx.nonce === txTime.tx.nonce) {
                let txOld = this.m_transactions[i];
                if (this._isTimeout(this.m_transactions[i])) {
                    let retCode = await this._onCheck(txTime, txOld);
                    if (retCode) {
                        return retCode;
                    }
                    this.m_transactions.splice(i, 1);
                    this._addToQueue(txTime, i);
                    await this._onAddedTx(txTime, txOld);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                let _err = await this._checkSmallNonceTx(txTime.tx, this.m_transactions[i].tx);
                if (_err === error_code_1.ErrorCode.RESULT_OK) {
                    let retCode = await this._onCheck(txTime, txOld);
                    if (retCode) {
                        return retCode;
                    }
                    this.m_transactions.splice(i, 1);
                    this._addToQueue(txTime, i);
                    await this._onAddedTx(txTime, txOld);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                return _err;
            }
        }
        return error_code_1.ErrorCode.RESULT_ERROR_NONCE_IN_TX;
    }
    async _addToOrphanMayNonceExist(txTime) {
        let s = txTime.tx.address;
        let l;
        if (this.m_orphanTx.has(s)) {
            l = this.m_orphanTx.get(s);
        }
        else {
            l = new Array();
            this.m_orphanTx.set(s, l);
        }
        if (l.length === 0) {
            l.push(txTime);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        for (let i = 0; i < l.length; i++) {
            if (txTime.tx.nonce === l[i].tx.nonce) {
                let txOld = l[i].tx;
                if (this._isTimeout(l[i])) {
                    l.splice(i, 1, txTime);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                let _err = await this._checkSmallNonceTx(txTime.tx, l[i].tx);
                if (_err === error_code_1.ErrorCode.RESULT_OK) {
                    l.splice(i, 1, txTime);
                    return error_code_1.ErrorCode.RESULT_OK;
                }
                return _err;
            }
            if (txTime.tx.nonce < l[i].tx.nonce) {
                l.splice(i, 0, txTime);
                return error_code_1.ErrorCode.RESULT_OK;
            }
        }
        l.push(txTime);
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.PendingTransactions = PendingTransactions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NoYWluL3BlbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBOEI7QUFDOUIsOENBQXdDO0FBSXhDLG1DQUFvQztBQUNwQyw4Q0FBeUM7QUFHekMsSUFBSyxXQUlKO0FBSkQsV0FBSyxXQUFXO0lBQ1osdURBQWEsQ0FBQTtJQUNiLCtDQUFTLENBQUE7SUFDVCwrQ0FBUyxDQUFBO0FBQ2IsQ0FBQyxFQUpJLFdBQVcsS0FBWCxXQUFXLFFBSWY7QUFNRCx5QkFBaUMsU0FBUSxxQkFBWTtJQTBCakQsWUFBWSxPQU9YO1FBQ0csS0FBSyxFQUFFLENBQUM7UUF0QkYsZUFBVSxHQUFjLEVBQUUsQ0FBQztRQXVCakMsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDakMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDM0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7UUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLG1CQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDNUQsQ0FBQztJQTVCRCxFQUFFLENBQUMsS0FBYSxFQUFFLFFBQWE7UUFD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