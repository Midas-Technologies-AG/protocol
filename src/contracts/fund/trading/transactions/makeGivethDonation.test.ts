import { Environment } from '~/utils/environment/Environment';
import { deployAndInitTestEnv } from '~/tests/utils/deployAndInitTestEnv';
import { Exchanges } from '~/Contracts';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { createQuantity, isEqual } from '@melonproject/token-math';
import { makeGivethDonation } from './makeGivethDonation';
import { setupInvestedTestFund } from '~/tests/utils/setupInvestedTestFund';
import { increaseTime } from '~/utils/evm/increaseTime';

describe('makeGivethDonation', () => {
  const shared: {
    env?: Environment;
    [p: string]: any;
  } = {};

  beforeAll(async () => {
    shared.env = await deployAndInitTestEnv();
    shared.accounts = await shared.env.eth.getAccounts();
    shared.routes = await setupInvestedTestFund(shared.env);

    shared.givethBridge =
      shared.env.deployment.exchangeConfigs[Exchanges.GivethBridge].exchange;

    shared.mln = getTokenBySymbol(shared.env, 'MLN');
    shared.weth = getTokenBySymbol(shared.env, 'WETH');
  });

  it('make givethBridge donation', async () => {
    const makerQuantity = createQuantity(shared.weth, 0.05);

    await increaseTime(shared.env, 60 * 30);

    // Now it should work again
    const donation = await makeGivethDonation(
      shared.env,
      shared.routes.tradingAddress,
      {
        makerQuantity,
      },
    );
  });
});
