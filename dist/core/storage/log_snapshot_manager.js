"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const assert = require("assert");
const error_code_1 = require("../error_code");
const serializable_1 = require("../serializable");
const js_log_1 = require("./js_log");
const dump_snapshot_1 = require("./dump_snapshot");
const dump_snapshot_manager_1 = require("./dump_snapshot_manager");
class StorageLogSnapshotManager {
    constructor(options) {
        this.m_snapshots = new Map();
        this.m_logPath = path.join(options.path, 'log');
        if (options.dumpSnapshotManager) {
            this.m_dumpManager = options.dumpSnapshotManager;
        }
        else {
            this.m_dumpManager = new dump_snapshot_manager_1.StorageDumpSnapshotManager(options);
        }
        this.m_headerStorage = options.headerStorage;
        this.m_storageType = options.storageType;
        this.m_logger = options.logger;
        this.m_readonly = !!(options && options.readonly);
    }
    recycle() {
        this.m_logger.debug(`begin recycle snanshot`);
        let recycledMap = new Map(this.m_snapshots);
        for (let [blockHash, stub] of recycledMap.entries()) {
            if (!stub.ref) {
                this.m_logger.debug(`delete snapshot ${blockHash}`);
                const err = this.m_dumpManager.removeSnapshot(blockHash);
                if (!err) {
                    this.m_snapshots.delete(blockHash);
                }
            }
        }
    }
    async init() {
        if (!this.m_readonly) {
            fs.ensureDirSync(this.m_logPath);
        }
        let err = await this.m_dumpManager.init();
        if (err) {
            return err;
        }
        let snapshots = this.m_dumpManager.listSnapshots();
        for (let ss of snapshots) {
            this.m_snapshots.set(ss.blockHash, { ref: 0 });
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        this.m_dumpManager.uninit();
        this.m_snapshots.clear();
    }
    async createSnapshot(from, blockHash) {
        let csr = await this.m_dumpManager.createSnapshot(from, blockHash);
        if (csr.err) {
            return csr;
        }
        let logger = from.storageLogger;
        if (logger) {
            this.m_logger.debug(`begin write redo log ${blockHash}`);
            let writer = new serializable_1.BufferWriter();
            logger.finish();
            let err = logger.encode(writer);
            if (err) {
                this.m_logger.error(`encode redo logger failed `, blockHash);
            }
            fs.writeFileSync(this.getLogPath(blockHash), writer.render());
        }
        else {
            this.m_logger.debug(`ignore write redo log ${blockHash} for redo log missing`);
        }
        this.m_snapshots.set(blockHash, { ref: 0 });
        return csr;
    }
    getSnapshotFilePath(blockHash) {
        return this.m_dumpManager.getSnapshotFilePath(blockHash);
    }
    getLogPath(blockHash) {
        return path.join(this.m_logPath, blockHash + '.redo');
    }
    hasRedoLog(blockHash) {
        return fs.existsSync(this.getLogPath(blockHash));
    }
    getRedoLog(blockHash) {
        let redoLogRaw;
        try {
            redoLogRaw = fs.readFileSync(this.getLogPath(blockHash));
        }
        catch (error) {
            this.m_logger.warn(`read log file ${this.getLogPath(blockHash)} failed.`);
        }
        if (!redoLogRaw) {
            this.m_logger.error(`get redo log ${blockHash} failed`);
            return undefined;
        }
        let redoLog = new js_log_1.JStorageLogger();
        let err = redoLog.decode(new serializable_1.BufferReader(redoLogRaw));
        if (err) {
            this.m_logger.error(`decode redo log ${blockHash} from storage failed`);
            return undefined;
        }
        return redoLog;
    }
    // 保存redolog文件
    // 文件内容来源是 从其他节点请求来， 并不是本地节点自己运行的redolog
    writeRedoLog(blockHash, redoLog) {
        this.m_logger.debug(`write redo log ${blockHash}`);
        let filepath = this.getLogPath(blockHash);
        let writer = new serializable_1.BufferWriter();
        let err = redoLog.encode(writer);
        if (err) {
            this.m_logger.error(`encode redo log failed `, redoLog);
            return err;
        }
        fs.writeFileSync(filepath, writer.render());
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async getSnapshot(blockHash) {
        this.m_logger.info(`getting snapshot ${blockHash}`);
        // 只能在storage manager 的实现中调用，在storage manager中保证不会以相同block hash重入
        let ssr = await this.m_dumpManager.getSnapshot(blockHash);
        if (!ssr.err) {
            assert(this.m_snapshots.get(blockHash));
            this.m_logger.info(`get snapshot ${blockHash} directly from dump`);
            ++this.m_snapshots.get(blockHash).ref;
            return ssr;
        }
        else if (ssr.err !== error_code_1.ErrorCode.RESULT_NOT_FOUND) {
            this.m_logger.error(`get snapshot ${blockHash} failed for dump manager get snapshot failed for ${ssr.err}`);
            return { err: ssr.err };
        }
        let hr = await this.m_headerStorage.getHeader(blockHash);
        if (hr.err) {
            this.m_logger.error(`get snapshot ${blockHash} failed for load header failed ${hr.err}`);
            return { err: hr.err };
        }
        let blockPath = [];
        let header = hr.header;
        let err = error_code_1.ErrorCode.RESULT_NOT_FOUND;
        let nearestSnapshot;
        this.m_logger.info(`================================getSnapshot need redo blockHash=${blockHash}`);
        do {
            let _ssr = await this.m_dumpManager.getSnapshot(header.hash);
            if (!_ssr.err) {
                nearestSnapshot = _ssr.snapshot;
                err = _ssr.err;
                break;
            }
            else if (_ssr.err !== error_code_1.ErrorCode.RESULT_NOT_FOUND) {
                this.m_logger.error(`get snapshot ${blockHash} failed for get dump ${header.hash} failed ${_ssr.err}`);
                err = _ssr.err;
                break;
            }
            blockPath.push(header.hash);
            let _hr = await this.m_headerStorage.getHeader(header.preBlockHash);
            if (_hr.err) {
                this.m_logger.error(`get snapshot ${blockHash} failed for get header ${header.preBlockHash} failed ${hr.err}`);
                err = error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                break;
            }
            header = _hr.header;
        } while (true);
        if (err) {
            this.m_logger.error(`get snapshot ${blockHash} failed for ${err}`);
            return { err };
        }
        /** 这段代码要保证同步 start */
        let storage = new this.m_storageType({
            filePath: this.m_dumpManager.getSnapshotFilePath(blockHash),
            logger: this.m_logger
        });
        fs.copyFileSync(nearestSnapshot.filePath, storage.filePath);
        /** 这段代码要保证同步 end */
        err = await storage.init();
        if (err) {
            this.m_logger.error(`get snapshot ${blockHash} failed for storage init failed for ${err}`);
            return { err };
        }
        for (let _blockHash of blockPath.reverse()) {
            if (!fs.existsSync(this.getLogPath(_blockHash))) {
                this.m_logger.error(`get snapshot ${blockHash} failed for get redo log for ${_blockHash} failed for not exist`);
                err = error_code_1.ErrorCode.RESULT_NOT_FOUND;
                break;
            }
            let log;
            try {
                log = fs.readFileSync(this.getLogPath(_blockHash));
            }
            catch (error) {
                this.m_logger.error(`read log file ${this.getLogPath(_blockHash)} failed.`);
            }
            err = await storage.redo(log);
            if (err) {
                this.m_logger.error(`get snapshot ${blockHash} failed for redo ${_blockHash} failed for ${err}`);
                break;
            }
        }
        await storage.uninit();
        if (err) {
            await storage.remove();
            this.m_logger.error(`get snapshot ${blockHash} failed for ${err}`);
            return { err };
        }
        this.m_snapshots.set(blockHash, { ref: 1 });
        return { err: error_code_1.ErrorCode.RESULT_OK,
            snapshot: new dump_snapshot_1.StorageDumpSnapshot(blockHash, storage.filePath) };
    }
    releaseSnapshot(blockHash) {
        let stub = this.m_snapshots.get(blockHash);
        if (stub) {
            assert(stub.ref > 0);
            if (stub.ref > 0) {
                --stub.ref;
            }
        }
    }
}
exports.StorageLogSnapshotManager = StorageLogSnapshotManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX3NuYXBzaG90X21hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9zdG9yYWdlL2xvZ19zbmFwc2hvdF9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpQ0FBa0M7QUFFbEMsOENBQTBDO0FBRTFDLGtEQUE2RDtBQUU3RCxxQ0FBd0M7QUFHeEMsbURBQThHO0FBQzlHLG1FQUFxRTtBQUdyRTtJQUNJLFlBQVksT0FBMkY7UUFtQi9GLGdCQUFXLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFsQjFELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hELElBQUksT0FBTyxDQUFDLG1CQUFtQixFQUFFO1lBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDO1NBQ3BEO2FBQU07WUFDSCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksa0RBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDaEU7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQVVNLE9BQU87UUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzlDLElBQUksV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztR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