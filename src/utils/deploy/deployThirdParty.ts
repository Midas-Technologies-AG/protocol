import {
  Address,
  BigInteger,
  createToken,
  power,
  TokenInterface,
} from '@melonproject/token-math';

import { Environment } from '../environment/Environment';
import {
  deployToken,
  deployWeth,
} from '~/contracts/dependencies/token/transactions/deploy';
import { deposit } from '~/contracts/dependencies/token/transactions/deposit';
import { getToken } from '~/contracts/dependencies/token/calls/getToken';
import { deployMatchingMarket } from '~/contracts/exchanges/transactions/deploy/deployMatchingMarket';
import {
  deployKyberEnvironment,
  KyberEnvironment,
} from '~/contracts/exchanges/transactions/deploy/deployKyberEnvironment';
import { deploy0xExchange } from '~/contracts/exchanges/transactions/deploy/deploy0xExchange';
import {
  deployGivethBridge,
  DeployGivethBridgeArgs,
} from '~/contracts/exchanges/transactions/deploy/deployGivethBridge';
import {
  deployEthfinex,
  EthfinexEnvironment,
} from '~/contracts/exchanges/transactions/deploy/deployEthfinex';
import { ensure } from '../guards/ensure';
import { getChainName } from '~/utils/environment/chainName';
import { deployBurnableToken } from '~/contracts/dependencies/token/transactions/deployBurnableToken';

export interface ThirdPartyContracts {
  exchanges: {
    kyber: KyberEnvironment;
    matchingMarket: Address;
    zeroEx: Address;
    ethfinex: EthfinexEnvironment;
    givethBridge: Address;
  };
  tokens: TokenInterface[];
}

const deployThirdParty = async (
  environment: Environment,
  tokens: TokenInterface[] = [
    createToken('WETH'),
    createToken('MLN'),
    createToken('EUR'),
    createToken('DGX', undefined, 9),
    createToken('ZRX'),
    createToken('DAI'),
  ],
): Promise<ThirdPartyContracts> => {
  ensure(!!tokens.find(t => t.symbol === 'WETH'), 'WETH Token is required');
  ensure(!!tokens.find(t => t.symbol === 'MLN'), 'MLN Token is required');
  ensure(!!tokens.find(t => t.symbol === 'EUR'), 'EUR Token is required');
  ensure(!!tokens.find(t => t.symbol === 'DGX'), 'DGX Token is required');
  ensure(!!tokens.find(t => t.symbol === 'ZRX'), 'ZRX Token is required');

  // : Promise<thirdPartyContracts>
  const deployedTokens: TokenInterface[] = await tokens.reduce(
    async (carryP, current) => {
      const carry = await carryP;
      let deployed;
      if (current.symbol === 'WETH') {
        deployed = await getToken(environment, await deployWeth(environment));
      } else if (current.symbol === 'MLN') {
        deployed = await getToken(
          environment,
          await deployBurnableToken(environment, 'MLN', 18, 'Melon Token'),
        );
      } else {
        deployed = await getToken(
          environment,
          await deployToken(environment, current.symbol, current.decimals),
        );
      }
      return [...carry, deployed];
    },
    Promise.resolve([]),
  );

  // Deposit WETH

  const chainName = await getChainName(environment);
  let depositAmount;
  if (chainName == 'development') {
    depositAmount = power(new BigInteger(10), new BigInteger(18)); // NB: for testnets...
  } else {
    depositAmount = power(new BigInteger(10), new BigInteger(18)); // NB: adjust as needed
  }
  await deposit(
    environment,
    deployedTokens.find(t => t.symbol === 'WETH').address,
    undefined,
    { value: `${depositAmount}` },
  );

  const zrxToken = deployedTokens.find(t => t.symbol === 'ZRX');

  const matchingMarket = await deployMatchingMarket(environment, {
    tokens: deployedTokens,
  });

  const kyber = await deployKyberEnvironment(environment, [
    deployedTokens.find(t => t.symbol === 'MLN'),
    deployedTokens.find(t => t.symbol === 'EUR'),
    deployedTokens.find(t => t.symbol === 'WETH'),
  ]);

  const zeroEx = await deploy0xExchange(environment, { zrxToken });
  const ethfinex = await deployEthfinex(environment, {
    zeroExExchangeAddress: zeroEx,
    tokens: deployedTokens,
  });

  const args: DeployGivethBridgeArgs = {
    absoluteMinTimeLock: 90000,
    escapeHatchCaller: '0x812ea1c4c193ffa12a3789405e3050a066fcbe25',
    escapeHatchDestination: '0x812ea1c4c193ffa12a3789405e3050a066fcbe25',
    maxSecurityGuardDelay: 432000,
    securityGuard: '0x812ea1c4c193ffa12a3789405e3050a066fcbe25',
    timeLock: 172800,
  };

  const givethBridge = await deployGivethBridge(environment, args);

  return {
    exchanges: {
      ethfinex,
      kyber,
      matchingMarket,
      zeroEx,
      givethBridge,
    },
    tokens: deployedTokens.map(token => ({
      ...token,
      reserveMin: 1000000000000000000,
    })),
  };
};

export { deployThirdParty };
