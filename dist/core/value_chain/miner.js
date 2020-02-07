"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const chain_1 = require("../chain");
const bignumber_js_1 = require("bignumber.js");
const chain_2 = require("./chain");
const assert = require('assert');
class ValueMiner extends chain_1.Miner {
    constructor(options) {
        super(options);
        this.m_feelimit = new bignumber_js_1.BigNumber(0);
    }
    set coinbase(address) {
        this.m_coinbase = address;
    }
    get coinbase() {
        return this.m_coinbase;
    }
    _chainInstance() {
        return new chain_2.ValueChain(this.m_constructOptions);
    }
    get chain() {
        return this.m_chain;
    }
    parseInstanceOptions(options) {
        let { err, value } = super.parseInstanceOptions(options);
        if (err) {
            return { err };
        }
        value.coinbase = options.origin.get('coinbase');
        if (!options.origin.has('feelimit')) {
            console.log(`not exist 'feelimit' option in command`);
            return { err: error_code_1.ErrorCode.RESULT_PARSE_ERROR };
        }
        value.feelimit = new bignumber_js_1.BigNumber(options.origin.get('feelimit'));
        return { err: error_code_1.ErrorCode.RESULT_OK, value };
    }
    async initialize(options) {
        if (options.coinbase) {
            this.m_coinbase = options.coinbase;
        }
        this.m_feelimit = options.feelimit;
        return await super.initialize(options);
    }
    async _decorateBlock(block) {
        block.header.coinbase = this.m_coinbase;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _collectTransactions(block) {
        let txs = this.chain.pending.popTransactionWithFee(this.m_feelimit);
        for (const tx of txs) {
            block.content.addTransaction(tx);
        }
    }
}
exports.ValueMiner = ValueMiner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS92YWx1ZV9jaGFpbi9taW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUN4QyxvQ0FBeUg7QUFFekgsK0NBQXVDO0FBQ3ZDLG1DQUFtQztBQUluQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFJakMsZ0JBQXdCLFNBQVEsYUFBSztJQUVqQyxZQUFZLE9BQTZCO1FBQ3JDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUZULGVBQVUsR0FBYyxJQUFJLHdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHbkQsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLE9BQXlCO1FBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUlTLGNBQWM7UUFDcEIsT0FBTyxJQUFJLGtCQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE9BQXFCLENBQUM7SUFDdEMsQ0FBQztJQUVNLG9CQUFvQixDQUFDLE9BRzNCO1FBQ0csSUFBSSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkQsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEVBQUMsR0FBRyxFQUFDLENBQUM7U0FDaEI7UUFDRCxLQUFLLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7WUFDdEQsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGtCQUFrQixFQUFDLENBQUM7U0FDOUM7UUFDRCxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksd0JBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBa0M7UUFDdEQsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNuQyxPQUFPLE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRVMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFZO1FBQ3RDLEtBQUssQ0FBQyxNQUEyQixDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVyxDQUFDO1FBQy9ELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVTLG9CQUFvQixDQUFDLEtBQVk7UUFDdkMsSUFBSSxHQUFHLEdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFvQyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsRyxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRTtZQUNsQixLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwQztJQUNMLENBQUM7Q0FDSjtBQTVERCxnQ0E0REMifQ==