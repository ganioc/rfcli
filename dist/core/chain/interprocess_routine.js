"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const childProcess = require("child_process");
const assert = require('assert');
const util_1 = require("util");
const error_code_1 = require("../error_code");
const reader_1 = require("../lib/reader");
const writer_1 = require("../lib/writer");
const storage_1 = require("../storage_sqlite/storage");
const executor_routine_1 = require("./executor_routine");
var RoutineType;
(function (RoutineType) {
    RoutineType[RoutineType["execute"] = 0] = "execute";
    RoutineType[RoutineType["verify"] = 1] = "verify";
})(RoutineType || (RoutineType = {}));
class BlockExecutorWorkerRoutine {
    constructor() {
    }
    static async encodeParams(params) {
        const writer = new writer_1.BufferWriter();
        let err;
        if (params.type === RoutineType.execute) {
            err = params.block.encode(writer);
        }
        else if (params.type === RoutineType.verify) {
            err = params.block.encode(writer);
        }
        else {
            assert(false, `invalid routine type`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (err) {
            return { err };
        }
        const blockPath = params.chain.tmpManager.getPath(`${params.name}.block`);
        try {
            fs.writeFileSync(blockPath, writer.render());
        }
        catch (e) {
            params.chain.logger.error(`write block to ${blockPath} failed `, e);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        const epr = await params.chain.executorParamCreator.interprocessEncode(params.externParams);
        if (epr.err) {
            return { err: epr.err };
        }
        try {
            const message = {
                type: params.type,
                name: params.name,
                dataDir: params.chain.dataDir,
                blockPath,
                storagePath: params.storage.filePath,
                externParams: epr.encoded
            };
            return { err: error_code_1.ErrorCode.RESULT_OK, message };
        }
        catch (e) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
    }
    static async decodeParams(creator, message) {
        let ccr = await creator.createChainInstance(message.dataDir, {
            readonly: true
        });
        if (ccr.err) {
            return { err: ccr.err };
        }
        const chain = ccr.chain;
        let block = chain.newBlock();
        let blockRaw;
        let err;
        try {
            blockRaw = fs.readFileSync(message.blockPath);
        }
        catch (e) {
            chain.logger.error(`read block from ${message.blockPath} failed `, e);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (message.type === RoutineType.execute) {
            err = block.decode(new reader_1.BufferReader(blockRaw));
        }
        else if (message.type === RoutineType.verify) {
            err = block.decode(new reader_1.BufferReader(blockRaw));
        }
        else {
            assert(false, `invalid routine type`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (err) {
            chain.logger.error(`decode block from params failed `, err);
            return { err };
        }
        const storage = new storage_1.SqliteStorage({
            filePath: message.storagePath,
            logger: chain.logger
        });
        err = await storage.init();
        if (err) {
            chain.logger.error(`init storage ${message.storagePath} failed `, err);
            return { err };
        }
        const dpr = await chain.executorParamCreator.interprocessDecode(message.externParams);
        if (dpr.err) {
            return { err: dpr.err };
        }
        return {
            err: error_code_1.ErrorCode.RESULT_OK,
            params: {
                type: message.type,
                chain,
                storage,
                block,
                name: message.name,
                externParams: dpr.params
            }
        };
    }
    static encodeResult(result) {
        const message = Object.create(null);
        message.name = result.name;
        message.err = result.err;
        message.type = result.type;
        if (result.type === RoutineType.execute) {
            if (result.block) {
                const writer = new writer_1.BufferWriter();
                let err = result.block.encode(writer);
                if (err) {
                    return { err };
                }
                const blockPath = result.chain.tmpManager.getPath(`${result.name}.block`);
                try {
                    fs.writeFileSync(blockPath, writer.render());
                }
                catch (e) {
                    result.chain.logger.error(`write block to ${blockPath} failed `, e);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
                message.blockPath = blockPath;
            }
        }
        else if (result.type === RoutineType.verify) {
            if (!util_1.isNullOrUndefined(result.valid)) {
                message.valid = result.valid;
            }
        }
        else {
            assert(false, `invalid result type`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (result.storage) {
            const writer = new writer_1.BufferWriter();
            if (result.storage.storageLogger) {
                let err = result.storage.storageLogger.encode(writer);
                if (err) {
                    return { err };
                }
                const redoPath = result.chain.tmpManager.getPath(`${result.name}.redo`);
                try {
                    fs.writeFileSync(redoPath, writer.render());
                }
                catch (e) {
                    result.chain.logger.error(`write redo log to ${redoPath} failed `, e);
                    return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
                }
                message.redoPath = redoPath;
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, message };
    }
    static decodeResult(params, message) {
        let result = Object.create(null);
        result.name = message.name;
        result.chain = params.chain;
        result.type = message.type;
        assert(result.name === params.name, `routine params' name is ${params.name} while result name is ${result.name}`);
        if (result.name !== params.name) {
            params.chain.logger.error(`routine result name mismatch`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        result.err = message.err;
        if (message.type === RoutineType.execute) {
            if (message.blockPath) {
                let blockRaw;
                try {
                    blockRaw = fs.readFileSync(message.blockPath);
                }
                catch (e) {
                    params.chain.logger.error(`read block from ${message.blockPath} failed `, e);
                    return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
                }
                let reader = new reader_1.BufferReader(blockRaw);
                let block = params.chain.newBlock();
                let err = block.decode(reader);
                if (err) {
                    params.chain.logger.error(`decode block from ${message.blockPath} failed `, err);
                    return { err };
                }
                result.block = block;
                params.chain.logger.debug(`about to remove tmp block `, message.blockPath);
                fs.unlinkSync(message.blockPath);
            }
        }
        else if (message.type === RoutineType.verify) {
            if (!util_1.isNullOrUndefined(message.valid)) {
                result.valid = message.valid;
            }
        }
        else {
            assert(false, `invalid routine type`);
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
        }
        if (message.redoPath) {
            let redoRaw;
            try {
                redoRaw = fs.readFileSync(message.redoPath);
            }
            catch (e) {
                params.chain.logger.error(`read redo log from ${message.redoPath} failed `, e);
                return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM };
            }
            let reader = new reader_1.BufferReader(redoRaw);
            params.storage.createLogger();
            let err = params.storage.storageLogger.decode(reader);
            if (err) {
                params.chain.logger.error(`decode redo log from ${message.redoPath} failed `, err);
                return { err };
            }
            params.chain.logger.debug(`about to remove tmp redo log `, message.redoPath);
            fs.unlinkSync(message.redoPath);
            result.storage = params.storage;
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, result };
    }
    async run(params) {
        let result = Object.create(null);
        result.name = params.name;
        result.chain = params.chain;
        result.type = params.type;
        do {
            params.storage.createLogger();
            const nber = await params.chain.newBlockExecutor(params);
            if (nber.err) {
                result.err = nber.err;
                break;
            }
            if (params.type === RoutineType.execute) {
                let err = await nber.executor.execute();
                result.err = err;
                if (!result.err) {
                    result.block = params.block;
                    result.storage = params.storage;
                }
            }
            else if (params.type === RoutineType.verify) {
                let vr = await nber.executor.verify();
                result.err = vr.err;
                if (!result.err) {
                    result.valid = vr.valid;
                    result.block = params.block;
                    result.storage = params.storage;
                }
            }
            else {
                assert(false, `invalid routine type`);
                result.err = error_code_1.ErrorCode.RESULT_INVALID_PARAM;
            }
        } while (false);
        await params.storage.uninit();
        return result;
    }
}
exports.BlockExecutorWorkerRoutine = BlockExecutorWorkerRoutine;
class InterprocessRoutineManager {
    constructor(chain) {
        this.m_chain = chain;
    }
    create(options) {
        const routine = new InterprocessRoutine({
            name: options.name,
            chain: this.m_chain,
            block: options.block,
            storage: options.storage,
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, routine };
    }
}
exports.InterprocessRoutineManager = InterprocessRoutineManager;
class InterprocessRoutine extends executor_routine_1.BlockExecutorRoutine {
    constructor(options) {
        super({
            name: options.name,
            logger: options.chain.logger,
            block: options.block,
            storage: options.storage,
        });
        this.m_state = executor_routine_1.BlockExecutorRoutineState.init;
        this.m_cancelSet = false;
        this.m_chain = options.chain;
    }
    async _executeOrVerify(type) {
        if (this.m_state !== executor_routine_1.BlockExecutorRoutineState.init) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE };
        }
        this.m_state = executor_routine_1.BlockExecutorRoutineState.running;
        this.m_worker = new WorkerProxy(this.m_logger);
        const epr = await this.m_chain.prepareExternParams(this.m_block, this.m_storage);
        if (epr.err) {
            return { err: epr.err };
        }
        const result = await this.m_worker.run({
            type,
            name: this.m_name,
            chain: this.m_chain,
            block: this.m_block,
            storage: this.m_storage,
            externParams: epr.params
        });
        if (this.m_cancelSet) {
            return { err: error_code_1.ErrorCode.RESULT_CANCELED };
        }
        if (result.block) {
            this.m_block = result.block;
        }
        if (result.storage) {
            this.m_storage = result.storage;
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, result: { err: result.err, valid: result.valid } };
    }
    async execute() {
        return this._executeOrVerify(RoutineType.execute);
    }
    async verify() {
        return this._executeOrVerify(RoutineType.verify);
    }
    cancel() {
        if (this.m_state === executor_routine_1.BlockExecutorRoutineState.finished) {
            return;
        }
        else if (this.m_state === executor_routine_1.BlockExecutorRoutineState.init) {
            this.m_state = executor_routine_1.BlockExecutorRoutineState.finished;
            return;
        }
        this.m_cancelSet = true;
        this.m_worker.cancel();
    }
}
class WorkerProxy {
    constructor(logger) {
        this.m_logger = logger;
    }
    async run(params) {
        await params.storage.uninit();
        const epr = await BlockExecutorWorkerRoutine.encodeParams(params);
        if (epr.err) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_PARAM, type: params.type, chain: params.chain, name: params.name };
        }
        const workerPath = path.join(__dirname, '../../routine/executor_routine.js');
        if (this.m_logger.level === 'debug') {
            let command = JSON.stringify(epr.message).replace(/\\\\/g, '/').replace(/\"/g, '\\"');
            this.m_logger.debug('run command in worker routine: ', command);
        }
        this.m_childProcess = childProcess.fork(workerPath);
        if (!this.m_childProcess.send(epr.message)) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION, type: params.type, chain: params.chain, name: params.name };
        }
        const result = await new Promise((resolve) => {
            const errListener = () => {
                this.m_logger.debug(`routine process error`);
                resolve({ err: error_code_1.ErrorCode.RESULT_EXCEPTION, type: params.type, chain: params.chain, name: params.name });
            };
            this.m_childProcess.on('error', errListener);
            this.m_childProcess.on('message', (message) => {
                this.m_childProcess.removeListener('error', errListener);
                if (this.m_logger.level === 'debug') {
                    const rawResult = JSON.stringify(message).replace(/\\\\/g, '/').replace(/\"/g, '\\"');
                    this.m_logger.debug('result of worker routine: ', rawResult);
                }
                const dr = BlockExecutorWorkerRoutine.decodeResult(params, message);
                if (dr.err) {
                    resolve({ err: dr.err, type: params.type, name: params.name, chain: params.chain });
                }
                else {
                    resolve(dr.result);
                }
            });
        });
        return result;
    }
    cancel() {
        if (!this.m_childProcess || this.m_childProcess.killed) {
            return;
        }
        this.m_logger.debug(`executor canceled, will kill routine process`);
        this.m_childProcess.kill();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcm9jZXNzX3JvdXRpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jaGFpbi9pbnRlcnByb2Nlc3Nfcm91dGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IsOENBQThDO0FBQzlDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQywrQkFBbUQ7QUFDbkQsOENBQTBDO0FBRzFDLDBDQUE2QztBQUM3QywwQ0FBNkM7QUFJN0MsdURBQXdEO0FBQ3hELHlEQUFpSDtBQUlqSCxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWixtREFBTyxDQUFBO0lBQ1AsaURBQU0sQ0FBQTtBQUNWLENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBcUJEO0lBQ0k7SUFDQSxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBd0M7UUFDOUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7UUFDbEMsSUFBSSxHQUFHLENBQUM7UUFDUixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUNyQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckM7YUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUMzQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNILE1BQU0sQ0FBQyxLQUFLLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUN0QyxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUMsQ0FBQztTQUNoRDtRQUVELElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxFQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ2hCO1FBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUM7UUFDMUUsSUFBSTtZQUNBLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ2hEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLFNBQVMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0IsRUFBQyxDQUFDO1NBQzVDO1FBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1RixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUVELElBQUk7WUFDQSxNQUFNLE9BQU8sR0FBRztnQkFDWixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ2pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtnQkFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTztnQkFDN0IsU0FBUztnQkFDVCxXQUFXLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRO2dCQUNwQyxZQUFZLEVBQUUsR0FBRyxDQUFDLE9BQU87YUFDNUIsQ0FBQztZQUNGLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7U0FDOUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxvQkFBb0IsRUFBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQXFCLEVBQUUsT0FBWTtRQUN6RCxJQUFJLEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3pELFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQU0sQ0FBQztRQUV6QixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0IsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFJLEdBQUcsQ0FBQztRQUNSLElBQUk7WUFDQSxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDakQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixPQUFPLENBQUMsU0FBUyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLG9CQUFvQixFQUFDLENBQUM7U0FDaEQ7UUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUN0QyxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHFCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUNsRDthQUFNLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQzVDLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUkscUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO2FBQU07WUFDSCxNQUFNLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdEMsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLG9CQUFvQixFQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLEdBQUcsRUFBRTtZQUNMLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVELE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQztTQUNoQjtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksdUJBQWEsQ0FBQztZQUM5QixRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVc7WUFDN0IsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1NBQ3ZCLENBQUMsQ0FBQztRQUNILEdBQUcsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQixJQUFJLEdBQUcsRUFBRTtZQUNMLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixPQUFPLENBQUMsV0FBVyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDdkUsT0FBTyxFQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RGLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsT0FBTztZQUNILEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVM7WUFDeEIsTUFBTSxFQUFFO2dCQUNKLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsS0FBSztnQkFDTCxPQUFPO2dCQUNQLEtBQUs7Z0JBQ0wsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJO2dCQUNsQixZQUFZLEVBQUUsR0FBRyxDQUFDLE1BQU87YUFDNUI7U0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBd0M7UUFDeEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDM0IsT0FBTyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUUzQixJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUNyQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Z0JBQ2QsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEdBQUcsRUFBRTtvQkFDTCxPQUFPLEVBQUMsR0FBRyxFQUFDLENBQUM7aUJBQ2hCO2dCQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJO29CQUNBLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUNoRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLFNBQVMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztpQkFDNUM7Z0JBQ0QsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7YUFDakM7U0FDSjthQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQzNDLElBQUksQ0FBQyx3QkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQzthQUNoQztTQUNKO2FBQU07WUFDSCxNQUFNLENBQUMsS0FBSyxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDckMsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLG9CQUFvQixFQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDaEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7WUFDbEMsSUFBSSxNQUFNLENBQUMsT0FBUSxDQUFDLGFBQWEsRUFBRTtnQkFDL0IsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLE9BQVEsQ0FBQyxhQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLEdBQUcsRUFBRTtvQkFDTCxPQUFPLEVBQUMsR0FBRyxFQUFDLENBQUM7aUJBQ2hCO2dCQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDO2dCQUN4RSxJQUFJO29CQUNBLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQztnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLFFBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN0RSxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztpQkFDNUM7Z0JBQ0QsT0FBTyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7YUFDL0I7U0FDSjtRQUVELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBd0MsRUFBRSxPQUFZO1FBQ3RFLElBQUksTUFBTSxHQUFxQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25FLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDNUIsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLE1BQU0sQ0FBQyxJQUFJLHlCQUF5QixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRTtZQUM3QixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUMxRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUMsQ0FBQztTQUNoRDtRQUNELE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUV6QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE9BQU8sRUFBRTtZQUN0QyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksUUFBUSxDQUFDO2dCQUNiLElBQUk7b0JBQ0EsUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUNqRDtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLE9BQU8sQ0FBQyxTQUFTLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDN0UsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLG9CQUFvQixFQUFDLENBQUM7aUJBQ2hEO2dCQUVELElBQUksTUFBTSxHQUFHLElBQUkscUJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDcEMsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixPQUFPLENBQUMsU0FBUyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2pGLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQztpQkFDaEI7Z0JBQ0QsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzNFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3BDO1NBQ0o7YUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUM1QyxJQUFJLENBQUMsd0JBQWlCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDaEM7U0FDSjthQUFNO1lBQ0gsTUFBTSxDQUFDLEtBQUssRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxvQkFBb0IsRUFBQyxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksT0FBTyxDQUFDO1lBQ1osSUFBSTtnQkFDQSxPQUFPLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0M7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLE9BQU8sQ0FBQyxRQUFRLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDL0UsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLG9CQUFvQixFQUFDLENBQUM7YUFDaEQ7WUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLHFCQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkQsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixPQUFPLENBQUMsUUFBUSxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ25GLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQzthQUNoQjtZQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUF3QztRQUM5QyxJQUFJLE1BQU0sR0FBcUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRSxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQixHQUFHO1lBQ0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QixNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekQsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDdEIsTUFBTTthQUNUO1lBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztvQkFDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO2lCQUNuQzthQUNKO2lCQUFNLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUMzQyxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7b0JBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO29CQUN4QixNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7b0JBQzVCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztpQkFDbkM7YUFDSjtpQkFBTztnQkFDSixNQUFNLENBQUMsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxvQkFBb0IsQ0FBQzthQUMvQztTQUNKLFFBQVEsS0FBSyxFQUFFO1FBQ2hCLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5QixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUFqUUQsZ0VBaVFDO0FBRUQ7SUFDSSxZQUFZLEtBQVk7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUdELE1BQU0sQ0FBQyxPQUF3RDtRQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDO1lBQ3BDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztTQUMzQixDQUFDLENBQUM7UUFDSCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSjtBQWZELGdFQWVDO0FBRUQseUJBQTBCLFNBQVEsdUNBQW9CO0lBQ2xELFlBQVksT0FLWDtRQUNHLEtBQUssQ0FBQztZQUNGLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQzVCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87U0FDM0IsQ0FBQyxDQUFDO1FBTUMsWUFBTyxHQUE4Qiw0Q0FBeUIsQ0FBQyxJQUFJLENBQUM7UUFDcEUsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFOakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQ2pDLENBQUM7SUFPUyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsSUFBaUI7UUFDOUMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLDRDQUF5QixDQUFDLElBQUksRUFBRTtZQUNqRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUMsQ0FBQztTQUNoRDtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsNENBQXlCLENBQUMsT0FBTyxDQUFDO1FBRWpELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDbkMsSUFBSTtZQUNKLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNqQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ25CLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUztZQUN2QixZQUFZLEVBQUUsR0FBRyxDQUFDLE1BQU87U0FDNUIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxlQUFlLEVBQUMsQ0FBQztTQUMzQztRQUNELElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztTQUMvQjtRQUNELElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7U0FDbkM7UUFDRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFDLEVBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNO1FBQ1IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxNQUFNO1FBQ0YsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLDRDQUF5QixDQUFDLFFBQVEsRUFBRTtZQUNyRCxPQUFRO1NBQ1g7YUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssNENBQXlCLENBQUMsSUFBSSxFQUFFO1lBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsNENBQXlCLENBQUMsUUFBUSxDQUFDO1lBQ2xELE9BQVE7U0FDWDtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDNUIsQ0FBQztDQUNKO0FBRUQ7SUFDSSxZQUFZLE1BQXNCO1FBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0lBQzNCLENBQUM7SUFJRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQXdDO1FBQzlDLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM5QixNQUFNLEdBQUcsR0FBRyxNQUFNLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUMsQ0FBQztTQUMzRztRQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7UUFDN0UsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssS0FBSyxPQUFPLEVBQUU7WUFDakMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ25FO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBUSxDQUFDLEVBQUU7WUFDekMsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFDLENBQUM7U0FDdkc7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksT0FBTyxDQUFtQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNFLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDN0MsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQzFHLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxjQUFlLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsY0FBZSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLGNBQWUsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxLQUFLLE9BQU8sRUFBRTtvQkFDakMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ3RGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUNoRTtnQkFDRCxNQUFNLEVBQUUsR0FBRywwQkFBMEIsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7b0JBQ1IsT0FBTyxDQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO2lCQUNyRjtxQkFBTTtvQkFDSCxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0QjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTTtRQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO1lBQ3BELE9BQVE7U0FDWDtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLGNBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0NBQ0oifQ==