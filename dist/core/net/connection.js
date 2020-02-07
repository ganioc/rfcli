"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const events_1 = require("events");
class IConnection extends events_1.EventEmitter {
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    send(data) {
        return 0;
    }
    close() {
        return Promise.resolve(error_code_1.ErrorCode.RESULT_OK);
    }
    destroy() {
        return Promise.resolve();
    }
    getTimeDelta() {
        return 0;
    }
    setTimeDelta(n) {
    }
}
exports.IConnection = IConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldC9jb25uZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQTBDO0FBQzFDLG1DQUFzQztBQUV0QyxpQkFBeUIsU0FBUSxxQkFBWTtJQU16QyxFQUFFLENBQUMsS0FBYSxFQUFFLFFBQWE7UUFDM0IsT0FBTyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBTUQsSUFBSSxDQUFDLEtBQWEsRUFBRSxRQUFhO1FBQzdCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELElBQUksQ0FBQyxJQUFZO1FBQ2IsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0QsS0FBSztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxzQkFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxPQUFPO1FBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQU1ELFlBQVk7UUFDUixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxZQUFZLENBQUMsQ0FBUztJQUV0QixDQUFDO0NBQ0o7QUF4Q0Qsa0NBd0NDIn0=