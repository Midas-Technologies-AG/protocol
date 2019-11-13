import {
  Environment,
  LogLevels,
  Tracks,
  Deployment,
  Options,
} from '~/utils/environment/Environment';
import { cliLogger } from '~/utils/environment/cliLogger';
import { toBeTrueWith } from '../utils/toBeTrueWith';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { default as Web3Eth } from 'web3-eth';
import { default as Web3Accounts } from 'web3-eth-accounts';
import { createQuantity, createToken, Address } from '@melonproject/token-math';
import { donateGivethBridgeERC20 } from '~/contracts/exchanges/transactions/donateGivethBridgeERC20';
// import { transfer } from '~/contracts/dependencies/token/transactions/transfer';

// initialize environment
export const init = async () => {
  //Logger Settings
  const info = cliLogger(
    'Midas-Technologies-AG/protocol:test-givethBridge:init',
    LogLevels.INFO,
  );
  //Load deployment
  const fs = require('fs');
  const deployment: Deployment = JSON.parse(
    fs.readFileSync('deployments/ropsten-kyberPrice.json', 'utf8'),
  );
  info('Loaded deployment');

  //Create Web3 provider and account with private Key from keystore file.
  const provider = new Web3Eth.providers.WebsocketProvider(
    process.env.JSON_RPC_ENDPOINT,
  );
  const web3Accounts = new Web3Accounts(provider);
  const account = await web3Accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY,
  );
  const eth = new Web3Eth(provider);

  /*    const account = web3Accounts.decrypt(
      JSON.parse(fs.readFileSync(process.env.KEYSTORE_FILE, 'utf8')),
      process.env.KEYSTORE_PASSWORD,
    );*/
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
    gasLimit: '5000000',
    gasPrice: '2100000000',
    skipGasEstimation: true,
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

const functionReport = cliLogger(
  'Midas-Technologies-AG/protocol:test-givethBridge:functionReport',
  LogLevels.INFO,
);

//Create testFund
export const createFund = async (environment: Environment) => {
  const fund = await setupFund(environment, 'Giveth Fund2');
  const { hubAddress } = fund;
  functionReport('setup Fund was successfull', fund);
  functionReport('hubAddress is:', hubAddress);
  return fund;
};

export const donateAsset = async (
  environment: Environment,
  vaultAddress: Address,
  tokenSymbol: string,
  tokenAddress: string,
  decimals: number = 18,
  amount: number,
) => {
  const token = await createToken(tokenSymbol, tokenAddress, decimals);
  const howMuch = await createQuantity(token, amount);

  //  await transfer(environment, { to: vaultAddress, howMuch });
  functionReport('start donateGivethBridgeERC20...');
  await donateGivethBridgeERC20(
    environment,
    environment.deployment.melonContracts.adapters.givethBridgeAdapter,
    { token, howMuch },
  );
  functionReport('Donated token', tokenSymbol);

  return true;
};

// start Tests
expect.extend({ toBeTrueWith });
describe('playground', () => {
  test('Happy path', async () => {
    //Create Environment.
    const environment = await init();
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethBridge:testReport',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');

    //Create a fund.
    /*    const fund = await createFund(environment);
    const hubAddress = fund.hubAddress;
    testReport('hubAddress is', fund);*/

    //First fund: (Giveth Fund2)
    const fund = {
      accountingAddress: '0x6B083F0bD2D086AEbdbE600fe8fF1Fea1C84eb8E',
      feeManagerAddress: '0xA4d64974930EF5781F36e5Ce7744Eee554B4d043',
      participationAddress: '0x8414Da126C9129a0d1DB01865c966F18a5795641',
      policyManagerAddress: '0xD274850754c52e983Ad46c7689e6AFE546D1444d',
      priceSourceAddress: '0x0590c7096813510feFc5a93c039EfD2604029C03',
      registryAddress: '0xECE03E38a99dE84D43F3494158578455E9361772',
      sharesAddress: '0xdC1cafBd9698740AAF89906c163a116C0807247b',
      tradingAddress: '0xc5D4162164794402257318c03bd0c5aF43f5864a',
      vaultAddress: '0x0691d5048ca51C465Fd5240Eed208799EFff0CA1',
      versionAddress: '0x51478c44E9e81A5363B221C0BC66709d33a9E1E1',
      hubAddress: '0xaeceB36c2eab99C6Cb91A3887AA6BF6FFA86Aa42',
    };
    //Donate ERC20 token.
    const successERC = await donateAsset(
      environment,
      fund.vaultAddress,
      'WETH',
      '0x00f92ed24BAadb6Da6CcD54B9525D29Fb1DF49F0',
      18,
      0.12,
    );
    testReport('Donated Asset.');

    expect(successERC);
  });
});
