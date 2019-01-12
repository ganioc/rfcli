# Command Line Interface

## Change History
- 1.0.5 Modify package.scripts.preinstall

## dependency
- ES2017
- tsc, typescript compiler
- winston v2.4.2 , 去掉兼容性，想办法，新版本是v3.1.0

## How to use?

```

./dist/cli.js --secret 054898c1a167977bc42790a3064821a2a35a8aa53455b9b3659fb2e9562010f7 --host 40.73.100.56 --port 18089

$rfccli --secret 054898c1a167977bc42790a3064821a2a35a8aa53455b9b3659fb2e9562010f7 --host 40.73.100.56 --port 18089

```

## Test

## known bugs

1. [DEP0025] DeprecationWarning: sys is deprecated. Use util instead.

/node_modules/sqlite3-transactions/sqlite3-transactions.js:1:73 需要将sys改成util



