"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const executor_routine_1 = require("./executor_routine");
class InprocessRoutineManager {
    constructor(chain) {
        this.m_chain = chain;
    }
    create(options) {
        const routine = new InprogressRoutine({
            name: options.name,
            chain: this.m_chain,
            block: options.block,
            storage: options.storage
        });
        return { err: error_code_1.ErrorCode.RESULT_OK, routine };
    }
}
exports.InprocessRoutineManager = InprocessRoutineManager;
class InprogressRoutine extends executor_routine_1.BlockExecutorRoutine {
    constructor(options) {
        super({
            name: options.name,
            logger: options.chain.logger,
            block: options.block,
            storage: options.storage,
        });
        this.m_state = executor_routine_1.BlockExecutorRoutineState.init;
        this.m_cancelSet = false;
        this.m_canceled = false;
        this.m_chain = options.chain;
    }
    async execute() {
        if (this.m_state !== executor_routine_1.BlockExecutorRoutineState.init) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE };
        }
        this.m_state = executor_routine_1.BlockExecutorRoutineState.running;
        let ner = await this._newBlockExecutor(this.block, this.storage);
        if (ner.err) {
            this.m_state = executor_routine_1.BlockExecutorRoutineState.finished;
            return { err: ner.err };
        }
        const err = await ner.executor.execute();
        if (this.m_cancelSet && !this.m_canceled) {
            this.m_canceled = true;
        }
        await ner.executor.finalize();
        this.m_state = executor_routine_1.BlockExecutorRoutineState.finished;
        if (this.m_canceled) {
            return { err: error_code_1.ErrorCode.RESULT_CANCELED };
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_OK, result: { err } };
        }
    }
    async verify() {
        if (this.m_state !== executor_routine_1.BlockExecutorRoutineState.init) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_STATE };
        }
        this.m_state = executor_routine_1.BlockExecutorRoutineState.running;
        let ner = await this._newBlockExecutor(this.block, this.storage);
        if (ner.err) {
            this.m_state = executor_routine_1.BlockExecutorRoutineState.finished;
            return { err: ner.err };
        }
        const result = await ner.executor.verify();
        if (this.m_cancelSet && !this.m_canceled) {
            this.m_canceled = true;
        }
        await ner.executor.finalize();
        this.m_state = executor_routine_1.BlockExecutorRoutineState.finished;
        if (this.m_canceled) {
            return { err: error_code_1.ErrorCode.RESULT_CANCELED };
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_OK, result };
        }
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
    }
    async _newBlockExecutor(block, storage) {
        let nber = await this.m_chain.newBlockExecutor({ block, storage });
        if (nber.err) {
            this.m_canceled = true;
            return nber;
        }
        let executor = nber.executor;
        const originExecuteBlockEvent = executor.executeBlockEvent;
        executor.executeBlockEvent = async (listener) => {
            if (this.m_cancelSet) {
                return { err: error_code_1.ErrorCode.RESULT_CANCELED };
            }
            return originExecuteBlockEvent.bind(executor)(listener);
        };
        const originExecuteTransaction = executor.executeTransaction;
        executor.executeTransaction = async (tx, flag) => {
            if (this.m_cancelSet) {
                this.m_canceled = true;
                return { err: error_code_1.ErrorCode.RESULT_CANCELED };
            }
            return originExecuteTransaction.bind(executor)(tx, flag);
        };
        return { err: error_code_1.ErrorCode.RESULT_OK, executor };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wcm9jZXNzX3JvdXRpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9jaGFpbi9pbnByb2Nlc3Nfcm91dGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwQztBQUcxQyx5REFBaUg7QUFJakg7SUFDSSxZQUFZLEtBQVk7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDekIsQ0FBQztJQUdELE1BQU0sQ0FBQyxPQUF3RDtRQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFpQixDQUFDO1lBQ2xDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbkIsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BCLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztTQUMzQixDQUFDLENBQUM7UUFDSCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSjtBQWZELDBEQWVDO0FBRUQsdUJBQXdCLFNBQVEsdUNBQW9CO0lBQ2hELFlBQVksT0FLWDtRQUNHLEtBQUssQ0FBQztZQUNGLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtZQUNsQixNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNO1lBQzVCLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztZQUNwQixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87U0FDM0IsQ0FBQyxDQUFDO1FBS0MsWUFBTyxHQUE4Qiw0Q0FBeUIsQ0FBQyxJQUFJLENBQUM7UUFDcEUsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFDN0IsZUFBVSxHQUFZLEtBQUssQ0FBQztRQU5oQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQU9ELEtBQUssQ0FBQyxPQUFPO1FBQ1Qs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