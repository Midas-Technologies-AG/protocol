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

    constructor() public { }

    function makeDonation(
        address bridge,
        uint64 receiverDAC,
        address donationAsset,
        uint donationQuantity
        ) public onlyManager notShutDown {
        ensureCanMakeOrder(donationAsset);
        getTrading().updateAndGetQuantityBeingTraded(donationAsset);
        ensureNotInOpenMakeOrder(donationAsset);
        // Prepare donation
        //prepareDonation(bridge, donationAsset, donationQuantity);
/*        Vault(Hub(getHub()).vault()).withdraw(donationAsset, donationQuantity);
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "Maker asset could not be approved"
        );*/
        // Donate
        GivethBridge(bridge).donateAndCreateGiver(
                address(this),
                uint64(receiverDAC),
                address(donationAsset),
                uint(donationQuantity)
            )    
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
    }

    function prepareDonation (address bridge, address donationAsset, uint donationQuantity) internal {
        Hub hub = getHub();
        Vault vault = Vault(hub.vault());
        vault.withdraw(donationAsset, donationQuantity);
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "Taker asset could not be approved"
        );
    }

    function whitelistTokenOnBridge (address bridge, address _token, bool _value)
    onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
