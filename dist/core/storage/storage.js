"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const fs = require("fs-extra");
const assert = require('assert');
const error_code_1 = require("../error_code");
const logger_1 = require("./logger");
const reader_1 = require("../lib/reader");
class IReadableStorage {
}
exports.IReadableStorage = IReadableStorage;
class IReadWritableStorage extends IReadableStorage {
}
exports.IReadWritableStorage = IReadWritableStorage;
class Storage extends IReadWritableStorage {
    constructor(options) {
        super();
        this.m_eventEmitter = new events_1.EventEmitter();
        this.m_filePath = options.filePath;
        this.m_logger = options.logger;
    }
    createLogger(logger) {
        if (!this.m_storageLogger) {
            if (!logger) {
                logger = this._createLogger();
                logger.init();
            }
            this.m_storageLogger = new logger_1.LoggedStorage(this, logger);
        }
    }
    get storageLogger() {
        if (this.m_storageLogger) {
            return this.m_storageLogger.logger;
        }
    }
    on(event, listener) {
        this.m_eventEmitter.on(event, listener);
        return this;
    }
    once(event, listener) {
        this.m_eventEmitter.once(event, listener);
        return this;
    }
    async redo(logBuf) {
        let logger = this._createLogger();
        let err = logger.decode(new reader_1.BufferReader(logBuf));
        if (err) {
            return err;
        }
        return logger.redoOnStorage(this);
    }
    get filePath() {
        return this.m_filePath;
    }
    async reset() {
        const err = await this.remove();
        if (err) {
            return err;
        }
        return await this.init();
    }
    async remove() {
        await this.uninit();
        if (fs.existsSync(this.m_filePath)) {
            try {
                this.m_logger.debug(`about to remove storage file `, this.m_filePath);
                fs.unlinkSync(this.m_filePath);
            }
            catch (e) {
                this.m_logger.error(`remove storage ${this.m_filePath} failed `, e);
                return error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    messageDigest() {
        return Promise.resolve({ err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT });
    }
    static getKeyValueFullName(dbName, kvName) {
        return `${dbName}${this.keyValueNameSpec}${kvName}`;
    }
    static checkDataBaseName(name) {
        if (Storage.splitFullName(name).dbName) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    static checkTableName(name) {
        if (Storage.splitFullName(name).dbName) {
            return error_code_1.ErrorCode.RESULT_INVALID_PARAM;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    static splitFullName(fullName) {
        let i = fullName.indexOf(this.keyValueNameSpec);
        if (i > 0) {
            let dbName = fullName.substr(0, i);
            let kvName = fullName.substr(i + 1);
            return {
                dbName,
                kvName
            };
        }
        return {};
    }
    async getKeyValue(dbName, kvName) {
        let err = Storage.checkDataBaseName(dbName);
        if (err) {
            return { err };
        }
        err = Storage.checkTableName(dbName);
        if (err) {
            return { err };
        }
        let dbr = await this.getReadWritableDatabase(dbName);
        if (dbr.err) {
            return { err: dbr.err };
        }
        return dbr.value.getReadWritableKeyValue(kvName);
    }
    async getTable(fullName) {
        let names = Storage.splitFullName(fullName);
        if (!names.dbName) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        let dbr = await this.getReadWritableDatabase(names.dbName);
        if (dbr.err) {
            return { err: dbr.err };
        }
        if (names.kvName) {
            return dbr.value.getReadWritableKeyValue(names.kvName);
        }
        else {
            assert(false, `invalid fullName ${fullName}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
}
Storage.keyValueNameSpec = '#';
exports.Storage = Storage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3N0b3JhZ2Uvc3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFzQztBQUN0QywrQkFBK0I7QUFDL0IsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pDLDhDQUEwQztBQUUxQyxxQ0FBd0Q7QUFDeEQsMENBQTZDO0FBcUU3QztDQUVDO0FBRkQsNENBRUM7QUFFRCwwQkFBMkMsU0FBUSxnQkFBZ0I7Q0FJbEU7QUFKRCxvREFJQztBQU9ELGFBQThCLFNBQVEsb0JBQW9CO0lBTXRELFlBQVksT0FBdUI7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFIRixtQkFBYyxHQUFpQixJQUFJLHFCQUFZLEVBQUUsQ0FBQztRQUl4RCxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFJTSxZQUFZLENBQUMsTUFBc0I7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUM5QixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDakI7WUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksc0JBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDMUQ7SUFDTCxDQUFDO0lBRUQsSUFBVyxhQUFhO1FBQ3BCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO1NBQ3RDO0lBQ0wsQ0FBQztJQUdELEVBQUUsQ0FBQyxLQUFhLEVBQUUsUUFBa0M7UUFDaEQsSUFBSSxDQUFDLGNBQWMs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