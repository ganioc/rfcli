"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const chain_1 = require("../chain");
class ViewExecutor {
    constructor(options) {
        this.m_handler = options.handler;
        this.m_method = options.method;
        this.m_param = options.param;
        this.m_externContext = options.externContext;
        this.m_header = options.header;
        this.m_storage = options.storage;
        this.m_logger = options.logger;
    }
    get externContext() {
        return this.m_externContext;
    }
    async prepareContext(blockHeader, storage, externContext) {
        let database = (await storage.getReadableDataBase(chain_1.Chain.dbUser)).value;
        let context = Object.create(externContext);
        // context.getNow = (): number => {
        //     return blockHeader.timestamp;
        // };
        Object.defineProperty(context, 'now', {
            writable: false,
            value: blockHeader.timestamp
        });
        // context.getHeight = (): number => {
        //     return blockHeader.number;
        // };
        Object.defineProperty(context, 'height', {
            writable: false,
            value: blockHeader.number
        });
        // context.getStorage = (): IReadWritableKeyValue => {
        //     return kv;
        // }
        Object.defineProperty(context, 'storage', {
            writable: false,
            value: database
        });
        Object.defineProperty(context, 'logger', {
            writable: false,
            value: this.m_logger
        });
        return context;
    }
    async execute() {
        let fcall = this.m_handler.getViewMethod(this.m_method);
        if (!fcall) {
            // 找不到view method时, 错误日志里列出全部可选的method
            let methods = this.m_handler.getViewMethodNames();
            this.m_logger.error(`view execute getViewMethod fail, method=${this.m_method}; suport methods [${methods.join(',')} ]`);
            return { err: error_code_1.ErrorCode.RESULT_NOT_SUPPORT, methods };
        }
        let context = await this.prepareContext(this.m_header, this.m_storage, this.m_externContext);
        try {
            this.m_logger.info(`will execute view method ${this.m_method}, params ${JSON.stringify(this.m_param)}`);
            let v = await fcall(context, this.m_param);
            return { err: error_code_1.ErrorCode.RESULT_OK, value: v };
        }
        catch (error) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
    }
}
exports.ViewExecutor = ViewExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2V4ZWN1dG9yL3ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBd0M7QUFFeEMsb0NBQThEO0FBYTlEO0lBU0ksWUFBWSxPQUE0QjtRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQVcsYUFBYTtRQUNwQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDaEMsQ0FBQztJQUVTLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBd0IsRUFBRSxPQUF5QixFQUFFLGFBQWtCO1FBQ2xHLElBQUksUUFBUSxHQUFHLENBQUMsTUFBTSxPQUFPLENBQUMsbUJBQW1CLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBTSxDQUFDO1FBQ3hFLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0MsbUNBQW1DO1FBQ25DLG9DQUFvQztRQUNwQyxLQUFLO1FBRUwsTUFBTSxDQUFDLGNBQWMsQ0FDakIsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUNaLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLFdBQVcsQ0FBQyxTQUFTO1NBQy9CLENBQ0osQ0FBQztRQUVGLHNDQUFzQztRQUN0QyxpQ0FBaUM7UUFDakMsS0FBSztRQUVMLE1BQU0sQ0FBQyxjQUFjLENBQ2pCLE9BQU8sRUFBRSxRQUFRLEVBQUU7WUFDZixRQUFRLEVBQUUsS0FBSztZQUNmLEtBQUssRUFBRSxXQUFXLENBQUMsTUFBTTtTQUM1QixDQUNKLENBQUM7UUFFRixzREFBc0Q7UUFDdEQsaUJBQWlCO1FBQ2pCLElBQUk7UUFFSixNQUFNLENBQUMsY0FBYyxDQUNqQixPQUFPLEVBQUUsU0FBUyxFQUFFO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLFFBQVE7U0FDbEIsQ0FDSixDQUFDO1FBRUYsTUFBTSxDQUFDLGNBQWMsQ0FDakIsT0FBTyxFQUFFLFFBQVEsRUFBRTtZQUNmLFFBQVEsRUFBRSxLQUFLO1lBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3ZCLENBQ0osQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTztRQUNoQixJQUFJLEtBQUssR0FBNEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxJQUFJLENBQUMsUUFBUSxxQkFBcUIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEgsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sRUFBQyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFN0YsSUFBSTtZQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDRCQUE0QixJQUFJLENBQUMsUUFBUSxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RyxJQUFJLENBQUMsR0FBUSxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBQyxDQUFDO1NBQy9DO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7Q0FDSjtBQXRGRCxvQ0FzRkMifQ==