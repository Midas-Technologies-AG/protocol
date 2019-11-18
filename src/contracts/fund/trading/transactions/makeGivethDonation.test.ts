import { Environment } from '~/utils/environment/Environment';
import { deployAndInitTestEnv } from '~/tests/utils/deployAndInitTestEnv';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { createQuantity } from '@melonproject/token-math';
import { makeGivethDonation } from './makeGivethDonation';
import { setupInvestedTestFund } from '~/tests/utils/setupInvestedTestFund';

describe('makeGivethDonation', () => {
  const shared: {
    env?: Environment;
    [p: string]: any;
  } = {};

  beforeAll(async () => {
    shared.env = await deployAndInitTestEnv();
    shared.accounts = await shared.env.eth.getAccounts();
    shared.routes = await setupInvestedTestFund(shared.env);
    shared.env.logger('First Step Done.');

    shared.mln = await getTokenBySymbol(shared.env, 'MLN');
    shared.weth = await getTokenBySymbol(shared.env, 'WETH');
  });

  it('make givethBridge donation', async () => {
    const makerQuantity = await createQuantity(shared.weth, 0.05);

    //await increaseTime(shared.env, 60 * 30);

    const donation = await makeGivethDonation(
      shared.env,
      shared.routes.tradingAddress,
      {
        makerQuantity,
      },
    );
    console.log('This is the donation:', donation);
  });
});
