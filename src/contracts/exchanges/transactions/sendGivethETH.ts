import { QuantityInterface } from '@melonproject/token-math';
import { Environment } from '~/utils/environment/Environment';
import { sendEth } from '~/utils/evm/sendEth';
import { Contracts } from '~/Contracts';

interface SendGivethETHArgs {
  howMuch: QuantityInterface;
}

const sendGivethETH = async (
  environment: Environment,
  { howMuch }: SendGivethETHArgs,
): Promise<void> => {
  const args = {
    to: Contracts.GivethBridgeAdapter,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethETH ${error.message}`);
  }
};

export { sendGivethETH };
