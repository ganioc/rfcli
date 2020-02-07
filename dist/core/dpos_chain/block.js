"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
//  出块计算从1开始，假设重新选举周期为100：
//  第一周期为1-100 
// 第二周期为101-200
// 以此类推
class DposBlockHeader extends value_chain_1.BlockWithSign(value_chain_1.ValueBlockHeader) {
    async verify(chain) {
        // 先验证签名是否正确
        if (!this._verifySign()) {
            chain.logger.error(`verify block ${this.number} sign error!`);
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: false };
        }
        // 从某个设施验证pubkey是否在列表中,是否轮到这个节点出块
        return await this._verifyMiner(chain);
    }
    getTimeIndex(chain) {
        return Math.ceil((this.timestamp - chain.epochTime) / chain.globalOptions.blockInterval) + 1;
    }
    async _verifyMiner(chain) {
        if (!this.number) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let hr = await chain.getHeader(this.preBlockHash);
        if (hr.err) {
            return { err: hr.err };
        }
        // 时间不可回退
        let preHeader = hr.header;
        if (this.timestamp < preHeader.timestamp) {
            return { err: error_code_1.ErrorCode.RESULT_OK, valid: false };
        }
        let dmr = await this.getDueMiner(chain);
        if (dmr.err) {
            return { err: dmr.err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, valid: dmr.miner === this.miner };
    }
    async getDueMiner(chain) {
        if (!this.number) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let thisIndex = this.getTimeIndex(chain);
        let gcr = await chain.getMiners(this);
        if (gcr.err) {
            chain.logger.error(`getMiners failed, err ${gcr.err}`);
            return { err: gcr.err };
        }
        let electionHeader = gcr.header;
        let electionIndex = electionHeader.getTimeIndex(chain);
        let index = (thisIndex - electionIndex) % gcr.creators.length;
        if (index < 0) {
            chain.logger.error(`calcute index failed, thisIndex ${thisIndex}, electionIndex ${electionIndex}, creators length ${gcr.creators.length}`);
            return { err: error_code_1.ErrorCode.RESULT_OK };
        }
        let creators = gcr.creators;
        return { err: error_code_1.ErrorCode.RESULT_OK, miner: creators[index] };
    }
}
exports.DposBlockHeader = DposBlockHeader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2NoYWluL2Jsb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsOENBQTBDO0FBRTFDLGdEQUFzRTtBQUd0RSwwQkFBMEI7QUFDMUIsZUFBZTtBQUNmLGVBQWU7QUFDZixPQUFPO0FBRVAscUJBQTZCLFNBQVEsMkJBQWEsQ0FBQyw4QkFBZ0IsQ0FBQztJQUN6RCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQVk7UUFDNUIsWUFBWTtRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDckIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxNQUFNLGNBQWMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQ3JEO1FBQ0QsaUNBQWlDO1FBQ2pDLE9BQU8sTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxZQUFZLENBQUMsS0FBWTtRQUM1QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFJLEtBQW1CLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEgsQ0FBQztJQUVPLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBWTtRQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNkLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxnQkFBZ0IsRUFBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxFQUFFLEdBQUcsTUFBTSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNsRCxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUU7WUFDUixPQUFPLEVBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN4QjtRQUNELFNBQVM7UUFDVCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsTUFBMEIsQ0FBQztRQUM5QyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRTtZQUN0QyxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQztTQUNuRDtRQUVELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUVELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQVk7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztRQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBa0IsQ0FBQyxDQUFDO1FBRXRELElBQUksR0FBRyxHQUFHLE1BQU8sS0FBbUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU8sQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxjQUFjLENBQUMsWUFBWSxDQUFDLEtBQWtCLENBQUMsQ0FBQztRQUVwRSxJQUFJLEtBQUssR0FBRyxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUyxDQUFDLE1BQU0sQ0FBQztRQUMvRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDWCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsU0FBUyxtQkFBbUIsYUFBYSxxQkFBcUIsR0FBRyxDQUFDLFFBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzVJLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUMsQ0FBQztTQUNyQztRQUNELElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFTLENBQUM7UUFDN0IsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUM7SUFDOUQsQ0FBQztDQUNKO0FBN0RELDBDQTZEQyJ9