pragma solidity ^0.4.25;

import "GivethBridge.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";


/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */


contract GivethBridgeAdapter is ExchangeAdapter {
    address public bridge;
    uint64 public receiverDAC;

    constructor(address _bridge, uint64 _receiverDAC) public {
        bridge = _bridge;
        receiverDAC = _receiverDAC;
    }

    function donate(
        address _makerAsset,
        uint _makerQuantity
    ) public onlyManager notShutDown returns(bool){

        Hub hub = getHub();
        Vault(hub.vault()).withdraw(_makerAsset, _makerQuantity);
        require(
            ERC20(_makerAsset).approve(bridge, _makerQuantity),
            "Maker asset could not be approved"
        );
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity
        );
        return true;
    }

    function donate2(
        address _makerAsset,
        uint _makerQuantity
    ) public returns(bool){
        Hub hub = getHub();
        Vault(hub.vault()).withdraw(_makerAsset, _makerQuantity);
        require(
            ERC20(_makerAsset).approve(bridge, _makerQuantity),
            "Maker asset could not be approved"
        );
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity
        );
        return true;
    }

    /// @notice needed to avoid stack too deep error

    function returnAssetToVault(address _token) onlyManager public {
        Hub hub = getHub();
        require(
            msg.sender == address(this) || msg.sender == hub.manager() || hub.isShutDown(),
            "Sender is not this contract or manager"
        );
        ERC20(_token).transfer(hub.vault(), ERC20(_token).balanceOf(this));
    }

    function changeBridge (address _newBridge) public onlyManager notShutDown returns(bool) {
        bridge = _newBridge;
        return true;
    }

    function changeDAC (uint64 _newDAC) public onlyManager notShutDown returns(bool) {
        receiverDAC = _newDAC;
        return true;
    }
}
