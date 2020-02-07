"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const net_1 = require("../net");
class StandaloneConnection extends net_1.IConnection {
    send(data) {
        return 0;
    }
    close() {
        return Promise.resolve(error_code_1.ErrorCode.RESULT_OK);
    }
    getRemote() {
        return '';
    }
}
exports.StandaloneConnection = StandaloneConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldF9zdGFuZGFsb25lL2Nvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBd0M7QUFDeEMsZ0NBQW1DO0FBRW5DLDBCQUFrQyxTQUFRLGlCQUFXO0lBQ2pELElBQUksQ0FBQyxJQUFZO1FBQ2IsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0QsS0FBSztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxTQUFTO1FBQ0wsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0NBQ0o7QUFWRCxvREFVQyJ9