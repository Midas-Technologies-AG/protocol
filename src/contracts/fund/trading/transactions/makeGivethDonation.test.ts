import { initTestEnv } from '~/contracts/fund/trading/utils/initTestEnv';
//import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { invest } from '~/contracts/fund/trading/utils/invest';
import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';
import { donateG } from '~/contracts/fund/trading/transactions/makeGivethDonation';

import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { LogLevels } from '~/utils/environment/Environment';

let shared: any = {};
shared.args = {
  tokenSymbol: 'WETH',
  amount: 0.001, //TODO: there have been 0.01 eth send...https://kovan.etherscan.io/tx/0x50983879b7ef9ff63f190224145a708008538e03dc6579017a28c1842c02d8a3
  deployment: 'deployments/kovan-kyberPrice.json',
};

beforeAll(async () => {
  //Create Environment with PRIVATE_KEY and JSON_RPC_ENDPOINT.
  shared.env = await initTestEnv(shared.args.deployment);
  shared.testReport = shared.env.logger(
    'Midas-Technologies-AG/protocol:test-givethModule:',
    LogLevels.INFO,
  );
  shared.testReport('Created environment and init testLogger.');

  //Create a fund.
  shared.env.routes = {
    accountingAddress: '0x6B1fc7c9d7E4412917A67Ee6F4157A3cb68f728e',
    feeManagerAddress: '0x27721AAc2fc8e4783360b136Fd916A6ca37f1Ecb',
    participationAddress: '0x89A6C5946973B3DbA38b38187ed27873b19fB4ec',
    policyManagerAddress: '0x6CbdafBC9659afCce4a5E524b24Fc4f4edF1492f',
    priceSourceAddress: '0x697A0BB425C7BCc1ed6773DbC1FbD42606dE9AFC',
    registryAddress: '0x152d77ED1e4Aef20D59Eb3A023e1ED657F97036A',
    sharesAddress: '0x397cBf1225487AC22B5E4d766c4e804162B30F46',
    tradingAddress: '0x27cFE1d15675345F99EAed713B5Ff27Cc5610D50',
    vaultAddress: '0xCD79997274aCC385C96faC8a2a64b9ffEC6B6d1b',
    versionAddress: '0xf5D0AA1F36Fd98c129AC4aEaD1676d29D9B2e27E',
    hubAddress: '0x185E5414D11254937fa570e861f676E072d9f4Ca',
  };
  /*await setupFund(shared.env, 'Test');
  shared.testReport(
    'Fund-creation was successfull, routes:',
    shared.env.routes,
  );*/

  //Invest in Fund.
  /*  shared.fundHoldings = await invest(
    shared.env,
    shared.args.tokenSymbol,
    shared.args.amount,
  );
  shared.testReport('invest in Fund successfull:', shared.fundHoldings);

  //@notice whitelist the token on the givethBridge.
  shared.whitelisted = await whitelistToken(
    shared.env,
    shared.env.deployment.thirdPartyContracts.exchanges.givethBridge.toString(),
    {
      tokenAddress: await getTokenBySymbol(shared.env, shared.args.tokenSymbol)
        .address,
    },
  );
  shared.testReport('whitelisting on givethBridge:', shared.whitelisted);*/
});

test('Giveth Module Test', async () => {
  shared.testReport('start donateG function...');
  const result = await donateG(
    shared.env,
    shared.args.tokenSymbol,
    shared.args.amount,
  );
  shared.testReport('Successfully donated via donateG:', result);
  expect(result.howMuch.quantity).toEqual(shared.args.amount);
  expect(result.tokenAddress.toString()).toEqual(
    await getTokenBySymbol(
      shared.env,
      shared.args.tokenSymbol,
    ).address.toString(),
  );
});
