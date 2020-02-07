"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const bignumber_js_1 = require("bignumber.js");
class ViewContext {
    constructor(kvBalance) {
        this.kvBalance = kvBalance;
    }
    async getBalance(address) {
        let retInfo = await this.kvBalance.get(address);
        return retInfo.err === error_code_1.ErrorCode.RESULT_OK ? retInfo.value : new bignumber_js_1.BigNumber(0);
    }
}
exports.ViewContext = ViewContext;
class Context extends ViewContext {
    constructor(kvBalance) {
        super(kvBalance);
    }
    async transferTo(from, to, amount) {
        let fromTotal = await this.getBalance(from);
        if (fromTotal.lt(amount)) {
            return error_code_1.ErrorCode.RESULT_NOT_ENOUGH;
        }
        await this.kvBalance.set(from, fromTotal.minus(amount));
        await this.kvBalance.set(to, (await this.getBalance(to)).plus(amount));
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async issue(to, amount) {
        let sh = await this.kvBalance.set(to, (await this.getBalance(to)).plus(amount));
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.Context = Context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZhbHVlX2NoYWluL2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBd0M7QUFFeEMsK0NBQXVDO0FBRXZDO0lBQ0ksWUFBc0IsU0FBNEI7UUFBNUIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7SUFFbEQsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZTtRQUM1QixJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSx3QkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7Q0FDSjtBQVRELGtDQVNDO0FBRUQsYUFBcUIsU0FBUSxXQUFXO0lBQ3BDLFlBQVksU0FBZ0M7UUFDeEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLElBQVksRUFBRSxFQUFVLEVBQUUsTUFBaUI7UUFDeEQsSUFBSSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0QixPQUFPLHNCQUFTLENBQUMsaUJBQWlCLENBQUM7U0FDdEM7UUFDRCxNQUFPLElBQUksQ0FBQyxTQUFtQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ25GLE1BQU8sSUFBSSxDQUFDLFNBQW1DLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBVSxFQUFFLE1BQWlCO1FBQ3JDLElBQUksRUFBRSxHQUFHLE1BQU8sSUFBSSxDQUFDLFNBQW1DLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNHLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztDQUNKO0FBbkJELDBCQW1CQyJ9