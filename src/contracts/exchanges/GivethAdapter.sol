pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "Hub.sol";


import "ERC20.i.sol";
import "Trading.sol";
import "Vault.sol";
import "Accounting.sol";
import "math.sol";
import "ExchangeAdapter.sol";
import "giveth-bridge.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

/**
 * The GivethAdapter contract does this and that...
 */
contract GivethAdapter is DSMath, ExchangeAdapter {
	mapping (address => uint) public ETHdonations;
	mapping (address => uint) public ERCdonations;
	address public targetExchange;
    address public reveiverDAC;


  constructor() {
        givethBridge = 0x279277482F13aeF92914317a0417DD591145aDc9;
        reveiverDAC = uint64(1);
  }

  function makeOrder (
        address _targetExchange,
        address[6] orderAddresses,
        uint[8] orderValues,
        bytes32 identifier,
        bytes makerAssetData,
        bytes takerAssetData,
        bytes signature
    ) onlyManager notShutDown returns(bool) public {
    require (givethBridge == _targetExchange, "Wrong targetexchange.");
    ensureCanMakeOrder(orderAddresses[2]);

    address makerAsset = orderAddresses[2];
    uint makerAssetAmount = orderValues[0];

    getTrading().updateAndGetQuantityBeingTraded(makerAsset);
    ensureNotInOpenMakeOrder(makerAsset);

    Hub hub = getHub();
    Vault vault = Vault(hub.vault());
    vault.withdraw(makerAsset, makerAssetAmount);
    ERC20Clone(makerAsset).approve(givethBridge, makerAssetAmount);

    require (GivethBridge(givethBridge).donateAndCreateGiver(
        hub.manager(),
        reveiverDAC,
        makerAsset,
        makerAssetAmount
    ), "Donation was not successfull.");
  }
  
}
