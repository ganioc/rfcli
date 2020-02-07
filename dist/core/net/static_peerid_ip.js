"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
function mapInstance(superClass) {
    return class extends superClass {
        constructor(...args) {
            super(...args.slice(1));
            this.m_peeridToIp = new Map();
            let iph = args[0];
            for (let peerid of Object.keys(iph)) {
                let [host, port] = iph[peerid].split(':');
                this.m_peeridToIp.set(peerid, { host, port: parseInt(port) });
            }
        }
        async _peeridToIpAddress(peerid) {
            let iph = this.m_peeridToIp.get(peerid);
            if (!iph) {
                return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
            }
            return { err: error_code_1.ErrorCode.RESULT_OK, ip: iph };
        }
    };
}
exports.mapInstance = mapInstance;
function splitInstance(superClass) {
    return class extends superClass {
        constructor(...args) {
            super(...args);
        }
        async _peeridToIpAddress(peerid) {
            let [host, port] = peerid.split(':');
            return { err: error_code_1.ErrorCode.RESULT_OK, ip: { host, port: parseInt(port) } };
        }
    };
}
exports.splitInstance = splitInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3BlZXJpZF9pcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldC9zdGF0aWNfcGVlcmlkX2lwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXdDO0FBR3hDLHFCQUE0QixVQUF3QztJQUNoRSxPQUFPLEtBQU0sU0FBUSxVQUFVO1FBRTNCLFlBQVksR0FBRyxJQUFXO1lBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7WUFDOUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBSSxHQUFHLENBQUMsTUFBTSxDQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUM7YUFDL0Q7UUFDTCxDQUFDO1FBRVMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQWM7WUFDN0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDTixPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQzthQUM1QztZQUNELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBQyxDQUFDO1FBQy9DLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQztBQXJCRCxrQ0FxQkM7QUFFRCx1QkFBOEIsVUFBd0M7SUFDbEUsT0FBTyxLQUFNLFNBQVEsVUFBVTtRQUMzQixZQUFZLEdBQUcsSUFBVztZQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBRVMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQWM7WUFDN0MsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsRUFBQyxDQUFDO1FBQ3hFLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQztBQVhELHNDQVdDIn0=