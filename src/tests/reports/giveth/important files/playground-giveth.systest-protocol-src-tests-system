import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  createFund,
  investInFund,
  //updateGivethAdapter,
  donateGivethAdapterETH,
  donateGivethAdapter,
  donateGiveth,
} from '~/tests/utils/givethTestingUtils';
import { allLogsWritten } from '../utils/testLogger';

//To use just this testfile set the 8th line of ./jest.setup.js to:
//  testRegex: '((\\giveth.|/)(systest))\\.(js|ts)$', //To test single files change here.

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

  const succsessETH = await donateGivethAdapterETH(environment, 0.00345);
  return successERC && succsessETH;
};

export const scndTest = async (environment, testReport) => {
  //Create a fund.
  const routes = await createFund(environment, 'Fund');
  environment.routes = routes;
  //Invest into a fund.
  const invested = await investInFund(environment, 'WETH', 0.3);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.120006789);

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
    //const donatedGiveth = await createFund(environment, 'Fund');
    expect(donatedGiveth);
  });
});
