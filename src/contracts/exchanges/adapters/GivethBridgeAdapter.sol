pragma solidity ^0.4.25;

import "GivethBridge.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

/**
 * TD:

            FunctionSignatures.withdrawTokens,

 */
contract GivethBridgeAdapter is ExchangeAdapter {

    address public bridge;
    uint64 public receiverDAC;

    constructor() public {
        bridge = address(0x123);
        receiverDAC = uint64(121);
    }

    function makeOrder(
        address _targetExchange,
        address[6] _orderAddresses,
        uint[8] _orderValues,
        bytes32 _identifier,
        bytes _makerAssetData,
        bytes _takerAssetData,
        bytes _signature
    ) public onlyManager notShutDown {

        Hub hub = getHub();

        address makerAsset = _orderAddresses[2];
        uint makerQuantity = _orderValues[0];
        address bridge = _targetExchange;

        ensureCanMakeOrder(makerAsset);

        // Order parameter checks
        getTrading().updateAndGetQuantityBeingTraded(makerAsset);
        ensureNotInOpenMakeOrder(makerAsset);

        // Get and approve makerAsset
        approveMakerAsset(bridge, makerAsset,makerQuantity);
        
        //check
        require (address(hub.manager()) == address(msg.sender));
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            makerAsset,
            makerQuantity
        );
        
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 

        //Maybe not needed.
/*      getTrading().returnAssetToVault(makerAsset);
*/      getTrading().orderUpdateHook(
            bridge,
            _identifier,
            Trading.UpdateType.make,
            [address(makerAsset), address(0x0)],
            [makerQuantity, uint(0), uint(0)]
        );
    }

    /// @notice needed to avoid stack too deep error
    function approveMakerAsset(address _targetExchange, address _makerAsset, uint _makerQuantity)
        internal
    {
        Hub hub = getHub();
        Vault(hub.vault()).withdraw(_makerAsset, _makerQuantity);
        require(
            ERC20(_makerAsset).approve(_targetExchange, _makerQuantity),
            "Maker asset could not be approved"
        );
    }

    function changeBridge (address _newBridge) public onlyManager notShutDown returns(bool) {
        bridge = _newBridge;
        return true;
    }
    
  
    function tester (
        address _bridge,
        uint64 _targetDAC,
        address _token,
        uint _amount
    ) public payable returns(bool) {
        require(ERC20(_token).approve(_bridge, _amount));        
        GivethBridge(_bridge).donateAndCreateGiver(
            msg.sender,
            _targetDAC,
            _token,
            _amount
        );
        return true;
    }
}
