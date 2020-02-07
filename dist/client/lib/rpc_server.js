"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const http = require("http");
class RPCServer extends events_1.EventEmitter {
    constructor(listenaddr, port) {
        super();
        this.m_addr = listenaddr;
        this.m_port = port;
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    prependListener(event, listener) {
        return super.prependListener(event, listener);
    }
    prependOnceListener(event, listener) {
        return super.prependOnceListener(event, listener);
    }
    start() {
        if (this.m_server) {
            return;
        }
        this.m_server = http.createServer();
        this.m_server.on('request', (req, resp) => {
            if (req.url !== '/rpc' || req.method !== 'POST') {
                resp.writeHead(404);
                resp.end();
            }
            else {
                let jsonData = '';
                req.on('data', (chunk) => {
                    jsonData += chunk;
                });
                req.on('end', () => {
                    let reqObj = JSON.parse(jsonData);
                    // console.info(`RPCServer emit request ${reqObj.funName}, params ${JSON.stringify(reqObj.args)}`);
                    if (!this.emit(reqObj.funName, reqObj.args, resp)) {
                        resp.writeHead(404);
                        resp.end();
                    }
                });
            }
        });
        this.m_server.listen(this.m_port, this.m_addr);
    }
    stop() {
        if (this.m_server) {
            this.m_server.close();
            delete this.m_server;
        }
    }
}
exports.RPCServer = RPCServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjX3NlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvbGliL3JwY19zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBc0M7QUFDdEMsNkJBQTZCO0FBRTdCLGVBQXVCLFNBQVEscUJBQVk7SUFJdkMsWUFBWSxVQUFrQixFQUFFLElBQVk7UUFDeEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDO0lBR0QsRUFBRSxDQUFDLEtBQWEsRUFBRSxRQUFhO1FBQzNCLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUdELElBQUksQ0FBQyxLQUFhLEVBQUUsUUFBYTtRQUM3QixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFHRCxlQUFlLENBQUMsS0FBYSxFQUFFLFFBQWE7UUFDeEMsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBR0QsbUJBQW1CLENBQUMsS0FBYSxFQUFFLFFBQWE7UUFDNUMsT0FBTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxLQUFLO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3RDLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNkO2lCQUFNO2dCQUNILElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDbEIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtvQkFDMUIsUUFBUSxJQUFJLEtBQUssQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO29CQUNmLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xDLG1HQUFtRztvQkFDbkcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNwQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQ2Q7Z0JBRUwsQ0FBQyxDQUFDLENBQUM7YUFDTjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUN4QjtJQUNMLENBQUM7Q0FDSjtBQWpFRCw4QkFpRUMifQ==