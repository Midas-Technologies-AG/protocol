import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

export const deployGiveth = async (environment: Environment) => {
  const address = await deployContract(environment, Contracts.Giveth, []);

  return address;
};
