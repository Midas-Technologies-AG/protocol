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
        require(prepareDonation(donationAsset, donationQuantity), 'Preparation for donation failed.');
        // Donate asset
        require(callBridge(bridge, donationAsset, donationQuantity), 'call Bridge failed.');
        // Postprocess/Update
        getAccounting().updateOwnedAssets(); 
    }

    function prepareDonation (
        address donationAsset,
        uint donationQuantity) internal returns(bool) {
        Hub hub = getHub();
        //withdraw the tokens
        Vault vault = Vault(hub.vault());
        vault.withdraw(donationAsset, donationQuantity);
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "Maker asset could not be approved"
            );
        return true;
    }

    function callBridge (address aim, address asset, uint amount) internal returns(bool) {
        aim.delegatecall(
                abi.encodeWithSignature(
                    "donateAndCreateGiver(address,uint64,address,uint256)",
                    msg.sender,
                    receiverDAC,
                    asset,
                    amount
                )
            );
        return true;
    }

    function whitelistTokenOnBridge (address _token, bool _value) onlyManager public returns(bool) {
        GivethBridge(bridge).whitelistToken(_token, _value);
        return true;
    }
}
