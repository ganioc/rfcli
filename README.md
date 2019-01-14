# Command Line Interface

## Change History
- 1.0.5 Modify package.scripts.preinstall
- 1.0.6 Add getBalance, getBlock
- 1.0.7 Add createToken, getMiners ...

## dependency
- ES2017
- tsc, typescript compiler
- winston v2.4.2 , 去掉兼容性，想办法，新版本是v3.1.0

## How to use?

```

./dist/cli.js --secret 054898c1a167977bc42790a3064821a2a35a8aa53455b9b3659fb2e9562010f7 --host 40.73.100.56 --port 18089

./dist/cli.js --secret 64d8284297f40dc7475b4e53eb72bc052b41bef62fecbd3d12c5e99b623cfc11 --host 40.73.100.56 --port 18089

$rfccli --secret 64d8284297f40dc7475b4e53eb72bc052b41bef62fecbd3d12c5e99b623cfc11 --host 40.73.100.56 --port 18089

transferTo  16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg 2000 1       
transferTo  12nD5LgUnLZDbyncFnoFB43YxhSFsERcgQ 20 1      

createtoken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}] 100 1
gettokenbalance token2 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79
transfertokento token2 1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4 10 1
gettokenbalance token2  1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4
```

## Test

## known bugs

1. [DEP0025] DeprecationWarning: sys is deprecated. Use util instead.

/node_modules/sqlite3-transactions/sqlite3-transactions.js:1:73 需要将sys改成util



