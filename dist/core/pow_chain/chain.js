"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const value_chain_1 = require("../value_chain");
const block_1 = require("./block");
const consensus = require("./consensus");
class PowChain extends value_chain_1.ValueChain {
    _getBlockHeaderType() {
        return block_1.PowBlockHeader;
    }
    _onCheckGlobalOptions(globalOptions) {
        if (!super._onCheckGlobalOptions(globalOptions)) {
            return false;
        }
        return consensus.onCheckGlobalOptions(globalOptions);
    }
    _onCheckTypeOptions(typeOptions) {
        return typeOptions.consensus === 'pow';
    }
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let err = await super.onCreateGenesisBlock(block, storage, genesisOptions);
        if (err) {
            return err;
        }
        let gkvr = await storage.getKeyValue(value_chain_1.ValueChain.dbSystem, value_chain_1.ValueChain.kvConfig);
        if (gkvr.err) {
            return gkvr.err;
        }
        let rpr = await gkvr.kv.set('consensus', 'pow');
        if (rpr.err) {
            return rpr.err;
        }
        block.header.bits = this.globalOptions.basicBits;
        block.header.updateHash();
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.PowChain = PowChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9wb3dfY2hhaW4vY2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBd0M7QUFDeEMsZ0RBQTRFO0FBQzVFLG1DQUF1QztBQUN2Qyx5Q0FBeUM7QUFFekMsY0FBc0IsU0FBUSx3QkFBVTtJQUMxQixtQkFBbUI7UUFDekIsT0FBTyxzQkFBYyxDQUFDO0lBQzFCLENBQUM7SUFFUyxxQkFBcUIsQ0FBQyxhQUFrQjtRQUM5QyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzdDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBQ0QsT0FBTyxTQUFTLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVTLG1CQUFtQixDQUFDLFdBQTZCO1FBQ3ZELE9BQU8sV0FBVyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUM7SUFDM0MsQ0FBQztJQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFZLEVBQUUsT0FBZ0IsRUFBRSxjQUFvQjtRQUMzRSxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzNFLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELElBQUksSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyx3QkFBVSxDQUFDLFFBQVEsRUFBRSx3QkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9FLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNuQjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pELElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUNBLEtBQUssQ0FBQyxNQUF5QixDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztRQUNyRSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFCLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBakNELDRCQWlDQyJ9