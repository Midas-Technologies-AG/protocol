import * as R from 'ramda';

import { getPrice } from '@melonproject/token-math/price';
import { appendDecimals, TokenInterface } from '@melonproject/token-math/token';
import { createQuantity } from '@melonproject/token-math/quantity';

import { Environment } from '~/utils/environment';
import { getQuoteToken } from '..';
import { Contract, getContract } from '~/utils/solidity';

export const getPrices = async (
  contractAddress: string,
  tokens: TokenInterface[],
  environment?: Environment,
) => {
  const quoteToken = await getQuoteToken(contractAddress, environment);
  const contract = await getContract(
    Contract.TestingPriceFeed,
    contractAddress,
    environment,
  );

  const result = await contract.methods
    .getPrices(tokens.map(t => t.address))
    .call();

  const processResult = (price, timestamp) => ({
    price,
    timestamp,
  });

  const processed = R.zipWith(processResult, result['0'], result['1']);

  const createPrice = (t: TokenInterface, { price, timestamp }) => {
    const base = createQuantity(t, appendDecimals(t, 1));
    const quote = createQuantity(quoteToken, price);
    return getPrice(base, quote);
  };

  const prices = R.zipWith(createPrice, tokens, processed);
  return prices;
};