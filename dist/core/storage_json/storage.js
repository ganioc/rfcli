"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const fs = require("fs-extra");
const path = require("path");
const error_code_1 = require("../error_code");
const serializable_1 = require("../serializable");
const storage_1 = require("../storage");
const digest = require("../lib/digest");
const util_1 = require("util");
class JsonStorageKeyValue {
    constructor(dbRoot, name, logger) {
        this.name = name;
        this.logger = logger;
        this.m_root = dbRoot[name];
    }
    get root() {
        const r = this.m_root;
        return r;
    }
    async set(key, value) {
        try {
            assert(key);
            this.m_root[key] = serializable_1.deepCopy(value);
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
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key]) };
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
            if (!this.m_root[key]) {
                this.m_root[key] = Object.create(null);
            }
            this.m_root[key][field] = serializable_1.deepCopy(value);
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
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key][field]) };
        }
        catch (e) {
            this.logger.error(`hget ${key} ${field} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hdel(key, field) {
        try {
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            delete this.m_root[key][field];
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
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: Object.keys(this.m_root[key]).length };
        }
        catch (e) {
            this.logger.error(`hlen ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hexists(key, field) {
        try {
            assert(key);
            assert(field);
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: !util_1.isUndefined(this.m_root[key][field]) };
        }
        catch (e) {
            this.logger.error(`hexsits ${key} ${field}`, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hmset(key, fields, values) {
        try {
            assert(key);
            assert(fields.length === values.length);
            if (!this.m_root[key]) {
                this.m_root[key] = Object.create(null);
            }
            for (let ix = 0; ix < fields.length; ++ix) {
                this.m_root[key][fields[ix]] = serializable_1.deepCopy(values[ix]);
            }
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
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            let values = [];
            for (let f of fields) {
                values.push(serializable_1.deepCopy(this.m_root[key][f]));
            }
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
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: Object.keys(this.m_root[key]) };
        }
        catch (e) {
            this.logger.error(`hkeys ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hvalues(key) {
        try {
            assert(key);
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: Object.values(this.m_root[key]).map((x) => serializable_1.deepCopy(x)) };
        }
        catch (e) {
            this.logger.error(`hvalues ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async hgetall(key) {
        try {
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return {
                err: error_code_1.ErrorCode.RESULT_OK, value: Object.keys(this.m_root[key]).map((x) => {
                    return { key: x, value: serializable_1.deepCopy(this.m_root[key][x]) };
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
            delete this.m_root[key];
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`hclean ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lindex(key, index) {
        try {
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key][index]) };
        }
        catch (e) {
            this.logger.error(`lindex ${key} ${index}`, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lset(key, index, value) {
        try {
            assert(key);
            this.m_root[key][index] = serializable_1.deepCopy(value);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lset ${key} ${index} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async llen(key) {
        try {
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, value: this.m_root[key].length };
        }
        catch (e) {
            this.logger.error(`llen ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lrange(key, start, stop) {
        try {
            assert(key);
            if (util_1.isUndefined(this.m_root[key])) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
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
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key].slice(start, stop + 1)) };
        }
        catch (e) {
            this.logger.error(`lrange ${key} ${start} ${stop}`, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lpush(key, value) {
        try {
            assert(key);
            if (!this.m_root[key]) {
                this.m_root[key] = [];
            }
            this.m_root[key].unshift(serializable_1.deepCopy(value));
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
            if (!this.m_root[key]) {
                this.m_root[key] = [];
            }
            this.m_root[key].unshift(...value.map((e) => serializable_1.deepCopy(e)));
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lpushx ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lpop(key) {
        try {
            assert(key);
            if (this.m_root[key] && this.m_root[key].length > 0) {
                return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key].shift()) };
            }
            else {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
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
            if (!this.m_root[key]) {
                this.m_root[key] = [];
            }
            this.m_root[key].push(serializable_1.deepCopy(value));
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
            if (!this.m_root[key]) {
                this.m_root[key] = [];
            }
            this.m_root[key].push(...value.map((e) => serializable_1.deepCopy(e)));
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`lpushx ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async rpop(key) {
        try {
            assert(key);
            if (this.m_root[key] && this.m_root[key].length > 0) {
                return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key].pop()) };
            }
            else {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
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
            this.m_root[key].splice(index, 0, serializable_1.deepCopy(value));
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        catch (e) {
            this.logger.error(`linsert ${key} ${index} `, value, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async lremove(key, index) {
        try {
            assert(key);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: serializable_1.deepCopy(this.m_root[key].splice(index, 1)[0]) };
        }
        catch (e) {
            this.logger.error(`lremove ${key} `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
}
class JsonReadableDatabase {
    constructor(storageRoot, name, logger) {
        this.name = name;
        this.logger = logger;
        this.m_root = storageRoot[name];
    }
    get root() {
        const r = this.m_root;
        return r;
    }
    async getReadableKeyValue(name) {
        const err = storage_1.Storage.checkTableName(name);
        if (err) {
            return { err };
        }
        let tbl = new JsonStorageKeyValue(this.m_root, name, this.logger);
        return { err: error_code_1.ErrorCode.RESULT_OK, kv: tbl };
    }
}
class JsonReadWritableDatabase extends JsonReadableDatabase {
    constructor(...args) {
        super(args[0], args[1], args[2]);
    }
    async getReadWritableKeyValue(name) {
        let err = storage_1.Storage.checkTableName(name);
        if (err) {
            return { err };
        }
        let tbl = new JsonStorageKeyValue(this.m_root, name, this.logger);
        return { err: error_code_1.ErrorCode.RESULT_OK, kv: tbl };
    }
    async createKeyValue(name) {
        let err = storage_1.Storage.checkTableName(name);
        if (err) {
            return { err };
        }
        if (!util_1.isNullOrUndefined(this.m_root[name])) {
            err = error_code_1.ErrorCode.RESULT_ALREADY_EXIST;
        }
        else {
            this.m_root[name] = Object.create(null);
            err = error_code_1.ErrorCode.RESULT_OK;
        }
        let tbl = new JsonStorageKeyValue(this.m_root, name, this.logger);
        return { err, kv: tbl };
    }
}
class JsonStorageTransaction {
    constructor(storageRoot) {
        this.m_transactionRoot = serializable_1.deepCopy(storageRoot);
        this.m_storageRoot = storageRoot;
    }
    async beginTransaction() {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async commit() {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async rollback() {
        for (const k of Object.keys(this.m_storageRoot)) {
            delete this.m_storageRoot[k];
        }
        Object.assign(this.m_storageRoot, this.m_transactionRoot);
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
class JsonStorage extends storage_1.Storage {
    constructor() {
        super(...arguments);
        this.m_isInit = false;
    }
    get root() {
        const r = this.m_root;
        return r;
    }
    _createLogger() {
        return new storage_1.JStorageLogger();
    }
    get isInit() {
        return this.m_isInit;
    }
    async init(readonly) {
        if (this.m_root) {
            return error_code_1.ErrorCode.RESULT_SKIPPED;
        }
        assert(!this.m_root);
        fs.ensureDirSync(path.dirname(this.m_filePath));
        let options = {};
        let err = error_code_1.ErrorCode.RESULT_OK;
        if (fs.existsSync(this.m_filePath)) {
            try {
                const root = fs.readJSONSync(this.m_filePath);
                this.m_root = serializable_1.fromStringifiable(root);
            }
            catch (e) {
                err = error_code_1.ErrorCode.RESULT_EXCEPTION;
            }
        }
        else {
            this.m_root = Object.create(null);
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
        await this.flush();
        if (this.m_root) {
            delete this.m_root;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async messageDigest() {
        try {
            const raw = JSON.stringify(this.m_root, undefined, 4);
            let hash = digest.hash256(Buffer.from(raw, 'utf8')).toString('hex');
            return { err: error_code_1.ErrorCode.RESULT_OK, value: hash };
        }
        catch (e) {
            this.m_logger.error('json storage messagedigest exception ', e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
    async getReadableDataBase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new JsonReadableDatabase(this.m_root, name, this.m_logger) };
    }
    async createDatabase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        if (util_1.isUndefined(this.m_root[name])) {
            this.m_root[name] = Object.create(null);
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new JsonReadWritableDatabase(this.m_root, name, this.m_logger) };
    }
    async getReadWritableDatabase(name) {
        let err = storage_1.Storage.checkDataBaseName(name);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, value: new JsonReadWritableDatabase(this.m_root, name, this.m_logger) };
    }
    async beginTransaction() {
        let transcation = new JsonStorageTransaction(this.m_root);
        await transcation.beginTransaction();
        return { err: error_code_1.ErrorCode.RESULT_OK, value: transcation };
    }
    async flush(root) {
        if (root) {
            this.m_root = root;
        }
        const s = serializable_1.toStringifiable(this.m_root, true);
        await fs.writeJSON(this.m_filePath, s, { spaces: 4, flag: 'w' });
    }
}
exports.JsonStorage = JsonStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3N0b3JhZ2VfanNvbi9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWlDO0FBQ2pDLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFFN0IsOENBQTBDO0FBQzFDLGtEQUErRTtBQUMvRSx3Q0FBMEk7QUFFMUksd0NBQXdDO0FBQ3hDLCtCQUFzRDtBQU10RDtJQUVJLFlBQVksTUFBVyxFQUFXLElBQVksRUFBbUIsTUFBc0I7UUFBckQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFtQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUNuRixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN0QixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQ3BDLElBQUk7WUFDQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLHVCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsT0FBTyxFQUFFLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ3ZDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzlDO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBVztRQUN4QixJQUFJO1lBQ0EsTUFBTSxDQUFDLEdB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