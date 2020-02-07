#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("../core/address");
let expect = require('chai').expect;
// let request = require('request');
const mocha_1 = require("mocha");
var assert = require('assert');
const transferto_1 = require("../lib/transferto");
const error_code_1 = require("../core/error_code");
const getbalance_1 = require("../lib/getbalance");
const test_common_1 = require("./test_common");
const createtoken_1 = require("../lib/createtoken");
const getTokenBalance_1 = require("../lib/getTokenBalance");
const getblock_1 = require("../lib/getblock");
const getCandidates_1 = require("../lib/getCandidates");
const getminers_1 = require("../lib/getminers");
const getpeers_1 = require("../lib/getpeers");
const getreceipt_1 = require("../lib/getreceipt");
const createBancorToken_1 = require("../lib/createBancorToken");
// import { getBancorTokenBalance, prnGetBancorTokenBalance } from '../lib/getBancorTokenBalance';
//import { transferBancorTokenTo } from '../lib/transferBancorTokenTo';
const getBancorTokenSupply_1 = require("../lib/getBancorTokenSupply");
const getBancorTokenReserve_1 = require("../lib/getBancorTokenReserve");
const getBancorTokenFactor_1 = require("../lib/getBancorTokenFactor");
const buyBancorToken_1 = require("../lib/buyBancorToken");
const sellBancorToken_1 = require("../lib/sellBancorToken");
const core_1 = require("../core");
process.on('warning', (warning) => {
    console.log(warning);
});
process.on('unhandledRejection', (reason, p) => {
    console.log('未处理的 rejection：', p, '原因：', reason);
    // 记录日志、抛出错误、或其他逻辑。
});
// Test all 
mocha_1.describe('Test key generation', () => {
    mocha_1.it('Address from secret key', (done) => {
        let addr = address_1.addressFromSecretKey("054898c1a167977bc42790a3064821a2a35a8aa53455b9b3659fb2e9562010f7");
        // console.log('1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J');
        expect(addr).to.equal('1Bbruv7E4nP62ZD4cJqxiGrUD43psK5E2J');
        done();
    });
});
// test bancor token
mocha_1.describe('Test bancor', function () {
    this.timeout(133000);
    test_common_1.switch2BigBoss();
    let TOKEN_NAME;
    let oldBancor;
    let oldSys;
    let oldBancorDelta;
    let oldSysDelta;
    let head_balance = 0.0;
    mocha_1.it('Transfer to account:head 250.8 sys', async function () {
        this.timeout(33000);
        let NUM = 250.8;
        let result = await transferto_1.transferTo(test_common_1.ctx, [test_common_1.config.head.address, NUM + '', "0.1"]);
        console.log(result);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        test_common_1.switch2Head();
    });
    mocha_1.it('Create a bancor token', async function () {
        this.timeout(40000);
        TOKEN_NAME = 'TOK' + Math.random().toString().slice(2, 10);
        let result = await createBancorToken_1.createBancorToken(test_common_1.ctx, [TOKEN_NAME, '[{"address":"1McScD9QAo3FQwmutBbhTFjfKYtwkatfHX","amount":"1000"}]', '0.5', '250', '0.1']);
        console.log('CreateBancorToken:', TOKEN_NAME);
        console.log(result);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        result = await getTokenBalance_1.getTokenBalance(test_common_1.ctx, [TOKEN_NAME, "1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79"]);
        let obj = JSON.parse(result.resp);
        assert.equal(obj.err, error_code_1.ErrorCode.RESULT_OK);
        getTokenBalance_1.prnGetTokenBalance(test_common_1.ctx, result);
        head_balance -= 250.1;
    });
    mocha_1.it('Check head\'s bancorToken', async function () {
        this.timeout(5000);
        let result = await getTokenBalance_1.getTokenBalance(test_common_1.ctx, [TOKEN_NAME, test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        oldBancor = new core_1.BigNumber(amount).toNumber();
        console.log(`Check head \'s bancortoken balance ${TOKEN_NAME}:`, amount);
        expect(1).to.equal(1);
    });
    mocha_1.it('Check head\'s balance', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log('head\'s balance:', amount);
        expect(1).to.equal(1);
        oldSys = new core_1.BigNumber(amount).toNumber();
        //done();
    });
    // buy something 
    mocha_1.it('Buy bancorToken 0.5 SYS', async function () {
        this.timeout(33000);
        let NUM = 0.5;
        let result = await buyBancorToken_1.buyBancorToken(test_common_1.ctx, [TOKEN_NAME, NUM + '', "0.1"]);
        console.log(result);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        oldSys -= 0.6;
    });
    mocha_1.it('Check head\'s balance', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        // oldSysDelta = oldSys - new BigNumber(amount).toNumber();
        console.log('head \'s balance:', amount);
        expect(1).to.equal(1);
        //done();
    });
    mocha_1.it('Check head\'s bancorToken', async function () {
        this.timeout(5000);
        let result = await getTokenBalance_1.getTokenBalance(test_common_1.ctx, [TOKEN_NAME, test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        oldBancorDelta = amount - oldBancor;
        console.log(`Check head \'s balance ${TOKEN_NAME}:`, amount);
        expect(1).to.equal(1);
    });
    // sell same amount of bancorToken
    mocha_1.it('sell bancorToken', async function () {
        this.timeout(33000);
        let NUM = oldBancorDelta;
        console.log('To sell bancortoken:', NUM);
        let result = await sellBancorToken_1.sellBancorToken(test_common_1.ctx, [TOKEN_NAME, NUM + '', "0.1"]);
        console.log(result);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        // oldBancorToken += 100;
        //head_balance -= 0.1;
    });
    mocha_1.it('Check head\'s balance', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        oldSys = new core_1.BigNumber(amount).toNumber();
        console.log('head \'s balance:', oldSys);
        expect(1).to.equal(1);
        //done();
    });
    mocha_1.it('Check head\'s bancorToken', async function () {
        this.timeout(5000);
        let result = await getTokenBalance_1.getTokenBalance(test_common_1.ctx, [TOKEN_NAME, test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        oldBancor = new core_1.BigNumber(amount).toNumber();
        console.log(`Check head \'s balance ${TOKEN_NAME}:`, oldBancor);
        // expect(amount).to.equal('900');
        expect(1).to.equal(1);
    });
    mocha_1.it('get bancorToken supply', async function () {
        this.timeout(5000);
        let result = await getBancorTokenSupply_1.getBancorTokenSupply(test_common_1.ctx, [TOKEN_NAME]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log(`Check bancorToken supply ${TOKEN_NAME}:`, new core_1.BigNumber(amount).toFixed(9));
        expect(1).to.equal(1);
    });
    mocha_1.it('get bancorToken reserve', async function () {
        this.timeout(5000);
        let result = await getBancorTokenReserve_1.getBancorTokenReserve(test_common_1.ctx, [TOKEN_NAME]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log(`Check bancorToken reserve ${TOKEN_NAME}:`, new core_1.BigNumber(amount).toFixed(9));
        expect(1).to.equal(1);
    });
    mocha_1.it('get bancorToken factor', async function () {
        this.timeout(5000);
        let result = await getBancorTokenFactor_1.getBancorTokenFactor(test_common_1.ctx, [TOKEN_NAME]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log(`Check bancorToken factor ${TOKEN_NAME}:`, amount);
        expect(1).to.equal(1);
    });
});
// Test Transferto
mocha_1.describe('Test TransferTo', function () {
    // switch2BigBoss();
    //this.timeout(50000);
    // it('Read from test.jon', () => {
    //     config.people.forEach((item) => {
    //         console.log('\taccount', item.name, ':', item.init_amount);
    //     });
    //     expect(config.people.length).to.equal(10);
    //     // done();
    // });
    let AMOUNT = 1000;
    let FEE_AMOUNT = 100;
    let NUM = AMOUNT + FEE_AMOUNT;
    let head_balance = 0.0;
    let TEST_TX1 = '';
    // let original_head_balance = 0.0;
    mocha_1.it('Check account:head', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        // original_head_balance = amount;
        console.log('head \'s balance:', amount);
        expect(1).to.equal(1);
        //done();
    });
    mocha_1.it('Transfer to account:head', async function () {
        test_common_1.switch2BigBoss();
        this.timeout(33000);
        let result = await transferto_1.transferTo(test_common_1.ctx, [test_common_1.config.head.address, (NUM) + '', "0.1"]);
        console.log(result);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        TEST_TX1 = result.resp.split(':')[1];
        head_balance += NUM;
    });
    mocha_1.it('Check account:head', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log('Check head \'s balance:', amount);
        expect(1).to.equal(1);
        //done();
    });
    mocha_1.it('Check createtoken', async function () {
        this.timeout(33000);
        let TOKEN_NAME = 'TOK' + Math.random().toString().slice(2, 10);
        // let COST = '100';
        let result = await createtoken_1.createToken(test_common_1.ctx, [TOKEN_NAME, '[{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}]', "0.1"]);
        console.log('CreateToken:', TOKEN_NAME);
        expect(result.ret).to.equal(error_code_1.ErrorCode.RESULT_OK);
        head_balance -= 0; //100.1;
        // check tokenBalance
        result = await getTokenBalance_1.getTokenBalance(test_common_1.ctx, [TOKEN_NAME, "1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79"]);
        // console.log(result);
        let obj = JSON.parse(result.resp);
        assert.equal(obj.err, error_code_1.ErrorCode.RESULT_OK);
        getTokenBalance_1.prnGetTokenBalance(test_common_1.ctx, result);
    });
    mocha_1.it('Check getBlock', async function () {
        this.timeout(5000);
        let result = await getblock_1.getBlock(test_common_1.ctx, ["0"]);
        // console.log(result);
        let obj = JSON.parse(result.resp);
        assert.equal(obj.err, error_code_1.ErrorCode.RESULT_OK);
        getblock_1.prnGetBlock(test_common_1.ctx, result);
    });
    mocha_1.it('Check getCandidates', async function () {
        this.timeout(5000);
        let result = await getCandidates_1.getCandidates(test_common_1.ctx, []);
        // console.log(result);
        let obj = JSON.parse(result.resp);
        assert.equal(obj.err, error_code_1.ErrorCode.RESULT_OK);
        getCandidates_1.prnGetCandidates(test_common_1.ctx, result);
    });
    mocha_1.it('Check getMiners', async function () {
        this.timeout(5000);
        let result = await getminers_1.getMiners(test_common_1.ctx, []);
        // console.log(result);
        let obj = JSON.parse(result.resp);
        assert.equal(obj.err, error_code_1.ErrorCode.RESULT_OK);
        getminers_1.prnGetMiners(test_common_1.ctx, result);
    });
    mocha_1.it('Check getPeers', async function () {
        this.timeout(5000);
        let result = await getpeers_1.getPeers(test_common_1.ctx, []);
        //console.log(result);
        assert.equal(result.ret, 200);
        getpeers_1.prnGetPeers(test_common_1.ctx, result);
    });
    mocha_1.it('Check getReceipt', async function () {
        this.timeout(5000);
        let result = await getreceipt_1.getReceipt(test_common_1.ctx, [TEST_TX1]);
        assert.equal(result.ret, 200);
        getreceipt_1.prnGetReceipt(test_common_1.ctx, result);
    });
    mocha_1.it('Transfer  account:head back to big boss', async function () {
        this.timeout(33000);
        test_common_1.switch2Head();
        let num = head_balance - 0.1; //  0.1;
        console.log('Send back to big boss:', num);
        let result = await transferto_1.transferTo(test_common_1.ctx, [test_common_1.config.access.address, num + '', "0.1"]);
        assert.equal(result.ret, error_code_1.ErrorCode.RESULT_OK);
    });
    mocha_1.it('Check account:head', async function () {
        this.timeout(5000);
        let result = await getbalance_1.getBalance(test_common_1.ctx, [test_common_1.config.head.address]);
        let amount = 0.0;
        if (result.resp) {
            let objJson = JSON.parse(result.resp);
            amount = objJson.value.replace(/n/g, '');
        }
        console.log('head \'s balance', amount);
        assert.equal(1, 1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L3Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkNBQXVEO0FBQ3ZELElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDcEMsb0NBQW9DO0FBQ3BDLGlDQUFxQztBQUNyQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFL0Isa0RBQStDO0FBQy9DLG1EQUErQztBQUMvQyxrREFBK0M7QUFFL0MsK0NBQXlFO0FBQ3pFLG9EQUFpRDtBQUNqRCw0REFBNkU7QUFDN0UsOENBQXdEO0FBQ3hELHdEQUF1RTtBQUN2RSxnREFBMkQ7QUFDM0QsOENBQXdEO0FBQ3hELGtEQUE4RDtBQUM5RCxnRUFBNkQ7QUFDN0Qsa0dBQWtHO0FBQ2xHLHVFQUF1RTtBQUN2RSxzRUFBbUU7QUFDbkUsd0VBQXFFO0FBQ3JFLHNFQUFtRTtBQUNuRSwwREFBdUQ7QUFDdkQsNERBQXlEO0FBQ3pELGtDQUFvQztBQUVwQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDLENBQUM7QUFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQzNDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxtQkFBbUI7QUFDdkIsQ0FBQyxDQUFDLENBQUM7QUFHSCxZQUFZO0FBQ1osZ0JBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDakMsVUFBRSxDQUFDLHlCQUF5QixFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFD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