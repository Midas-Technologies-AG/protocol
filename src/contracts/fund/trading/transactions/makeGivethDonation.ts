import * as web3Utils from 'web3-utils';
import {
  QuantityInterface,
  createQuantity,
  Address,
} from '@melonproject/token-math';

import {
  PrepareArgsFunction,
  GuardFunction,
  PostProcessFunction,
  transactionFactory,
} from '~/utils/solidity/transactionFactory';
import { getExchangeIndex } from '../calls/getExchangeIndex';
import { ensureSufficientBalance } from '~/contracts/dependencies/token/guards/ensureSufficientBalance';
import { getHub } from '~/contracts/fund/hub/calls/getHub';
import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';
import { ensureIsNotShutDown } from '~/contracts/fund/hub/guards/ensureIsNotShutDown';
import { ensureFundOwner } from '~/contracts/fund/trading/guards/ensureFundOwner';
import { Exchanges, Contracts } from '~/Contracts';
import { FunctionSignatures } from '../utils/FunctionSignatures';
import { emptyAddress } from '~/utils/constants/emptyAddress';
import { ensureNotInOpenMakeOrder } from '../guards/ensureNotInOpenMakeOrder';
import { ensure } from '~/utils/guards/ensure';

export type MakeGivethDonationResult = {
  howMuch: QuantityInterface;
  tokenAddress: Address;
  timestamp: string;
};

export interface MakeGivethDonationArgs {
  makerQuantity: QuantityInterface;
}

const guard: GuardFunction<MakeGivethDonationArgs> = async (
  environment,
  { makerQuantity },
  contractAddress,
) => {
  const hubAddress = await getHub(environment, contractAddress);
  const { vaultAddress } = await getRoutes(environment, hubAddress);

  await ensureSufficientBalance(environment, makerQuantity, vaultAddress);
  await ensureFundOwner(environment, contractAddress);
  await ensureIsNotShutDown(environment, hubAddress);
  await ensureNotInOpenMakeOrder(environment, contractAddress, {
    makerToken: makerQuantity.token,
  });
};

const prepareArgs: PrepareArgsFunction<MakeGivethDonationArgs> = async (
  environment,
  { makerQuantity },
  contractAddress,
) => {
  const exchangeIndex = await getExchangeIndex(environment, contractAddress, {
    exchange: Exchanges.GivethBridge,
  });

  return [
    exchangeIndex,
    FunctionSignatures.makeOrder,
    [
      environment.deployment.thirdPartyContracts.exchanges.givethBridge.toString(),
      emptyAddress,
      makerQuantity.token.address.toString(),
      makerQuantity.token.address.toString(),
      emptyAddress,
      emptyAddress,
    ],
    [makerQuantity.quantity.toString(), '0', '0', '0', '0', '0', '0', 0],
    web3Utils.padLeft('0x0', 32),
    web3Utils.padLeft('0x0', 64),
    web3Utils.padLeft('0x0', 64),
    web3Utils.padLeft('0x0', 64),
  ];
};

const postProcess: PostProcessFunction<
  MakeGivethDonationArgs,
  MakeGivethDonationResult
> = async (environment, receipt) => {
  const logEntry = receipt.events.Donation;
  ensure(
    !!logEntry,
    `No LogMake nor LogTake found in transaction: ${receipt.transactionHash}`,
  );
  return {
    howMuch: createQuantity(
      logEntry.returnValues.makerAsset,
      logEntry.returnValues.makerQuantity,
    ),
    tokenAddress: logEntry.returnValues.makerAsset,
    timestamp: logEntry.returnValues.timestamp,
  };
};

interface Options {
  skipGasEstimation?: boolean;
  gas?: string;
  gasPrice?: string;
  value?: string;
}
const defaulOptions: Options = {
  skipGasEstimation: true,
  gasPrice: '2000000000',
  gas: '8000000',
};

const makeGivethDonation = transactionFactory(
  'callOnExchange',
  Contracts.Trading,
  guard,
  prepareArgs,
  postProcess,
  defaulOptions,
);

export { makeGivethDonation };
