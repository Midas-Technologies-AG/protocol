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
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';

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
  tradingContractAddress,
) => {
  const hubAddress = await getHub(environment, tradingContractAddress);
  const { vaultAddress } = await getRoutes(environment, hubAddress);

  //Balance, Fund/Trading checks
  await ensureSufficientBalance(environment, makerQuantity, vaultAddress);
  await ensureFundOwner(environment, tradingContractAddress);
  await ensureIsNotShutDown(environment, hubAddress);
  await ensureNotInOpenMakeOrder(environment, tradingContractAddress, {
    makerToken: makerQuantity.token,
  });
};

const prepareArgs: PrepareArgsFunction<MakeGivethDonationArgs> = async (
  environment,
  { makerQuantity },
  tradingContractAddress,
) => {
  const exchangeIndex = await getExchangeIndex(
    environment,
    tradingContractAddress,
    {
      exchange: Exchanges.GivethBridge,
    },
  );

  return [
    exchangeIndex,
    FunctionSignatures.makeOrder,
    [
      tradingContractAddress,
      environment.deployment.thirdPartyContracts.exchanges.givethBridge,
      makerQuantity.token.address.toString(),
      makerQuantity.token.address.toString(),
      emptyAddress,
      emptyAddress,
    ],
    [makerQuantity.quantity, 0, '0', '0', '0', '0', 0, '0'],
    '0x0000000000003678fd21a000',
    '0x0000312',
    '0x00312',
    '0x000312',
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
  gas: '7500100',
};

export const makeGivethDonation = transactionFactory(
  'callOnExchange',
  Contracts.Trading,
  guard,
  prepareArgs,
  postProcess,
  defaulOptions,
);

export const donateG = async (
  _environment,
  _tokenSymbol: string,
  _amount: number,
) => {
  const token = await getTokenBySymbol(_environment, _tokenSymbol);
  const makerQuantity = await createQuantity(token, _amount);
  return await makeGivethDonation(
    _environment,
    _environment.routes.tradingAddress,
    { makerQuantity },
  );
};
