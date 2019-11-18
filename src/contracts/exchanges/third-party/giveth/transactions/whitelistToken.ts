import {
  transactionFactory,
  PrepareArgsFunction,
} from '~/utils/solidity/transactionFactory';
import { Contracts } from '~/Contracts';

export interface whitelistTokenArgs {
  tokenAddress: string;
}

const prepareArgs: PrepareArgsFunction<whitelistTokenArgs> = async (
  _,
  { tokenAddress },
) => {
  return [tokenAddress, true];
};

const whitelistToken = transactionFactory(
  'whitelistToken',
  Contracts.GivethBridge,
  undefined,
  prepareArgs,
);

export { whitelistToken };
