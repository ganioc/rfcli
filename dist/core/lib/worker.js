"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const child_process_1 = require("child_process");
class Worker extends events_1.EventEmitter {
    constructor(file, params) {
        super();
        this.file = file;
        this.params = params;
        this.data = '';
    }
    run() {
        // 1. 开一个进程，传serverPort, file, params进去
        // 2. 子进程启动，开始运行
        // 3. 函数返回后，子进程
        const bin = process.argv[0];
        const options = { stdio: 'pipe', env: process.env };
        this.child = child_process_1.spawn(bin, [this.file, this.params], options);
        this.child.on('error', (err) => {
            console.error(`child process error! ${err}`);
            this.destory();
        });
        this.child.once('exit', (code, signal) => {
            this.emit('exit', code == null ? -1 : code, signal);
        });
        this.child.stdin.on('error', (err) => {
            console.error(`child process error! ${err}`);
            this.destory();
        });
        this.child.stdout.on('error', (err) => {
            console.error(`child process error! ${err}`);
            this.destory();
        });
        this.child.stderr.on('error', (err) => {
            console.error(`child process error! ${err}`);
            this.destory();
        });
        this.child.stdout.on('data', (data) => {
            this.data += data;
        });
    }
    destory() {
        if (this.child) {
            this.child.kill('SIGTERM');
        }
    }
}
exports.Worker = Worker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL3dvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFzQztBQUN0QyxpREFBa0U7QUFFbEUsWUFBb0IsU0FBUSxxQkFBWTtJQUtwQyxZQUFZLElBQVksRUFBRSxNQUFjO1FBQ3BDLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELEdBQUc7UUFDQyx1Q0FBdUM7UUFDdkMsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFFZixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXBELElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUF1QixDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDM0IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNqQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDOUI7SUFDTCxDQUFDO0NBQ0o7QUF4REQsd0JBd0RDIn0=