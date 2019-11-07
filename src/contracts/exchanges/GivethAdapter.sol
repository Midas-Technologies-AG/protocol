pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "GivethBridge.sol";
import "Hub.sol";
import "ERC20.i.sol";
import "Trading.sol";
import "Vault.sol";
import "Accounting.sol";
import "math.sol";
import "ExchangeAdapter.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

/**
 * The GivethAdapter contract does this and that...
 */
contract GivethAdapter is DSMath, ExchangeAdapter {
	mapping (address => uint) public ETHdonations;
	mapping (address => uint) public ERCdonations;
	address public bridgeAddress;
    address public reveiverDAC;


  constructor() {
        bridgeAddress = 0x279277482F13aeF92914317a0417DD591145aDc9;
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
    ) public onlyManager notShutDown returns(bool) {
    require (bridgeAddress == _targetExchange, "Wrong targetexchange.");
    ensureCanMakeOrder(orderAddresses[2]);

    address makerAsset = orderAddresses[2];
    uint makerQuantity = orderValues[0];

    getTrading().updateAndGetQuantityBeingTraded(makerAsset);
    ensureNotInOpenMakeOrder(makerAsset);

    Hub hub = getHub();
    Vault vault = Vault(hub.vault());
    vault.withdraw(makerAsset, makerQuantity);

    require(
        ERC20(makerAsset).approve(bridgeAddress, makerQuantity),
        "Could not approve maker asset"
    );    

    require (GivethBridge(bridgeAddress).donateAndCreateGiver(
        hub.manager(),
        reveiverDAC,
        makerAsset,
        makerQuantity
    ), "Donation was not successfull.");

    getTrading().returnAssetToVault(makerAsset);
    getAccounting().updateOwnedAssets();
  }
  
  function tester (address _targetAddress, uint64 _targetDAC, address _token, uint _amount) public returns(bool) {   
        require (GivethBridge(_targetAddress).donateAndCreateGiver(
            msg.sender,
            _targetDAC,
            _token,
            _amount
    ));      
  }
}
