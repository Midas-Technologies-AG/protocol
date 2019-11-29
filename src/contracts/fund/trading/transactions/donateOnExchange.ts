import { createQuantity } from '@melonproject/token-math';
import { Contracts, Exchanges } from '~/Contracts';
import { getExchangeIndex } from '../calls/getExchangeIndex';
import {
  GuardFunction,
  PrepareArgsFunction,
  transactionFactory,
} from '~/utils/solidity/transactionFactory';
import { getHub } from '../../hub/calls/getHub';
import { getRoutes } from '../../hub/calls/getRoutes';
import { getToken } from '~/contracts/dependencies/token/calls/getToken';
import { ensureSufficientBalance } from '~/contracts/dependencies/token/guards/ensureSufficientBalance';

// The order needs to be signed by the manager
export interface donateOnExchangeArgs {
  methodSignature: string;
  donationAssetAddress: string;
  donationQuantity: number;
}

const guard: GuardFunction<donateOnExchangeArgs> = async (
  environment,
  args: donateOnExchangeArgs,
  contractAddress,
) => {
  const hubAddress = await getHub(environment, contractAddress);
  const { vaultAddress } = await getRoutes(environment, hubAddress);
  const donationToken = await getToken(environment, args.donationAssetAddress);

  const donationQuant = createQuantity(
    donationToken,
    args.donationQuantity.toString(),
  );
  await ensureSufficientBalance(environment, donationQuant, vaultAddress);
};

const prepareArgs: PrepareArgsFunction<donateOnExchangeArgs> = async (
  environment,
  args: donateOnExchangeArgs,
  contractAddress,
) => {
  const exchangeIndex = await getExchangeIndex(environment, contractAddress, {
    exchange: Exchanges.GivethBridge,
  });
  const functionArgs = [
    exchangeIndex,
    args.methodSignature,
    args.donationAssetAddress,
    args.donationQuantity,
  ];

  return functionArgs;
};

const donateOnExchange = transactionFactory(
  'donateOnExchange',
  Contracts.Trading,
  guard,
  prepareArgs,
);

export { donateOnExchange };
