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

    function makeDonation(
        address donationAsset,
        uint donationQuantity
        ) public payable onlyManager notShutDown {
        Hub hub = getHub();
        // Prepare donation
        require(prepareDonation(donationAsset, donationQuantity), 'Preparation for donation failed.');
        // Donate asset
        require(callBridge(bridge, donationAsset, donationQuantity), 'call Bridge failed.');
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
    }

    function prepareDonation (
        address donationAsset,
        uint donationQuantity) internal onlyManager returns(bool) {
        ensureCanMakeOrder(donationAsset);
        Hub hub = getHub();
        // Order parameter checks
        getTrading().updateAndGetQuantityBeingTraded(donationAsset);
        ensureNotInOpenMakeOrder(donationAsset);
        //withdraw the tokens
        Vault vault = Vault(hub.vault());
        vault.withdraw(donationAsset, donationQuantity);

        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "Maker asset could not be approved"
            );
        return true;
    }

    function callBridge (address aim, address asset, uint amount) public payable returns(bool) {
        aim.call.value(address(this).balance)(
            bytes4(keccak256("donateAndCreateGiver(address,uint64,address,uint256)")),
            msg.sender,
            receiverDAC,
            asset,
            amount
            );
        return true;
    }

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
