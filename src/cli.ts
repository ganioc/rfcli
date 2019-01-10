#!/usr/bin/env node

/**
* Action according to arg input
*/


const main = () => {

    console.log("hello main -->");

    process.argv.forEach((val, index, array) => {
        console.log(index + ": " + val);
    });

    console.log("Let\'s do it!");
}

main();

