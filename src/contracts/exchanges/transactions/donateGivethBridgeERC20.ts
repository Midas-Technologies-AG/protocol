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
  '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
    [
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      token.address.toString(),
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
      '0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E',
    ],
    [howMuch.quantity.toString(), 0, 0, 0, 0, 0, 0, 0],
    new ArrayBuffer(32),
    new ArrayBuffer(5),
    new ArrayBuffer(5),
    new ArrayBuffer(5);
};

/*interface donateGivethBridgeERC20makeOrderArgs {
	targetExchange: Address;
	orderAddresses: Address[6];
	orderValues: uint[8];
	identifier: bytes32;
	makerAssetData: bytes;
	takerAssetData: bytes;
	signature: bytes;
}

const prepareArgs: PrepareArgsFunction<
  donateGivethBridgeERC20makeOrderArgs
> = async (_, { token, howMuch }: donateGivethBridgeERC20makeOrderArgs) => {

  const targetExchange = new Address('0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E');
  const orderAddresses[2] = token.toString();
  const orderValues[0] = howMuch.quantity.toString();
  const identifier = new bytes32('Test');
  const makerAssetData = new bytes('One');
  const takerAssetData = new bytes('Two');
  const signature = new bytes(':)');

  return [
  	targetExchange,
  	orderAddresses,
  	orderValues,
  	identifier,
  	makerAssetData,
  	takerAssetData,
  	signature
  ];
};*/

type donateGivethBridgeERC20Result = boolean;

export const donateGivethBridgeERC20: EnhancedExecute<
  donateGivethBridgeERC20Args,
  donateGivethBridgeERC20Result
> = transactionFactory(
  'makeOrder',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
);
