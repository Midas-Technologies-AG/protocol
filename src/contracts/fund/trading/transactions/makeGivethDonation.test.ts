import { initTestEnv } from '~/contracts/fund/trading/utils/initTestEnv';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { invest } from '~/contracts/fund/trading/utils/invest';
import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';
import { donateG } from '~/contracts/fund/trading/transactions/makeGivethDonation';

import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { LogLevels } from '~/utils/environment/Environment';

let shared: any = {};
shared.args = {
  tokenSymbol: 'WETH',
  amount: 0.0001, //TODO: there have been 0.01 eth send...https://kovan.etherscan.io/tx/0x50983879b7ef9ff63f190224145a708008538e03dc6579017a28c1842c02d8a3
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
  shared.env.routes = await setupFund(shared.env, 'Test Fund');
  shared.testReport(
    'Fund-creation was successfull, routes:',
    shared.env.routes,
  );

  //Invest in Fund.
  shared.fundHoldings = await invest(
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
  shared.testReport('whitelisting on givethBridge:', shared.whitelisted);
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
