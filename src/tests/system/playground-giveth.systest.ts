import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  createFund,
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
  await donateGivethAdapter(environment, 'WETH', 0.0055);
  testReport('Donated Asset from', environment.wallet.address);
  //TODO:Adapter accesible and new eth donateFunction
  return true;
};

export const scndTest = async (environment, testReport) => {
  //Create a fund.
  const routes = await createFund(environment, 'Fund1');
  environment.routes = routes;
  //Invest into a fund.
  await investInFund(environment, 'WETH', 0.043214321);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  await donateGiveth(environment, 410, 'WETH', 0.01);
  await donateGiveth(environment, 410, 'WETH', 0.011);
  await donateGiveth(environment, 410, 'WETH', 0.0111);
  await donateGiveth(environment, 410, 'WETH', 0.01111);
  await donateGiveth(environment, 410, 'WETH', 0.000001);
  await donateGiveth(environment, 410, 'WETH', 0.0000011);
  await donateGiveth(environment, 410, 'WETH', 0.00000111);
  await donateGiveth(environment, 410, 'WETH', 0.000001111);

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
    const environment = await init('deployments/ropsten-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');
    /*    await updateKyber(
      environment,
      environment.deployment.melonContracts.priceSource,
    );*/
    await firstTest(environment, testReport);
    await createFund(environment, 'dAppFund');
    //await scndTest(environment, testReport);
    expect(true);
  });
});
