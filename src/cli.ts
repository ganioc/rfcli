#!/usr/bin/env node

/**
* Action according to arg input
*/
import * as readline from 'readline';
import * as process from 'process';
import * as colors from 'colors';

let keyin = readline.createInterface(process.stdin, process.stdout);

const VERSION = '0.1';
const PROMPT = '> ';

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
    console.log('\trfccli [options] command [command options] [arguments ...]');
    console.log('');
    console.log('VERSION:')
    console.log('\t', VERSION);
    console.log('');
};
let printHelp = () => {
    printHelpHeader();
    console.log('COMMANDS:');
    console.log('\t%s - %s', 'help', '帮助');
    console.log('');
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
    console.log(colors.green('-'.repeat(80)));
    console.log('');

    process.argv.forEach((val, index, array) => {
        console.log(index + ": " + val);
    });
}

initArgs();

let handleCmd = (cmd: string) => {


    switch (cmd) {
        case 'help':
            printHelp();
            break;
        case 'exit':
            console.log('Bye\n');
            process.exit(0);
            break;
        case 'q':
            console.log('Bye\n');
            process.exit(0);
            break;

        case '':
            break;
        default:
            console.log(cmd);
            process.stdout.write('Unknown cmds');
            break;
    }

    console.log('');
    showPrompt();
};


keyin.on('line', (cmd: string) => {
    handleCmd(cmd);
})

showPrompt();
