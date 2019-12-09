# Giveth Module for Melon Protocol

This Repository is forked from @melonproject/protocol and is for now on version v1.0.0 unpublished as npm-package.

This branch is successfull running on Kovan TESTNET.

## Setup

You need `yarn` and `typescript` installed.

1. Run `yarn install` after clone and cd into the directory.

This often fails because of different reasons. Mostly it worked with first `npm install`, fixing those errors, and then `yarn install` should work.

2. `yarn compile`, compiles all the solidity files via `solc`.

3. `yarn build`, creates a node app usable javascript framework of the typescript functions.

Now you are ready to make some decisions.

- Which chain do you want to use?
- Do you have an etherbacked address, and the matching private key?
- Do you want to redeploy, or use a running system...

Check out the scripts in `package.json` to see, what and how you can use this protocol.

## Test

1. Set the env vars `JSON_RPC_ENDPOINT=...` and `PRIVATE_KEY=...` to use
2. `yarn test:system` which creates a fund and invest into it and last but not least donates tokens to a givethDAC.

## Report

For further and deeper understanding read the following pdf, `src/tests/reports/giveth/givethModuleReport.pdf`.

## TODOs

1. Publish and run via npm i @Midas-Technologies-AG/protocol.
2. Further and deeper integration into the policy system ec. of the melonprotocol.
3. Redeploy of GivethBridge with ` checkWhitelisted(address _token) public view... `.

cheers!
