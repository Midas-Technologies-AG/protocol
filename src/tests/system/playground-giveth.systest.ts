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

//import { donateGivethETH } from '~/contracts/exchanges/transactions/donateGivethETH';
//import { donateGivethERC20 } from '~/contracts/exchanges/transactions/donateGivethERC20';

expect.extend({ toBeTrueWith });

describe('playground', () => {
  test('Happy path', async () => {
    //Logger Settings
    const { cliLogger } = require('~/utils/environment/cliLogger');
    const info = cliLogger(
      'Midas-Technologies-AG/protocol:test-giveth',
      LogLevels.INFO,
    );
    //Load deployment
    const fs = require('fs');
    const _deployment: Deployment = JSON.parse(
      fs.readFileSync(
        'deployments/configs/ropsten-kyberPrice/001-givethModuleBeta-1.0.7.json',
        'utf8',
      ),
    );
    info('Loaded deployment');

    //Create Web3 provider and account with private Key from keystore file.
    const _provider = new Web3Eth.providers.WebsocketProvider(
      process.env.JSON_RPC_ENDPOINT,
    );
    const web3Accounts = new Web3Accounts(_provider);
    const account = web3Accounts.decrypt(
      JSON.parse(fs.readFileSync(process.env.KEYSTORE_FILE, 'utf8')),
      process.env.KEYSTORE_PASSWORD,
    );
    info('Prepared Web3 with:', account.address);

    //Prepare wallet attributes
    const { address } = web3Accounts.privateKeyToAccount(account.privateKey);
    const signTransaction = unsignedTransaction =>
      web3Accounts
        .signTransaction(unsignedTransaction, account.privateKey)
        .then(t => t.rawTransaction);
    const signMessage = message =>
      web3Accounts.sign(message, account.privateKey);
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
      track: Tracks.KYBER_PRICE,
    };

    //Create Environment
    const environment: Environment = await constructEnvironment(param);

    info('construct Environment was successfull.');

    //Create testFund
    const fund = await setupFund(environment, 'GOGO');
    info('setup Fund was successfull', fund);

    //Using testFund
    const hubAddress = { fund };
    info('Hub Address is:', hubAddress);

    expect(5 == 5);
    /*    expect(subtract(preFundMln, postFundMln).quantity).toEqual(
      takerQuantity.quantity,
    );*/
  });
});
