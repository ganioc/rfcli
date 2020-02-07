"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const dpos_chain_1 = require("../dpos_chain");
const chain_state_1 = require("./chain_state");
const block_1 = require("./block");
const value_chain_1 = require("../value_chain");
class DposBftChainTipStateCreator extends dpos_chain_1.DposChainTipStateCreator {
    createChainTipState(options) {
        return new chain_state_1.DposBftChainTipState(options);
    }
}
exports.DposBftChainTipStateCreator = DposBftChainTipStateCreator;
class DposBftChain extends dpos_chain_1.DposChain {
    createChainTipStateCreator() {
        return new DposBftChainTipStateCreator();
    }
    _getBlockHeaderType() {
        return block_1.DposBftBlockHeader;
    }
    _onCheckTypeOptions(typeOptions) {
        return typeOptions.consensus === 'dposbft';
    }
    async onCreateGenesisBlock(block, storage, genesisOptions) {
        let err = await super.onCreateGenesisBlock(block, storage, genesisOptions);
        if (err) {
            return err;
        }
        let gkvr = await storage.getKeyValue(value_chain_1.Chain.dbSystem, value_chain_1.Chain.kvConfig);
        if (gkvr.err) {
            return gkvr.err;
        }
        let rpr = await gkvr.kv.set('consensus', 'dposbft');
        if (rpr.err) {
            return rpr.err;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.DposBftChain = DposBftChain;
class DposBftMinerChain extends DposBftChain {
    _defaultNetworkOptions() {
        return {
            netType: 'dposbft'
        };
    }
}
exports.DposBftMinerChain = DposBftMinerChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9kcG9zX2JmdF9jaGFpbi9jaGFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwQztBQUMxQyw4Q0FBd0o7QUFDeEosK0NBQW1EO0FBQ25ELG1DQUEyQztBQUUzQyxnREFBcUQ7QUFNckQsaUNBQXlDLFNBQVEscUNBQXdCO0lBQzlELG1CQUFtQixDQUFDLE9BQWlDO1FBQ3hELE9BQU8sSUFBSSxrQ0FBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0o7QUFKRCxrRUFJQztBQUVELGtCQUEwQixTQUFRLHNCQUFTO0lBQzdCLDBCQUEwQjtRQUNoQyxPQUFRLElBQUksMkJBQTJCLEVBQUUsQ0FBQztJQUM5QyxDQUFDO0lBRVMsbUJBQW1CO1FBQ3pCLE9BQU8sMEJBQWtCLENBQUM7SUFDOUIsQ0FBQztJQUVTLG1CQUFtQixDQUFDLFdBQTZCO1FBQ3ZELE9BQU8sV0FBVyxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUM7SUFDL0MsQ0FBQztJQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFZLEVBQUUsT0FBZ0IsRUFBRSxjQUFtQjtRQUMxRSxJQUFJLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQzNFLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUVELElBQUksSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLFdBQVcsQ0FBQyxtQkFBSyxDQUFDLFFBQVEsRUFBRSxtQkFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNuQjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3JELElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNsQjtRQUVELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBOUJELG9DQThCQztBQUVELHVCQUErQixTQUFRLFlBQVk7SUFDckMsc0JBQXNCO1FBQzVCLE9BQU87WUFDSCxPQUFPLEVBQUUsU0FBUztTQUNyQixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBTkQsOENBTUMifQ==