import { RPCClient } from '../client/client/rfc_client';
import { ErrorCode } from "../core";
import { IfResult, IfContext } from './common';

const FUNC_NAME = 'view';

export async function getStake(ctx: IfContext, args: string[]): Promise<IfResult> {
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
            method: 'getStake',
            params: { address: args[0] }
        }

        let cr = await ctx.client.callAsync(FUNC_NAME, params);
        console.log(cr);
        resolve(cr);
    });
}
export function prnGetStake(obj: IfResult) {
    console.log(obj);
    console.log('');

    if (!obj.resp) {
        console.log('Wrong result: ');
        return;
    }
    let objJson: any;
    try {
        objJson = JSON.parse(obj.resp);
        //console.log('Ruff: ', objJson.value.replace(/n/g, ''))
    } catch (e) {
        console.log(e);
    }
}
