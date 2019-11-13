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
  return [
    environment.deployment.thirdPartyContracts.exchanges.givethBridge,
    [
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      token.address.toString(),
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
    ],
    [howMuch.quantity.toString(), 0, 0, 0, 0, 0, 0, 0],
    '0x6d616b654f726465720000000000000000000000000000000000000000000000',
    '0xddddd',
    '0xddddd',
    '0xddddd',
  ];
};

type donateGivethBridgeERC20Result = boolean;

interface Options {
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
};

export const donateGivethBridgeERC20: EnhancedExecute<
  donateGivethBridgeERC20Args,
  donateGivethBridgeERC20Result
> = transactionFactory(
  'makeOrder',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
  undefined,
  defaultOptions,
);
