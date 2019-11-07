import {
  QuantityInterface,
  TokenInterface,
  isToken,
  hasAddress,
  display,
} from '@melonproject/token-math';

import { Environment } from '~/utils/environment/Environment';
import { ensure } from '~/utils/guards/ensure';
import { Contracts } from '~/Contracts';
import {
  transactionFactory,
  EnhancedExecute,
  PrepareArgsFunction,
  GuardFunction,
} from '~/utils/solidity/transactionFactory';
import { approve } from '~/contracts/dependencies/token/transactions/approve';
import { sendEth } from '~/utils/evm/sendEth';

/*interface deployGivethBridgeERC20Args {
  absoluteMinTimeLock: string,
  escapeHatchCaller: string,
  escapeHatchDestination: string,
  maxSecurityGuardDelay:  number,
  securityGuard: string,
  timeLock: number
}

interface deployGivethBridgeERC20Results {
  absoluteMinTimeLock: string,
  escapeHatchCaller: string,
  escapeHatchDestination: string,
  maxSecurityGuardDelay:  number,
  securityGuard: string,
  timeLock: number
}*/

interface donateGivethBridgeERC20Args {
  token: TokenInterface;
  howMuch: QuantityInterface;
}

const guard: GuardFunction<donateGivethBridgeERC20Args> = async (
  environment: Environment,
  { token, howMuch }: donateGivethBridgeERC20Args,
) => {
  ensure(
    isToken(token) && hasAddress(token),
    `Token ${display(token)} is invalid`,
  );
  ensure(
    await approve(environment, {
      howMuch: howMuch,
      spender: environment.wallet.address,
    }),
    'You do not have enough token to spend the given amount.',
  );
};

const prepareArgs: PrepareArgsFunction<donateGivethBridgeERC20Args> = async (
  _,
  { token, howMuch }: donateGivethBridgeERC20Args,
) => {
  token.address.toString(), howMuch.quantity.toString();
};

type donateGivethBridgeERC20Result = boolean;

export const donateGivethBridgeERC20: EnhancedExecute<
  donateGivethBridgeERC20Args,
  donateGivethBridgeERC20Result
> = transactionFactory(
  'donateAsset',
  Contracts.GivethBridge,
  guard,
  prepareArgs,
);

interface DonateGivethBridgeETHArgs {
  howMuch: QuantityInterface;
}

export const donateGivethBridgeETH = async (
  environment: Environment,
  { howMuch }: DonateGivethNridgeETHArgs,
): Promise<void> => {
  const args = {
    to: Contracts.GivethBridge,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethBridgeETH ${error.message}`);
  }
};
