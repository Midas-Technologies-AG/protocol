pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "GivethBridge.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

/**
 * The GivethAdapter contract does this and that...
 */
contract GivethAdapter {
    constructor() {
    }
  
    function tester (
        address _bridge,
        uint64 _targetDAC,
        address _token,
        uint _amount
    ) public payable returns(bool) {        
        GivethBridge(_bridge).donateAndCreateGiver(
            msg.sender,
            _targetDAC,
            _token,
            _amount
        );
        return true;
    }

/*  function makeOrder (
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
  }*/
}
