import { cliLogger } from '~/utils/environment/cliLogger';
import {
  Environment,
  LogLevels,
  Tracks,
  Deployment,
  Options,
} from '~/utils/environment/Environment';
import { toBeTrueWith } from '../utils/toBeTrueWith';
import { constructEnvironment } from '~/utils/environment/constructEnvironment';
import { setupFund } from '~/contracts/fund/hub/transactions/setupFund';
import { default as Web3Eth } from 'web3-eth';
import { default as Web3Accounts } from 'web3-eth-accounts';
import { createQuantity, createToken } from '@melonproject/token-math';

// initialize environment
export const init = async () => {
  //Logger Settings
  const info = cliLogger(
    'Midas-Technologies-AG/protocol:test-givethBridge:init',
    LogLevels.INFO,
  );
  //Load deployment
  const fs = require('fs');
  const _deployment: Deployment = JSON.parse(
    fs.readFileSync('deployments/ropsten-kyberPrice.json', 'utf8'),
  );
  info('Loaded deployment');

  //Create Web3 provider and account with private Key from keystore file.
  const _provider = new Web3Eth.providers.WebsocketProvider(
    process.env.JSON_RPC_ENDPOINT,
  );
  const web3Accounts = new Web3Accounts(_provider);
  const account = await web3Accounts.privateKeyToAccount(
    process.env.PRIVATE_KEY,
  );
  /*    const account = web3Accounts.decrypt(
      JSON.parse(fs.readFileSync(process.env.KEYSTORE_FILE, 'utf8')),
      process.env.KEYSTORE_PASSWORD,
    );*/
  info('Prepared Web3 with:', account.address);

  //Prepare wallet attributes
  const { address } = account.address;
  const signTransaction = unsignedTransaction =>
    web3Accounts
      .signTransaction(unsignedTransaction, process.env.PRIVATE_KEY)
      .then(t => t.rawTransaction);
  const signMessage = message =>
    web3Accounts.sign(message, process.env.PRIVATE_KEY);
  info('Prepared wallet.');

  //Create wallet
  const _wallet = {
    address,
    signMessage,
    signTransaction,
  };
  //TXoptions
  const customOptions: Options = {
    gasLimit: '8500000',
    gasPrice: '3000000000',
  };
  info('Created wallet.');

  //constructEnvironment(param) Result
  const param = {
    endpoint: process.env.JSON_RPC_ENDPOINT,
    provider: _provider,
    logger: cliLogger,
    deployment: _deployment,
    options: customOptions, // does not work...
    wallet: _wallet,
    track: Tracks.KYBER,
  };

  //Create Environment
  const environment: Environment = await constructEnvironment(param);
  info('construct Environment was successfull.');
  return environment;
};

const functionReport = cliLogger(
  'Midas-Technologies-AG/protocol:test-givethBridge:functionReport',
  LogLevels.INFO,
);

//Create testFund
export const createFund = async (environment: Environment) => {
  const fund = await setupFund(environment);
  const { hubAddress } = fund;
  functionReport('setup Fund was successfull', fund);
  functionReport('hubAddress is:', hubAddress);
  return fund;
};

export const donate = async (environment: Environment) => {
  //Donate directly through tird-party contract
  const howMuch = await createQuantity('0x0', 0.05);
  const donateETH = await donateGivethBridgeETH(environment, { howMuch });
  functionReport('Donated ETH: $(howMuch.quantity.toString()).', donateETH);
  return donateETH;
};

export const donateAsset = async (environment: Environment) => {
  const token = await createToken(
    'MLN',
    '0x758E94c97caf81d0d0624B272278fe9cd2bdDfB8',
    18,
  );
  const howMuch = await createQuantity(
    '0x758E94c97caf81d0d0624B272278fe9cd2bdDfB8',
    0.05,
  );
  const donateERC = await donateGivethBridgeERC20(
    environment,
    token.address.toString(),
    { token, howMuch },
  );
  functionReport(
    'Donated ERC: $(howMuch.quantity.toString()) of $(token.symbol).',
    donateERC,
  );
};

// start Tests
expect.extend({ toBeTrueWith });
describe('playground', () => {
  test('Happy path', async () => {
    const testReport = cliLogger(
      'Midas-Technologies-AG/protocol:test-givethBridge:testReport',
      LogLevels.INFO,
    );

    /*const environment: Environment = await init();

    const ETHdonator = await donate(environment);
    testReport('Donated ETH.', ETHdonator);

    const Assetdonator = await donateAsset(environment);
    testReport('Donated Asset.', Assetdonator);*/

    /*    const fund = await createFund(environment);
    const hubAddress = fund.hubAddress;
    testReport('hubAddress is', hubAddress);

    expect(isAddress(hubAddress);*/
    expect(5 == 5);
  });
});
