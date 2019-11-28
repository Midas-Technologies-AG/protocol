import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  createFund,
  donateGivethAdapterETH,
  donateGivethAdapter,
} from '~/tests/utils/giveth';

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

const scndTest = async (environment, testReport) => {
  //Create a fund.
  const fund = await createFund(environment, 'Test Fund');
  testReport('Created fund:', fund);

  //TODO: invest properly into a fund.
  //TODO: Try donateOnExchange :)
  return true;
};

// start Tests
expect.extend({ toBeTrueWith });
describe('playground', () => {
  test('Happy path', async () => {
    //Create Environment.
    const environment = await init('deployments/kovan-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');

    //    const donatedAdapter = await firstTest(environment, testReport);
    //    expect(donatedAdapter);

    const donatedGiveth = await scndTest(environment, testReport);
    expect(donatedGiveth);
  });
});
