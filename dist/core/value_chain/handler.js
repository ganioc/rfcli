"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
const chain_1 = require("../chain");
class ValueHandler extends chain_1.BaseHandler {
    constructor() {
        super();
        this.m_minerWage = (height) => {
            return Promise.resolve(new bignumber_js_1.BigNumber(1));
        };
    }
    onMinerWage(l) {
        if (l) {
            this.m_minerWage = l;
        }
    }
    getMinerWageListener() {
        return this.m_minerWage;
    }
}
exports.ValueHandler = ValueHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZhbHVlX2NoYWluL2hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQ0FBdUM7QUFDdkMsb0NBQXFDO0FBS3JDLGtCQUEwQixTQUFRLG1CQUFXO0lBRXpDO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsTUFBYyxFQUFzQixFQUFFO1lBQ3RELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLHdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUM7SUFDTixDQUFDO0lBRU0sV0FBVyxDQUFDLENBQW9CO1FBQ25DLElBQUksQ0FBQyxFQUFFO1lBQ0gsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRU0sb0JBQW9CO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0NBQ0o7QUFsQkQsb0NBa0JDIn0=