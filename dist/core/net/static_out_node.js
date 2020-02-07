"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
function instance(superClass) {
    return class extends superClass {
        constructor(...args) {
            super(...args.slice(1));
            this.m_staticPeers = (args[0]).slice(0);
        }
        async randomPeers(count, excludes) {
            const doubleCount = 2 * count;
            if (this.m_staticPeers.length) {
                const ex = new Set(excludes);
                let inc = [];
                for (const peerid of this.m_staticPeers) {
                    if (!ex.has(peerid)) {
                        inc.push(peerid);
                    }
                }
                if (inc.length <= doubleCount) {
                    return { err: error_code_1.ErrorCode.RESULT_OK, peers: inc };
                }
                else {
                    const start = Math.floor(inc.length * Math.random());
                    let peers = [];
                    peers.push(...inc.slice(start));
                    if (peers.length <= doubleCount) {
                        peers.push(...inc.slice(doubleCount - peers.length));
                    }
                    return { err: error_code_1.ErrorCode.RESULT_OK, peers };
                }
            }
            else {
                return { err: error_code_1.ErrorCode.RESULT_SKIPPED, peers: [] };
            }
        }
    };
}
exports.instance = instance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX291dF9ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbmV0L3N0YXRpY19vdXRfbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF3QztBQUd4QyxrQkFBeUIsVUFBd0M7SUFDN0QsT0FBTyxLQUFNLFNBQVEsVUFBVTtRQUMzQixZQUFZLEdBQUcsSUFBVztZQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFhLEVBQUUsUUFBa0I7WUFDL0MsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUM5QixJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO2dCQUMzQixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNiLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDckMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7d0JBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3BCO2lCQUNKO2dCQUNELElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxXQUFXLEVBQUU7b0JBQzNCLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBQyxDQUFDO2lCQUNqRDtxQkFBTTtvQkFDSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7b0JBQ3JELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDZixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNoQyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksV0FBVyxFQUFFO3dCQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7cUJBQ3hEO29CQUNELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLENBQUM7aUJBQzVDO2FBQ0o7aUJBQU07Z0JBQ0gsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDckQ7UUFDTCxDQUFDO0tBQ0osQ0FBQztBQUNOLENBQUM7QUFqQ0QsNEJBaUNDIn0=