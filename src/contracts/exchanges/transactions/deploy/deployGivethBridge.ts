import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

export interface DeployGivethBridgeArgs {
  escapeHatchCaller: string;
  escapeHatchDestination: string;
  absoluteMinTimeLock: number;
  timeLock: number;
  securityGuard: string;
  maxSecurityGuardDelay: number;
}

export const deployGivethBridge = async (
  environment: Environment,
  {
    escapeHatchCaller,
    escapeHatchDestination,
    absoluteMinTimeLock,
    timeLock,
    securityGuard,
    maxSecurityGuardDelay,
  }: DeployGivethBridgeArgs,
) => {
  const address = await deployContract(environment, Contracts.GivethBridge, [
    escapeHatchCaller,
    escapeHatchDestination,
    absoluteMinTimeLock,
    timeLock,
    securityGuard,
    maxSecurityGuardDelay,
  ]);

  return address;
};
