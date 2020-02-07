"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggedStorage {
    constructor(storage, logger) {
        this.m_storage = storage;
        this.m_logger = logger;
        this._wrapStorage();
    }
    get logger() {
        return this.m_logger;
    }
    _wrapStorage() {
        let storage = this.m_storage;
        {
            let proto = storage.beginTransaction;
            storage.beginTransaction = async () => {
                let ltr = await this.m_logger.beginTransaction();
                await ltr.value.beginTransaction();
                let btr = await proto.bind(storage)();
                this._wrapTransaction(btr.value, ltr.value);
                return btr;
            };
        }
        {
            let proto = storage.getReadWritableDatabase;
            storage.getReadWritableDatabase = async (name) => {
                let ltr = await this.m_logger.getReadWritableDatabase(name);
                let dbr = await proto.bind(storage)(name);
                this._wrapDatabase(dbr.value, ltr.value);
                return dbr;
            };
        }
        {
            let proto = storage.createDatabase;
            storage.createDatabase = async (name) => {
                let ltr = await this.m_logger.createDatabase(name);
                let dbr = await proto.bind(storage)(name);
                this._wrapDatabase(dbr.value, ltr.value);
                return dbr;
            };
        }
    }
    _wrapDatabase(database, logger) {
        {
            let proto = database.getReadWritableKeyValue;
            database.getReadWritableKeyValue = async (name) => {
                let ltr = await logger.getReadWritableKeyValue(name);
                let btr = await proto.bind(database)(name);
                this._wrapKeyvalue(btr.kv, ltr.kv);
                return btr;
            };
        }
        {
            let proto = database.createKeyValue;
            database.createKeyValue = async (name) => {
                let ltr = await logger.createKeyValue(name);
                let btr = await proto.bind(database)(name);
                this._wrapKeyvalue(btr.kv, ltr.kv);
                return btr;
            };
        }
    }
    _wrapTransaction(transaction, logger) {
        {
            let proto = transaction.commit;
            transaction.commit = async () => {
                logger.commit();
                return await proto.bind(transaction)();
            };
        }
        {
            let proto = transaction.rollback;
            transaction.rollback = async () => {
                logger.rollback();
                return await proto.bind(transaction)();
            };
        }
    }
    _wrapKeyvalue(kv, logger) {
        {
            let proto = kv.set;
            kv.set = async (key, value) => {
                await logger.set(key, value);
                return await proto.bind(kv)(key, value);
            };
        }
        {
            let proto = kv.hset;
            kv.hset = async (key, field, value) => {
                await logger.hset(key, field, value);
                return await proto.bind(kv)(key, field, value);
            };
        }
        {
            let proto = kv.hmset;
            kv.hmset = async (key, fields, values) => {
                await logger.hmset(key, fields, values);
                return await proto.bind(kv)(key, fields, values);
            };
        }
        {
            let proto = kv.hdel;
            kv.hdel = async (key, field) => {
                await logger.hdel(key, field);
                return await proto.bind(kv)(key, field);
            };
        }
        {
            let proto = kv.hclean;
            kv.hclean = async (key) => {
                await logger.hclean(key);
                return await proto.bind(kv)(key);
            };
        }
        {
            let proto = kv.lset;
            kv.lset = async (key, index, value) => {
                await logger.lset(key, index, value);
                return await proto.bind(kv)(key, index, value);
            };
        }
        {
            let proto = kv.lpush;
            kv.lpush = async (key, value) => {
                await logger.lpush(key, value);
                return await proto.bind(kv)(key, value);
            };
        }
        {
            let proto = kv.lpushx;
            kv.lpushx = async (key, value) => {
                await logger.lpushx(key, value);
                return await proto.bind(kv)(key, value);
            };
        }
        {
            let proto = kv.lpop;
            kv.lpop = async (key) => {
                await logger.lpop(key);
                return await proto.bind(kv)(key);
            };
        }
        {
            let proto = kv.rpush;
            kv.rpush = async (key, value) => {
                await logger.rpush(key, value);
                return await proto.bind(kv)(key, value);
            };
        }
        {
            let proto = kv.rpushx;
            kv.rpushx = async (key, value) => {
                await logger.rpushx(key, value);
                return await proto.bind(kv)(key, value);
            };
        }
        {
            let proto = kv.rpop;
            kv.rpop = async (key) => {
                await logger.rpop(key);
                return await proto.bind(kv)(key);
            };
        }
        {
            let proto = kv.linsert;
            kv.linsert = async (key, index, value) => {
                await logger.linsert(key, index, value);
                return await proto.bind(kv)(key, index, value);
            };
        }
        {
            let proto = kv.lremove;
            kv.lremove = async (key, index) => {
                await logger.lremove(key, index);
                return await proto.bind(kv)(key, index);
            };
        }
    }
}
exports.LoggedStorage = LoggedStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvc3RvcmFnZS9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFpQkE7SUFFSSxZQUFZLE9BQWdCLEVBQUUsTUFBcUI7UUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFLRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVPLFlBQVk7UUFDaEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM3QjtZQUNJLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNyQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxJQUE2RCxFQUFFO2dCQUMzRixJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxHQUFHLENBQUMsS0FBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3BDLElBQUksR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBTSxDQUFDLENBQUM7Z0JBQzdDLE9BQU8sR0FBRyxDQUFDO1lBQ2YsQ0FBQyxDQUFDO1NBQ0w7UUFDRDtZQUNJLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztZQUM1QyxPQUFPLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxFQUFFLElBQVksRUFBNkQsRUFBRTtnQkFDaEgsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENB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