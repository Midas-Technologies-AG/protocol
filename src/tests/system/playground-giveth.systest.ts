import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  //createFund,
  //investInFund,
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
    accountingAddress: '0x736193bCD39379995A0d0B4305Db3eB26E38c9E8',
    feeManagerAddress: '0x8510c4902364658E042B975CfB50C010bCC59c9b',
    participationAddress: '0xcf87C30e604fEc92579537a7BB2c1159a9A2fD30',
    policyManagerAddress: '0x989Be0A69379BE366A35a5e2cb08F71e49bb457a',
    priceSourceAddress: '0x874dACf6F1D3Bf85353e5279C66526B16eb5Bcd6',
    registryAddress: '0xd8876425AA6473a01a0A4637F8C9e9fd12fEbC0A',
    sharesAddress: '0xa994A1D94a9715ec5344471d8e5aF9EA8D77698b',
    tradingAddress: '0x1D01211D40e05b39aF69845434eE6A136eA30dC8',
    vaultAddress: '0x134Dabc0fCAF1D4595646Dda51BAB3Fb0f39d390',
    versionAddress: '0x5612d45E37018Ac5BD6250A80EdC836D2Af116Fb',
    hubAddress: '0xceBbFdb51C13cd4c9f2c26A72De12f3Cd85191D1',
  };

  //await createFund(environment, 'Fund');
  environment.routes = routes;
  //Invest into a fund.
  //const invested = await investInFund(environment, 'WETH', 1);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.07);

  return don;
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
    //const donatedGiveth = await createFund(environment, 'Fund');
    expect(donatedGiveth);
  });
});
