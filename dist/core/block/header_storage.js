"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_1 = require("./block");
const writer_1 = require("../lib/writer");
const reader_1 = require("../lib/reader");
const error_code_1 = require("../error_code");
const assert = require("assert");
const LRUCache_1 = require("../lib/LRUCache");
const Lock_1 = require("../lib/Lock");
const tx_storage_1 = require("./tx_storage");
const initHeaderSql = 'CREATE TABLE IF NOT EXISTS "headers"("hash" CHAR(64) PRIMARY KEY NOT NULL UNIQUE, "pre" CHAR(64) NOT NULL, "verified" TINYINT NOT NULL, "raw" BLOB NOT NULL);';
const initBestSql = 'CREATE TABLE IF NOT EXISTS "best"("height" INTEGER PRIMARY KEY NOT NULL UNIQUE, "hash" CHAR(64) NOT NULL,  "timestamp" INTEGER NOT NULL);';
const getByHashSql = 'SELECT raw, verified FROM headers WHERE hash = $hash';
const getByTimestampSql = 'SELECT h.raw, h.verified FROM headers AS h LEFT JOIN best AS b ON b.hash = h.hash WHERE b.timestamp = $timestamp';
const getHeightOnBestSql = 'SELECT b.height, h.raw, h.verified FROM headers AS h LEFT JOIN best AS b ON b.hash = h.hash WHERE b.hash = $hash';
const getByHeightSql = 'SELECT h.raw, h.verified FROM headers AS h LEFT JOIN best AS b ON b.hash = h.hash WHERE b.height = $height';
const insertHeaderSql = 'INSERT INTO headers (hash, pre, raw, verified) VALUES($hash, $pre, $raw, $verified)';
const getBestHeightSql = 'SELECT max(height) AS height FROM best';
const rollbackBestSql = 'DELETE best WHERE height > $height';
const extendBestSql = 'INSERT INTO best (hash, height, timestamp) VALUES($hash, $height, $timestamp)';
const getTipSql = 'SELECT h.raw, h.verified FROM headers AS h LEFT JOIN best AS b ON b.hash = h.hash ORDER BY b.height DESC';
const updateVerifiedSql = 'UPDATE headers SET verified=$verified WHERE hash=$hash';
const getByPreBlockSql = 'SELECT raw, verified FROM headers WHERE pre = $pre';
var VERIFY_STATE;
(function (VERIFY_STATE) {
    VERIFY_STATE[VERIFY_STATE["notVerified"] = 0] = "notVerified";
    VERIFY_STATE[VERIFY_STATE["verified"] = 1] = "verified";
    VERIFY_STATE[VERIFY_STATE["invalid"] = 2] = "invalid";
})(VERIFY_STATE = exports.VERIFY_STATE || (exports.VERIFY_STATE = {}));
class BlockHeaderEntry {
    constructor(blockheader, verified) {
        this.blockheader = blockheader;
        this.verified = verified;
    }
}
class HeaderStorage {
    constructor(options) {
        this.m_transactionLock = new Lock_1.Lock();
        this.m_readonly = !!(options && options.readonly);
        this.m_db = options.db;
        this.m_blockHeaderType = options.blockHeaderType;
        this.m_logger = options.logger;
        this.m_cacheHeight = new LRUCache_1.LRUCache(100);
        this.m_cacheHash = new LRUCache_1.LRUCache(100);
        this.m_txView = new tx_storage_1.TxStorage({ logger: options.logger, db: options.db, blockstorage: options.blockStorage, readonly: this.m_readonly });
    }
    get txView() {
        return this.m_txView;
    }
    async init() {
        if (!this.m_readonly) {
            try {
                let stmt = await this.m_db.run(initHeaderSql);
                stmt = await this.m_db.run(initBestSql);
            }
            catch (e) {
                this.m_logger.error(e);
                return error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
        }
        return await this.m_txView.init();
    }
    uninit() {
        this.m_txView.uninit();
    }
    async getHeader(arg1, arg2) {
        let header;
        if (arg2 === undefined || arg2 === undefined) {
            if (arg1 instanceof block_1.BlockHeader) {
                assert(false);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            return await this._loadHeader(arg1);
        }
        else {
            let fromHeader;
            if (arg1 instanceof block_1.BlockHeader) {
                fromHeader = arg1;
            }
            else {
                let hr = await this._loadHeader(arg1);
                if (hr.err) {
                    return hr;
                }
                fromHeader = hr.header;
            }
            let headers = [];
            headers.push(fromHeader);
            if (arg2 > 0) {
                assert(false);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            else {
                if (fromHeader.number + arg2 < 0) {
                    arg2 = -fromHeader.number;
                }
                for (let ix = 0; ix < -arg2; ++ix) {
                    let hr = await this._loadHeader(fromHeader.preBlockHash);
                    if (hr.err) {
                        return hr;
                    }
                    fromHeader = hr.header;
                    headers.push(fromHeader);
                }
                headers = headers.reverse();
                return { err: error_code_1.ErrorCode.RESULT_OK, header: headers[0], headers };
            }
        }
    }
    async _loadHeader(arg) {
        let rawHeader;
        let verified;
        if (typeof arg === 'number') {
            let headerEntry = this.m_cacheHeight.get(arg);
            if (headerEntry) {
                return { err: error_code_1.ErrorCode.RESULT_OK, header: headerEntry.blockheader, verified: headerEntry.verified };
            }
            try {
                let result = await this.m_db.get(getByHeightSql, { $height: arg });
                if (!result) {
                    return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
                }
                rawHeader = result.raw;
                verified = result.verified;
            }
            catch (e) {
                this.m_logger.error(`load Header height ${arg} failed, ${e}`);
                return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
            }
        }
        else if (typeof arg === 'string') {
            if (arg === 'latest') {
                try {
                    let result = await this.m_db.get(getTipSql);
                    if (!result) {
                        return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
                    }
                    rawHeader = result.raw;
                    verified = result.verified;
                }
                catch (e) {
                    this.m_logger.error(`load latest Header failed, ${e}`);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
            }
            else {
                let headerEntry = this.m_cacheHash.get(arg);
                if (headerEntry) {
                    // this.m_logger.debug(`get header storage directly from cache hash: ${headerEntry.blockheader.hash} number: ${headerEntry.blockheader.number} verified: ${headerEntry.verified}`);
                    return { err: error_code_1.ErrorCode.RESULT_OK, header: headerEntry.blockheader, verified: headerEntry.verified };
                }
                try {
                    let result = await this.m_db.get(getByHashSql, { $hash: arg });
                    if (!result) {
                        return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
                    }
                    rawHeader = result.raw;
                    verified = result.verified;
                }
                catch (e) {
                    this.m_logger.error(`load Header hash ${arg} failed, ${e}`);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
            }
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        let header = new this.m_blockHeaderType();
        let err = header.decode(new reader_1.BufferReader(rawHeader, false));
        if (err !== error_code_1.ErrorCode.RESULT_OK) {
            this.m_logger.error(`decode header ${arg} from header storage failed`);
            return { err };
        }
        if (arg !== 'latest' && header.number !== arg && header.hash !== arg) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let entry = new BlockHeaderEntry(header, verified);
        this.m_logger.debug(`update header storage cache hash: ${header.hash} number: ${header.number} verified: ${verified}`);
        this.m_cacheHash.set(header.hash, entry);
        if (typeof arg === 'number') {
            this.m_cacheHeight.set(header.number, entry);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, header, verified };
    }
    async getHeightOnBest(hash) {
        let result = await this.m_db.get(getHeightOnBestSql, { $hash: hash });
        if (!result || result.height === undefined) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        let header = new this.m_blockHeaderType();
        let err = header.decode(new reader_1.BufferReader(result.raw, false));
        if (err !== error_code_1.ErrorCode.RESULT_OK) {
            this.m_logger.error(`decode header ${hash} from header storage failed`);
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, height: result.height, header };
    }
    async _saveHeader(header) {
        let writer = new writer_1.BufferWriter();
        let err = header.encode(writer);
        if (err) {
            this.m_logger.error(`encode header failed `, err);
            return err;
        }
        try {
            let headerRaw = writer.render();
            await this.m_db.run(insertHeaderSql, { $hash: header.hash, $raw: headerRaw, $pre: header.preBlockHash, $verified: VERIFY_STATE.notVerified });
        }
        catch (e) {
            this.m_logger.error(`save Header ${header.hash}(${header.number}) failed, ${e}`);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async saveHeader(header) {
        return await this._saveHeader(header);
    }
    async createGenesis(genesis) {
        assert(genesis.number === 0);
        if (genesis.number !== 0) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        let writer = new writer_1.BufferWriter();
        let err = genesis.encode(writer);
        if (err) {
            this.m_logger.error(`genesis block encode failed`);
            return err;
        }
        let hash = genesis.hash;
        let headerRaw = writer.render();
        try {
            await this._begin();
        }
        catch (e) {
            this.m_logger.error(`createGenesis begin ${genesis.hash}(${genesis.number}) failed, ${e}`);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        try {
            await this.m_db.run(insertHeaderSql, { $hash: genesis.hash, $pre: genesis.preBlockHash, $raw: headerRaw, $verified: VERIFY_STATE.verified });
            await this.m_db.run(extendBestSql, { $hash: genesis.hash, $height: genesis.number, $timestamp: genesis.timestamp });
            await this._commit();
        }
        catch (e) {
            this.m_logger.error(`createGenesis ${genesis.hash}(${genesis.number}) failed, ${e}`);
            await this._rollback();
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async getNextHeader(hash) {
        let query;
        try {
            query = await this.m_db.all(getByPreBlockSql, { $pre: hash });
        }
        catch (e) {
            this.m_logger.error(`getNextHeader ${hash} failed, ${e}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        if (!query || !query.length) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
        let results = [];
        for (let result of query) {
            let header = new this.m_blockHeaderType();
            let err = header.decode(new reader_1.BufferReader(result.raw, false));
            if (err !== error_code_1.ErrorCode.RESULT_OK) {
                this.m_logger.error(`decode header ${result.hash} from header storage failed`);
                return { err };
            }
            results.push({ header, verified: result.verified });
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, results };
    }
    async updateVerified(header, verified) {
        try {
            this.m_logger.debug(`remove header storage cache hash: ${header.hash} number: ${header.number}`);
            this.m_cacheHash.remove(header.hash);
            this.m_cacheHeight.remove(header.number);
            await this.m_db.run(updateVerifiedSql, { $hash: header.hash, $verified: verified });
        }
        catch (e) {
            this.m_logger.error(`updateVerified ${header.hash}(${header.number}) failed, ${e}`);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async changeBest(header) {
        let sqls = [];
        let txViewOp = [];
        sqls.push(`INSERT INTO best (hash, height, timestamp) VALUES("${header.hash}", "${header.number}", "${header.timestamp}")`);
        txViewOp.push({ op: 'add', value: header.hash });
        let forkFrom = header;
        while (true) {
            let result = await this.getHeightOnBest(forkFrom.preBlockHash);
            if (result.err === error_code_1.ErrorCode.RESULT_OK) {
                assert(result.header);
                forkFrom = result.header;
                sqls.push(`DELETE FROM best WHERE height > ${forkFrom.number}`);
                txViewOp.push({ op: 'remove', value: forkFrom.number });
                break;
            }
            else if (result.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                let _result = await this._loadHeader(forkFrom.preBlockHash);
                assert(_result.header);
                forkFrom = _result.header;
                sqls.push(`INSERT INTO best (hash, height, timestamp) VALUES("${forkFrom.hash}", "${forkFrom.number}", "${forkFrom.timestamp}")`);
                txViewOp.push({ op: 'add', value: forkFrom.hash });
                continue;
            }
            else {
                return result.err;
            }
        }
        sqls.push(`UPDATE headers SET verified="${VERIFY_STATE.verified}" WHERE hash="${header.hash}"`);
        sqls = sqls.reverse();
        txViewOp = txViewOp.reverse();
        await this._begin();
        try {
            for (let e of txViewOp) {
                let err;
                if (e.op === 'add') {
                    err = await this.m_txView.add(e.value);
                }
                else if (e.op === 'remove') {
                    err = await this.m_txView.remove(e.value);
                }
                else {
                    err = error_code_1.ErrorCode.RESULT_FAILED;
                }
                if (err !== error_code_1.ErrorCode.RESULT_OK) {
                    throw new Error(`run txview error,code=${err}`);
                }
            }
            for (let sql of sqls) {
                await this.m_db.run(sql);
            }
            await this._commit();
        }
        catch (e) {
            this.m_logger.error(`changeBest ${header.hash}(${header.number}) failed, ${e}`);
            await this._rollback();
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        this.m_logger.debug(`remove header storage cache hash: ${header.hash} number: ${header.number}`);
        this.m_cacheHash.remove(header.hash);
        this.m_cacheHeight.clear();
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async _begin() {
        await this.m_transactionLock.enter();
        await this.m_db.run('BEGIN;');
    }
    async _commit() {
        await this.m_db.run('COMMIT;');
        this.m_transactionLock.leave();
    }
    async _rollback() {
        await this.m_db.run('ROLLBACK;');
        this.m_transactionLock.leave();
    }
}
exports.HeaderStorage = HeaderStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyX3N0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9ibG9jay9oZWFkZXJfc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLG1DQUFzQztBQUN0QywwQ0FBNkM7QUFDN0MsMENBQTZDO0FBQzdDLDhDQUEwQztBQUMxQyxpQ0FBaUM7QUFFakMsOENBQXlDO0FBRXpDLHNDQUFtQztBQUNuQyw2Q0FBbUQ7QUFHbkQsTUFBTSxhQUFhLEdBQUcsK0pBQStKLENBQUM7QUFDdEwsTUFBTSxXQUFXLEdBQUcsMklBQTJJLENBQUM7QUFDaEssTUFBTSxZQUFZLEdBQUcsc0RBQXNELENBQUM7QUFDNUUsTUFBTSxpQkFBaUIsR0FBRyxrSEFBa0gsQ0FBQztBQUM3SSxNQUFNLGtCQUFrQixHQUFHLGtIQUFrSCxDQUFDO0FBQzlJLE1BQU0sY0FBYyxHQUFHLDRHQUE0RyxDQUFDO0FBQ3BJLE1BQU0sZUFBZSxHQUFHLHFGQUFxRixDQUFDO0FBQzlHLE1BQU0sZ0JBQWdCLEdBQUcsd0NBQXdDLENBQUM7QUFDbEUsTUFBTSxlQUFlLEdBQUcsb0NBQW9DLENBQUM7QUFDN0QsTUFBTSxhQUFhLEdBQUcsK0VBQStFLENBQUM7QUFDdEcsTUFBTSxTQUFTLEdBQUcsMEdBQTBHLENBQUM7QUFDN0gsTUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztBQUNuRixNQUFNLGdCQUFnQixHQUFHLG9EQUFvRCxDQUFDO0FBZ0I5RSxJQUFZLFlBSVg7QUFKRCxXQUFZLFlBQVk7SUFDcEIsNkRBQWUsQ0FBQTtJQUNmLHVEQUFZLENBQUE7SUFDWixxREFBVyxDQUFBO0FBQ2YsQ0FBQyxFQUpXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBSXZCO0FBRUQ7SUFHSSxZQUFZLFdBQXdCLEVBQUUsUUFBc0I7UUFDeEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FB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