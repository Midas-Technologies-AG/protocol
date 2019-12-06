import { transactionFactory } from '~/utils/solidity/transactionFactory';
import { Contracts } from '~/Contracts';

interface Options {
  skipGasEstimation?: boolean;
  gas: string;
  gasPrice: string;
  value?: string;
}
const defaultOptions: Options = {
  skipGasEstimation: true,
  gasPrice: '7000000000',
  gas: '8000000',
};

export const createAccounting = transactionFactory(
  'createAccounting',
  Contracts.FundFactory,
  undefined,
  undefined,
  undefined,
  defaultOptions,
);
