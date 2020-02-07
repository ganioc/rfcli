"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
function toWei(value) {
    return new bignumber_js_1.BigNumber(value).multipliedBy(new bignumber_js_1.BigNumber(10).pow(18));
}
exports.toWei = toWei;
function fromWei(value) {
    return new bignumber_js_1.BigNumber(value).div(new bignumber_js_1.BigNumber(10).pow(18));
}
exports.fromWei = fromWei;
function toCoin(value) {
    return new bignumber_js_1.BigNumber(value).div(new bignumber_js_1.BigNumber(10).pow(18));
}
exports.toCoin = toCoin;
function fromCoin(value) {
    return new bignumber_js_1.BigNumber(value).multipliedBy(new bignumber_js_1.BigNumber(10).pow(18));
}
exports.fromCoin = fromCoin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjaW1hbF90cmFuc2Zlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9kZWNpbWFsX3RyYW5zZmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0NBQXVDO0FBRXZDLGVBQXNCLEtBQWtDO0lBQ3BELE9BQU8sSUFBSSx3QkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLHdCQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUZELHNCQUVDO0FBRUQsaUJBQXdCLEtBQWtDO0lBQ3RELE9BQU8sSUFBSSx3QkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdCQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUZELDBCQUVDO0FBRUQsZ0JBQXVCLEtBQWtDO0lBQ3JELE9BQU8sSUFBSSx3QkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLHdCQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUZELHdCQUVDO0FBRUQsa0JBQXlCLEtBQWtDO0lBQ3ZELE9BQU8sSUFBSSx3QkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLHdCQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEUsQ0FBQztBQUZELDRCQUVDIn0=