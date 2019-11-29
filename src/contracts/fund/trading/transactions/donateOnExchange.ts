import { createQuantity } from '@melonproject/token-math';
import { Contracts, Exchanges } from '~/Contracts';
import { getExchangeIndex } from '../calls/getExchangeIndex';
import {
  GuardFunction,
  PrepareArgsFunction,
  transactionFactory,
} from '~/utils/solidity/transactionFactory';
import { getHub } from '~/contracts/fund/hub/calls/getHub';
import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';
import { getToken } from '~/contracts/dependencies/token/calls/getToken';
import { ensureSufficientBalance } from '~/contracts/dependencies/token/guards/ensureSufficientBalance';

export interface donateOnExchangeArgs {
  methodSignature: string;
  donationAssetAddress: string;
  donationQuantity: number;
}

const guard: GuardFunction<donateOnExchangeArgs> = async (
  environment,
  { donationAssetAddress, donationQuantity },
  contractAddress,
) => {
  const hubAddress = await getHub(environment, contractAddress);
  const { vaultAddress } = await getRoutes(environment, hubAddress);
  const donationToken = await getToken(environment, donationAssetAddress);

  const donationQuant = await createQuantity(
    donationToken,
    donationQuantity.toString(),
  );
  await ensureSufficientBalance(environment, donationQuant, vaultAddress);
};

const prepareArgs: PrepareArgsFunction<donateOnExchangeArgs> = async (
  environment,
  { methodSignature, donationAssetAddress, donationQuantity },
  contractAddress,
) => {
  const exchangeIndex = await getExchangeIndex(environment, contractAddress, {
    exchange: Exchanges.GivethBridge,
  });
  const functionArgs = [
    exchangeIndex,
    methodSignature,
    donationAssetAddress,
    donationQuantity,
  ];
  return functionArgs;
};

export const donateOnExchange = transactionFactory(
  'donateOnExchange',
  Contracts.Trading,
  guard,
  prepareArgs,
);
