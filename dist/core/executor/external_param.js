"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require('assert');
const error_code_1 = require("../error_code");
const fs = require("fs-extra");
const storage_1 = require("../storage_sqlite/storage");
class InprocessStorageParam {
    constructor(options) {
        this.m_logger = options.logger;
    }
    get type() {
        return InprocessStorageParam.type;
    }
    async init(options) {
        this.m_logger.debug(`begin create external storage param ${options.blockHash}`);
        const vr = await options.storageManager.getSnapshotView(options.blockHash);
        if (vr.err) {
            this.m_logger.error(`create extern storage param ${options.blockHash} failed for ${error_code_1.stringifyErrorCode(vr.err)}`);
            return vr.err;
        }
        this.m_storage = vr.storage;
        this.m_storageManager = options.storageManager;
        this.m_blockHash = options.blockHash;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    get value() {
        return this.m_storage;
    }
    finalize() {
        if (!this.m_blockHash) {
            return;
        }
        this.m_logger.debug(`extern storage param ${this.m_blockHash} finalized`);
        this.m_storageManager.releaseSnapshotView(this.m_blockHash);
        if (this.m_encodedPath && fs.existsSync(this.m_encodedPath)) {
            this.m_logger.debug(`extern storage param ${this.m_blockHash} has encoded, remove encode path ${this.m_encodedPath}`);
            fs.unlinkSync(this.m_encodedPath);
        }
    }
    async interprocessEncode() {
        assert(this.m_storageManager, `try to interprocess encode null storage`);
        if (this.m_encodedPath) {
            assert(false, `encode twice, last encode path is ${this.m_encodedPath}`);
            return { err: error_code_1.ErrorCode.RESULT_ALREADY_EXIST };
        }
        const name = `${Date.now()}${this.m_blockHash}`;
        this.m_logger.debug(`interprocess encode storage param ${this.m_blockHash} to path ${name}`);
        const csr = await this.m_storageManager.createStorage(name, this.m_blockHash);
        if (csr.err) {
            this.m_logger.error(`interprocess encode storage param ${this.m_blockHash} failed for ${error_code_1.stringifyErrorCode(csr.err)}`);
            return { err: csr.err };
        }
        this.m_encodedPath = csr.storage.filePath;
        await csr.storage.uninit();
        return {
            err: error_code_1.ErrorCode.RESULT_OK,
            result: {
                path: this.m_encodedPath
            }
        };
    }
}
InprocessStorageParam.type = 'storage';
class InterprocessStorageParam {
    constructor(options) {
        this.m_logger = options.logger;
    }
    get type() {
        return InprocessStorageParam.type;
    }
    async init(options) {
        let storage = new storage_1.SqliteStorage({
            filePath: options.encoded.path,
            logger: this.m_logger
        });
        const err = await storage.init(true);
        if (err) {
            return err;
        }
        this.m_storage = storage;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    get value() {
        return this.m_storage;
    }
    finalize() {
        if (!this.m_storage) {
            return;
        }
        this.m_logger.debug(`interprocess extern storage param ${this.m_storage.filePath} finalize`);
        this.m_storage.uninit();
    }
    async interprocessEncode() {
        assert(false, `should not encode storage param in worker routine`);
        return { err: error_code_1.ErrorCode.RESULT_NO_IMP };
    }
}
class BlockExecutorExternParamCreator {
    constructor(options) {
        this.m_logger = options.logger;
    }
    async createStorage(options) {
        const p = new InprocessStorageParam({
            logger: this.m_logger
        });
        const err = await p.init(options);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, param: p };
    }
    async interprocessEncode(params) {
        let err = error_code_1.ErrorCode.RESULT_OK;
        let ops = [];
        for (const p of params) {
            if (p.type === InprocessStorageParam.type) {
            }
            else {
                err = error_code_1.ErrorCode.RESULT_INVALID_PARAM;
                break;
            }
            ops.push(p.interprocessEncode());
        }
        if (err) {
            return { err };
        }
        let results = await Promise.all(ops);
        let encoded = [];
        for (let ix = 0; ix < results.length; ++ix) {
            const r = results[ix];
            const p = params[ix];
            if (r.err) {
                return { err: r.err };
            }
            encoded.push({
                type: p.type,
                encoded: r.result
            });
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, encoded };
    }
    async interprocessDecode(encoded) {
        let params = [];
        let err = error_code_1.ErrorCode.RESULT_OK;
        let ops = [];
        for (const e of encoded) {
            if (e.type === InprocessStorageParam.type) {
                ops.push(this._decodeStorage(e.encoded));
            }
            else {
                err = error_code_1.ErrorCode.RESULT_INVALID_PARAM;
            }
        }
        if (err) {
            return { err };
        }
        const results = await Promise.all(ops);
        for (const r of results) {
            if (r.err) {
                return { err: r.err };
            }
            params.push(r.param);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, params };
    }
    async _decodeStorage(encoded) {
        const p = new InterprocessStorageParam({
            logger: this.m_logger
        });
        const err = await p.init({ encoded });
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, param: p };
    }
}
exports.BlockExecutorExternParamCreator = BlockExecutorExternParamCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWxfcGFyYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9leGVjdXRvci9leHRlcm5hbF9wYXJhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyw4Q0FBNEQ7QUFHNUQsK0JBQStCO0FBQy9CLHVEQUEwRDtBQVMxRDtJQWFJLFlBQVksT0FBaUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFORCxJQUFJLElBQUk7UUFDSixPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQztJQUN0QyxDQUFDO0lBTUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUE0RDtRQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDaEYsTUFBTSxFQUFFLEdBQUcsTUFBTSxPQUFPLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0UsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsK0JBQStCLE9BQU8sQ0FBQyxTQUFTLGVBQWUsK0JBQWtCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqSCxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7U0FDakI7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFRLENBQUM7UUFDN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFDL0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQ3JDLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ25CLE9BQVE7U0FDWDtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHdCQUF3QixJQUFJLENBQUMsV0FBVyxZQUFZLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsZ0JBQWlCLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFdBQVksQ0FBQyxDQUFDO1FBQzlELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsSUFBSSxDQUFDLFdBQVcsb0NBQW9DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3RILEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNwQixNQUFNLENBQUMsS0FBSyxFQUFFLHFDQUFxQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUN6RSxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUMsQ0FBQztTQUNoRDtRQUNELE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFZLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSxDQUFDLFdBQVcsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFpQixDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVksQ0FBQyxDQUFDO1FBQ2hGLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsV0FBVyxlQUFlLCtCQUFrQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkgsT0FBTyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDekI7UUFDRCxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxPQUFRLENBQUMsUUFBUSxDQUFDO1FBQzNDLE1BQU0sR0FBRyxDQUFDLE9BQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixPQUFPO1lBQ0gsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUztZQUN4QixNQUFNLEVBQUU7Z0JBQ0osSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhO2FBQzNCO1NBQ0osQ0FBQztJQUNOLENBQUM7O0FBNURNLDBCQUFJLEdBQVcsU0FBUyxDQUFDO0FBK0RwQztJQUlJLFlBQVksT0FBaUM7UUFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQztJQUN0QyxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUF1QjtRQUM5QixJQUFJLE9BQU8sR0FBRyxJQUFJLHVCQUFhLENBQUM7WUFDNUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSTtZQUM5QixNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVUsQ0FBQztJQUMzQixDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pCLE9BQVE7U0FDWDtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsV0FBVyxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLFNBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSyxDQUFDLGtCQUFrQjtRQUNwQixNQUFNLENBQUMsS0FBSyxFQUFFLG1EQUFtRCxDQUFDLENBQUM7UUFDbkUsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGFBQWEsRUFBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSjtBQUVEO0lBQ0ksWUFBWSxPQUFpQztRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQUdELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBNEQ7UUFDNUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQztZQUNoQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDeEIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxFQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFrQztRQUN2RCxJQUFJLEdBQUcsR0FBYyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztRQUN6QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUNwQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUsscUJBQXFCLENBQUMsSUFBSSxFQUFFO2FBQzFDO2lCQUFNO2dCQUNILEdBQUcsR0FBRyxzQkFBUyxDQUFDLG9CQUFvQixDQUFDO2dCQUNyQyxNQUFNO2FBQ1Q7WUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7U0FDcEM7UUFDRCxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQztTQUNoQjtRQUNELElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDeEMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxFQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUM7YUFDdkI7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUNULElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtnQkFDWixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU87YUFDckIsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBYztRQUNuQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxTQUFTLENBQUM7UUFDOUIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsS0FBSyxNQUFNLENBQUMsSUFBSSxPQUFPLEVBQUU7WUFDckIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLHFCQUFxQixDQUFDLElBQUksRUFBRTtnQkFDdkMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILEdBQUcsR0FBRyxzQkFBUyxDQUFDLG9CQUFvQixDQUFDO2FBQ3hDO1NBQ0o7UUFDRCxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQztTQUNoQjtRQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQU8sRUFBRTtZQUNyQixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxFQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFDLENBQUM7YUFDdkI7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFNLENBQUMsQ0FBQztTQUN6QjtRQUNELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBWTtRQUM3QixNQUFNLENBQUMsR0FBRyxJQUFJLHdCQUF3QixDQUFDO1lBQ25DLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN4QixDQUFDLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxFQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNKO0FBakZELDBFQWlGQyJ9