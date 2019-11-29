import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
import {
  init,
  //createFund,
  //investInFund,
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
    accountingAddress: '0x09dE8567E08b4388355Ed78464dF3AF854a35Bb5',
    feeManagerAddress: '0x4b551bD3b4C9c93aFA58a01Cb42EF04Cb583880f',
    participationAddress: '0xD3242FbBB3dc506E094708C073472D618A12adaE',
    policyManagerAddress: '0xcBD051827b5DCd213a54FC430A970Ea6C0361cFc',
    priceSourceAddress: '0x41C868910D4f74226e00a2120C69F82aB9dD9aCe',
    registryAddress: '0xeFf76D41dC71257f991F09a962ca54E06bb2bd03',
    sharesAddress: '0xe950a32229e5E1823966AAc76609a52484e4Fb2B',
    tradingAddress: '0x0Bb0735E6F6bAb7BF8DBdE3Ce1A772F79D19Bc32',
    vaultAddress: '0xDBd9C74A356825b272Be5877243a0562162Ea277',
    versionAddress: '0x5A84Da62fe32cFA4659776D3CC811067047273B7',
    hubAddress: '0x67792D22c3E5f250142fe192C41502e2EE2E68Ce',
  };
  //await createFund(environment, 'Fund');
  environment.routes = routes;
  //nvest into a fund.
  //const invested = await investInFund(environment, 'WETH', 0.00005);
  //donateOnExchange :)
  const don = await donateGiveth(environment, 'WETH', 0.000004);

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
    expect(donatedGiveth);
  });
});
/*
first new kovan deploy
  {
    accountingAddress: '0x4adc074E0047A729e4c713ae43a0Fa06190A5488',
    feeManagerAddress: '0xC08dbeca66f2FBdAEa99cF72F5aE96cF5C0E74aa',
    participationAddress: '0x73f317D19bdDD2347801a6b1dF45a007298dA8c5',
    policyManagerAddress: '0x91936AF5d0f084Cd0fc4628Bd6E92b36ecCb1885',
    priceSourceAddress: '0x405E4d5F8A225489a68f787595C3517591aCa4E5',
    registryAddress: '0x68E2Dd512A534fcc89a18E7e2979CF235d5f465A',
    sharesAddress: '0x965Fa8a8B5bDCaD36df3263E4681C8143b7Eaee7',
    tradingAddress: '0xF2d4D5f613162A997cCd4CEDA48Cb154C4b59080',
    vaultAddress: '0xd2dF36BF66909F5164a1FF08459f5d5f35759574',
    versionAddress: '0x3B709Aa9F343419E894b1E1eC1cD7AE4dfDaf677',
    hubAddress: '0x4b75ada851142B845b18170BeD3Fa11B3C47D6e2',
  };*/
