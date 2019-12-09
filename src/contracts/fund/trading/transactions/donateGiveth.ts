import { donateOnExchange } from '~/contracts/fund/trading/transactions/donateOnExchange';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { FunctionSignatures } from '~/contracts/fund/trading/utils/FunctionSignatures';

export const donateGiveth = async (
  env,
  receiverDAC,
  tokenSymbol,
  donationQuantity,
) => {
  const token = getTokenBySymbol(env, tokenSymbol);

  await donateOnExchange(env, env.routes.tradingAddress, {
    methodSignature: FunctionSignatures.makeDonation,
    receiverDAC: receiverDAC,
    donationAssetAddress: token.address.toString(),
    donationQuantity: donationQuantity,
  });
  return true;
};
