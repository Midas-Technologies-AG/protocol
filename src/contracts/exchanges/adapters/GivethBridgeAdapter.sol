pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "GivethBridge.sol";
import "Hub.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";
import "Accounting.sol";
import "Trading.sol";
import "ERC20.i.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

contract GivethBridgeAdapter is ExchangeAdapter {
    address public bridge;
    uint64 public receiverDAC;

    constructor(address _bridge, uint64 _receiverDAC) public {
        bridge = _bridge;
        receiverDAC = _receiverDAC;
    }

    function makeDonation(
        address donationAsset,
        uint donationQuantity
        ) public onlyManager notShutDown {
        ensureCanMakeOrder(donationAsset);
        Hub hub = getHub();
        // Prepare donation
        Vault vault = Vault(hub.vault());
        vault.withdraw(donationAsset, donationQuantity);
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "Maker asset could not be approved"
        );
        // Donate
        GivethBridge(bridge).donateAndCreateGiver(
            msg.sender,
            receiverDAC,
            donationAsset,
            donationQuantity
        );
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
    }

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
