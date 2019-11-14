pragma solidity ^0.4.25;

import "GivethBridge.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";
import "Hub.sol";
import "Trading.sol";




/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */


contract GivethBridgeAdapter is ExchangeAdapter {
    address public bridge;
    uint64 public receiverDAC;

    constructor(address _bridge, uint64 _receiverDAC) public {
        bridge = _bridge;
        receiverDAC = _receiverDAC;
    }

    function prepareDonation (
        address _makerAsset,
        uint _makerQuantity) internal returns(bool) {
        
        Hub hub = getHub();
        Vault vault = Vault(hub.vault());
        vault.withdraw(_makerAsset, _makerQuantity);

        require(
            ERC20(_makerAsset).approve(bridge, _makerQuantity),
            "Maker asset could not be approved"
        );
        return true;
    }
    

    function donate(
        address _makerAsset,
        uint _makerQuantity
    ) public onlyManager notShutDown returns(uint){

        whitelistTokenOnBridge2(_makerAsset, true);
        Hub hub = getHub();
        require(prepareDonation(_makerAsset, _makerQuantity), 'Preparation for donation failed.');
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity
        );
        return _makerQuantity;
    }
    function donate2(
        address _makerAsset,
        uint _makerQuantity
    ) public returns(uint){

        whitelistTokenOnBridge2(_makerAsset, true);
        Hub hub = getHub();
        require(prepareDonation(_makerAsset, _makerQuantity), 'Preparation for donation failed.');
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity
        );
        return _makerQuantity;
    }

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
    function whitelistTokenOnBridge2 (address _token, bool _value) public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
    
    function testwithMod (address _token, uint _random) onlyManager notShutDown public view returns(bool) {
        return true;
    }
    function testwithMod1 (address _token, uint _random) onlyManager public returns(bool) {
        return true;
    }
    function testwithMod2 (address _token, uint _random) notShutDown public  returns(bool) {
        return true;
    }
    function testNoMod (address _token, uint _random) public returns(address) {
        return address(getHub().manager());
    }
    function testNoMod2 (address _token, uint _random) public returns(address) {
        return Hub(Trading(address(this)).hub()).manager();
    }
}
