import {
  QuantityInterface,
  TokenInterface,
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
import { approve } from '~/contracts/dependencies/token/transactions/approve'

interface donateGivethERC20Args {
	token: TokenInterface;
	howMuch: QuantityInterface
}

const guard: GuardFunction<donateGivethERC20Args> = async (
  environment: Environment,
  { token, QuantityInterface }: donateGivethERC20Args,
) => {
  ensure(
    isToken(token) && hasAddress(token),
    `Token ${display(token)} is invalid`,
  );
  ensure(
    approve(
    	environment,
    	{
    		howMuch: howMuch,
    		spender: environment.wallet.address
    	}
    )
  )
};

interface donateGivethERC20makeOrderArgs {
	targetExchange: Address;
	orderAddresses: Address[6];
	orderValues: uint[8];
	identifier: bytes32;
	makerAssetData: bytes;
	takerAssetData: bytes;
	signature: bytes;
}

const prepareArgs: PrepareArgsFunction<
  donateGivethERC20makeOrderArgs
> = async (_, { token, howMuch }: donateGivethERC20makeOrderArgs) => {

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
};

type donateGivethERC20Result = boolean;

export const donateGivethERC20: EnhancedExecute<
  donateGivethERC20makeOrderArgs,
  donateGivethERC20Result
> = transactionFactory(
  'makeOrder',
  Contracts.GivethAdapter,
  guard,
  prepareArgs,
);
