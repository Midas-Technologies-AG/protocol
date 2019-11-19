import { initTestEnv } from '~/contracts/fund/trading/utils/initTestEnv';
//import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
//import { invest } from '~/contracts/fund/trading/utils/invest';
//import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';
import { donateG } from '~/contracts/fund/trading/transactions/makeGivethDonation';

import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { LogLevels } from '~/utils/environment/Environment';

let shared: any = {};
shared.args = {
  tokenSymbol: 'WETH',
  amount: 0.001, //TODO: there have been 0.01 eth send...https://kovan.etherscan.io/tx/0x50983879b7ef9ff63f190224145a708008538e03dc6579017a28c1842c02d8a3
};

beforeAll(async () => {
  //Create Environment with PRIVATE_KEY and JSON_RPC_ENDPOINT.
  shared.env = await initTestEnv('deployments/kovan-kyberPrice.json');
  shared.testReport = shared.env.logger(
    'Midas-Technologies-AG/protocol:test-givethModule:',
    LogLevels.INFO,
  );
  shared.testReport('Created environment and init testLogger.');

  //Create a fund.
  /*  shared.env.routes = await setupFund(shared.env, 'Test Fund');
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
  shared.testReport('whitelisting on givethBridge:', shared.whitelisted);*/

  shared.env.routes = {
    accountingAddress: '0xfA0E830317F8277D1A31476191C65AB2482a00d2',
    feeManagerAddress: '0xC639e21382720Ca22F3C5B77AA4697ef536eF83B',
    participationAddress: '0x03ef051814197db36FDf9D152362316186c8F95a',
    policyManagerAddress: '0x8eaeE0A8d93b182313725D745cDC81273bDde831',
    priceSourceAddress: '0x15bE368853e1f51CCBDdC588383375c31112c2EE',
    registryAddress: '0xe7A95263018f1dBB662C0B85Dc86f2Eb5aD80cAB',
    sharesAddress: '0xc740c7837b4c680c984B4D460d46229d7c441391',
    tradingAddress: '0xc5567BFdF36e3895e39E4520959D468762cF8420',
    vaultAddress: '0xe75AFd39D27890A3F328f0E63F04Ad47A2eB8Fb1',
    versionAddress: '0xB7443EA9a38BD4d143e0F17fa6AF2867E39A5885',
    hubAddress: '0x8bbFa063370413A08a0f6AE9a3523AD52e809352',
  };
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
