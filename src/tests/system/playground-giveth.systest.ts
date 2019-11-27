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
import {
  createQuantity,
  createToken,
  Address /*, isAddress*/,
} from '@melonproject/token-math';
import {
  donateGivethBridgeETH,
  donateGivethBridgeERC20,
} from '~/contracts/exchanges/transactions/donateGivethBridgeAdapter';
import { transfer } from '~/contracts/dependencies/token/transactions/transfer';

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
    fs.readFileSync('deployments/kovan-kyberPrice.json', 'utf8'),
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
    gasLimit: '8000000',
    gasPrice: '2100000000',
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
export const createFund = async (environment: Environment, _name: string) => {
  const fund = await setupFund(environment, _name);
  const { hubAddress } = fund;
  functionReport('setup Fund was successfull', fund);
  functionReport('hubAddress is:', hubAddress);
  return fund;
};

export const donateETH = async (environment: Environment, _amount: number) => {
  //Donate through giveth Bridge Adapter contract.
  const howMuch = await createQuantity('ETH', _amount);
  const to: Address =
    environment.deployment.melonContracts.adapters.givethBridgeAdapter;
  await donateGivethBridgeETH(environment, { to, howMuch });
  functionReport('Donated ETH: $(howMuch.quantity.toString()).');
  return true;
};

export const donateAsset = async (
  environment: Environment,
  tokenSymbol: string,
  tokenAddress: string,
  decimals: number = 18,
  amount: number,
) => {
  const token = await createToken(tokenSymbol, tokenAddress, decimals);
  const howMuch = await createQuantity(token, amount);
  // @notice First transfer token to BridgeAdapter, so the BridgeAdapter can approve the Bridge
  // to make the transferFrom(...)
  const to: Address =
    environment.deployment.melonContracts.adapters.givethBridgeAdapter;
  await transfer(environment, { to, howMuch });
  await donateGivethBridgeERC20(
    environment,
    environment.deployment.melonContracts.adapters.givethBridgeAdapter,
    { token, howMuch },
  );
  functionReport(
    `Donated ERC: $(howMuch.quantity.toString()) of $(token.symbol).`,
  );
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
    await createFund(environment, 'Fund1');

    // Donate Ether.
    const successETH = await donateETH(environment, 0.0001);
    testReport('Donated ETH from:', environment.wallet.address);

    //Donate ERC20 token.
    const successERC = await donateAsset(
      environment,
      'WETH',
      '0x0De667F576E787562707A9565245417875070577',
      18,
      0.0002,
    );
    testReport('Donated Asset from', environment.wallet.address);

    expect(successETH && successERC);
  });
});
