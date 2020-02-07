#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const colors = require("colors");
const path = require("path");
const address_1 = require("./core/address");
const rfc_client_1 = require("./client/client/rfc_client");
const testcmd_1 = require("./lib/testcmd");
const error_code_1 = require("./core/error_code");
const getblock_1 = require("./lib/getblock");
const getbalance_1 = require("./lib/getbalance");
const createtoken_1 = require("./lib/createtoken");
const setusercode_1 = require("./lib/setusercode");
const getusercode_1 = require("./lib/getusercode");
const runusermethod_1 = require("./lib/runusermethod");
const getreceipt_1 = require("./lib/getreceipt");
const transferto_1 = require("./lib/transferto");
const getNonce_1 = require("./lib/getNonce");
const getTokenBalance_1 = require("./lib/getTokenBalance");
const transferTokenTo_1 = require("./lib/transferTokenTo");
const getstake_1 = require("./lib/getstake");
const getCandidates_1 = require("./lib/getCandidates");
const getpeers_1 = require("./lib/getpeers");
const getminers_1 = require("./lib/getminers");
const register_1 = require("./lib/register");
const mortgage_1 = require("./lib/mortgage");
const unmortgage_1 = require("./lib/unmortgage");
const vote_1 = require("./lib/vote");
const getvote_1 = require("./lib/getvote");
const getusertable_1 = require("./lib/getusertable");
const prompt = require('prompts-ex');
const keyStore = require('../js/key-store');
const createLockBancorToken_1 = require("./lib/createLockBancorToken");
const { randomBytes } = require('crypto');
const secp256k1 = require('secp256k1');
const fs = require('fs');
const parsetesterjson_1 = require("./lib/parsetesterjson");
var pjson = require('../package.json');
const transferLockBancorTokenTo_1 = require("./lib/transferLockBancorTokenTo");
const getLockBancorTokenBalance_1 = require("./lib/getLockBancorTokenBalance");
const getBancorTokenFactor_1 = require("./lib/getBancorTokenFactor");
const getBancorTokenReserve_1 = require("./lib/getBancorTokenReserve");
const getBancorTokenSupply_1 = require("./lib/getBancorTokenSupply");
const getZeroBalance_1 = require("./lib/getZeroBalance");
const getLIBNumber_1 = require("./lib/getLIBNumber");
const getbalances_1 = require("./lib/getbalances");
const getTokenBalances_1 = require("./lib/getTokenBalances");
const getBancorTokenParams_1 = require("./lib/getBancorTokenParams");
const getblocks_1 = require("./lib/getblocks");
const unregister_1 = require("./lib/unregister");
const getticket_1 = require("./lib/getticket");
const buyLockBancorToken_1 = require("./lib/buyLockBancorToken");
const sellLockBancorToken_1 = require("./lib/sellLockBancorToken");
const getCandidateInfo_1 = require("./lib/getCandidateInfo");
const transferLockBancorTokenToMulti_1 = require("./lib/transferLockBancorTokenToMulti");
const getLockBancorTokenBalances_1 = require("./lib/getLockBancorTokenBalances");
const program = require("commander");
const getNodeInfo_1 = require("./lib/getNodeInfo");
const getConnInfo_1 = require("./lib/getConnInfo");
const getProcessInfo_1 = require("./lib/getProcessInfo");
const getContribInfo_1 = require("./lib/getContribInfo");
const VERSION = pjson.version;
const SECRET_TIMEOUT = 5 * 60 * 1000;
const PROMPT = '> ';
let SYSINFO = {};
SYSINFO.secret = "";
SYSINFO.host = "";
SYSINFO.port = 18089;
SYSINFO.address = "";
SYSINFO.verbose = false;
SYSINFO.keystore = "";
// let chainClient: NewChainClient;
let clientHttp;
process.on('unhandledRejection', (err) => {
    console.log(colors.red('unhandledRrejection'));
    console.log(err);
});
process.on('uncaughtException', (err) => {
    console.log(colors.red('uncaughtException'));
    console.log(err);
});
process.on('warning', (warning) => {
    console.log(colors.red('warning'));
    console.log(warning);
    console.log('\n');
    console.log(colors.yellow('Please change the file mentioned below:'));
    console.log('/node_modules/sqlite3-transactions/sqlite3-transactions.js:1:73 Change sys to util');
    console.log('line 1: var sys = require(\'sys\'),');
    console.log('to: var sys = require(\'util\'),');
});
let checkArgs = (SYSINFO) => {
    if (SYSINFO.keystore === "") {
        console.log(colors.red("No secret\n"));
        console.log('\tPlease create your own secret with command:\n');
        console.log('\t$rfccli --createKeyStore <keyStore_path> \n');
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
};
const CMDS = [
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
        name: 'createKey',
        content: 'create address, public key, secrete key',
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
        name: 'getBalances',
        content: 'get balances under address',
        example: '\ngetbalances\n'
            + '\targ  -  [address]:string[]\n'
            + 'Example:\n'
            + '\t$ getbalances ["1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J"]'
    },
    {
        name: 'getTokenBalance',
        content: 'get Token balance under address',
        example: '\ngetTokenbalance\n'
            + '\targ1  -  tokenid:string\n'
            + '\targ2  -  address:string\n'
            + 'Example:\n'
            + '\t$ getTokenBalance tokenid 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    },
    {
        name: 'getTokenBalances',
        content: 'get Token balances under address',
        example: '\ngetTokenbalances\n'
            + '\targ1  -  tokenid:string\n'
            + '\targ2  -  [address]:string[]\n'
            + 'Example:\n'
            + '\t$ getTokenBalances tokenid ["1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J"]'
    },
    {
        name: 'getStake',
        content: 'get stake ',
        example: '\n' +
            '\targ1  -  address\n'
            + '\n\nExample:\n$ getstake 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    },
    {
        name: 'getCandidates',
        content: 'get candidates ',
        example: '\n'
            + '\n\nExample:\n$ getCandidates'
    },
    {
        name: 'getCandidateInfo',
        content: 'get a candidate info ',
        example: '\n'
            + '\n\nExample:\n$ getCandidateInfo 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    },
    {
        name: 'getMiners',
        content: 'get miners ',
        example: '\n'
            + '\n\nExample:\n$ getMiners'
    },
    {
        name: 'getPeers',
        content: 'get peers ',
        example: '\n'
            + '\n\nExample:\n$ getPeers'
    },
    {
        name: 'getLIBNumber',
        content: 'get last irreversible block number ',
        example: '\n'
            + '\n\nExample:\n$ getLibNumber'
    },
    {
        name: 'getBlock',
        content: 'get Block',
        example: '\n' +
            '\targ1  -  block number | hash value | \'latest\'\n'
            + '\targ2  -  contain transactions?'
            + '\targ3  -  contain eventlogs?'
            + '\targ4  -  contain receipts?'
            + '\n\nExample:\n$ getblock 1 false'
    },
    {
        name: 'getBlocks',
        content: 'get Blocks, max number is 20 blocks',
        example: '\n' +
            '\targ1  -  block  min number\n'
            + '\targ2  -  block max number\n'
            + '\targ3  -  contain transactions?'
            + '\targ4  -  contain eventlogs?'
            + '\targ5  -  contain receipts?'
            + '\n\nExample:\n$ getblocks 1 10 false'
    },
    {
        name: 'getReceipt',
        content: 'get transaction receipt',
        example: '\n' +
            '\targ1  -  tx hash\n'
            + '\n\nExample:\n$ getReceipt c6f697ee409e40db10bbd2533cea35f8e95dc9e92ef360ee5bbd0a2638be98b7'
    },
    {
        name: 'transferTo',
        content: 'Transfer RUFF to some address',
        example: '\n' +
            '\targ1  -  address\n'
            + '\targ2  -  amount\n'
            + '\targ3  -  fee\n'
            + '\n\nExample:\n$ transferTo 16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg 1000 0.1'
    },
    {
        name: 'transferTokenTo',
        content: 'Transfer Token to some address',
        example: '\n\targ1  -  tokenid\n'
            + '\targ2  -  address\n'
            + '\targ3  -  amount\n'
            + '\targ3  -  fee\n'
            + '\n\nExample:\n$ transferTokenTo tokenid 16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg 1000 0.1'
    },
    {
        name: 'createToken',
        content: 'create a token',
        example: '\n\targ1  -  token-name\n'
            + '\targ2  -  preBalance\n'
            + '\targ3  -  precision\n'
            + '\targ4  -  fee\n'
            + '\n\ncreatetoken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}] 9 0.1'
    },
    {
        name: 'setUserCode',
        content: 'set user code (!!Experiment)',
        example: '\n\targs1 - user code path\n'
            + '\targs2 - fee\n'
            + '\n\n $ setUserCode path 0.1'
    },
    {
        name: 'getUserCode',
        content: 'get user code(!!Experiment)',
        example: '\n'
            + '\targ1 - address (user address)\n'
            + '\n\n$ getUserCode 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79'
    },
    {
        name: 'runUserMethod',
        content: ' run user method (!!Experiment)',
        example: '\n\targs1 - to account address\n'
            + '\targs2 - DApp address\n'
            + '\targs3 - amount the amount send to DApp Address\n'
            + '\targs4 - action to run\n'
            + '\targs5 - params\n'
            + '\n\n$ runUserMethod DAppAddress amount fee action params'
    },
    // {
    //     name: 'createBancorToken',
    //     content: 'create a BancorToken',
    //     example:
    //         '\n\targ1  -  token-name\n'
    //         + '\targ2  -  preBalance\n'
    //         + '\targ3  -  factor (0,1)\n'
    //         + '\targ4  -  nonliquidity\n'
    //         + '\targ5  -  cost\n'
    //         + '\targ6  -  fee\n'
    //         + '\n\ncreatebancortoken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}] 0.5 10000000000 100 0.1'
    // },
    {
        name: 'transferBancorTokenTo',
        content: 'transfer BancorToken to address',
        example: '\n\targ1  -  token-name\n'
            + '\targ2  -  address\n'
            + '\targ3  -  amount\n'
            + '\targ4  -  fee\n'
            + '\n\ntransferBancorTokenTo token2 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79 1000 0.1'
    },
    // {
    //     name: 'getBancorTokenBalance',
    //     content: 'get BancorToken balance under address',
    //     example: '\ngetBancorTokenbalance\n'
    //         + '\targ1  -  tokenid:string\n'
    //         + '\targ2  -  address:string\n'
    //         + 'Example:\n'
    //         + '\t$ getBancorTokenBalance tokenid 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    // },
    {
        name: 'createBancorToken',
        content: 'create a BancorToken; time_expiration minutes after which lock_amount will be freed',
        example: '\n\targ1  -  token-name\n'
            + '\targ2  -  preBalance\n'
            + '\targ3  -  factor (0,1)\n'
            + '\targ4  -  nonliquidity\n'
            + '\targ5  -  cost\n'
            + '\targ6  -  fee\n'
            + '\n\ncreatebancortoken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000", "lock_amount":"1000","time_expiration":"240"},{"address":"16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg","amount":"10000", "lock_amount":"0","time_expiration":"0"}]  0.5 0 100 0.1'
    },
    {
        name: 'transferBancorTokenTo',
        content: 'transfer BancorToken to address',
        example: '\n\targ1  -  token-name\n'
            + '\targ2  -  address\n'
            + '\targ3  -  amount\n'
            + '\targ4  -  fee\n'
            + '\n\ntransferBancorTokenTo token2 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79 1000 0.1'
    },
    {
        name: 'transferBancorTokenToMulti',
        content: 'transfer BancorToken to multi address',
        example: '\n\targ1  -  token-name\n'
            + '\targ2  -  preBalances | airdrop.json\n'
            + '\targ3  -  fee\n'
            + '\n\ntransferBancorTokenToMulti token2 [{"address":"16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg","amount":"10000"},{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"100"}] 0.1'
    },
    {
        name: 'getBancorTokenBalance',
        content: 'get BancorToken balance under address',
        example: '\ngetBancorTokenbalance\n'
            + '\targ1  -  tokenid:string\n'
            + '\targ2  -  address:string\n'
            + 'Example:\n'
            + '\t$ getBancorTokenBalance tokenid 1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J'
    },
    {
        name: 'buyBancorToken',
        content: 'buy BancorToken',
        example: '\nbuyBancorToken\n'
            + '\targ1  -  tokenid\n'
            + '\targ2  -  cost\n'
            + '\targ3  -  fee\n'
            + 'Example:\n'
            + '\t$ buyBancorToken tokenid cost fee'
    },
    {
        name: 'sellBancorToken',
        content: 'sell LockBancorToken',
        example: '\nsellBancorToken\n'
            + '\targ1  -  tokenid\n'
            + '\targ2  -  amount\n'
            + '\targ3  -  fee\n'
            + 'Example:\n'
            + '\t$ sellBancorToken tokenid amount fee'
    },
    {
        name: 'getBancorTokenBalances',
        content: 'get BancorToken balances under address',
        example: '\ngetBancorTokenbalances\n'
            + '\targ1  -  tokenid:string\n'
            + '\targ2  -  [address]:string[]\n'
            + 'Example:\n'
            + '\t$ getBancorTokenBalances tokenid ["1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J"]'
    },
    // {
    //     name: 'getBancorTokenBalances',
    //     content: 'get BancorToken balances under address',
    //     example: '\ngetBancorTokenbalances\n'
    //         + '\targ1  -  tokenid:string\n'
    //         + '\targ2  -  [address]:string[]\n'
    //         + 'Example:\n'
    //         + '\t$ getBancorTokenBalances tokenid ["1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J"]'
    // },
    // {
    //     name: 'buyBancorToken',
    //     content: 'buy BancorToken',
    //     example: '\nbuyBancorToken\n'
    //         + '\targ1  -  tokenid\n'
    //         + '\targ2  -  cost\n'
    //         + '\targ3  -  fee\n'
    //         + 'Example:\n'
    //         + '\t$ buyBancorToken tokenid cost fee'
    // },
    // {
    //     name: 'sellBancorToken',
    //     content: 'sell BancorToken',
    //     example: '\nsellBancorToken\n'
    //         + '\targ1  -  tokenid\n'
    //         + '\targ2  -  amount\n'
    //         + '\targ3  -  fee\n'
    //         + 'Example:\n'
    //         + '\t$ sellBancorToken tokenid amount fee'
    // },
    {
        name: 'getBancorTokenFactor',
        content: 'get BancorToken factor',
        example: '\ngetBancorTokenFactor\n'
            + '\targ1  -  tokenid:string\n'
            + 'Example:\n'
            + '\t$ getBancorTokenFactor tokenid '
    },
    {
        name: 'getBancorTokenReserve',
        content: 'get BancorToken reserve',
        example: '\ngetBancorTokenReserve\n'
            + '\targ1  -  tokenid:string\n'
            + 'Example:\n'
            + '\t$ getBancorTokenReserve tokenid '
    },
    {
        name: 'getBancorTokenSupply',
        content: 'get BancorToken supply',
        example: '\ngetBancorTokenSupply\n'
            + '\targ1  -  tokenid:string\n'
            + 'Example:\n'
            + '\t$ getBancorTokenSupply tokenid '
    },
    {
        name: 'getBancorTokenParams',
        content: 'get BancorToken params',
        example: '\ngetBancorTokenParams\n'
            + '\targ1  -  tokenid:string\n'
            + 'Example:\n'
            + '\t$ getBancorTokenParams tokenid '
    },
    {
        name: 'getZeroBalance',
        content: 'get Zero account balance',
        example: '\ngetZeroBalance\n'
            + 'Example:\n'
            + '\t$ getZeroBalance '
    },
    {
        name: 'getNonce',
        content: 'get nonce of some address',
        example: '\n' +
            '\targ1  -  address\n'
            + '\n\nExample:\n$ getNonce 16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg'
    },
    {
        name: 'createKey',
        content: 'create a new address',
        example: ''
    },
    {
        name: 'register',
        content: 'register to be a candidate with caller\'s address, you should have at least 300000 SYS',
        example: '\n' +
            '\targ1  -  amount\n' +
            '\targ2  -  name\n' +
            '\targ3  -  ip\n' +
            '\targ4  -  url\n' +
            '\targ5  -  location\n' +
            '\targ6  -  fee\n'
            + '\n\nExample:\n$ register 3000000 node-test 10.23.23.103 http://bigboss.com Shanghai 0.1'
    },
    {
        name: 'unregister',
        content: 'unregister, not to be a candidate any more, with caller\'s own address. Can not unregister other address',
        example: '\n' +
            '\targ1  -  address\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ unregister 154bdF5WH3FXGo4v24F4dYwXnR8br8rc2r 0.1'
    },
    {
        name: 'freeze',
        content: 'freeze some balance, so you can vote for candidates',
        example: '\n' +
            '\targ1  -  amount\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ freeze 1000 0.1'
    },
    {
        name: 'mortgage',
        content: 'mortgage some balance, so you can vote for candidates',
        example: '\n' +
            '\targ1  -  amount\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ freeze 1000 0.1'
    },
    {
        name: 'unfreeze',
        content: 'unfreeze back to balance',
        example: '\n' +
            '\targ1  -  amount\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ unfreeze 1000 0.1'
    },
    {
        name: 'unmortgage',
        content: 'unmortgage back to balance',
        example: '\n' +
            '\targ1  -  amount\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ unmortgage 1000 0.1'
    },
    {
        name: 'vote',
        content: 'vote to candidates',
        example: '\n' +
            '\targ1  -  [candidate1, candidate2]\n' +
            '\targ2  -  fee\n'
            + '\n\nExample:\n$ vote ["13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY","xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"] 0.1'
    },
    {
        name: 'getVote',
        content: 'getVote',
        example: '\n'
            + '\n\nExample:\n$ getVote'
    },
    {
        name: 'getTicket',
        content: 'getTicket',
        example: '\n'
            + '\targ1 - [address]\n'
            + '\n\nExample:\n$ getTicket 13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY'
    },
    {
        name: 'getUserTable',
        content: 'get value from user table',
        example: '\n' +
            '\targ1 - contractAddress\n'
            + '\targ2 - table name\n'
            + '\targ3 - key name\n'
            + '\n\n$ getUserTable contractaddress table key'
    },
    {
        name: 'sendToTesters',
        content: 'Send token according to prebalance json file',
        example: '\n'
            + '\n\nExample:\n$ sendToTesters'
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
        name: 'getNodeInfo',
        content: 'getNodeInfo',
        example: ''
    },
    {
        name: 'getConnInfo',
        content: 'getConnInfo',
        example: ''
    },
    {
        name: 'getProcessInfo',
        content: 'getProcessInfo',
        example: '\n'
            + '\targ1 - [index, 0~23] \n'
            + '\n\nExample:\n$ getProcessInfo 0'
    },
    {
        name: 'getContribInfo',
        content: 'getContribInfo',
        example: '\n'
            + '\targ1 - [index, 0~23] \n'
            + '\n\nExample:\n$ getContribInfo 0'
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
        name: 'unlock',
        content: 'unlock the keyStore',
        example: '\n' +
            '\t[arg1] - timeout (0 to disable)'
    },
    {
        name: 'q',
        content: 'quit',
        example: ''
    }
];
let getMaxCmdWidth = (cmds) => {
    let arr = [];
    CMDS.forEach((item) => {
        arr.push(item.name.length);
    });
    return Math.max(...arr);
};
const showPrompt = () => {
    process.stdout.write(PROMPT);
};
let printHelpHeader = () => {
    console.log('');
    console.log('NAME:');
    console.log('\trfccli - the command line intrface for Shepherd');
    console.log('');
    console.log('\tCopyright 2019');
    console.log('');
    console.log('USAGE:');
    console.log('\t$rfccli --keyStore xxxxxxxx --host 10.0.0.1 --port 18089 [-v|--verbose]');
    console.log('');
    console.log('VERSION:');
    console.log('\t', VERSION);
    console.log('');
    // console.log('To create a secret key pair: $rfccli createkey');
    console.log('');
};
let printContent = (words, offset, cols) => {
    let pos = offset;
    words.forEach((word) => {
        if ((pos + word.length) >= cols) {
            console.log('');
            pos = offset;
            process.stdout.write(' '.repeat(offset));
            process.stdout.write(word + ' ');
            pos = pos + word.length + 1;
        }
        else {
            process.stdout.write(word + ' ');
            pos = pos + word.length + 1;
        }
    });
    console.log('');
};
let printCmd = (cmd, cols, width) => {
    let widthCmd = width + 5;
    let widthRight = cols - widthCmd - 1;
    let wordsArray = cmd.content.split(' ');
    process.stdout.write(' ' + cmd.name);
    for (let i = 0; i < widthCmd - cmd.name.length - 1; i++) {
        process.stdout.write(' ');
    }
    printContent(wordsArray, widthCmd, cols);
};
let printCmds = (arr, cols, width) => {
    arr.forEach((item) => {
        printCmd(item, cols, width);
    });
};
let printHelpList = () => {
    let COLUMNS = process.stdout.columns;
    let maxCmdWidth = getMaxCmdWidth(CMDS);
    // console.log(maxCmdWidth);
    // printHelpHeader();
    console.log(colors.underline("\nCOMMANDS:\n"));
    printCmds(CMDS, COLUMNS, maxCmdWidth);
};
let printHelp = (args) => {
    if (args[0]) {
        let index = CMDS.find((item) => {
            return (item.name.toLowerCase() === args[0].toLowerCase());
        });
        if (index) {
            console.log(index.example);
        }
        else {
            console.log(args[0] + ' not found');
        }
    }
    else {
        printHelpList();
    }
};
let createKey = function () {
    let privateKey;
    do {
        privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    const pkey = secp256k1.publicKeyCreate(privateKey, true);
    let address = address_1.addressFromSecretKey(privateKey);
    console.log('');
    console.log(colors.green('address   : '), address);
    console.log(colors.green('public key: '), pkey.toString('hex'));
    console.log(colors.green('secret key: '), privateKey.toString('hex'));
    console.log('');
};
async function genKeyStore(keyFile, secretKey) {
    const response = await prompt({
        type: 'password',
        name: 'secret',
        message: 'password',
        validate: (value) => value.length < 8 ? 'password length must >= 8' : true
    });
    let privateKey;
    if (secretKey) {
        privateKey = Buffer.from(secretKey, 'hex');
    }
    else {
        do {
            privateKey = randomBytes(32);
        } while (!secp256k1.privateKeyVerify(privateKey));
    }
    const pkey = secp256k1.publicKeyCreate(privateKey, true);
    let address = address_1.addressFromSecretKey(privateKey);
    let keyJson = keyStore.toV3Keystore(privateKey.toString('hex'), address, response.secret);
    let keyPath;
    if (path.isAbsolute(keyFile)) {
        keyPath = keyFile;
    }
    else {
        keyPath = path.join(process.cwd(), keyFile);
    }
    fs.writeFileSync(keyPath, JSON.stringify(keyJson, null, 4));
    //console.log('openkeyb', keyStore.fromV3Keystore(keyJson, response.secret));
}
/**
 * Expected args
 *
 * rpchost
 * rpcpost
 * secret
 *
 */
const initArgs = async () => {
    // console.log(process.argv);
    // console.log(process.argv.length);
    // console.log('****************');
    program
        .version('2.1.0')
        .option('-v, --verbose', 'Enable Verbose log output')
        .option('-s, --secret <value>', 'secret key')
        .option('-h, --host <value>', 'host address')
        .option('-p, --port <value>', 'host port')
        .option('--createKey', 'createKey')
        .option('--keyStore <value>', 'key store file')
        .option('--createKeyStore <value>', 'create key store')
        .parse(process.argv);
    if (program.verbose) {
        SYSINFO['verbose'] = true;
    }
    if (program.createKey) {
        createKey();
        process.exit(0);
    }
    const outKeyFile = program.createKeyStore;
    if (outKeyFile) {
        await genKeyStore(outKeyFile, program.secret);
        process.exit(0);
    }
    const keyStoreFile = program.keyStore;
    if (keyStoreFile) {
        let keyPath = keyStoreFile;
        if (!path.isAbsolute(keyStoreFile)) {
            keyPath = path.join(process.cwd(), keyStoreFile);
        }
        if (!fs.existsSync(keyPath)) {
            console.log(`keystore file ${keyPath} not exist`);
            process.exit(1);
        }
        SYSINFO['keystore'] = fs.readFileSync(keyPath).toString();
        try {
            let info = JSON.parse(SYSINFO['keystore']);
            SYSINFO['address'] = info.address;
        }
        catch (err) {
            console.log('invalid keystore file');
            process.exit(1);
        }
    }
    if (program.host) {
        SYSINFO['host'] = program.host;
    }
    if (program.port) {
        SYSINFO['port'] = program.port;
    }
    printHelpHeader();
    let currentArg = "";
    checkArgs(SYSINFO);
    console.log('');
};
let unlockTimer;
let initChainClient = (sysinfo) => {
    // chainClient = new NewChainClient({
    //     host: sysinfo.host,
    //     port: sysinfo.port
    // });
    clientHttp = new rfc_client_1.RPCClient(sysinfo.host, sysinfo.port, SYSINFO);
};
let handleResult = (f, ctx, arg) => {
    if (arg.ret === error_code_1.ErrorCode.RESULT_WRONG_ARG || arg.ret === error_code_1.ErrorCode.RESULT_FAILED) {
        console.log(arg.resp);
    }
    else if (arg.ret !== 200 && arg.ret !== error_code_1.ErrorCode.RESULT_OK) {
        console.log(colors.red('No result'));
    }
    else { // arg.ret === 200
        f(ctx, arg);
    }
};
let handleCmd = async (cmd) => {
    // Remove continuous space , or other blank characte
    let words = cmd.replace(/\s+/g, ' ').split(' ');
    if (words.length < 1) {
        return;
    }
    const cmd1 = words[0].toLowerCase();
    const args = words.splice(1, words.length - 1);
    let ctx = {
        client: clientHttp,
        sysinfo: SYSINFO
    };
    let result;
    switch (cmd1) {
        case 'info':
            console.log(colors.gray(' host    : ') + SYSINFO.host);
            console.log(colors.gray(' port    : ') + SYSINFO.port);
            console.log(colors.gray(' address : ') + SYSINFO.address);
            console.log(colors.gray(' secret  : ') + SYSINFO.secret);
            break;
        case 'testcmd':
            result = await testcmd_1.testcmd(args);
            console.log(result);
            break;
        case 'test':
            console.log('Do some test');
            // result = await getBlock(ctx, args);
            // handleResult(prnGetBlock, result);
            // ctx.client.on();
            break;
        case 'getblock':
            result = await getblock_1.getBlock(ctx, args);
            handleResult(getblock_1.prnGetBlock, ctx, result);
            break;
        case 'getblocks':
            result = await getblocks_1.getBlocks(ctx, args);
            handleResult(getblocks_1.prnGetBlocks, ctx, result);
            break;
        case 'getbalance':
            result = await getbalance_1.getBalance(ctx, args);
            handleResult(getbalance_1.prnGetBalance, ctx, result);
            break;
        case 'getbalances':
            result = await getbalances_1.getBalances(ctx, args);
            handleResult(getbalances_1.prnGetBalances, ctx, result);
            break;
        case 'gettokenbalance':
            result = await getTokenBalance_1.getTokenBalance(ctx, args);
            handleResult(getTokenBalance_1.prnGetTokenBalance, ctx, result);
            break;
        case 'gettokenbalances':
            result = await getTokenBalances_1.getTokenBalances(ctx, args);
            handleResult(getTokenBalances_1.prnGetTokenBalances, ctx, result);
            break;
        case 'getreceipt':
            result = await getreceipt_1.getReceipt(ctx, args);
            handleResult(getreceipt_1.prnGetReceipt, ctx, result);
            break;
        case 'getstake':
            result = await getstake_1.getStake(ctx, args);
            handleResult(getstake_1.prnGetStake, ctx, result);
            break;
        case 'getcandidates':
            result = await getCandidates_1.getCandidates(ctx, args);
            handleResult(getCandidates_1.prnGetCandidates, ctx, result);
            break;
        case 'getcandidateinfo':
            result = await getCandidateInfo_1.getCandidateInfo(ctx, args);
            handleResult(getCandidateInfo_1.prnGetCandidateInfo, ctx, result);
            break;
        case 'getpeers':
            result = await getpeers_1.getPeers(ctx, args);
            handleResult(getpeers_1.prnGetPeers, ctx, result);
            break;
        case 'getlibnumber':
            result = await getLIBNumber_1.getLastIrreversibleBlockNumber(ctx, args);
            handleResult(getLIBNumber_1.prnGetLastIrreversibleBlockNumber, ctx, result);
            break;
        case 'getminers':
            result = await getminers_1.getMiners(ctx, args);
            handleResult(getminers_1.prnGetMiners, ctx, result);
            break;
        case 'transferto':
            result = await transferto_1.transferTo(ctx, args);
            handleResult(transferto_1.prnTransferTo, ctx, result);
            break;
        case 'transfertokento':
            result = await transferTokenTo_1.transferTokenTo(ctx, args);
            handleResult(transferTokenTo_1.prnTransferTokenTo, ctx, result);
            break;
        case 'createtoken':
            result = await createtoken_1.createToken(ctx, args);
            handleResult(createtoken_1.prnCreateToken, ctx, result);
            break;
        // case 'createbancortoken':
        //     result = await createBancorToken(ctx, args);
        //     handleResult(prnCreateBancorToken, ctx, result);
        //     break;
        case 'createbancortoken':
            result = await createLockBancorToken_1.createLockBancorToken(ctx, args);
            handleResult(createLockBancorToken_1.prnCreateLockBancorToken, ctx, result);
            break;
        // case 'transferbancortokento':
        //     result = await transferBancorTokenTo(ctx, args);
        //     handleResult(prnTransferBancorTokenTo, ctx, result);
        //     break;
        case 'transferbancortokento':
            result = await transferLockBancorTokenTo_1.transferLockBancorTokenTo(ctx, args);
            handleResult(transferLockBancorTokenTo_1.prnTransferLockBancorTokenTo, ctx, result);
            break;
        case 'transferbancortokentomulti':
            result = await transferLockBancorTokenToMulti_1.transferLockBancorTokenToMulti(ctx, args);
            handleResult(transferLockBancorTokenToMulti_1.prnTransferLockBancorTokenToMulti, ctx, result);
            break;
        // case 'getbancortokenbalance':
        //     result = await getBancorTokenBalance(ctx, args);
        //     handleResult(prnGetBancorTokenBalance, ctx, result);
        //     break;
        case 'getbancortokenbalance':
            result = await getLockBancorTokenBalance_1.getLockBancorTokenBalance(ctx, args);
            handleResult(getLockBancorTokenBalance_1.prnGetLockBancorTokenBalance, ctx, result);
            break;
        case 'getbancortokenbalances':
            result = await getLockBancorTokenBalances_1.getLockBancorTokenBalances(ctx, args);
            handleResult(getLockBancorTokenBalances_1.prnGetLockBancorTokenBalances, ctx, result);
            break;
        // case 'getbancortokenbalances':
        //     result = await getBancorTokenBalances(ctx, args);
        //     handleResult(prnGetBancorTokenBalances, ctx, result);
        //     break;
        // case 'buybancortoken':
        //     result = await buyBancorToken(ctx, args);
        //     handleResult(prnBuyBancorToken, ctx, result);
        //     break;
        case 'buybancortoken':
            result = await buyLockBancorToken_1.buyLockBancorToken(ctx, args);
            handleResult(buyLockBancorToken_1.prnBuyLockBancorToken, ctx, result);
            break;
        // case 'sellbancortoken':
        //     result = await sellBancorToken(ctx, args);
        //     handleResult(prnSellBancorToken, ctx, result);
        //     break;
        case 'sellbancortoken':
            result = await sellLockBancorToken_1.sellLockBancorToken(ctx, args);
            handleResult(sellLockBancorToken_1.prnSellLockBancorToken, ctx, result);
            break;
        case 'getbancortokenfactor':
            result = await getBancorTokenFactor_1.getBancorTokenFactor(ctx, args);
            handleResult(getBancorTokenFactor_1.prnGetBancorTokenFactor, ctx, result);
            break;
        case 'getbancortokenreserve':
            result = await getBancorTokenReserve_1.getBancorTokenReserve(ctx, args);
            handleResult(getBancorTokenReserve_1.prnGetBancorTokenReserve, ctx, result);
            break;
        case 'getbancortokensupply':
            result = await getBancorTokenSupply_1.getBancorTokenSupply(ctx, args);
            handleResult(getBancorTokenSupply_1.prnGetBancorTokenSupply, ctx, result);
            break;
        case 'getbancortokenparams':
            result = await getBancorTokenParams_1.getBancorTokenParams(ctx, args);
            handleResult(getBancorTokenParams_1.prnGetBancorTokenParams, ctx, result);
            break;
        case 'getzerobalance':
            result = await getZeroBalance_1.getZeroBalance(ctx, args);
            handleResult(getZeroBalance_1.prnGetZeroBalance, ctx, result);
            break;
        case 'getnonce':
            result = await getNonce_1.getNonce(ctx, args);
            handleResult(getNonce_1.prnGetNonce, ctx, result);
            break;
        case 'register':
            result = await register_1.register(ctx, args);
            handleResult(register_1.prnRegister, ctx, result);
            break;
        case 'unregister':
            handleResult(unregister_1.prnUnregister, ctx, await unregister_1.unregister(ctx, args));
            break;
        case 'freeze':
            result = await mortgage_1.mortgage(ctx, args);
            handleResult(mortgage_1.prnMortgage, ctx, result);
            break;
        case 'unfreeze':
            result = await unmortgage_1.unmortgage(ctx, args);
            handleResult(unmortgage_1.prnUnmortgage, ctx, result);
            break;
        case 'mortgage':
            result = await mortgage_1.mortgage(ctx, args);
            handleResult(mortgage_1.prnMortgage, ctx, result);
            break;
        case 'unmortgage':
            result = await unmortgage_1.unmortgage(ctx, args);
            handleResult(unmortgage_1.prnUnmortgage, ctx, result);
            break;
        case 'vote':
            result = await vote_1.vote(ctx, args);
            handleResult(vote_1.prnVote, ctx, result);
            break;
        case 'getvote':
            result = await getvote_1.getVote(ctx, args);
            handleResult(getvote_1.prnGetVote, ctx, result);
            break;
        case 'getticket':
            result = await getticket_1.getTicket(ctx, args);
            handleResult(getticket_1.prnGetTicket, ctx, result);
            break;
        case 'getusertable':
            result = await getusertable_1.getUserTable(ctx, args);
            handleResult(getusertable_1.prnGetUserTable, ctx, result);
            break;
        case 'getaddress':
            console.log(SYSINFO.address);
            break;
        case 'createkey':
            createKey();
            break;
        case 'sendtotesters':
            let text = fs.readFileSync('./data/tester.json');
            if (!text) {
                console.log("Can not fetch tester.json");
            }
            else {
                let obj;
                // console.log(text.toString());
                try {
                    obj = JSON.parse(text);
                }
                catch (e) {
                    console.log(e);
                }
                await parsetesterjson_1.parseTesterJson(ctx, obj);
            }
            break;
        case 'setusercode':
            result = await setusercode_1.setUserCode(ctx, args);
            handleResult(setusercode_1.prnSetUserCode, ctx, result);
            break;
        case 'getusercode':
            result = await getusercode_1.getUserCode(ctx, args);
            handleResult(getusercode_1.prnGetUserCode, ctx, result);
            break;
        case 'getnodeinfo':
            result = await getNodeInfo_1.getNodeInfo(ctx, args);
            handleResult(getNodeInfo_1.prnGetNodeInfo, ctx, result);
            break;
        case 'getconninfo':
            result = await getConnInfo_1.getConnInfo(ctx, args);
            handleResult(getConnInfo_1.prnGetConnInfo, ctx, result);
            break;
        case 'getprocessinfo':
            result = await getProcessInfo_1.getProcessInfo(ctx, args);
            handleResult(getProcessInfo_1.prnGetProcessInfo, ctx, result);
            break;
        case 'getcontribinfo':
            result = await getContribInfo_1.getContribInfo(ctx, args);
            handleResult(getContribInfo_1.prnGetContribInfo, ctx, result);
            break;
        case 'runusermethod':
            result = await runusermethod_1.runUserMethod(ctx, args);
            handleResult(runusermethod_1.prnRunUserMethod, ctx, result);
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
        case 'unlock':
            let ts;
            if (args.length >= 1) {
                ts = parseInt(args[0]) * 1000;
            }
            if (ts === undefined) {
                ts = SECRET_TIMEOUT;
            }
            if (SYSINFO['keystore'].length > 0) {
                const response = await prompt({
                    type: 'password',
                    name: 'secret',
                    message: 'password',
                    validate: (value) => value.length < 8 ? 'password length must >= 8' : true
                });
                try {
                    if (response.secret) {
                        SYSINFO['secret'] = keyStore.fromV3Keystore(SYSINFO['keystore'], response.secret);
                        SYSINFO['address'] = address_1.addressFromSecretKey(SYSINFO['secret']);
                        if (ts && ts > 0) {
                            if (SYSINFO.verbose) {
                                console.log(`in set timeout ts is ${ts} ms`);
                            }
                            if (unlockTimer) {
                                clearTimeout(unlockTimer);
                            }
                            unlockTimer = setTimeout(() => {
                                if (SYSINFO.verbose) {
                                    console.log('unlock timer tiggered');
                                }
                                SYSINFO['secret'] = null;
                            }, ts);
                        }
                        else {
                            if (unlockTimer) {
                                if (SYSINFO.verbose) {
                                    console.log('clear unlock timer');
                                }
                                clearTimeout(unlockTimer);
                                unlockTimer = null;
                            }
                        }
                    }
                }
                catch (err) {
                    console.log('invalid passwd');
                }
            }
            break;
        case '':
            break;
        default:
            process.stdout.write(colors.red('Unknown cmds: '));
            console.log(cmd);
            break;
    }
};
//////////////////////////////////////////
async function main() {
    let ret = await initArgs();
    initChainClient(SYSINFO);
    while (1) {
        const onCancel = (prompt) => {
            console.log('exit rfccli');
            process.exit(1);
        };
        const response = await prompt([{
                type: 'textex',
                name: 'cmd',
                message: '>'
            }], { onCancel });
        if (response.cmd) {
            await handleCmd(response.cmd);
        }
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFNQSxtQ0FBbUM7QUFDbkMsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3Qiw0Q0FBc0Q7QUFDdEQsMkRBQXVEO0FBQ3ZELDJDQUF3QztBQUV4QyxrREFBOEM7QUFDOUMsNkNBQXVEO0FBQ3ZELGlEQUE2RDtBQUM3RCxtREFBZ0U7QUFDaEUsbURBQWdFO0FBQ2hFLG1EQUFnRTtBQUNoRSx1REFBc0U7QUFDdEUsaURBQTZEO0FBQzdELGlEQUE2RDtBQUM3RCw2Q0FBdUQ7QUFDdkQsMkRBQTRFO0FBQzVFLDJEQUE0RTtBQUM1RSw2Q0FBdUQ7QUFDdkQsdURBQXNFO0FBQ3RFLDZDQUF1RDtBQUN2RCwrQ0FBMEQ7QUFDMUQsNkNBQXVEO0FBQ3ZELDZDQUF1RDtBQUN2RCxpREFBNkQ7QUFDN0QscUNBQTJDO0FBQzNDLDJDQUFvRDtBQUVwRCxxREFBbUU7QUFDbkUsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzVDLHVFQUE4RjtBQUc5RixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUN2QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFekIsMkRBQXdEO0FBQ3hELElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXZDLCtFQUEwRztBQUMxRywrRUFBMEc7QUFHMUcscUVBQTJGO0FBQzNGLHVFQUE4RjtBQUM5RixxRUFBMkY7QUFDM0YseURBQXlFO0FBQ3pFLHFEQUF1RztBQUN2RyxtREFBZ0U7QUFDaEUsNkRBQStFO0FBRS9F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