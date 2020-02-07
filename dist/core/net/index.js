"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./connection"));
__export(require("./node"));
__export(require("./package"));
__export(require("./reader"));
__export(require("./writer"));
var static_out_node_1 = require("./static_out_node");
exports.StaticOutNode = static_out_node_1.instance;
const static_peerid_ip_1 = require("./static_peerid_ip");
const staticPeeridIp = {
    mapInstance: static_peerid_ip_1.mapInstance,
    splitInstance: static_peerid_ip_1.splitInstance
};
exports.staticPeeridIp = staticPeeridIp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uZXQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrQ0FBNkI7QUFDN0IsNEJBQXVCO0FBQ3ZCLCtCQUEwQjtBQUMxQiw4QkFBeUI7QUFDekIsOEJBQXlCO0FBQ3pCLHFEQUE0RDtBQUFwRCwwQ0FBQSxRQUFRLENBQWlCO0FBQ2pDLHlEQUE4RDtBQUM5RCxNQUFNLGNBQWMsR0FBRztJQUNuQixXQUFXLEVBQVgsOEJBQVc7SUFDWCxhQUFhLEVBQWIsZ0NBQWE7Q0FDaEIsQ0FBQztBQUNNLHdDQUFjIn0=