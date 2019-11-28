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

interface makeDonationArgs {
  token: TokenInterface;
  howMuch: QuantityInterface;
}

const guard: GuardFunction<makeDonationArgs> = async (
  environment: Environment,
  { token, howMuch }: makeDonationArgs,
) => {
  ensure(
    isToken(token) && hasAddress(token),
    `Token ${display(token)} is invalid`,
  );
};

const prepareArgs: PrepareArgsFunction<makeDonationArgs> = async (
  environment: Environment,
  { token, howMuch }: makeDonationArgs,
) => {
  return [token.address.toString(), howMuch.quantity.toString()];
};

type makeDonationResult = boolean;

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
  gasPrice: '8000000000',
};*/

// donate
// whitelistTokenOnBridge
// testNoMod
// returnAssetToVault input just token
// whitelistToken @ Bridge

export const makeGivethDonation: EnhancedExecute<
  makeDonationArgs,
  makeDonationResult
> = transactionFactory(
  'makeDonation',
  Contracts.GivethBridgeAdapter,
  guard,
  prepareArgs,
);
