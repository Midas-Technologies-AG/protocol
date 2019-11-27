import "GivethBridge.sol";
import "Hub.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";
import "Accounting.sol";
import "Trading.sol";


pragma solidity ^0.4.25;

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
    }
    function donate(
        address _makerAsset,
        uint _makerQuantity
    ) public onlyManager notShutDown returns(uint){

        Hub hub = getHub();
        require(prepareDonation(_makerAsset, _makerQuantity), 'Preparation for donation failed.');
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity);
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
        return _makerQuantity;
    }

    /// @notice needed to avoid stack too deep error
    function approveMakerAsset(address _targetExchange, address _makerAsset, uint _makerQuantity)
        internal returns(bool)
    {
        Hub hub = getHub();
        require(prepareDonation(_makerAsset, _makerQuantity), 'Preparation for donation failed.');
        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            _makerAsset,
            _makerQuantity
        );
        return true;
    }

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
