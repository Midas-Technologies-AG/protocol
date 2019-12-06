import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  //createFund,
  investInFund,
  //updateGivethAdapter,
  //donateGivethAdapterETH,
  donateGivethAdapter,
} from '~/tests/utils/givethTestingUtils';
import { donateGiveth } from '~/contracts/fund/trading/transactions/donateGiveth';
import { allLogsWritten } from '../utils/testLogger';
//import { updateKyber } from '~/contracts/prices/transactions/updateKyber';

//To use just this testfile set the 8th line of ./jest.setup.js to:
//  testRegex: '((\\giveth.|/)(systest))\\.(js|ts)$', //To test single files change here.

export const firstTest = async (environment, testReport) => {
  //Donate ERC20 token directly via adapter, no fund needed...(not possible from fund.)
  await donateGivethAdapter(environment, 'DAI', 100);
  await donateGivethAdapter(environment, 'WETH', 0.01);
  testReport('Donated Asset from', environment.wallet.address);

  //const succsessETH = await donateGivethAdapterETH(environment, 0.00345);
  //TODO:Adapter accesible and new eth donateFunction
  return true;
};

export const scndTest = async (environment, testReport) => {
  //Create a fund.
  const routes = {
    accountingAddress: '0x6af711b0e1Fb32B135424212c429f8c7f2Fb2EAE',
    feeManagerAddress: '0x12eFDd4b9325B87053946E4f128C7f4FA280e154',
    participationAddress: '0x5d15ff7563E24C5e40f6B7bFb74E0C96c5f59B0A',
    policyManagerAddress: '0x34aD336142B5da0867ff84753a661A18F1872c14',
    priceSourceAddress: '0xAdcE960EDb2f14A15A43B964C4a59C29D733d488',
    registryAddress: '0x1A974941552b38f1515BFfb4cBAb51A9d2a3a409',
    sharesAddress: '0xD8E42C889a30E4ba41F07AFD320287a924b7822C',
    tradingAddress: '0xc067CFF01426492792Fa0a96A1DCE27AAfb85BFB',
    vaultAddress: '0xD897a881a26079a1c300a3a09D52970f93c178EE',
    versionAddress: '0x5ce0f72370C8B6Db85F947Fd3Cb0e34b33d1aC42',
    hubAddress: '0x92854152d46FeC4bf7456A04f8F978Ae5549368B',
  };
  //await createFund(environment, 'Fund1');
  environment.routes = routes;
  //Invest into a fund.
  await investInFund(environment, 'WETH', 0.0004321);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  await donateGiveth(environment, 'WETH', 0.0001);
  await donateGiveth(environment, 'WETH', 0.00011);
  await donateGiveth(environment, 'WETH', 0.000111);
  await donateGiveth(environment, 'WETH', 0.0001111);

  return true;
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
    /*    await updateKyber(
      environment,
      environment.deployment.melonContracts.priceSource,
    );*/
    //const donatedAdapter = await firstTest(environment, testReport);

    const donatedGiveth = await scndTest(environment, testReport);
    expect(donatedGiveth);
  });
});
