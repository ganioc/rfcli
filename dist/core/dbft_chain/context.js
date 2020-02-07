"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
class DbftContext {
    constructor(storage, globalOptions, logger) {
        this.storage = storage;
        this.globalOptions = globalOptions;
        this.logger = logger;
    }
    async init(miners) {
        let storage = this.storage;
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return { err: dbr.err };
        }
        let kvr = await dbr.value.getReadWritableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return { err: kvr.err };
        }
        let kvDBFT = kvr.kv;
        await kvDBFT.set(DbftContext.keyMiners, JSON.stringify(miners));
        for (let address of miners) {
            let info = { height: 0 };
            let { err } = await kvDBFT.hset(DbftContext.keyCandidate, address, info);
            if (err) {
                return { err };
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
    static getElectionBlockNumber(globalOptions, n) {
        if (n === 0) {
            return 0;
        }
        return Math.floor((n - 1) / globalOptions.reSelectionBlocks) * globalOptions.reSelectionBlocks;
    }
    static isElectionBlockNumber(globalOptions, n) {
        // n=0的时候为创世块，config里面还没有值呢
        if (n === 0) {
            return true;
        }
        return n % globalOptions.reSelectionBlocks === 0;
    }
    static isAgreeRateReached(globalOptions, minerCount, agreeCount) {
        return agreeCount >= (minerCount * globalOptions.agreeRateNumerator / globalOptions.agreeRateDenominator);
    }
    static getDueNextMiner(globalOptions, preBlock, nextMiners, view) {
        let offset = view;
        if (!DbftContext.isElectionBlockNumber(globalOptions, preBlock.number)) {
            let idx = nextMiners.indexOf(preBlock.miner);
            if (idx >= 0) {
                offset += idx + 1;
            }
        }
        return nextMiners[offset % nextMiners.length];
    }
    async getMiners() {
        let dbr = await this.storage.getReadableDataBase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return { err: dbr.err };
        }
        let kvr = await dbr.value.getReadableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return { err: kvr.err };
        }
        let kvDBFT = kvr.kv;
        let gm = await kvDBFT.get(DbftContext.keyMiners);
        if (gm.err) {
            this.logger.error(`getMinersFromStorage failed,errcode=${gm.err}`);
            return { err: gm.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, miners: JSON.parse(gm.value) };
    }
    async isMiner(address) {
        let dbr = await this.storage.getReadableDataBase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return { err: dbr.err };
        }
        let kvr = await dbr.value.getReadableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return { err: kvr.err };
        }
        let kvDBFT = kvr.kv;
        let gm = await kvDBFT.get(DbftContext.keyMiners);
        if (gm.err) {
            if (gm.err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                return { err: error_code_1.ErrorCode.RESULT_OK, isminer: false };
            }
            else {
                return { err: gm.err };
            }
        }
        let miners = new Set(JSON.parse(gm.value));
        return { err: error_code_1.ErrorCode.RESULT_OK, isminer: miners.has(address) };
    }
    async registerToCandidate(superAdmin, blockheight, address) {
        if (superAdmin !== this.globalOptions.superAdmin) {
            this.logger.error(`registerToCandidate superAdmin error should ${this.globalOptions.superAdmin} but ${superAdmin} address=${address}`);
            return error_code_1.ErrorCode.RESULT_NOT_SUPPORT;
        }
        /*
        if (!libAddress.verify(Buffer.from(digest.md5(Buffer.from(address, 'hex')).toString('hex')), Buffer.from(sign, 'hex'), Buffer.from(this.globalOptions.systemPubkey, 'hex'))) {
            this.logger.error(`registerToCandidate superAdmin sign error,address=${address}`);
            return ErrorCode.RESULT_NOT_SUPPORT;
        }
        */
        let storage = this.storage;
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return dbr.err;
        }
        let kvr = await dbr.value.getReadWritableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return kvr.err;
        }
        let kvDBFT = kvr.kv;
        let info = { height: blockheight };
        let { err } = await kvDBFT.hset(DbftContext.keyCandidate, address, info);
        return err;
    }
    async unRegisterFromCandidate(superAdmin, address) {
        if (superAdmin !== this.globalOptions.superAdmin) {
            this.logger.error(`registerToCandidate superadmin error should ${this.globalOptions.superAdmin} but ${superAdmin} address=${address}`);
            return error_code_1.ErrorCode.RESULT_NOT_SUPPORT;
        }
        /*
        if (!libAddress.verify(Buffer.from(digest.md5(Buffer.from(address, 'hex')).toString('hex')), Buffer.from(sign, 'hex'), Buffer.from(this.globalOptions.systemPubkey, 'hex'))) {
            this.logger.error(`registerToCandidate superadmin sign error,address=${address}`);
            return ErrorCode.RESULT_NOT_SUPPORT;
        }
        */
        let storage = this.storage;
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return dbr.err;
        }
        let kvr = await dbr.value.getReadWritableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return kvr.err;
        }
        let kvDBFT = kvr.kv;
        let { err } = await kvDBFT.hdel(DbftContext.keyCandidate, address);
        return err;
    }
    async updateMiners(blockheight) {
        let storage = this.storage;
        let dbr = await storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
        if (dbr.err) {
            this.logger.error(`get system database failed ${dbr.err}`);
            return dbr.err;
        }
        let kvr = await dbr.value.getReadWritableKeyValue(DbftContext.kvDBFT);
        if (kvr.err) {
            this.logger.error(`get dbft keyvalue failed ${dbr.err}`);
            return kvr.err;
        }
        let kvDBFT = kvr.kv;
        let ga = await kvDBFT.hgetall(DbftContext.keyCandidate);
        if (ga.err) {
            this.logger.error(`updateCandidate failed,hgetall errcode=${ga.err}`);
            return ga.err;
        }
        let minWaitBlocksToMiner = this.globalOptions.minWaitBlocksToMiner;
        let miners = [];
        ga.value.forEach((v) => {
            let info = v.value;
            if (blockheight - info.height >= minWaitBlocksToMiner) {
                miners.push(v.key);
            }
        });
        let minValidator = this.globalOptions.minValidator;
        let maxValidator = this.globalOptions.maxValidator;
        if (minValidator > miners.length) {
            this.logger.error(`updateCandidate failed, valid miners not enough, length ${miners.length} minValidator ${minValidator}`);
            return error_code_1.ErrorCode.RESULT_NOT_ENOUGH;
        }
        if (miners.length > maxValidator) {
            miners = miners.slice(maxValidator);
        }
        let { err } = await kvDBFT.set(DbftContext.keyMiners, JSON.stringify(miners));
        return err;
    }
}
DbftContext.kvDBFT = 'dbft';
DbftContext.keyCandidate = 'candidate';
DbftContext.keyMiners = 'miner';
exports.DbftContext = DbftContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2RiZnRfY2hhaW4vY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw4Q0FBd0M7QUFDeEMsZ0RBQTZFO0FBVTdFO0lBS0ksWUFBc0IsT0FBeUIsRUFBWSxhQUFrQixFQUFZLE1BQXNCO1FBQXpGLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQVksa0JBQWEsR0FBYixhQUFhLENBQUs7UUFBWSxXQUFNLEdBQU4sTUFBTSxDQUFnQjtJQUUvRyxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFnQjtRQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBK0IsQ0FBQztRQUNuRCxJQUFJLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxtQkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMzRCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUcsQ0FBQztRQUNyQixNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEUsS0FBSyxJQUFJLE9BQU8sSUFBSSxNQUFNLEVBQUU7WUFDeEIsSUFBSSxJQUFJLEdBQWtCLEVBQUMsTUFBTSxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQ3RDLElBQUksRUFBQyxHQUFHLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkUsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsT0FBTyxFQUFDLEdBQUcsRUFBQyxDQUFDO2FBQ2hCO1NBQ0o7UUFDRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxhQUFrQixFQUFFLENBQVM7UUFDdkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ1QsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUM7SUFDbkcsQ0FBQztJQUVELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxhQUFrQixFQUFFLENBQVM7UUFDdEQsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxPQUFRLENBQUMsR0FBRyxhQUFhLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsYUFBa0IsRUFBRSxVQUFrQixFQUFFLFVBQWtCO1FBQ2hGLE9BQU8sVUFBVSxJQUFJLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQyxrQkFBa0IsR0FBRyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUM5RyxDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFrQixFQUFFLFFBQXlCLEVBQUUsVUFBb0IsRUFBRSxJQUFZO1FBQ3BHLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDcEUsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFO2dCQUNWLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO2FBQ3JCO1NBQ0o7UUFDRCxPQUFPLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxLQUFLLENBQUMsU0FBUztRQUNsQixJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsbUJBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDM0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFNLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25FLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN6RCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFHLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7WUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDbkUsT0FBTyxFQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDeEI7UUFFRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWU7UUFDaEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLG1CQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLENBQUMsS0FBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDekQsT0FBTyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRyxDQUFDO1FBQ3JCLElBQUksRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO1lBQ1IsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFNLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3hDLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDO2FBQ3JEO2lCQUFNO2dCQUNILE9BQU8sRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBQyxDQUFDO2FBQ3hCO1NBQ0o7UUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFVBQWtCLEVBQUUsV0FBbUIsRUFBRSxPQUFlO1FBQzlFLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFO1lBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLCtDQUErQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsUUFBUSxVQUFVLFlBQVksT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN2SSxPQUFPLHNCQUFTLENBQUMsa0JBQWtCLENBQUM7U0FDdkM7UUFDRDs7Ozs7VUFLRTtRQUNGLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUErQixDQUFDO1FBQ25ELElBQUksR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLHVCQUF1QixDQUFDLG1CQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUNELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFHLENBQUM7UUFDckIsSUFBSSxJQUFJLEdBQWtCLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxDQUFDO1FBQ2hELElBQUksRUFBQyxHQUFHLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdkUsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFVBQWtCLEVBQUUsT0FBZTtRQUM3RCxJQUFJLFVBQVUsS0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRTtZQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQywrQ0FBK0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLFFBQVEsVUFBVSxZQUFZLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdkksT0FBTyxzQkFBUyxDQUFDLGtCQUFrQixDQUFDO1NBQ3ZDO1FBQ0Q7Ozs7O1VBS0U7UUFFRixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBK0IsQ0FBQztRQUNuRCxJQUFJLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxtQkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDhCQUE4QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMzRCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7U0FDbEI7UUFDRCxJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFNLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUN6RCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7U0FDbEI7UUFDRCxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBRyxDQUFDO1FBRXJCLElBQUksRUFBQyxHQUFHLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVqRSxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFTSxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQW1CO1FBQ3pDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUErQixDQUFDO1FBQ25ELElBQUksR0FBRyxHQUFHLE1BQU0sT0FBTyxDQUFDLHVCQUF1QixDQUFDLG1CQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUNELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFHLENBQUM7UUFFckIsSUFBSSxFQUFFLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN4RCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7WUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEUsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxvQkFBb0IsR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDO1FBQzNFLElBQUksTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUMxQixFQUFFLENBQUMsS0FBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BCLElBQUksSUFBSSxHQUFrQixDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2xDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksb0JBQW9CLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3RCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLFlBQVksR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUMzRCxJQUFJLFlBQVksR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQztRQUMzRCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJEQUEyRCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsWUFBWSxFQUFFLENBQUMsQ0FBQztZQUMzSCxPQUFPLHNCQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDdEM7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBWSxFQUFFO1lBQzlCLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3ZDO1FBQ0QsSUFBSSxFQUFDLEdBQUcsRUFBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU1RSxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7O0FBN01hLGtCQUFNLEdBQVcsTUFBTSxDQUFDO0FBQ3hCLHdCQUFZLEdBQVcsV0FBVyxDQUFDO0FBQ25DLHFCQUFTLEdBQVcsT0FBTyxDQUFDO0FBSDlDLGtDQStNQyJ9