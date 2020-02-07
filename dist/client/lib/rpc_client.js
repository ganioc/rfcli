"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
class RPCClient {
    constructor(serveraddr, port, logger) {
        this.logger = logger;
        this.m_url = 'http://' + serveraddr + ':' + port + '/rpc';
    }
    call(funName, funcArgs, onComplete) {
        let sendObj = {
            funName,
            args: funcArgs
        };
        this.logger.info(`RPCClient send request ${sendObj.funName}, params ${JSON.stringify(sendObj.args)}`);
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    let strResp = xmlhttp.responseText;
                    onComplete(strResp, xmlhttp.status);
                }
                else {
                    onComplete(null, xmlhttp.status);
                }
            }
        };
        xmlhttp.ontimeout = (err) => {
            onComplete(null, 504);
        };
        xmlhttp.open('POST', this.m_url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');
        xmlhttp.send(JSON.stringify(sendObj));
    }
    async callAsync(funcName, funcArgs) {
        return new Promise((resolve, reject) => {
            this.call(funcName, funcArgs, (resp, statusCode) => {
                resolve({ resp, ret: statusCode });
            });
        });
    }
}
exports.RPCClient = RPCClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjX2NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvbGliL3JwY19jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLGNBQWMsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxjQUFjLENBQUM7QUFFOUQ7SUFFSSxZQUFZLFVBQWtCLEVBQUUsSUFBWSxFQUFVLE1BQXNCO1FBQXRCLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3hFLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLFVBQVUsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztJQUM5RCxDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQWUsRUFBRSxRQUFhLEVBQUUsVUFBdUQ7UUFDeEYsSUFBSSxPQUFPLEdBQUc7WUFDVixPQUFPO1lBQ1AsSUFBSSxFQUFFLFFBQVE7U0FDakIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixPQUFPLENBQUMsT0FBTyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0RyxNQUFNLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxHQUFHLEVBQUU7WUFDOUIsSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQkFDeEIsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztvQkFDbkMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3ZDO3FCQUFNO29CQUNILFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNwQzthQUNKO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLFNBQVMsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO1lBQzdCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDO1FBRUYsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFFN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBZ0IsRUFBRSxRQUFhO1FBQzNDLE9BQU8sSUFBSSxPQUFPLENBQXVDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ3pFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDL0MsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF6Q0QsOEJBeUNDIn0=