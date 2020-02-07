"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
function rejectifyValue(func, _this, _name) {
    let _func = async (...args) => {
        let ret = await func.bind(_this)(...args);
        if (ret.err) {
            return Promise.reject(new Error(core_1.stringifyErrorCode(ret.err)));
        }
        else {
            return Promise.resolve(ret[_name ? _name : 'value']);
        }
    };
    return _func;
}
exports.rejectifyValue = rejectifyValue;
function rejectifyErrorCode(func, _this) {
    let _func = async (...args) => {
        let err = await func.bind(_this)(...args);
        if (err) {
            return Promise.reject(new Error(`${err}`));
        }
        else {
            return Promise.resolve();
        }
    };
    return _func;
}
exports.rejectifyErrorCode = rejectifyErrorCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVqZWN0aWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudC9saWIvcmVqZWN0aWZ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXlEO0FBRXpELHdCQUFrQyxJQUF1RCxFQUFFLEtBQVUsRUFBRSxLQUFjO0lBQ2pILElBQUksS0FBSyxHQUFHLEtBQUssRUFBRSxHQUFHLElBQVcsRUFBZ0IsRUFBRTtRQUMvQyxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMseUJBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqRTthQUFNO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFNLENBQUMsQ0FBQztTQUM3RDtJQUNMLENBQUMsQ0FBQztJQUNGLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFWRCx3Q0FVQztBQUVELDRCQUFtQyxJQUE0QyxFQUFFLEtBQVU7SUFDdkYsSUFBSSxLQUFLLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBVyxFQUFnQixFQUFFO1FBQy9DLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzlDO2FBQU07WUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtJQUNMLENBQUMsQ0FBQztJQUNGLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFWRCxnREFVQyJ9