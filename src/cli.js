#!/usr/bin/env node

'use strict';

/**
* Action according to arg input
*/


function main(arg){

    console.log("hello main -->");

    process.argv.forEach(function(val, index, array){
	console.log(index + ": " + val);
    });

    console.log("Let\'s do it!");
}

main();


