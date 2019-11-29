import {
  Environment,
  LogLevels,
  Tracks,
  Deployment,
  Options,
} from '~/utils/environment/Environment';
import { cliLogger } from '~/utils/environment/cliLogger';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { default as Web3Eth } from 'web3-eth';
import { default as Web3Accounts } from 'web3-eth-accounts';
import { createQuantity, createToken } from '@melonproject/token-math';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';

import { makeGivethDonation } from '~/contracts/exchanges/transactions/makeGivethDonation';
import { sendGivethETH } from '~/contracts/exchanges/transactions/sendGivethETH';
import { transfer } from '~/contracts/dependencies/token/transactions/transfer';
import { donateOnExchange } from '~/contracts/fund/trading/transactions/donateOnExchange';
import { invest } from '~/contracts/fund/trading/utils/invest';

// initialize environment
export const init = async (_deploymentPath: string) => {
  //Logger Settings
  const info = cliLogger(
    'Midas-Technologies-AG/protocol:test-givethBridge:init',
    LogLevels.INFO,
  );
  //Load deployment
  const fs = require('fs');
  const deployment: Deployment = JSON.parse(
    fs.readFileSync(_deploymentPath, 'utf8'),
  );
  info('Loaded deployment from ');

  //Create Web3 provider and account with private Key from keystore file.
  const provider = new Web3Eth.providers.WebsocketProvider(
    process.env.JSON_RPC_ENDPOINT,
  );
  const web3Accounts = new Web3Accounts(provider);
  const account = await web3Accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY,
  );
  const eth = new Web3Eth(provider);
  info('Prepared Web3 with:', account.address);

  //Prepare wallet attributes
  const { address } = account;
  const signTransaction = unsignedTransaction =>
    web3Accounts
      .signTransaction(unsignedTransaction, process.env.PRIVATE_KEY)
      .then(t => t.rawTransaction);
  const signMessage = message =>
    web3Accounts.sign(message, process.env.PRIVATE_KEY);
  info('Prepared wallet.');

  //Create wallet
  const wallet = {
    address,
    signMessage,
    signTransaction,
  };
  //TXoptions
  const options: Options = {
    gasLimit: '8000000',
    gasPrice: '3300000000',
  };
  info('Created wallet.');

  // Return environment
  info('Construct Environment was successfull for:', wallet.address);
  return {
    deployment,
    eth,
    logger: cliLogger,
    options,
    track: Tracks.KYBER_PRICE,
    wallet,
  };
};

const givethReport = cliLogger(
  'Midas-Technologies-AG/protocol:givethTests:',
  LogLevels.INFO,
);

//Create testFund
export const createFund = async (environment: Environment, _name: string) => {
  const fund = await setupFund(environment, _name);
  givethReport('setup Fund was successfull', fund);
  return fund;
};

export const donateGivethAdapterETH = async (
  environment: Environment,
  _amount: number,
) => {
  //Donate through giveth Bridge Adapter contract.
  const howMuch = await createQuantity('ETH', _amount);
  await sendGivethETH(environment, { howMuch });
  givethReport('Donated ETH: $(howMuch.quantity.toString()).');
  return true;
};

export const donateGivethAdapter = async (
  environment: Environment,
  tokenSymbol: string,
  tokenAddress: string,
  decimals: number = 18,
  amount: number,
) => {
  const token = await createToken(tokenSymbol, tokenAddress, decimals);
  const howMuch = await createQuantity(token, amount);

  await transfer(environment, {
    to: environment.deployment.melonContracts.adapters.givethBridgeAdapter,
    howMuch,
  });

  givethReport('start donateGivethAdapter...');
  const donated = await makeGivethDonation(
    environment,
    environment.deployment.melonContracts.adapters.givethBridgeAdapter,
    { token, howMuch },
  );
  givethReport('Donated token', tokenSymbol, donated);

  return true;
};

export const investInFund = async (
  environment,
  tokenSymbol: string,
  amount: number,
) => {
  const fundHoldings = await invest(environment, tokenSymbol, amount);
  givethReport('invest in Fund successfull:', fundHoldings);
  return true;
};

export const donateGiveth = async (env, tokenSymbol, donationQuantity) => {
  const tokenAddress = getTokenBySymbol(env, tokenSymbol);
  await donateOnExchange(env, env.routes.tradingAddress, {
    methodSignature: 'makeDonation',
    donationAssetAddress: tokenAddress.toString(),
    donationQuantity: donationQuantity,
  });
  givethReport('donateGiveth was successfull executed.');
  return true;
};
