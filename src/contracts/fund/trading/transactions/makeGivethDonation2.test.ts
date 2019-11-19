import {
  Environment,
  LogLevels,
  Tracks,
  Deployment,
  Options,
} from '~/utils/environment/Environment';
import { cliLogger } from '~/utils/environment/cliLogger';
import { getTokenBySymbol } from '~/utils/environment/getTokenBySymbol';
import { toBeTrueWith } from '~/tests/utils/toBeTrueWith';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { default as Web3Eth } from 'web3-eth';
import { default as Web3Accounts } from 'web3-eth-accounts';
import { createQuantity } from '@melonproject/token-math';
import { transfer } from '~/contracts/dependencies/token/transactions/transfer';
import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';
import { makeGivethDonation } from './makeGivethDonation';

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

const functionReport = cliLogger(
  'Midas-Technologies-AG/protocol:test-givethBridge:functionReport',
  LogLevels.DEBUG,
);

//Create testFund
export const createFund = async (
  environment: Environment,
  _fundName: string,
) => {
  const fund = await setupFund(environment, _fundName);
  functionReport('setup Fund was successfull', fund);
  return fund;
};

export const donateAsset = async (
  environment: Environment,
  routes,
  tokenSymbol: string,
  amount: number,
) => {
  const token = await getTokenBySymbol(environment, tokenSymbol);
  const makerQuantity = await createQuantity(token, amount);

  //@notice Send tokens to the vault, so that they can be donated.
  await transfer(environment, {
    to: routes.vaultAddress,
    howMuch: makerQuantity,
  });

  //TD: approve trading to withdraw from vault
  await transfer(environment, {
    to: routes.tradingAddress,
    howMuch: makerQuantity,
  });
  //@notice whitelist the token on the givethBridge.
  const whitelisted = await whitelistToken(
    environment,
    environment.deployment.thirdPartyContracts.exchanges.givethBridge.toString(),
    { tokenAddress: token.address },
  );
  functionReport('token whitelisted on Bridge.', whitelisted);

  functionReport('start makeGivethDonation');
  const manager = await makeGivethDonation(environment, routes.tradingAddress, {
    makerQuantity,
  });
  functionReport('Donated token', tokenSymbol, manager);

  return true;
};

// start Tests
expect.extend({ toBeTrueWith });
describe('playground', () => {
  test('Happy path', async () => {
    //Create Environment.
    const environment = await init('deployments/kovan-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');

    //Create a fund.
    const routes = await createFund(environment, 'Test Fund');

    //Donate ERC20 token.
    const successERC = await donateAsset(environment, routes, 'WETH', 0.05);
    testReport('Donated Asset.');
    expect(successERC);
  });
});

/*


*/
