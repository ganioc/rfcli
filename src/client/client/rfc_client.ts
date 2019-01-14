import { EventEmitter } from 'events';
import { ErrorCode } from "../../core/error_code";
import { ValueTransaction } from '../../core/value_chain/transaction'
import { BufferWriter } from '../../core/lib/writer';

let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

const BLOCK_INTERVAL = 10000;

export interface ChainClientOptions {
    host: string;
    port: string;
}
export interface paramsGetBlock {
    which: string | number | 'lastest';
    transactions?: boolean;
}
/**
 * Modified, remove loggerInstance
 */
export class RPCClient {
    private m_url: string;
    // private m_tipBlockTimer?: any;
    // private m_tipBlock?: any;
    // private m_emitter = new EventEmitter();

    constructor(serveraddr: string, port: number) {
        this.m_url = 'http://' + serveraddr + ':' + port + '/rpc';


    }

    call(funName: string, funcArgs: any, onComplete: (resp: string | null, code: number) => void) {
        let sendObj = {
            funName,
            args: funcArgs
        };
        console.log(`RPCClient send request ${sendObj.funName}, params ${JSON.stringify(sendObj.args)}`);

        const xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    let strResp = xmlhttp.responseText;
                    onComplete(strResp, xmlhttp.status);
                } else {
                    onComplete(null, xmlhttp.status);
                }
            }
        };

        xmlhttp.ontimeout = (err: any) => {
            onComplete(null, 504);
        };

        xmlhttp.open('POST', this.m_url, true);
        xmlhttp.setRequestHeader('Content-Type', 'application/json');

        xmlhttp.send(JSON.stringify(sendObj));
    }
    async callAsync(funcName: string, funcArgs: any): Promise<{ resp: string | null, ret: number }> {
        return new Promise<{ resp: string | null, ret: number }>((resolve, reject) => {
            this.call(funcName, funcArgs, (resp, statusCode) => {
                resolve({ resp, ret: statusCode });
            });
        });
    }

    // getNonce
    async getNonce(params: { address: string }): Promise<{ err: ErrorCode, nonce?: number }> {
        let cr = await this.callAsync('getNonce', params);
        if (cr.ret !== 200) {
            return { err: ErrorCode.RESULT_FAILED };
        }
        console.log('nonce fb:');
        console.log(cr);
        return JSON.parse(cr.resp!);

    }

    // sendTransaction
    async sendTransaction(params: { tx: ValueTransaction }): Promise<{ err: ErrorCode }> {
        let writer = new BufferWriter();
        let err = params.tx.encode(writer);
        if (err) {
            console.log(`send invalid transactoin`, params.tx);
            return { err };
        }
        let cr = await this.callAsync('sendTransaction', { tx: writer.render() });
        if (cr.ret !== 200) {
            console.log(`send tx failed ret `, cr.ret);
            return { err: ErrorCode.RESULT_FAILED };
        }
        return { err: JSON.parse(cr.resp!) as ErrorCode };
    }

    async getTransactionReceipt(params: { tx: string }): Promise<{ err: ErrorCode, block?: any, tx?: any, receipt?: any }> {
        let cr = await this.callAsync('getTransactionReceipt', params);

        if (cr.ret !== 200) {
            return { err: ErrorCode.RESULT_FAILED };
        }
        return JSON.parse(cr.resp!);
        // return cr;
    }
}

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



