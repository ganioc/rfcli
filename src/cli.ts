#!/usr/bin/env node

/**
* Action according to arg input
*/
import * as readline from 'readline';
import * as process from 'process';
import * as colors from 'colors';
import { addressFromSecretKey } from './core/address';
import { RPCClient, NewChainClient } from './client/client/rfc_client';

import { testcmd } from './lib/testcmd';

import { IfResult } from './lib/common';
import { ErrorCode } from './core';
import { getBlock, prnGetBlock } from './lib/getblock';
import { getBalance, prnGetBalance } from './lib/getbalance';

const VERSION = '0.1';
const PROMPT = '> ';
let SYSINFO: any = {};
SYSINFO.secret = "";
SYSINFO.host = "";
SYSINFO.port = "";
SYSINFO.address = "";

let chainClient: NewChainClient;
let clientHttp: RPCClient;

process.on('unhandledRejection', (err) => {
    console.log(colors.red('unhandledRrejection'));
    console.log(err);
})
process.on('uncaughtException', (err) => {
    console.log(colors.red('uncaughtException'));
    console.log(err);
})
process.on('warning', (warning) => {
    console.log(colors.red('warning'));
    console.log(warning);
});

let keyin = readline.createInterface(process.stdin, process.stdout);

let checkArgs = (SYSINFO: any) => {
    if (SYSINFO.secret === "") {
        console.log(colors.red("No secret\n"));
        process.exit(1);
    }
    if (SYSINFO.host === "") {
        console.log(colors.red("No host\n"));
        process.exit(1);
    }
    if (SYSINFO.port === "") {
        console.log(colors.red("No port\n"));
        process.exit(1);
    }

    SYSINFO.address = addressFromSecretKey(SYSINFO.secret);
    // console.log(SYSINFO);
}
interface ifCMD {
    name: string;
    content: string;
    example: string;
}
const CMDS: ifCMD[] = [
    {
        name: 'help',
        content: 'help COMMAND',
        example: ''
    },
    {
        name: 'info',
        content: 'print public address, secret, rpchost, rpcport',
        example: ''
    },
    {
        name: 'getAddress',
        content: 'print public address',
        example: ''
    },
    {
        name: 'getBalance',
        content: 'get balance under address',
        example: '\ngetbalance\n'
            + '\targ  -  address:string\n'
            + 'Example:\n'
            + '\t$ getbalance 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    },
    {
        name: 'getBlock',
        content: 'get Block',
        example: '\n' +
            '\targ1  -  block number | hash value | \'latest\'\n'
            + '\targ2  -  contain transactions?'
            + '\n\nExample:\n$ getblock 1 false'
    },
    {
        name: 'createAddress',
        content: 'create a new address',
        example: ''
    },
    {
        name: 'test',
        content: 'just for test, will be deleted later',
        example: ''
    },
    {
        name: 'testcmd',
        content: 'just for testcmd, will be deleted later',
        example: ''
    },
    {
        name: '----',
        content: '',
        example: ''
    },
    {
        name: 'exit',
        content: 'quit',
        example: ''
    },
    {
        name: 'quit',
        content: 'quit',
        example: ''
    },
    {
        name: 'q',
        content: 'quit',
        example: ''
    }
];
let getMaxCmdWidth = (cmds: any) => {
    let arr: number[] = [];
    CMDS.forEach((item) => {
        arr.push(item.name.length);
    })
    return Math.max(...arr);
}
const showPrompt = () => {
    process.stdout.write(PROMPT);
};
let printHelpHeader = () => {
    console.log('');
    console.log('NAME:');
    console.log('\trfccli - the RuffChain command line intrface');
    console.log('');
    console.log('\tCopyright 2019');
    console.log('');
    console.log('USAGE:');
    // console.log('\trfccli [options] command [command options] [arguments ...]');
    // console.log('\trfccli [options] ');
    console.log('\t$rfccli --secret xxxxxxxx --host 10.0.0.1 --port 18089')
    console.log('');
    console.log('VERSION:')
    console.log('\t', VERSION);
    console.log('');
};

let printContent = (words: string[], offset: number, cols: number) => {
    let pos = offset;
    words.forEach((word) => {
        if ((pos + word.length) >= cols) {
            console.log('');
            pos = offset;
            process.stdout.write(' '.repeat(offset));
            process.stdout.write(word + ' ');
            pos = pos + word.length + 1;
        } else {
            process.stdout.write(word + ' ');
            pos = pos + word.length + 1;
        }
    })
    console.log('');
};
let printCmd = (cmd: ifCMD, cols: number, width: number) => {
    let widthCmd = width + 5;
    let widthRight = cols - widthCmd - 1;
    let wordsArray = cmd.content.split(' ');

    process.stdout.write(' ' + cmd.name);
    for (let i = 0; i < widthCmd - cmd.name.length - 1; i++) {
        process.stdout.write(' ');
    }
    printContent(wordsArray, widthCmd, cols);
};
let printCmds = (arr: ifCMD[], cols: number, width: number) => {
    arr.forEach((item: ifCMD) => {
        printCmd(item, cols, width);
    })
};
let printHelpList = () => {
    let COLUMNS = process.stdout.columns;
    let maxCmdWidth = getMaxCmdWidth(CMDS);
    // console.log(maxCmdWidth);
    // printHelpHeader();

    console.log(colors.underline("\nCOMMANDS:\n"));
    printCmds(CMDS, COLUMNS!, maxCmdWidth);
}
let printHelp = (args: string[]) => {
    if (args[0]) {
        let index = CMDS.find((item) => {
            return (item.name.toLowerCase() === args[0].toLowerCase());
        });
        if (index) {
            console.log(index.example);
        } else {
            console.log(args[0] + ' not found');
        }
    } else {
        printHelpList();
    }
};
/**
 * Expected args
 * 
 * rpchost
 * rpcpost
 * secret
 * 
 */
const initArgs = () => {

    printHelpHeader();

    let currentArg = "";

    process.argv.forEach((val, index, array) => {
        // console.log(index + ": " + val);
        if ([0, 1].indexOf(index) !== -1) {
            return;
        }
        let result = val.match(/--(.*)/);
        if (result) {
            currentArg = result[1];

        } else if (Object.keys(SYSINFO).indexOf(currentArg) !== -1) {
            SYSINFO[currentArg] = val;

            currentArg = "";
        } else {
            console.log(colors.red('Wrong arg: ' + val));
            process.exit(1);
        }

    });

    checkArgs(SYSINFO);

    console.log('');
}
let initChainClient = (sysinfo: any) => {
    chainClient = new NewChainClient({
        host: sysinfo.host,
        port: sysinfo.port
    });
    clientHttp = new RPCClient(
        sysinfo.host,
        sysinfo.port
    );
};
let handleResult = (f: (result: IfResult) => void, arg: IfResult) => {
    if (arg.ret === ErrorCode.RESULT_WRONG_ARG) {
        console.log(arg.resp);
    }
    else if (arg.ret !== 200) {
        console.log(colors.red('No result'));
    } else {
        f(arg);
    }
}
let handleCmd = async (cmd: string) => {
    let words = cmd.split(' ');

    if (words.length < 1) {
        return;
    }

    const cmd1 = words[0].toLowerCase();
    const args: string[] = words.splice(1, words.length - 1);


    let result: any;

    switch (cmd1) {
        case 'info':

            console.log(colors.gray(' host    : ') + SYSINFO.host);
            console.log(colors.gray(' port    : ') + SYSINFO.port);
            console.log(colors.gray(' address : ') + SYSINFO.address);
            console.log(colors.gray(' secret  : ') + SYSINFO.secret);
            break;
        case 'testcmd':
            result = await testcmd(args);
            console.log(result);
            break;
        case 'test':
            console.log('Do some test');
            result = await getBlock(clientHttp, args);
            handleResult(prnGetBlock, result);
            break;
        case 'getblock':
            result = await getBlock(clientHttp, args);
            handleResult(prnGetBlock, result);
            break;
        case 'getbalance':
            result = await getBalance(clientHttp, args);
            handleResult(prnGetBalance, result);
            break;
        case 'getaddress':
            console.log(SYSINFO.address);
            break;
        case 'help':
            printHelp(args);
            break;
        case 'exit':
            console.log('Bye\n');
            process.exit(0);
            break;
        case 'q':
            console.log('Bye\n');
            process.exit(0);
            break;
        case 'quit':
            console.log('Bye\n');
            process.exit(0);
            break;
        case '':
            break;
        default:
            process.stdout.write(colors.red('Unknown cmds: '));
            console.log(cmd);
            break;
    }

    console.log('');
    showPrompt();
};

//////////////////////////////////////////
keyin.on('line', (cmd: string) => {
    handleCmd(cmd);
})

initArgs();
initChainClient(SYSINFO);
showPrompt();



