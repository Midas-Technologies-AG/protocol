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
};

const prepareArgs: PrepareArgsFunction<donateGivethBridgeERC20Args> = async (
  environment: Environment,
  { token, howMuch }: donateGivethBridgeERC20Args,
) => {
  return [token.address.toString(), howMuch.quantity.toString()];
};

type donateGivethBridgeERC20Result = boolean;

/*interface Options {
  amguPayable?: boolean;
  incentive?: boolean;
  skipGuards?: boolean;
  skipGasEstimation?: boolean;
  from?: string;
  gas?: string;
  gasPrice?: string;
  value?: string;
}

const defaultOptions: Options = {
  skipGasEstimation: true,
  gas: '8000000',
  gasPrice: '40000000',
};*/

export const donateGivethBridgeERC20: EnhancedExecute<
  donateGivethBridgeERC20Args,
  donateGivethBridgeERC20Result
> = transactionFactory(
  'donate',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
);
