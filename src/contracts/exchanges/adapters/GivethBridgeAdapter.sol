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

    // @notice Map donatoraddress to an array of tokens, where each points to an amount.
    mapping (address => mapping(address => uint)) public  donations;
    event Donation(address makerAsset, uint makerQuantity, uint time);
    

    constructor(address _bridge, uint64 _receiverDAC) public {
        bridge = _bridge;
        receiverDAC = _receiverDAC;
    }
    function makeOrder(
        address _targetExchange,
        address[6] _orderAddresses,
        uint[8] _orderValues,
        bytes32 _identifier,
        bytes _makerAssetData,
        bytes _takerAssetData,
        bytes _signature
    ) public {
        ensureCanMakeOrder(_orderAddresses[2]);
        ERC20 makerAsset = ERC20(_orderAddresses[2]);
        uint makerQuantity = _orderValues[0];
        require (_targetExchange == bridge,
            "Wrong bridge is provided."
        );

        // Order parameter checks
        getTrading().updateAndGetQuantityBeingTraded(makerAsset);
        ensureNotInOpenMakeOrder(makerAsset);

        // Get and approve makerAsset
        Vault(Hub(getHub()).vault()).withdraw(makerAsset, makerQuantity);
        require(
            makerAsset.approve(bridge, makerQuantity),
            "Maker asset could not be approved"
        );        
        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            address(makerAsset),
            makerQuantity
        );
        donations[msg.sender][address(makerAsset)] += makerQuantity;
        
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 

        emit Donation(address(makerAsset), makerQuantity, now);
    }

    function changeBridge (address _newBridge) public onlyManager notShutDown returns(bool) {
        bridge = _newBridge;
        return true;
    }

    function showDonations(address _of, address _token) public view returns(uint){
        return donations[_of][_token];
    }
    
}
