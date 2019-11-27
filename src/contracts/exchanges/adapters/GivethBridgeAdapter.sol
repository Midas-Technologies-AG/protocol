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

    function () public payable {
        require(msg.value > 0);
        callBridge(bridge, address(0x0), 0);
    }

    function prepareDonation (
        address _makerAsset,
        uint _makerQuantity) public onlyManager returns(bool) {
        
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
        donate(makerAsset, makerQuantity);
    }

    function donate(
        address _makerAsset,
        uint _makerQuantity
    ) public onlyManager notShutDown returns(uint){

        Hub hub = getHub();
        require(prepareDonation(_makerAsset, _makerQuantity), 'Preparation for donation failed.');
        
        // Donate asset
        callBridge(bridge, _makerAsset, _makerQuantity);
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
        return _makerQuantity;
    }

    function callBridge (address aim, address asset, uint amount) public {
        if(asset != address(0x0)){

            require(asset.call(
                bytes4(keccak256("approve(address,uint256)")),
                aim,
                amount
            ));
            
            aim.call(
                bytes4(keccak256("donateAndCreateGiver(address,uint64,address,uint256)")),
                msg.sender,
                receiverDAC,
                asset,
                amount
            );
        } else {
            aim.call.value(address(this).balance)(
                bytes4(keccak256("donateAndCreateGiver(address,uint64,address,uint256)")),
                msg.sender,
                receiverDAC,
                asset,
                amount
            );
        }
    }
    

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
