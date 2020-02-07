"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("../net/node");
const error_code_1 = require("../error_code");
const connection_1 = require("./connection");
class StandaloneNode extends node_1.INode {
    constructor(network, peerid) {
        super({ network, peerid });
    }
    async _connectTo(peerid) {
        let connType = this._nodeConnectionType();
        let conn = new connType(this);
        return { err: error_code_1.ErrorCode.RESULT_OK, conn };
    }
    _connectionType() {
        return connection_1.StandaloneConnection;
    }
    async listen() {
        return error_code_1.ErrorCode.RESULT_OK;
    }
    async randomPeers(count, excludes) {
        return { err: error_code_1.ErrorCode.RESULT_SKIPPED, peers: [] };
    }
}
exports.StandaloneNode = StandaloneNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldF9zdGFuZGFsb25lL25vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQ0FBa0Q7QUFDbEQsOENBQXdDO0FBRXhDLDZDQUFrRDtBQUVsRCxvQkFBNEIsU0FBUSxZQUFLO0lBQ3JDLFlBQVksT0FBZSxFQUFFLE1BQWM7UUFDdkMsS0FBSyxDQUFDLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVTLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBYztRQUNyQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMxQyxJQUFJLElBQUksR0FBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO0lBQzVDLENBQUM7SUFFUyxlQUFlO1FBQ3JCLE9BQU8saUNBQW9CLENBQUM7SUFDaEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNO1FBQ2YsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFhLEVBQUUsUUFBa0I7UUFDdEQsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFDdEQsQ0FBQztDQUNKO0FBdEJELHdDQXNCQyJ9