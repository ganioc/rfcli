# Command Line Interface

## Change History
- 1.0.5 Modify package.scripts.preinstall
- 1.0.6 Add getBalance, getBlock
- 1.0.7 Add createToken, getMiners ...
- 1.0.8 Add vote, mortgage, unmortgage ...
- 1.0.9 upload ， modfity README
- 2.1.0 Update newest Wallet function

## dependency
- ES2017
- tsc, typescript compiler
- winston v2.4.2 , 去掉兼容性，想办法，新版本是v3.1.0

## install

```
// under directory, run
npm install 

```

## How to use?

```


// start cli
// create your keystore file with your secret
./rfccli --createKeyStore user.json

// login with your keystore file, with sever host and port
./rfccli --keyStore xxx.json --host xx.xx.xx.xx  --port 18089

// To unlock the secret, enter the code you created with the keystore file
// Otherwise you will not be able to do transfer ... functions, only viewing 
unlock

// get balance for default account
getBalance
// transfer 200 sys token to 16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg with fee 1 sys token
transferTo          16ZJ7mRgkWf4bMmQFoyLkqW8eUCA5JqTHg  1000   0.1
transferTo  12nD5LgUnLZDbyncFnoFB43YxhSFsERcgQ 20 1
transferTo  13dhmGDEuaoV7QvwbTm4gC6fx7CCRM7VkY  1000 1
transferTo  1NsES7YKm8ZbRE4K5LaPGKeSELVtAwzoTw  2000 1

//issue token with token name 'token2'
createToken token2 [{"address":"1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79","amount":"10000"}] 100 1

//get token2 balance for account
getTokenBalance token2 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79
transferTokenTo token2 1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4 10 1
getTokenBalance token2  1LuwjNj8wkqo237N7Gh8nZSSvUa6TZ5ds4
getBalance 1EYLLvMtXGeiBJ7AZ6KJRP2BdAQ2Bof79
getBalance 12nD5LgUnLZDbyncFnoFB43YxhSFsERcgQ
transferTo 


```

## Test

## known bugs

1. [DEP0025] DeprecationWarning: sys is deprecated. Use util instead.

/node_modules/sqlite3-transactions/sqlite3-transactions.js:1:73 需要将sys改成util



