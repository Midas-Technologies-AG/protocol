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
    accountingAddress: '0x935E50DE7428060BBF309eFb0568Bd15E322782f',
    feeManagerAddress: '0x8cebD94D9F2EC957B2290484149d44F071A141be',
    participationAddress: '0xEf8F4AcE98F20863B215F3d93bCd208435260C9b',
    policyManagerAddress: '0xc1eD32D9F2834AD654895c0f384A7650AF7CA839',
    priceSourceAddress: '0x00881ccB557F7BC86B03a5A4D4297722A2dbFE1b',
    registryAddress: '0x9BD1B343eb6089F5B3E545C00c9e1F25EdB2d1A8',
    sharesAddress: '0xF1A13B9FEEd8e138370324260e4d2bc2b028976d',
    tradingAddress: '0x1fe6B1AA1A6C8389EBB00dC8CCFFEd5c293EAb0A',
    vaultAddress: '0x5B6237C03E615E548810a66980c173A045508d18',
    versionAddress: '0x61A4793838F55A41FAbcc7B2FB491214309CA544',
    hubAddress: '0xA9d400FF77D3afEf6B08d093A6957D768d30ed00',
  };

  //await createFund(environment, 'Fund');
  environment.routes = routes;
  //Invest into a fund.
  //const invested = await investInFund(environment, 'WETH', 1.0);
  // register makeDonation function for givethAdapter
  //const reg = await updateGivethAdapter(environment);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.044);

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
