import { QuantityInterface } from '@melonproject/token-math';

import { Environment } from '~/utils/environment/Environment';
import { sendEth } from '~/utils/evm/sendEth';
import { Contracts } from '~/Contracts';

interface DonateGivethBridgeETHArgs {
  howMuch: QuantityInterface;
}

const donateGivethBridgeETH = async (
  environment: Environment,
  { howMuch }: DonateGivethBridgeETHArgs,
): Promise<void> => {
  const args = {
    to: Contracts.GivethBridgeAdapter,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethBridgeETH ${error.message}`);
  }
};

export { donateGivethBridgeETH };
