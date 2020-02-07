"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param args
 */
async function testcmd(args) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ resp: 'hello', ret: 10 });
        }, 2000);
    });
}
exports.testcmd = testcmd;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGNtZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvdGVzdGNtZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7R0FHRztBQUNJLEtBQUssa0JBQWtCLElBQWM7SUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBdUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUNqRSxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN4QyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFORCwwQkFNQyJ9