import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

const args = {
  absoluteMinTimeLock: 90000,
  escapeHatchCaller: 0x812ea1c4c193ffa12a3789405e3050a066fcbe25,
  escapeHatchDestination: 0x812ea1c4c193ffa12a3789405e3050a066fcbe25,
  maxSecurityGuardDelay: 432000,
  securityGuard: 0x812ea1c4c193ffa12a3789405e3050a066fcbe25,
  timeLock: 172800,
};

export const deployGivethBridge = async (environment: Environment) => {
  const address = await deployContract(environment, Contracts.GivethBridge, [
    args,
  ]);

  return address;
};
