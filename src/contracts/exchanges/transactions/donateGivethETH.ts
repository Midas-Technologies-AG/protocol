import { QuantityInterface } from '@melonproject/token-math';

import { Environment } from '~/utils/environment/Environment';
import { sendEth } from '~/utils/evm/sendEth';
import { Contracts } from '~/Contracts';

interface DonateGivethETHArgs {
  howMuch: QuantityInterface;
}

const donateGivethETH = async (
  environment: Environment,
  { howMuch }: DonateGivethETHArgs,
): Promise<void> => {
  const args = {
    to: Contracts.GivethAdapter,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethETH ${error.message}`);
  }
};

export { donateGivethETH };
