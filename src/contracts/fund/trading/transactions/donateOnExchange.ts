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
  methodSignature;
  donationAssetAddress;
  donationQuantity;
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
  const donationToken = await getToken(environment, donationAssetAddress);
  const donationQuant = await createQuantity(
    donationToken,
    donationQuantity.toString(),
  );
  const functionArgs = [
    exchangeIndex,
    methodSignature,
    environment.deployment.thirdPartyContracts.exchanges.givethBridge,
    1,
    donationAssetAddress,
    donationQuant.quantity,
  ];
  return functionArgs;
};

interface Options {
  skipGasEstimation?: boolean;
  gas: string;
  gasPrice: string;
  value?: string;
}
const defaultOptions: Options = {
  skipGasEstimation: true,
  gasPrice: '2000000000',
  gas: '7500100',
};

export const donateOnExchange = transactionFactory(
  'donateOnExchange',
  Contracts.Trading,
  guard,
  prepareArgs,
  undefined,
  defaultOptions,
);
