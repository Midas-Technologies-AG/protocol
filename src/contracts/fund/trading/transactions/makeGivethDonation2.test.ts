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
import { makeGivethDonation } from './makeGivethDonation';
import { whitelistToken } from '~/contracts/exchanges/third-party/giveth/transactions/whitelistToken';

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
  LogLevels.INFO,
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

  //@notice whitelist the token on the givethBridge.
  const cc = await whitelistToken(environment, token.address);
  functionReport('token whitelisted on Bridge.', cc);

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
    const environment = await init('deployments/development-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');

    //Create a fund.
    const fund = await createFund(environment, 'Test Fund');

    //Donate ERC20 token.
    const successERC = await donateAsset(environment, fund, 'WETH', 0.33);
    testReport('Donated Asset.');
    expect(successERC);
  });
});
/*
    //First fund: (Giveth Fund2) Ropsten
    const fund = {
            "accountingAddress": "0xeEf50ca52b3bc4aC29AfC109a251BA6494A1F4c6",
            "feeManagerAddress": "0xD34EdB9543D70ADfdC0694c61282512684BdC0B6",
            "participationAddress": "0x9BCf8F6581E71b7Dab38Da74B73DE6941a2A968f",
            "policyManagerAddress": "0xcE2A68c25c4562776D2C5154585F88CDc761A236",
            "priceSourceAddress": "0x4487Bc48C1B81e34b4780E7Ed8aA7Afbb3aaf613",
            "registryAddress": "0x4eFF83A9e2Fa41D44ADf3AC3c46A4B80b68a1908",
            "sharesAddress": "0x400c1C0E4f1d6e93c4f0B47dfeE4b0F252802AF1",
            "tradingAddress": "0x7aCADAc89C041f03dB0E250C1D51C56710F6c1C8",
            "vaultAddress": "0xc07Bd3883f54b8893236A31dd1653aDBef51Df2e",
            "versionAddress": "0x9A4CC1EcAb29705CdF6f2F1f645e7859985Aa7a4",
            "hubAddress": "0x215857e763BAA133BACF0E8C57c9b13CFA4A18cF"
}
    // active fund on kovan-kyberPrice
    const fund = {
      "accountingAddress": "0x48c3FFfEb36f0B201022cB3a5B6BA0455ab995C9",
      "feeManagerAddress": "0x1589Ee8d9896FcD9a3E32D306D10Bcd6D115837F",
      "participationAddress": "0x0C857302C99e171447e8461d90D57d4c137a3e50",
      "policyManagerAddress": "0x1e81E80d90C80080E7bD7dBd599b622d318B28C4",
      "priceSourceAddress": "0x4b9bdB63308075730d81eFE2Eb3cDEC0be83AAca",
      "registryAddress": "0x81899c97Bd10AF2Ba7b2eBC01321cef24C24d67e",
      "sharesAddress": "0x073EBaC4a2763eFEA2d7C79C34CF790f9f9AA8c4",
      "tradingAddress": "0x46Bb70d8f58522CC0252B7f90A8c20FbCAa1D4B6",
      "vaultAddress": "0xC72a0667D247C212F8C017595B53EC45EC40D88C",
      "versionAddress": "0xa9Ab8570eCc1930fbE5356750718e8D00c7397fB",
      "hubAddress": "0x76C3897fFD845505b6DABa2174d3B3970DFA7432"
    };
*/
