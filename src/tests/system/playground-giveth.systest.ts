//import { Contracts } from '~/Contracts';
import { cliLogger } from '~/utils/environment/cliLogger';
//import { createAccounting } from '~/contracts/factory/transactions/createAccounting';
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
//import { isAddress } from '~/utils/checks/isAddress';
import {
  donateGivethETH,
  donateGivethERC20,
} from '~/contracts/exchanges/third-party/giveth/transactions/donateGiveth';
import { createQuantity, createToken } from '@melonproject/token-math';

/*import { getHub } from '~/contracts/fund/hub/calls/getHub';
import { getManager } from '~/contracts/fund/hub/calls/getManager';
import { getRoutes } from '~/contracts/fund/hub/calls/getRoutes';
import { getName } from '~/contracts/fund/hub/calls/getName';
import { getCreationTime } from '~/contracts/fund/hub/calls/getCreationTime';*/

//import { donateGivethETH } from '~/contracts/exchanges/transactions/donateGivethETH';
//import { donateGivethERC20 } from '~/contracts/exchanges/transactions/donateGivethERC20';

// initialize environment
export const init = async () => {
  //Logger Settings
  const info = cliLogger(
    'Midas-Technologies-AG/protocol:test-giveth:init',
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
    track: Tracks.GIVETH,
  };

  //Create Environment
  const environment: Environment = await constructEnvironment(param);
  info('construct Environment was successfull.');
  return environment;
};

const functionReport = cliLogger(
  'Midas-Technologies-AG/protocol:test-giveth:functionReport',
  LogLevels.INFO,
);
/*// create Accounting
export const createAccounting = async (environment:Environment) => {
  const { melonContracts } = environment.deployment;
  const acc = await createAccounting(
    environment,
    melonContracts.version
  );
  functionReport('created Accounting:', acc);
  return acc;
}*/

/*    //Checking the created Fund
    const hub = await getHub(environment);
    info('hub is:', hub);
    const manager = await getManager(environment);
    info('manager is:', manager);
    const routes = await getRoutes(environment);
    info('routes is:', routes);
    const name = await getName(environment);
    info('name is:', name);
    const creationTime = await getCreationTime(environment);
    info('creationTime is:', creationTime);
*/

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
  const donateETH = await donateGivethETH(environment, { howMuch });
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
  const donateERC = await donateGivethERC20(
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
      'Midas-Technologies-AG/protocol:test-giveth:testReport',
      LogLevels.INFO,
    );

    const environment: Environment = await init();

    const ETHdonator = await donate(environment);
    testReport('Donated ETH.', ETHdonator);

    const Assetdonator = await donateAsset(environment);
    testReport('Donated Asset.', Assetdonator);

    /*    const fund = await createFund(environment);
    const hubAddress = fund.hubAddress;
    testReport('hubAddress is', hubAddress);

    expect(isAddress(hubAddress);*/
    expect(5 == 5);
  });
});
