"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const value_chain_1 = require("../value_chain");
const consensus = require("./consensus");
class DposBlockExecutor extends value_chain_1.ValueBlockExecutor {
    constructor(options) {
        super(options);
    }
    get _libStorage() {
        return this.m_externParams[0].value;
    }
    async executePostBlockEvent() {
        let ebr = await super.executePostBlockEvent();
        if (ebr.err) {
            return { err: ebr.err };
        }
        if (this.m_block.number > 0) {
            let dbr = await this.m_storage.getReadWritableDatabase(value_chain_1.Chain.dbSystem);
            if (dbr.err) {
                this.m_logger.error(`execute block failed for get system database from curr storage ,code=${dbr.err}`);
                return { err: dbr.err };
            }
            let denv = new consensus.Context({ currDatabase: dbr.value, globalOptions: this.m_globalOptions, logger: this.m_logger });
            // 修改miner的最后一次出块时间
            // 创世快不算时间，因为创世快产生后可能很长时间才开始出其他块的
            await denv.updateProducerTime(this.m_block.header.miner, this.m_block.header.timestamp);
            // 维护被禁用miner信息
            if (this.m_block.number % this.m_globalOptions.unbanBlocks === 0) {
                await denv.unbanProducer(this.m_block.header.timestamp);
            }
            await denv.checkIfNeedBan(this.m_block.header.timestamp);
            let bReSelect = false;
            if (this.m_block.number % this.m_globalOptions.reSelectionBlocks === 0) {
                // 先禁用那些超过最长时间不出块的miner
                await denv.banProducer(this.m_block.header.timestamp);
                // 更新选举结果
                let hr = await this._libStorage.getReadableDataBase(value_chain_1.Chain.dbSystem);
                if (hr.err) {
                    this.m_logger.error(`execute block failed for get system database from lib storage ,code=${dbr.err}`);
                    return { err: hr.err };
                }
                let ber = await denv.finishElection(hr.value, this.m_block.header.timestamp.toString());
                if (ber.err) {
                    return { err: ber.err };
                }
                bReSelect = true;
            }
            if (this.m_block.number === 1 || bReSelect) {
                // 维护miner时间信息
                await denv.maintain_producer(this.m_block.header.timestamp);
            }
        }
        return ebr;
    }
}
exports.DposBlockExecutor = DposBlockExecutor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2NoYWluL2V4ZWN1dG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsZ0RBQTRHO0FBQzVHLHlDQUF5QztBQUt6Qyx1QkFBK0IsU0FBUSxnQ0FBa0I7SUFDckQsWUFBWSxPQUFpQztRQUN6QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUVELElBQWMsV0FBVztRQUNyQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBeUIsQ0FBQztJQUM1RCxDQUFDO0lBRU0sS0FBSyxDQUFDLHFCQUFxQjtRQUM5QixJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzlDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDekIsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLG1CQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkUsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHdFQUF3RSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDdkcsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDM0I7WUFDRCxJQUFJLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEtBQU0sRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFDekgsbUJBQW1CO1lBQ25CLGlDQUFpQztZQUNqQyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQTBCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTdHLGVBQWU7WUFDZixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxLQUFLLENBQUMsRUFBRTtnQkFDOUQsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQzNEO1lBRUQsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXpELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxFQUFFO2dCQUNwRSx1QkFBdUI7Z0JBQ3ZCLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdEQsU0FBUztnQkFFVCxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsbUJBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxFQUFFLENBQUMsR0FBRyxFQUFFO29CQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLHVFQUF1RSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDdEcsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQzFCO2dCQUVELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsS0FBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQzNCO2dCQUNELFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDcEI7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLEVBQUU7Z0JBQ3hDLGNBQWM7Z0JBQ2QsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDL0Q7U0FDSjtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKO0FBM0RELDhDQTJEQyJ9