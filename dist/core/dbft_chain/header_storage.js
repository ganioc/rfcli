"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const LRUCache_1 = require("../lib/LRUCache");
const context_1 = require("./context");
const initHeadersSql = 'CREATE TABLE IF NOT EXISTS "miners"("hash" CHAR(64) PRIMARY KEY NOT NULL UNIQUE, "miners" TEXT NOT NULL, "totalView" INTEGER NOT NULL);';
const addHeaderSql = 'INSERT INTO miners (hash, miners, totalView) values ($hash, $miners, $totalView)';
const getHeaderSql = 'SELECT miners, totalView FROM miners WHERE hash=$hash';
class DbftHeaderStorage {
    constructor(options) {
        this.m_cache = new LRUCache_1.LRUCache(12);
        this.m_readonly = !!(options && options.readonly);
        this.m_db = options.db;
        this.m_logger = options.logger;
        this.m_headerStorage = options.headerStorage;
        this.m_globalOptions = options.globalOptions;
    }
    async init() {
        if (!this.m_readonly) {
            try {
                await this.m_db.run(initHeadersSql);
            }
            catch (e) {
                this.m_logger.error(e);
                return error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        // do nothing
    }
    updateGlobalOptions(globalOptions) {
        this.m_globalOptions = globalOptions;
    }
    async _getHeader(hash) {
        let c = this.m_cache.get(hash);
        if (c) {
            return { err: error_code_1.ErrorCode.RESULT_OK, miners: c.m, totalView: c.v };
        }
        try {
            const gm = await this.m_db.get(getHeaderSql, { $hash: hash });
            if (!gm || !gm.miners) {
                this.m_logger.error(`getMinersSql error,election block hash=${hash}`);
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            let miners = JSON.parse(gm.miners);
            this.m_cache.set(hash, { m: miners, v: gm.totalView });
            return { err: error_code_1.ErrorCode.RESULT_OK, miners: miners, totalView: gm.totalView };
        }
        catch (e) {
            this.m_logger.error(e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async addHeader(header, storageManager) {
        let miners = [];
        if (context_1.DbftContext.isElectionBlockNumber(this.m_globalOptions, header.number)) {
            const gs = await storageManager.getSnapshotView(header.hash);
            if (gs.err) {
                return gs.err;
            }
            const context = new context_1.DbftContext(gs.storage, this.m_globalOptions, this.m_logger);
            const gmr = await context.getMiners();
            storageManager.releaseSnapshotView(header.hash);
            if (gmr.err) {
                return gmr.err;
            }
            miners = gmr.miners;
        }
        let totalView = 0;
        if (header.number !== 0) {
            const ghr = await this._getHeader(header.preBlockHash);
            if (ghr.err) {
                return ghr.err;
            }
            totalView = ghr.totalView;
        }
        totalView += Math.pow(2, header.view + 1) - 1;
        try {
            await this.m_db.run(addHeaderSql, { $hash: header.hash, $miners: JSON.stringify(miners), $totalView: totalView });
            return error_code_1.ErrorCode.RESULT_OK;
        }
        catch (e) {
            this.m_logger.error(e);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
    }
    async getTotalView(header) {
        this.m_logger.debug(`getTotalView, hash=${header.hash}`);
        return await this._getHeader(header.hash);
    }
    async getMiners(header) {
        return await this._getMiners(header, false);
    }
    async getNextMiners(header) {
        return await this._getMiners(header, true);
    }
    async _getMiners(header, bNext) {
        let en = context_1.DbftContext.getElectionBlockNumber(this.m_globalOptions, bNext ? header.number + 1 : header.number);
        let electionHeader;
        if (header.number === en) {
            electionHeader = header;
        }
        else {
            let hr = await this.m_headerStorage.getHeader(header.preBlockHash, en - header.number + 1);
            if (hr.err) {
                this.m_logger.error(`dbft get electionHeader error,number=${header.number},prevblockhash=${header.preBlockHash}`);
                return { err: hr.err };
            }
            electionHeader = hr.header;
        }
        return this._getHeader(electionHeader.hash);
    }
    async getDueMiner(header, miners) {
        if (header.number === 0) {
            return { err: error_code_1.ErrorCode.RESULT_OK, miner: header.miner };
        }
        const hr = await this.m_headerStorage.getHeader(header.preBlockHash);
        if (hr.err) {
            this.m_logger.error(`getDueMiner failed for get pre block failed `, hr.err);
            return { err: hr.err };
        }
        let due = context_1.DbftContext.getDueNextMiner(this.m_globalOptions, hr.header, miners, header.view);
        return { err: error_code_1.ErrorCode.RESULT_OK, miner: due };
    }
}
exports.DbftHeaderStorage = DbftHeaderStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVyX3N0b3JhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL2hlYWRlcl9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsOENBQXdDO0FBR3hDLDhDQUF5QztBQUV6Qyx1Q0FBc0M7QUFFdEMsTUFBTSxjQUFjLEdBQUcseUlBQXlJLENBQUM7QUFDakssTUFBTSxZQUFZLEdBQUcsa0ZBQWtGLENBQUM7QUFDeEcsTUFBTSxZQUFZLEdBQUcsdURBQXVELENBQUM7QUFFN0U7SUFDSSxZQUFtQixPQU1sQjtRQVVTLFlBQU8sR0FBK0MsSUFBSSxtQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBVDdFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUM3QyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDakQsQ0FBQztJQVFNLEtBQUssQ0FBQyxJQUFJO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsSUFBSTtnQkFDQSxNQUFNLElBQUksQ0FBQyxJQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ3hDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLE9BQU8sc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQzthQUNyQztTQUNKO1FBQ0QsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztJQUMv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