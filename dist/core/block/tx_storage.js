"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
let assert = require('assert');
const initSql = 'CREATE TABLE IF NOT EXISTS "txview"("txhash" CHAR(64) PRIMARY KEY NOT NULL UNIQUE, "address" CHAR(64) NOT NULL, "blockheight" INTEGER NOT NULL, "blockhash" CHAR(64) NOT NULL);';
class TxStorage {
    constructor(options) {
        this.m_readonly = !!(options && options.readonly);
        this.m_db = options.db;
        this.m_logger = options.logger;
        this.m_blockStorage = options.blockstorage;
    }
    async init() {
        if (!this.m_readonly) {
            try {
                await this.m_db.run(initSql);
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
    async add(blockhash) {
        if (!this.m_blockStorage.has(blockhash)) {
            assert(false, `can't find block ${blockhash} when update tx storage`);
            return error_code_1.ErrorCode.RESULT_NOT_FOUND;
        }
        let block = this.m_blockStorage.get(blockhash);
        if (!block) {
            this.m_logger.error(`can't load ${blockhash} when update tx storage`);
            return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
        }
        try {
            for (let tx of block.content.transactions) {
                await this.m_db.run(`insert into txview (txhash, address, blockheight, blockhash) values ("${tx.hash}","${tx.address}", ${block.number}, "${block.hash}")`);
            }
        }
        catch (e) {
            this.m_logger.error(`add exception,error=${e},blockhash=${blockhash}`);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async remove(nBlockHeight) {
        try {
            await this.m_db.run(`delete from txview where blockheight > ${nBlockHeight}`);
        }
        catch (e) {
            this.m_logger.error(`remove exception,error=${e},height=${nBlockHeight}`);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async get(txHash) {
        try {
            let result = await this.m_db.get(`select blockhash from txview where txhash="${txHash}"`);
            if (!result || result.blockhash === undefined) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, blockhash: result.blockhash };
        }
        catch (e) {
            this.m_logger.error(`get exception,error=${e},txHash=${txHash}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async getCountByAddress(address) {
        try {
            let result = await this.m_db.get(`select count(*) as value from txview where address="${address}"`);
            if (!result || result.value === undefined) {
                return { err: error_code_1.ErrorCode.RESULT_FAILED };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, count: result.value };
        }
        catch (e) {
            this.m_logger.error(`getCountByAddress exception,error=${e},address=${address}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
}
exports.TxStorage = TxStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHhfc3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Jsb2NrL3R4X3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw4Q0FBd0M7QUFJeEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBZ0IvQixNQUFNLE9BQU8sR0FBRyxpTEFBaUwsQ0FBQztBQUVsTTtJQU1JLFlBQVksT0FLWDtRQUNHLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztJQUMvQyxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixJQUFJO2dCQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDaEM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsT0FBTyxzQkFBUyxDQUFDLGdCQUFnQixDQUFDO2FBQ3JDO1NBQ0o7UUFDRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRCxNQUFNO1FBQ0YsYUFBYTtJQUNqQixDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFpQjtRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDckMsTUFBTSxDQUFDLEtBQUssRUFBRSxvQkFBb0IsU0FBUyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQztRQUNELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLFNBQVMseUJBQXlCLENBQUMsQ0FBQztZQUN0RSxPQUFPLHNCQUFTLENBQUMsb0JBQW9CLENBQUM7U0FDekM7UUFFRCxJQUFJO1lBQ0EsS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTtnQkFDdkMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx5RUFBeUUsRUFBRSxDQUFDLElBQUksTUFBTSxFQUFFLENBQUMsT0FBTyxNQUFNLEtBQUssQ0FBQyxNQUFNLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7YUFDL0o7U0FDSjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQztRQUVELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBb0I7UUFDcEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsMENBQTBDLFlBQVksRUFBRSxDQUFDLENBQUM7U0FDakY7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLFdBQVcsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMxRSxPQUFPLHNCQUFTLENBQUMsZ0JBQWdCLENBQUM7U0FDckM7UUFFRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQWM7UUFDM0IsSUFBSTtZQUNBLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsOENBQThDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDMUYsSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtnQkFDM0MsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQixFQUFDLENBQUM7YUFDNUM7WUFFRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFDLENBQUM7U0FDbEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNqRSxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUM3QztJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBZTtRQUMxQyxJQUFJO1lBQ0EsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUN2QyxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYSxFQUFDLENBQUM7YUFDekM7WUFFRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBZSxFQUFDLENBQUM7U0FDcEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNqRixPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7Q0FDSjtBQS9GRCw4QkErRkMifQ==