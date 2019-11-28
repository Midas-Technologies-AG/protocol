import { toBeTrueWith } from '../utils/toBeTrueWith';
import { LogLevels } from '~/utils/environment/Environment';
//import { donateOnExchange } from '~/contracts/fund/trading/transactions/donateOnExchange';
import {
  init,
  createFund,
  donateGivethAdapterETH,
  donateGivethAdapter,
} from '~/tests/utils/giveth';

const firstTest = async () => {
  //Create Environment.
  const environment = await init('deployments/development-kyberPrice.json');
  const testReport = environment.logger(
    'Midas-Technologies-AG/protocol:test-givethModule:',
    LogLevels.INFO,
  );
  testReport('Created environment and init testLogger.');

  //Donate ERC20 token.
  const successERC = await donateGivethAdapter(
    environment,
    environment.deployment.melonContracts.adapters.givethBridgeAdapter,
    'WETH',
    '0x0De667F576E787562707A9565245417875070577',
    18,
    0.0002,
  );
  testReport('Donated Asset from', environment.wallet.address);

  const succsessETH = await donateGivethAdapterETH(environment, 0.0001);

  return successERC && succsessETH;
};

const scndTest = async () => {
  //Create Environment.
  const environment = await init('deployments/development-kyberPrice.json');
  const testReport = environment.logger(
    'Midas-Technologies-AG/protocol:test-givethModule:',
    LogLevels.INFO,
  );
  testReport('Created environment and init testLogger.');
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
    expect(firstTest());
    expect(scndTest());
  });
});
