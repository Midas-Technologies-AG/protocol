import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  //createFund,
  investInFund,
  //updateGivethAdapter,
  donateGivethAdapterETH,
  donateGivethAdapter,
  donateGiveth,
} from '~/tests/utils/giveth';
import { allLogsWritten } from '../utils/testLogger';

export const firstTest = async (environment, testReport) => {
  //Donate ERC20 token.
  const successERC = await donateGivethAdapter(
    environment,
    'WETH',
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    18,
    0.00002,
  );
  testReport('Donated Asset from', environment.wallet.address);

  const succsessETH = await donateGivethAdapterETH(environment, 0.00001);
  return successERC && succsessETH;
};

export const scndTest = async (environment, testReport) => {
  //Create a fund.
  const routes = {
    accountingAddress: '0xD444261F46c65438C5142FdFCB24D0E5e1837505',
    feeManagerAddress: '0x63FF1cd96AF8E999f5308B072847Fd9053a81003',
    participationAddress: '0x64FCb11E5c53296B83863d13Dc5013AF6F6d07F4',
    policyManagerAddress: '0xDf9386451cC10267d09EF9Ad3d94b6e7FbEBAAF5',
    priceSourceAddress: '0x24D1E7de725a1945CfDAD0e353522bd37Ef9c86b',
    registryAddress: '0x65fc21E1b6F377EE5E84a415695c450Cb43C4C80',
    sharesAddress: '0x92b2df7535eb5b5eceFF36fd3d9E72Ca0B1EeCe2',
    tradingAddress: '0x9452D3D86fb38262f1e486a212a10A35B6D68540',
    vaultAddress: '0x5339Cc89d86B4Af8B67D9A52545E0DE3b141827F',
    versionAddress: '0x4f4077Bbc721795c23F1948E57Bce7421E7d4AD4',
    hubAddress: '0x988358446D2E003F7d81d4A4a2031fb2D65a5be8',
  }; //await createFund(environment, 'Fund');
  environment.routes = routes;
  //Invest into a fund.
  const invested = await investInFund(environment, 'WETH', 0.123);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.123);

  return invested && don;
};

// start Tests
expect.extend({ toBeTrueWith });
describe('playground', () => {
  afterAll(async () => {
    await allLogsWritten();
  });
  test('Happy path', async () => {
    //Create Environment.
    const environment = await init('deployments/kovan-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');
    /*    const donatedAdapter = await firstTest(environment, testReport);
    expect(donatedAdapter);*/

    const donatedGiveth = await scndTest(environment, testReport);

    expect(donatedGiveth);
  });
});
