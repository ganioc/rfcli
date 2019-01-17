# Command Line Interface

## Change History
- 1.0.5 Modify package.scripts.preinstall
- 1.0.6 Add getBalance, getBlock
- 1.0.7 Add createToken, getMiners ...
- 1.0.8 Add vote, mortgage, unmortgage ...

## dependency
- ES2017
- tsc, typescript compiler
- winston v2.4.2 , 去掉兼容性，想办法，新版本是v3.1.0

## How to use?

```

./dist/cli.js --secret 054898c1a167977bc42790a3064821a2a35a8aa53455b9b3659fb2e9562010f7 --host 40.73.100.56 --port 18089

./dist/cli.js --secret 64d8284297f40dc7475b4e53eb72bc052b41bef62fecbd3d12c5e99b623cfc11 --host 40.73.100.56 --port 18089

$rfccli --secret 64d8284297f40dc7475b4e53eb72bc052b41bef62fecbd3d12c5e99b623cfc11 --host 40.73.100.56 --port 18089

// No 9
13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY
9832ef4c12abdee85290a5fe709f426a8081899346406e21ca70fad259b66f8e
./dist/cli.js --secret 9832ef4c12abdee85290a5fe709f426a8081899346406e21ca70fad259b66f8e --host 40.73.100.56 --port 18089
mortgage 500 1
getbalance 13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY

// No 10
1NsES7YKm8ZbRE4K5LaPGKeSELVtAwzoTw
add099cc7a530f73530d94824c83f69c1a555d43c6b3d9b74ba76d2f64d4509d
./dist/cli.js --secret add099cc7a530f73530d94824c83f69c1a555d43c6b3d9b74ba76d2f64d4509d --host 40.73.100.56 --port 18089

transferTo  16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg 2000 1       
transferTo  12nD5LgUnLZDbyncFnoFB43YxhSFsERcgQ 20 1      
transferTo  13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY  1000 1
transferTo  1NsES7YKm8ZbRE4K5LaPGKeSELVtAwzoTw  2000 1 

createtoken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}] 100 1
gettokenbalance token2 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79
transfertokento token2 1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4 10 1
gettokenbalance token2  1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4
getbalance 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79


```

## Test

## known bugs

1. [DEP0025] DeprecationWarning: sys is deprecated. Use util instead.

/node_modules/sqlite3-transactions/sqlite3-transactions.js:1:73 需要将sys改成util



