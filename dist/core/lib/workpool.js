"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_1 = require("./worker");
const error_code_1 = require("../error_code");
class Workpool {
    constructor(workerfile, size) {
        this.file = workerfile;
        this.size = size;
        this.workers = new Array(this.size);
    }
    push(params, callback) {
        //找一个空闲的worker
        for (let index = 0; index < this.workers.length; index++) {
            if (!this.workers[index]) {
                //run for worker
                let workerParam = JSON.stringify(params);
                console.log(`worker params `, workerParam.replace(/\\\\/g, '/').replace(/\"/g, '\\"'));
                this.workers[index] = new worker_1.Worker(this.file, workerParam);
                this.workers[index].on('exit', (code, signal) => {
                    callback(code, signal, this.workers[index].data);
                    this.workers[index] = undefined;
                });
                this.workers[index].run();
                return error_code_1.ErrorCode.RESULT_OK;
            }
        }
        return error_code_1.ErrorCode.RESULT_NOT_FOUND;
    }
    stop() {
        for (let index = 0; index < this.workers.length; index++) {
            if (this.workers[index]) {
                this.workers[index].destory();
                //this.workers[index] = undefined;
            }
        }
    }
}
exports.Workpool = Workpool;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Bvb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvd29ya3Bvb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBZ0M7QUFDaEMsOENBQTBDO0FBRTFDO0lBS0ksWUFBWSxVQUFrQixFQUFFLElBQVk7UUFDeEMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksQ0FBQyxNQUFjLEVBQUUsUUFBeUQ7UUFDMUUsY0FBYztRQUNkLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdEIsZ0JBQWdCO2dCQUNoQixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzdDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQTtnQkFDRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUMzQixPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO2FBQzlCO1NBQ0o7UUFFRCxPQUFPLHNCQUFTLENBQUMsZ0JBQWdCLENBQUM7SUFDdEMsQ0FBQztJQUVELElBQUk7UUFDQSxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDdEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMvQixrQ0FBa0M7YUFDckM7U0FFSjtJQUNMLENBQUM7Q0FDSjtBQXhDRCw0QkF3Q0MifQ==