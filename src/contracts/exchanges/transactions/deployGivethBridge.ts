import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

export const deployGivethBridge = async (environment: Environment) => {
  const address = await deployContract(environment, Contracts.GivethBridge, []);

  return address;
};
