import { initTestEnv } from '~/contracts/fund/trading/utils/initTestEnv';

import { LogLevels } from '~/utils/environment/Environment';
import { updateKyber } from '~/contracts/prices/transactions/updateKyber';

let shared: any = {};
shared.args = {
  deployment: 'deployments/ropsten-kyberPrice.json',
  amount: 5,
};

beforeAll(async () => {
  //Create Environment with PRIVATE_KEY and JSON_RPC_ENDPOINT.
  shared.env = await initTestEnv(shared.args.deployment);
  shared.testReport = shared.env.logger(
    'Midas-Technologies-AG/protocol:test-givethcallOnExchange:',
    LogLevels.INFO,
  );
  shared.testReport('Created environment and init testLogger.');
});

test('Giveth Module Test', async () => {
  const check = await updateKyber(
    shared.env,
    shared.env.deployment.melonContracts.priceSource,
  );
  expect(check);
  shared.testReport('Done.');
});
