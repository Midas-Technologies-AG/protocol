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
import { transfer } from '~/contracts/dependencies/token/transactions/transfer';

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
  vaultAddress: Address,
  tokenSymbol: string,
  tokenAddress: string,
  decimals: number = 18,
  amount: number,
) => {
  const token = await createToken(tokenSymbol, tokenAddress, decimals);
  const howMuch = await createQuantity(token, amount);

  await transfer(environment, { to: vaultAddress, howMuch });
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
    const environment = await init('deployments/development-kyberPrice.json');
    const testReport = environment.logger(
      'Midas-Technologies-AG/protocol:test-givethModule:',
      LogLevels.INFO,
    );
    testReport('Created environment and init testLogger.');

    //Create a fund.
    //const fund = await createFund(environment, 'Giveth Fund');

    //First fund: (Giveth Fund2) Ropsten
    /*    const fund = {
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
}*/

    // active fund on kovan-kyberPrice
    const fund = {
      accountingAddress: '0xB3f700a32CB71746E9D6ea10b1D890fAfcf0b18d',
      feeManagerAddress: '0x79EF34dfF40aEa5a42c54e5243e2cA18eE4165d5',
      participationAddress: '0x878137141754Af82fDA2ef9D8fAFf754257AFC55',
      policyManagerAddress: '0x48cC092C7BAe923750a1B9A5Fb1b34Df820Dc42A',
      priceSourceAddress: '0x689a746FeaEdC9333aCCD8691b88CaEB63152d2a',
      registryAddress: '0xBabe5Cc5758e2896b8c57cc4AA57F519b163d308',
      sharesAddress: '0x0f85063720be2F222d02AcDC7c95Fd965E060106',
      tradingAddress: '0x0EAE8FffCf5944f2690935269290e5dD2C2dA4dE',
      vaultAddress: '0x43eE07986849144ac85b38a76BF86524347f040B',
      versionAddress: '0x313c81277A66BB1B072c2cB6D15588cCa3668E88',
      hubAddress: '0x271baef8F2bbec64Db7a79449bc20A04bFD919f1',
    };

    //Donate ERC20 token.
    const successERC = await donateAsset(
      environment,
      fund.vaultAddress,
      'WETH',
      '0xf6fF03432121c85E7D48A712A3aE1b5cE2472606',
      undefined,
      0.15,
    );
    testReport('Donated Asset.');

    expect(successERC);
  });
});
