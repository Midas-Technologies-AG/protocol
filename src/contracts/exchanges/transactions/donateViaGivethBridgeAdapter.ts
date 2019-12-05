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
//Not via fund possible.
interface donateViaGivethBridgeAdapterArgs {
  token: TokenInterface;
  howMuch: QuantityInterface;
}

const guard: GuardFunction<donateViaGivethBridgeAdapterArgs> = async (
  environment: Environment,
  { token, howMuch }: donateViaGivethBridgeAdapterArgs,
) => {
  ensure(
    isToken(token) && hasAddress(token),
    `Token ${display(token)} is invalid`,
  );
  //TODO: ensure(getToken(token).approve(environment,givethBridge,amount));
};

const prepareArgs: PrepareArgsFunction<
  donateViaGivethBridgeAdapterArgs
> = async (
  environment: Environment,
  { token, howMuch }: donateViaGivethBridgeAdapterArgs,
) => {
  return [
    environment.deployment.thirdPartyContracts.exchanges.givethBridge,
    1, //HardCoded receiverDAC :HC:
    token.address.toString(),
    howMuch.quantity.toString(),
  ];
};

type donateViaGivethBridgeAdapterResult = boolean;

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

const customOptions: Options = {
  skipGasEstimation: true,
  gas: '8000000',
  gasPrice: '2000000000',
};
export const donateViaGivethBridgeAdapter: EnhancedExecute<
  donateViaGivethBridgeAdapterArgs,
  donateViaGivethBridgeAdapterResult
> = transactionFactory(
  'donateViaGivethBridge',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
  undefined,
  customOptions,
);

//enable before last const and add after prepareArgs, undefined (or postProcess if exists above), customOptions.
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

const customOptions: Options = {
  skipGasEstimation: true,
  gas: '8000000',
  gasPrice: '8000000000',
};*/
