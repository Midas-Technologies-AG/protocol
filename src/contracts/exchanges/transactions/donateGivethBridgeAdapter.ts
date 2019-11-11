import {
  QuantityInterface,
  TokenInterface,
  isToken,
  hasAddress,
  display,
  Address,
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
import { sendEth } from '~/utils/evm/sendEth';
import { balanceOf } from '~/contracts/dependencies/token/calls/balanceOf';

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
  const balance = await balanceOf(environment, token.address);
  ensure(
    balance >= howMuch.quantity,
    'You do not have enough token to spend the given amount.',
  );
};

const prepareArgs: PrepareArgsFunction<donateGivethBridgeERC20Args> = async (
  environment: Environment,
  { token, howMuch }: donateGivethBridgeERC20Args,
) => {
  return [token.address.toString(), howMuch.quantity.toString()];
};

type donateGivethBridgeERC20Result = boolean;

export const donateGivethBridgeERC20: EnhancedExecute<
  donateGivethBridgeERC20Args,
  donateGivethBridgeERC20Result
> = transactionFactory(
  'tester',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
);

interface DonateGivethBridgeETHArgs {
  to: Address;
  howMuch: QuantityInterface;
}

export const donateGivethBridgeETH = async (
  environment: Environment,
  { to, howMuch }: DonateGivethBridgeETHArgs,
): Promise<void> => {
  const args = {
    to: to,
    howMuch: howMuch,
  };

  try {
    await sendEth(environment, args);
  } catch (error) {
    throw new Error(`Error with donateGivethBridgeETH ${error.message}`);
  }
};
