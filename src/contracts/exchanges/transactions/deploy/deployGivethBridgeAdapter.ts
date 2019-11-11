import { deployContract } from '~/utils/solidity/deployContract';
import { Environment } from '~/utils/environment/Environment';
import { Contracts } from '~/Contracts';

export interface DeployGivethBridgeAdapterArgs {
  bridge: string;
  receiverDAC: number;
}
export const deployGivethBridgeAdapter = async (
  environment: Environment,
  { bridge, receiverDAC }: DeployGivethBridgeAdapterArgs,
) => {
  const address = await deployContract(
    environment,
    Contracts.GivethBridgeAdapter,
    [bridge, receiverDAC],
  );

  return address;
};
