"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const assert = require("assert");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const error_code_1 = require("../error_code");
const serializable_1 = require("../serializable");
const storage_1 = require("../storage");
const util_1 = require("util");
const digest = require('../lib/digest');
const { LogShim } = require('../lib/log_shim');
class SqliteStorageKeyValue {
    constructor(db, fullName, logger) {
        this.db = db;
        this.fullName = fullName;
        this.logger = new LogShim(logger).bind(`[transaction: ${this.fullName}]`, true).log;
    }
    async set(key, value) {
        try {
            assert(key);
            const json = JSON.stringify(serializable_1.toStringifiable(value, true));
            const sql = `REPLACE INTO '${this.fullName}' (name, field, value) VALUES ('${key}', "____default____", '${json}')`;
            await this.db.exec(sql);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`set ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async get(key) {
        try {
            assert(key);
            const result = await this.db.get(`SELECT value FROM '${this.fullName}' \
                WHERE name=? AND field="____default____"`, key);
            if (result == null) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.fromStringifiable(JSON.parse(result.value)) };
        }
        catch (e) {
            this.logger.error(`get ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hset(key, field, value) {
        try {
            assert(key);
            assert(field);
            const json = JSON.stringify(serializable_1.toStringifiable(value, true));
            const sql = `REPLACE INTO '${this.fullName}' (name, field, value) VALUES ('${key}', '${field}', '${json}')`;
            await this.db.exec(sql);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`hset ${key} ${field} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hget(key, field) {
        try {
            assert(key);
            assert(field);
            const result = await this.db.get(`SELECT value FROM '${this.fullName}' WHERE name=? AND field=?`, key, field);
            if (result == null) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.fromStringifiable(JSON.parse(result.value)) };
        }
        catch (e) {
            this.logger.error(`hget ${key} ${field} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hdel(key, field) {
        try {
            await this.db.exec(`DELETE FROM '${this.fullName}' WHERE name='${key}' and field='${field}'`);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`hdel ${key} ${field} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hlen(key) {
        try {
            assert(key);
            const result = await this.db.get(`SELECT count(*) as value FROM '${this.fullName}' WHERE name=?`, key);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: result.value };
        }
        catch (e) {
            this.logger.error(`hlen ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hexists(key, field) {
        let { err } = await this.hget(key, field);
        if (!err) {
            return { err: error_code_1.ErrorCode.RESULT_OK, value: true };
        }
        else if (err === error_code_1.ErrorCode.RESULT_NOT_FOUND) {
            return { err: error_code_1.ErrorCode.RESULT_OK, value: false };
        }
        else {
            this.logger.error(`hexists ${key} ${field} `, err);
            return { err };
        }
    }
    async hmset(key, fields, values) {
        try {
            assert(key);
            assert(fields.length === values.length);
            const statement = await this.db.prepare(`REPLACE INTO '${this.fullName}'  (name, field, value) VALUES (?, ?, ?)`);
            for (let i = 0; i < fields.length; i++) {
                await statement.run([key, fields[i], JSON.stringify(serializable_1.toStringifiable(values[i], true))]);
            }
            await statement.finalize();
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`hmset ${key} ${fields} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hmget(key, fields) {
        try {
            assert(key);
            const sql = `SELECT * FROM '${this.fullName}' WHERE name=? AND field in (${fields.map((x) => '?').join(',')})`;
            // console.log({ sql });
            const result = await this.db.all(sql, key, ...fields);
            const resultMap = {};
            result.forEach((x) => resultMap[x.field] = serializable_1.fromStringifiable(JSON.parse(x.value)));
            const values = fields.map((x) => resultMap[x]);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: values };
        }
        catch (e) {
            this.logger.error(`hmget ${key} ${fields} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hkeys(key) {
        try {
            assert(key);
            const result = await this.db.all(`SELECT * FROM '${this.fullName}' WHERE name=?`, key);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: result.map((x) => x.field) };
        }
        catch (e) {
            this.logger.error(`hkeys ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hvalues(key) {
        try {
            assert(key);
            const result = await this.db.all(`SELECT * FROM '${this.fullName}' WHERE name=?`, key);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: result.map((x) => serializable_1.fromStringifiable(JSON.parse(x.value))) };
        }
        catch (e) {
            this.logger.error(`hvalues ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hgetall(key) {
        try {
            const result = await this.db.all(`SELECT * FROM '${this.fullName}' WHERE name=?`, key);
            return {
                err: error_code_1.ErrorCode.RESULT_OK, value: result.map((x) => {
                    return { key: x.field, value: serializable_1.fromStringifiable(JSON.parse(x.value)) };
                })
            };
        }
        catch (e) {
            this.logger.error(`hgetall ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hclean(key) {
        try {
            const result = await this.db.exec(`DELETE FROM ${this.fullName} WHERE name='${key}'`);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`hclean ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lindex(key, index) {
        return this.hget(key, index.toString());
    }
    async lset(key, index, value) {
        try {
            assert(key);
            assert(!util_1.isNullOrUndefined(index));
            const json = JSON.stringify(serializable_1.toStringifiable(value, true));
            const sql = `REPLACE INTO '${this.fullName}' (name, field, value) VALUES ('${key}', '${index.toString()}', '${json}')`;
            await this.db.exec(sql);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lset ${key} ${index} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async llen(key) {
        return await this.hlen(key);
    }
    async lrange(key, start, stop) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            if (!len) {
                return { err: error_code_1.ErrorCode.RESULT_OK, value: [] };
            }
            if (start < 0) {
                start = len + start;
            }
            if (stop < 0) {
                stop = len + stop;
            }
            if (stop >= len) {
                stop = len - 1;
            }
            let fields = [];
            for (let i = start; i <= stop; ++i) {
                fields.push(i);
            }
            const result = await this.db.all(`SELECT * FROM '${this.fullName}' WHERE name='${key}' AND field in (${fields.map((x) => `'${x}'`).join(',')})`);
            let ret = new Array(result.length);
            for (let x of result) {
                ret[parseInt(x.field) - start] = serializable_1.fromStringifiable(JSON.parse(x.value));
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: ret };
        }
        catch (e) {
            this.logger.error(`lrange ${key} ${start} ${stop}`, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lpush(key, value) {
        try {
            assert(key);
            // update index += 1
            // set index[0] = value
            const json = JSON.stringify(serializable_1.toStringifiable(value, true));
            await this.db.exec(`UPDATE '${this.fullName}' SET field=field+1 WHERE name='${key}'`);
            const sql = `INSERT INTO '${this.fullName}' (name, field, value) VALUES ('${key}', '0', '${json}')`;
            // console.log('lpush', { sql });
            await this.db.exec(sql);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lpush ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lpushx(key, value) {
        try {
            assert(key);
            const len = value.length;
            await this.db.exec(`UPDATE '${this.fullName}' SET field=field+${len} WHERE name='${key}'`);
            for (let i = 0; i < len; i++) {
                const json = JSON.stringify(serializable_1.toStringifiable(value[i], true));
                await this.db.exec(`INSERT INTO '${this.fullName}' (name, field, value) VALUES ('${key}', '${i}', '${json}')`);
            }
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lpushx ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lpop(key) {
        try {
            const index = 0;
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            if (len === 0) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            else {
                const { err: err2, value } = await this.lindex(key, index);
                let sql = `DELETE FROM '${this.fullName}' WHERE name='${key}' AND field='${index}'`;
                await this.db.exec(sql);
                for (let i = index + 1; i < len; i++) {
                    sql = `UPDATE '${this.fullName}' SET field=field-1 WHERE name='${key}' AND field = ${i}`;
                    await this.db.exec(sql);
                }
                return { err: error_code_1.ErrorCode.RESULT_OK, value };
            }
        }
        catch (e) {
            this.logger.error(`lpop ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async rpush(key, value) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            const json = JSON.stringify(serializable_1.toStringifiable(value, true));
            await this.db.exec(`INSERT INTO '${this.fullName}' (name, field, value) VALUES ('${key}', '${len}', '${json}')`);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`rpush ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async rpushx(key, value) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            for (let i = 0; i < value.length; i++) {
                const json = JSON.stringify(serializable_1.toStringifiable(value[i], true));
                await this.db.exec(`INSERT INTO '${this.fullName}' (name, field, value) \
                    VALUES ('${key}', '${len + i}', '${json}')`);
            }
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`rpushx ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async rpop(key) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            if (len === 0) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            else {
                const { err: err2, value } = await this.lindex(key, len - 1);
                await this.db.exec(`DELETE FROM '${this.fullName}' WHERE name='${key}' AND field=${len - 1}`);
                return { err: error_code_1.ErrorCode.RESULT_OK, value };
            }
        }
        catch (e) {
            this.logger.error(`rpop ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async linsert(key, index, value) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            if (len === 0 || index >= len) {
                return await this.lset(key, len, value);
            }
            else {
                for (let i = len - 1; i >= index; i--) {
                    await this.db.exec(`UPDATE '${this.fullName}' SET field=field+1 WHERE name='${key}' AND field = ${i}`);
                }
                return await this.lset(key, index, value);
            }
        }
        catch (e) {
            this.logger.error(`linsert ${key} ${index} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lremove(key, index) {
        try {
            assert(key);
            const { err, value: len } = await this.llen(key);
            if (err) {
                return { err };
            }
            if (len === 0) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            else {
                const { err: err2, value } = await this.lindex(key, index);
                let sql = `DELETE FROM '${this.fullName}' WHERE name='${key}' AND field='${index}'`;
                // console.log('lremove', { sql });
                await this.db.exec(sql);
                for (let i = index + 1; i < len; i++) {
                    sql = `UPDATE '${this.fullName}' SET field=field-1 WHERE name='${key}' AND field = ${i}`;
                    // console.log({ sql });
                    await this.db.exec(sql);
                }
                return { err: error_code_1.ErrorCode.RESULT_OK, value };
            }
        }
        catch (e) {
            this.logger.error(`lremove ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
}
class SqliteStorageTransaction {
    constructor(db) {
        //        this.m_transcationDB = new TransactionDatabase(db.driver);
    }
    beginTransaction() {
        return new Promise((resolve, reject) => {
            this.m_transcationDB.beginTransaction((err, transcation) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.m_transcation = transcation;
                    resolve(error_code_1.ErrorCode.RESULT_OK);
                }
            });
        });
    }
    commit() {
        return new Promise((resolve, reject) => {
            this.m_transcation.commit((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(error_code_1.ErrorCode.RESULT_OK);
                }
            });
        });
    }
    rollback() {
        return new Promise((resolve, reject) => {
            this.m_transcation.rollback((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(error_code_1.ErrorCode.RESULT_OK);
                }
            });
        });
    }
}
class SqliteReadableDatabase {
    constructor(name, db, logger) {
        this.name = name;
        this.logger = logger;
        this.m_db = db;
    }
    async getReadableKeyValue(name) {
        const fullName = storage_1.Storage.getKeyValueFullName(this.name, name);
        let tbl = new SqliteStorageKeyValue(this.m_db, fullName, this.logger);
        return { err: error_code_1.ErrorCode.RESULT_OK, kv: tbl };
    }
}
class SqliteReadWritableDatabase extends SqliteReadableDatabase {
    async createKeyValue(name) {
        let err = storage_1.Storage.checkTableName(name);
        if (err) {
            return { err };
        }
        const fullName = storage_1.Storage.getKeyValueFullName(this.name, name);
        // 先判断表是否存在
        let count;
        try {
            let ret = await this.m_db.get(`SELECT COUNT(*) FROM sqlite_master where type='table' and name='${fullName}'`);
            count = ret['COUNT(*)'];
        }
        catch (e) {
            this.logger.error(`select table name failed `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        if (count > 0) {
            err = error_code_1.ErrorCode.RESULT_ALREADY_EXIST;
        }
        else {
            err = error_code_1.ErrorCode.RESULT_OK;
            await this.m_db.exec(`CREATE TABLE IF NOT EXISTS  '${fullName}'\
            (name TEXT, field TEXT, value TEXT, unique(name, field))`);
        }
        let tbl = new SqliteStorageKeyValue(this.m_db, fullName, this.logger);
        return { err: error_code_1.ErrorCode.RESULT_OK, kv: tbl };
    }
    async getReadWritableKeyValue(name) {
        let tbl = new SqliteStorageKeyValue(this.m_db, storage_1.Storage.getKeyValueFullName(this.name, name), this.logger);
        return { err: error_code_1.ErrorCode.RESULT_OK, kv: tbl };
    }
}
class SqliteStorage extends storage_1.Storage {
    constructor() {
        super(...arguments);
        this.m_isInit = false;
    }
    _createLogger() {
        return new storage_1.JStorageLogger();
    }
    get isInit() {
        return this.m_isInit;
    }
    async init(readonly) {
        if (this.m_db) {
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        assert(!this.m_db);
        fs.ensureDirSync(path.dirname(this.m_filePath));
        let options = {};
        if (!readonly) {
            options.mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
        }
        else {
            options.mode = sqlite3.OPEN_READONLY;
        }
        let err = error_code_1.ErrorCode.RESULT_OK;
        try {
            this.m_db = await sqlite.open(this.m_filePath, options);
        }
        catch (e) {
            this.m_logger.error(`open sqlite database file ${this.m_filePath} failed `, e);
            err = error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        if (!err) {
            this.m_isInit = true;
        }
        try {
            this.m_db.run('PRAGMA journal_mode = MEMORY');
            this.m_db.run('PRAGMA synchronous = OFF');
            this.m_db.run('PRAGMA locking_mode = EXCLUSIVE');
        }
        catch (e) {
            this.m_logger.error(`pragma some options on sqlite database file ${this.m_filePath} failed `, e);
            err = error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        if (!err) {
            this.m_isInit = true;
        }
        setImmediate(() => {
            this.m_eventEmitter.emit('init', err);
        });
        return err;
    }
    async uninit() {
        if (this.m_db) {
            await this.m_db.close();
            delete this.m_db;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async messageDigest() {
        let buf = await fs.readFile(this.m_filePath);
        const sqliteHeaderSize = 100;
        if (buf.length < sqliteHeaderSize) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_FORMAT };
        }
        const content = Buffer.from(buf.buffer, sqliteHeaderSize, buf.length - sqliteHeaderSize);
        let hash = digest.hash256(content).toString('hex');
        return { err: error_code_1.ErrorCode.RESULT_OK, value: hash };
    }
    async getReadableDataBase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new SqliteReadableDatabase(name, this.m_db, this.m_logger) };
    }
    async createDatabase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new SqliteReadWritableDatabase(name, this.m_db, this.m_logger) };
    }
    async getReadWritableDatabase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new SqliteReadWritableDatabase(name, this.m_db, this.m_logger) };
    }
    async beginTransaction() {
        assert(this.m_db);
        let transcation = new SqliteStorageTransaction(this.m_db);
        await transcation.beginTransaction();
        return { err: error_code_1.ErrorCode.RESULT_OK, value: transcation };
    }
    async toJsonStorage(storage) {
        let tableNames = new Map();
        try {
            const results = await this.m_db.all(`select name fromsqlite_master where type='table' order by name;`);
            for (const { name } of results) {
                const { dbName, kvName } = SqliteStorage.splitFullName(name);
                if (!tableNames.has(dbName)) {
                    tableNames.set(dbName, []);
                }
                tableNames.get(dbName).push(kvName);
            }
        }
        catch (e) {
            this.m_logger.error(`get all tables failed `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let root = Object.create(null);
        for (let [dbName, kvNames] of tableNames.entries()) {
            let dbRoot = Object.create(null);
            root[dbName] = dbRoot;
            for (let kvName of kvNames) {
                let kvRoot = Object.create(null);
                dbRoot[kvName] = kvRoot;
                const tableName = SqliteStorage.getKeyValueFullName(dbName, kvName);
                try {
                    const elems = await this.m_db.all(`select * from ${tableName}`);
                    for (const elem of elems) {
                        if (util_1.isUndefined(elem.field)) {
                            kvRoot[elem.name] = serializable_1.fromStringifiable(JSON.parse(elem.value));
                        }
                        else {
                            const index = parseInt(elem.field);
                            if (isNaN(index)) {
                                if (util_1.isUndefined(kvRoot[elem.name])) {
                                    kvRoot[elem.name] = Object.create(null);
                                }
                                kvRoot[elem.name][elem.filed] = serializable_1.fromStringifiable(JSON.parse(elem.value));
                            }
                            else {
                                if (!util_1.isArray(kvRoot[elem.name])) {
                                    kvRoot[elem.name] = [];
                                }
                                let arr = kvRoot[elem.name];
                                if (arr.length > index) {
                                    arr[index] = serializable_1.fromStringifiable(JSON.parse(elem.value));
                                }
                                else {
                                    const offset = index - arr.length - 1;
                                    for (let ix = 0; ix < offset; ++ix) {
                                        arr.push(undefined);
                                    }
                                    arr.push(serializable_1.fromStringifiable(JSON.parse(elem.value)));
                                }
                            }
                        }
                    }
                }
                catch (e) {
                    this.m_logger.error(`database: ${dbName} kv: ${kvName} transfer error `, e);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
            }
        }
        await storage.flush(root);
        return { err: error_code_1.ErrorCode.RESULT_OK };
    }
}
exports.SqliteStorage = SqliteStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3N0b3JhZ2Vfc3FsaXRlL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBRTdCLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsbUNBQW1DO0FBVW5DLDhDQUEwQztBQUMxQyxrREFBcUU7QUFDckUsd0NBQTBJO0FBRzFJLCtCQUErRDtBQUMvRCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDeEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBTS9DO0lBRUksWUFBcUIsRUFBbUIsRUFBVyxRQUFnQixFQUFFLE1BQXNCO1FBQXRFLE9BQUUsR0FBRixFQUFFLENBQWlCO1FBQVcsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUMvRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUN4RixDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUNwQyxJQUFJO1lBQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1osTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBZSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sR0FBRyxHQUFHLGlCQUFpQixJQUFJLENBQUMsUUFBUSxtQ0FBbUMsR0FBRywwQkFBMEIsSUFBSSxJQUFJLENBQUM7WUFDbkgsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QixPQUFPLEVBQUUsR0FBRyxF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