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

//To use just this testfile set the 8th line of ./jest.setup.js to:
//  testRegex: '((\\giveth.|/)(systest))\\.(js|ts)$', //To test single files change here.

export const firstTest = async (environment, testReport) => {
  //Donate ERC20 token directly via adapter, no fund needed...(not possible from fund.)
  const successERC = await donateGivethAdapter(
    environment,
    'WETH',
    0.000006789,
  );
  testReport('Donated Asset from', environment.wallet.address);

  //const succsessETH = await donateGivethAdapterETH(environment, 0.00345);
  //TODO:Adapter accesible and new eth donateFunction
  return successERC; // && succsessETH;
};

export const scndTest = async (environment, testReport) => {
  //Create a fund.
  const routes = await createFund(environment, 'Fund');
  environment.routes = routes;
  //Invest into a fund.
  const invested = await investInFund(environment, 'WETH', 0.120006789);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.01);

  await donateGiveth(environment, 'WETH', 0.0000001);
  await donateGiveth(environment, 'WETH', 0.0099999);
  await donateGiveth(environment, 'WETH', 0.000006789);

  return don && invested;
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

    const donatedAdapter = await firstTest(environment, testReport);
    expect(donatedAdapter);

    const donatedGiveth = await scndTest(environment, testReport);
    expect(donatedGiveth);
  });
});
