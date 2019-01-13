import { RPCClient } from '../client/client/rfc_client';
import { resolve } from 'path';

const MAX_CONFIRM_TIMES = 3;
const BLOCK_INTERVAL = 10;

export interface IfResult { resp: string | null, ret: number };

export interface IfSysinfo {
    secret: string;
    address: string;
    port: string;
    host: string;
}

export interface IfContext { sysinfo: IfSysinfo, client: RPCClient }

export async function waitSeconds(seconds: number) {
    return new Promise((resove) => {
        setTimeout(() => {
            resolve('0');
        }, 1000 * seconds);
    });
}

export async function checkReceipt(ctx: IfContext, txhash: string): Promise<{ resp: string | null, ret: number }> {
    return new Promise<{ resp: string | null, ret: number }>(async (resolve, reject) => {
        let counter = 0;

        for (let i = 0; i < MAX_CONFIRM_TIMES; i++) {
            await waitSeconds(1 * BLOCK_INTERVAL);

            let result = await ctx.client.callAsync('getTransactionReceipt', { tx: txhash });

            if (result.ret == 200) {
                // check if receipt valid
                counter++;
            }
            if (counter >= 1) {
                resolve();
            }
        }
        // error!
        resolve();

    });
}
