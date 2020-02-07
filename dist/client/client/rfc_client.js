"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../../core/error_code");
const writer_1 = require("../../core/lib/writer");
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const BLOCK_INTERVAL = 10000;
/**
 * Modified, remove loggerInstance
 */
class RPCClient {
    // private m_tipBlockTimer?: any;
    // private m_tipBlock?: any;
    // private m_emitter = new EventEmitter();
    constructor(serveraddr, port, sysinfo) {
        this.m_url = 'http://' + serveraddr + ':' + port + '/rpc';
        this.m_verbose = sysinfo.verbose;
    }
    call(funName, funcArgs, onComplete) {
        let sendObj = {
            funName,
            args: funcArgs
        };
        if (this.m_verbose) {
            console.log(`RPCClient send request ${sendObj.funName}, params ${JSON.stringify(sendObj.args)}`);
        }
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
    // getNonce
    async getNonce(params) {
        if (!params.address) {
            console.log('unlock first');
            return { err: error_code_1.ErrorCode.RESULT_FAILED };
        }
        let cr = await this.callAsync('getNonce', params);
        if (cr.ret !== 200) {
            return { err: error_code_1.ErrorCode.RESULT_FAILED };
        }
        if (this.m_verbose) {
            console.log('nonce fb:');
            console.log(cr);
        }
        return JSON.parse(cr.resp);
    }
    // sendTransaction
    async sendTransaction(params) {
        let writer = new writer_1.BufferWriter();
        let err = params.tx.encode(writer);
        if (err) {
            console.log(`send invalid transactoin`, params.tx);
            return { err };
        }
        let cr = await this.callAsync('sendTransaction', { tx: writer.render() });
        // if (ctx.sysinfo.verbose) {
        //     console.log('cr:');
        //     console.log(cr);
        // }
        if (cr.ret !== 200) {
            console.log(`send tx failed ret `, cr.ret);
            return { err: error_code_1.ErrorCode.RESULT_FAILED };
        }
        return { err: JSON.parse(cr.resp) };
    }
    async getTransactionReceipt(params) {
        let cr = await this.callAsync('getTransactionReceipt', params);
        if (cr.ret !== 200) {
            return { err: error_code_1.ErrorCode.RESULT_FAILED };
        }
        return JSON.parse(cr.resp);
        // return cr;
    }
}
exports.RPCClient = RPCClient;
// export class NewChainClient {
//     m_client: RPCClient;
//     constructor(options: ChainClientOptions) {
//         this.m_client = new RPCClient(
//             options.host,
//             parseInt(options.port)
//         );
//     }
//     async getBlock(params: paramsGetBlock): Promise<{ err: ErrorCode, block?: any, txs?: any[] }> {
//         let cr = await this.m_client.callAsync('getBlock', params);
//         // console.log('getBlock after callAsync');
//         if (cr.ret !== 200) {
//             return { err: ErrorCode.RESULT_FAILED };
//         }
//         return JSON.parse(cr.resp!);
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmZjX2NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnQvY2xpZW50L3JmY19jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzREFBa0Q7QUFFbEQsa0RBQXFEO0FBSXJELElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQTtBQUU3RCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFVN0I7O0dBRUc7QUFDSDtJQUlJLGlDQUFpQztJQUNqQyw0QkFBNEI7SUFDNUIsMENBQTBDO0lBRTFDLFlBQVksVUFBa0IsRUFBRSxJQUFZLEVBQUUsT0FBa0I7UUFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsVUFBVSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztJQUVyQyxDQUFDO0lBRUQsSUFBSSxDQUFDLE9BQWUsRUFBRSxRQUFhLEVBQUUsVUFBdUQ7UUFDeEYsSUFBSSxPQUFPLEdBQUc7WUFDVixPQUFPO1lBQ1AsSUFBSSxFQUFFLFFBQVE7U0FDakIsQ0FBQztRQUNGLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixPQUFPLENBQUMsT0FBTyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwRztRQUdELE1BQU0sT0FBTyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFFckMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLEdBQUcsRUFBRTtZQUM5QixJQUFJLE9BQU8sQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFO2dCQUMxQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29CQUN4QixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO29CQUNuQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDdkM7cUJBQU07b0JBQ0gsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0o7UUFDTCxDQUFDLENBQUM7UUFFRixPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDN0IsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUM7UUFFRixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUU3RCxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBQ0QsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFnQixFQUFFLFFBQWE7UUFDM0MsT0FBTyxJQUFJLE9BQU8sQ0FBdUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDekUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUMvQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXO0lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUEyQjtRQUV0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sRUFBRSxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUMzQztRQUNELElBQUksRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbEQsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRTtZQUNoQixPQUFPLEVBQUUsR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDM0M7UUFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFLLENBQUMsQ0FBQztJQUVoQyxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBZ0M7UUFDbEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7UUFDaEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkMsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRCxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7U0FDbEI7UUFDRCxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUxRSw2QkFBNkI7UUFDN0IsMEJBQTBCO1FBQzFCLHVCQUF1QjtRQUN2QixJQUFJO1FBRUosSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRTtZQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxPQUFPLEVBQUUsR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDM0M7UUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUssQ0FBYyxFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVELEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxNQUFzQjtRQUM5QyxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFL0QsSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRTtZQUNoQixPQUFPLEVBQUUsR0FBRyxFQUFFLHNCQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDM0M7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUssQ0FBQyxDQUFDO1FBQzVCLGFBQWE7SUFDakIsQ0FBQztDQUNKO0FBekdELDhCQXlHQztBQUVELGdDQUFnQztBQUNoQywyQkFBMkI7QUFDM0IsaURBQWlEO0FBQ2pELHlDQUF5QztBQUN6Qyw0QkFBNEI7QUFDNUIscUNBQXFDO0FBQ3JDLGFBQWE7QUFDYixRQUFRO0FBQ1Isc0dBQXNHO0FBQ3RHLHNFQUFzRTtBQUN0RSxzREFBc0Q7QUFDdEQsZ0NBQWdDO0FBQ2hDLHVEQUF1RDtBQUN2RCxZQUFZO0FBQ1osdUNBQXVDO0FBQ3ZDLFFBQVE7QUFDUixJQUFJIn0=