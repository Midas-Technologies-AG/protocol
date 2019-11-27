pragma solidity ^0.4.25;

import "GivethBridge.sol";
import "Hub.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";
import "Accounting.sol";
import "Trading.sol";


/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */


contract GivethBridgeAdapter is ExchangeAdapter {

    address public bridge;
    uint64 public receiverDAC;

    constructor(address _bridge, uint64 _receiverDAC) public {
        bridge = _bridge;
        receiverDAC = _receiverDAC;
    }

    function () public payable {
        require (msg.value > 0);
        require(GivethBridge(bridge).call.value(address(this).balance).gas(30000)(
            bytes4(keccak256("donateAndCreateGiver(address,uint64)")),
            msg.sender,
            receiverDAC)
        );
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

        require(approveMakerAsset(bridge, makerAsset, makerQuantity),
            "Approval in makeOrder did not work.");
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            makerAsset,
            makerQuantity);
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
    }

    /// @notice needed to avoid stack too deep error
    function approveMakerAsset(address _targetExchange, address _makerAsset, uint _makerQuantity)
        internal returns(bool)
    {
        Hub hub = getHub();
        Vault(hub.vault()).withdraw(_makerAsset, _makerQuantity);
        require(
            ERC20(_makerAsset).approve(_targetExchange, _makerQuantity),
            "Maker asset could not be approved"
        );
        return true;
    }

    function changeBridge (address _newBridge) public onlyManager notShutDown returns(bool) {
        bridge = _newBridge;
        return true;
    }
  
    function tester (
        address _token,
        uint _amount
    ) public payable returns(bool) {
        require(ERC20(_token).approve(bridge, _amount),
            "ERC approval failed.");        
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _token,
            _amount
        );
        return true;
    }
}
