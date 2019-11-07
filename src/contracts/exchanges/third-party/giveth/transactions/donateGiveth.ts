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

interface donateGivethERC20Args {
  token: TokenInterface;
  howMuch: QuantityInterface;
}

const guard: GuardFunction<donateGivethERC20Args> = async (
  environment: Environment,
  { token, howMuch }: donateGivethERC20Args,
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

const prepareArgs: PrepareArgsFunction<donateGivethERC20Args> = async (
  _,
  { token, howMuch }: donateGivethERC20Args,
) => {
  token.address.toString(), howMuch.quantity.toString();
};

type donateGivethERC20Result = boolean;

export const donateGivethERC20: EnhancedExecute<
  donateGivethERC20Args,
  donateGivethERC20Result
> = transactionFactory('donateAsset', Contracts.Giveth, guard, prepareArgs);

interface DonateGivethETHArgs {
  howMuch: QuantityInterface;
}

export const donateGivethETH = async (
  environment: Environment,
  { howMuch }: DonateGivethETHArgs,
): Promise<void> => {
  const args = {
    to: Contracts.Giveth,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethETH ${error.message}`);
  }
};
