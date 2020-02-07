"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const util_1 = require("util");
const error_code_1 = require("../error_code");
const storage_1 = require("./storage");
const log_snapshot_manager_1 = require("./log_snapshot_manager");
class StorageManager {
    constructor(options) {
        this.m_views = new Map();
        this.m_path = options.path;
        this.m_storageType = options.storageType;
        this.m_logger = options.logger;
        if (options.snapshotManager) {
            this.m_snapshotManager = options.snapshotManager;
        }
        else {
            this.m_snapshotManager = new log_snapshot_manager_1.StorageLogSnapshotManager(options);
        }
        this.m_readonly = !!options.readonly;
        this.m_tmpManager = options.tmpManager;
    }
    async init() {
        let err = await this.m_snapshotManager.init();
        if (err) {
            return err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    get path() {
        return this.m_path;
    }
    uninit() {
        this.m_snapshotManager.uninit();
    }
    async createSnapshot(from, blockHash, remove) {
        if (this.m_readonly) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT };
        }
        let csr = await this.m_snapshotManager.createSnapshot(from, blockHash);
        if (csr.err) {
            return csr;
        }
        // assert((await csr.snapshot!.messageDigest()).value !== (await from.messageDigest()).value);
        if (remove) {
            await from.remove();
        }
        return csr;
    }
    async getSnapshot(blockHash) {
        return await this.m_snapshotManager.getSnapshot(blockHash);
    }
    releaseSnapshot(blockHash) {
        return this.m_snapshotManager.releaseSnapshot(blockHash);
    }
    async createStorage(name, from) {
        if (this.m_readonly) {
            return { err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT };
        }
        let storage = new this.m_storageType({
            filePath: this.m_tmpManager.getPath(`${name}.storage`),
            logger: this.m_logger
        });
        await storage.remove();
        let err;
        if (!from) {
            this.m_logger.info(`create storage ${name}`);
            err = await storage.init();
        }
        else if (util_1.isString(from)) {
            this.m_logger.info(`create storage ${name} from snapshot ${from}`);
            let ssr = await this._getSnapshotStorage(from);
            if (ssr.err) {
                this.m_logger.error(`get snapshot failed for ${from}`);
                err = ssr.err;
            }
            else {
                fs.copyFileSync(ssr.storage.filePath, storage.filePath);
                this.releaseSnapshotView(from);
                err = await storage.init();
            }
        }
        else if (from instanceof storage_1.Storage) {
            this.m_logger.info(`create storage ${name} from snapshot ${storage.filePath}`);
            fs.copyFileSync(from.filePath, storage.filePath);
            err = await storage.init();
        }
        else {
            this.m_logger.error(`create storage ${name} with invalid from ${from}`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (err) {
            this.m_logger.error(`create storage ${name} failed for ${err}`);
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, storage };
    }
    async _getSnapshotStorage(blockHash) {
        let stub = this.m_views.get(blockHash);
        if (stub) {
            ++stub.ref;
            if (stub.storage.isInit) {
                return { err: error_code_1.ErrorCode.RESULT_OK, storage: stub.storage };
            }
            else {
                return new Promise((resolve) => {
                    stub.storage.once('init', (err) => {
                        if (err) {
                            resolve({ err });
                        }
                        else {
                            resolve({ err, storage: stub.storage });
                        }
                    });
                });
            }
        }
        stub = {
            storage: new this.m_storageType({
                filePath: this.m_snapshotManager.getSnapshotFilePath(blockHash),
                logger: this.m_logger
            }),
            ref: 1
        };
        this.m_views.set(blockHash, stub);
        let sr = await this.m_snapshotManager.getSnapshot(blockHash);
        if (sr.err) {
            this.m_logger.error(`get snapshot failed for ${sr.err}`);
            this.m_views.delete(blockHash);
            return { err: sr.err };
        }
        let ret = new Promise((resolve) => {
            stub.storage.once('init', (err) => {
                if (err) {
                    this.m_snapshotManager.releaseSnapshot(blockHash);
                    this.m_views.delete(blockHash);
                    resolve({ err });
                }
                else {
                    resolve({ err, storage: stub.storage });
                }
            });
        });
        stub.storage.init(true);
        return ret;
    }
    async getSnapshotView(blockHash) {
        return await this._getSnapshotStorage(blockHash);
    }
    // 根据block hash 获取redo log内容
    // 提供给chain_node层引用
    getRedoLog(blockHash) {
        return this.m_snapshotManager.getRedoLog(blockHash);
    }
    hasRedoLog(blockHash) {
        return this.m_snapshotManager.hasRedoLog(blockHash);
    }
    addRedoLog(blockHash, log) {
        return this.m_snapshotManager.writeRedoLog(blockHash, log);
    }
    async releaseSnapshotView(blockHash) {
        let stub = this.m_views.get(blockHash);
        if (stub) {
            --stub.ref;
            if (!stub.ref) {
                this.m_views.delete(blockHash);
                // 这里await也不能保证互斥， 可能在uninit过程中再次创建，只能靠readonly保证在一个path上创建多个storage 实例
                await stub.storage.uninit();
                this.m_snapshotManager.releaseSnapshot(blockHash);
            }
        }
    }
    recycleSnapshot() {
        return this.m_snapshotManager.recycle();
    }
}
exports.StorageManager = StorageManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZV9tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvc3RvcmFnZS9zdG9yYWdlX21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBK0I7QUFHL0IsK0JBQWdDO0FBRWhDLDhDQUEwQztBQUsxQyx1Q0FBb0U7QUFDcEUsaUVBQWlFO0FBY2pFO0lBQ0ksWUFBWSxPQUE4QjtRQWtCbEMsWUFBTyxHQUFpRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBakJ0RSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQUU7WUFDekIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7U0FDcEQ7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGdEQUF5QixDQUFDLE9BQXdDLENBQUMsQ0FBQztTQUNwRztRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0lBQzNDLENBQUM7SUFTTSxLQUFLLENBQUMsSUFBSTtRQUNiLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUVELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lB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