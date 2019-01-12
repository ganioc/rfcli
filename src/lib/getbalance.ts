import { RPCClient } from '../client/client/rfc_client';
import { ErrorCode } from "../core";
import { IfResult } from './common';

const FUNC_NAME = 'view';

export async function getBalance(client: RPCClient, args: string[]): Promise<IfResult> {
    return new Promise<IfResult>(async (resolve) => {

        // check args
        if (args.length < 1) {
            resolve({
                ret: ErrorCode.RESULT_WRONG_ARG,
                resp: "Wrong args"
            });
            return;
        }

        let params =
        {
            method: 'getBalance',
            params: { address: args[0] }
        }

        let cr = await client.callAsync(FUNC_NAME, params);

        resolve(cr);
    });
}
export function prnGetBalance(obj: IfResult) {
    console.log(obj);
    console.log('');

    if (!obj.resp) {
        console.log('Wrong result: ');
        return;
    }
    let objJson: any;
    try {
        objJson = JSON.parse(obj.resp);
        console.log('Ruff: ', objJson.value.replace(/n/g, ''))
    } catch (e) {
        console.log(e);
    }
}
