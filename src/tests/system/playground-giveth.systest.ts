import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  createFund,
  donateGivethAdapterETH,
  donateGivethAdapter,
} from '~/tests/utils/giveth';
import { allLogsWritten } from '../utils/testLogger';
import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';

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
  await createFund(environment, 'Fund');

  //TODO: invest properly into a fund.
  //TODO: Try donateOnExchange :)
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

    const routes = await getRoutes(
      environment,
      '0x25Fd21483bD8030a0A436c4fc6fD89F3B5a7F9a1',
    );
    testReport('Routes:', routes);

    //    const donatedAdapter = await firstTest(environment, testReport);
    //    expect(donatedAdapter);

    //    const donatedGiveth = await scndTest(environment, testReport);
    //    expect(donatedGiveth);
  });
});
