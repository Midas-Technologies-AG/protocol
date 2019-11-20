import { initTestEnv } from '~/contracts/fund/trading/utils/initTestEnv';
//import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';
import { donateG2 } from '~/contracts/fund/trading/transactions/makeGivethDonation2';

import { createQuantity } from '@melonproject/token-math';
import { transfer } from '~/contracts/dependencies/token/transactions/transfer';
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
  // shared.env.routes = await setupFund(shared.env, 'Test Fund without Invest2');
  // shared.testReport(
  //   'Fund-creation was successfull, routes:',
  //   shared.env.routes,
  // );
  shared.env.routes = {
    accountingAddress: '0xF887d426a0Cf5b96306917E5AB56fa6a7016eA1c',
    feeManagerAddress: '0x088864E34695A578bF319D639054B318b839b54A',
    participationAddress: '0xa5B3F00779fB8421d8FA9cE87298A856c06436ac',
    policyManagerAddress: '0x1ec8108346498ed9893EBf0a444f50265Aaa55Be',
    priceSourceAddress: '0x263F6CC2E2F3842EDfEc90832fCF1E140E81aBBb',
    registryAddress: '0x7E393D36842020752D809AE5434A689d7F46DaE8',
    sharesAddress: '0xb2061c670800f69861953D8E6E2d2C45ca3D171C',
    tradingAddress: '0xf8669aa95945385fad923448686C4edb6b42500A',
    vaultAddress: '0xf7BB154653E40163D6952cF24c8E5b9cBC68d812',
    versionAddress: '0x2dfaeAf6fFF650a8E0e4724A6C82987f4DB7DfF7',
    hubAddress: '0xc6DD0a9f1d1Dd42D025121e6EcBAC4a27420C778',
  };

  //Invest in Fund.
  const token = await getTokenBySymbol(shared.env, shared.args.tokenSymbol);
  const makerQuantity = await createQuantity(token, shared.args.amount);

  await transfer(shared.env, {
    to: shared.env.routes.vaultAddress,
    howMuch: makerQuantity,
  });
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
  const result = await donateG2(
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
