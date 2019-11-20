pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "GivethBridge.sol";
import "ERC20.i.sol";
import "ExchangeAdapter.sol";
import "Accounting.sol";
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
    ) public onlyManager notShutDown {
        ensureCanMakeOrder(_orderAddresses[2]);
        ERC20 makerAsset = ERC20(_orderAddresses[2]);
        uint makerQuantity = _orderValues[0];
        require(_targetExchange == bridge,
            "Wrong bridge is provided."
        );
        // Order parameter checks
        getTrading().updateAndGetQuantityBeingTraded(makerAsset);
        ensureNotInOpenMakeOrder(makerAsset);
        // Get and approve makerAsset
        require(approveMakerAsset(makerAsset, makerQuantity),
            "approveMakerAsset() failed.");

        // Donate asset
        GivethBridge(bridge).donateAndCreateGiver(
            0x173Add8c7E4f7034e9ca41c5D2D8a0A986FD427E,
            receiverDAC,
            address(makerAsset),
            makerQuantity
        );
        donations[msg.sender][address(makerAsset)] += makerQuantity;

        // Postprocess/Update
        getAccounting().updateOwnedAssets();

        emit Donation(address(makerAsset), makerQuantity, now);
    }

    /// @notice needed to avoid stack too deep error
    function approveMakerAsset(ERC20 _makerAsset, uint _makerQuantity)
        internal returns(bool)
    {
        Hub hub = getHub();
        Vault vault = Vault(hub.vault());
        vault.withdraw(_makerAsset, _makerQuantity);
        require(
            _makerAsset.approve(bridge, _makerQuantity),
            "Maker asset could not be approved");
        return true;
    }

    function getOrder(
        address onExchange,
        uint id,
        address makerAsset
    ) public view returns (
        address,
        address,
        uint,
        uint
    ) { return (
            address(makerAsset),
            address(0x0),
            donations[msg.sender][makerAsset],
            1
        );
    }

    function _returnAssetToVault (address _tokenAddress) internal onlyManager returns(bool) {
        Hub hub = getHub();
        Trading(hub.trading()).returnAssetToVault(_tokenAddress);
        return true;
    }

    function changeBridge (address _newBridge) public onlyManager notShutDown returns(bool) {
        bridge = _newBridge;
        return true;
    }

    function showDonations(address _of, address _token) public view returns(uint){
        return donations[_of][_token];
    }
}
