"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_chain_1 = require("../value_chain");
const context_1 = require("./context");
class DbftBlockExecutor extends value_chain_1.ValueBlockExecutor {
    async executePostBlockEvent() {
        if (this.m_block.number > 0) {
            let dbftProxy = new context_1.DbftContext(this.m_storage, this.m_globalOptions, this.m_logger);
            if (context_1.DbftContext.isElectionBlockNumber(this.m_globalOptions, this.m_block.number)) {
                await dbftProxy.updateMiners(this.m_block.number);
            }
        }
        return await super.executePostBlockEvent();
    }
}
exports.DbftBlockExecutor = DbftBlockExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kYmZ0X2NoYWluL2V4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0RBQTZFO0FBQzdFLHVDQUFzQztBQUV0Qyx1QkFBK0IsU0FBUSxnQ0FBa0I7SUFFOUMsS0FBSyxDQUFDLHFCQUFxQjtRQUM5QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN6QixJQUFJLFNBQVMsR0FBZ0IsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEcsSUFBSSxxQkFBVyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUUsTUFBTSxTQUFTLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDckQ7U0FDSjtRQUNELE9BQU8sTUFBTSxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0NBQ0o7QUFYRCw4Q0FXQyJ9