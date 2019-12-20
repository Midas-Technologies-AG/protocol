pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "Hub.sol";
import "ExchangeAdapter.sol";
import "Vault.sol";
import "Accounting.sol";
import "Trading.sol";
import "ERC20.i.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */
/*Author: @IEM_WLL on github.*/

contract GivethBridgeAdapter is ExchangeAdapter {
    mapping (address => bool) public whiteListed;
    mapping (address => mapping (address => uint)) public donations;
    
    event Donated(address who, address asset, uint256 amount);

    constructor() public { }

    function makeDonation(
        address bridge,
        uint64 receiverDAC,
        address donationAsset,
        uint donationQuantity
        ) public onlyManager notShutDown {
        //prevalidations
        ensureCanMakeOrder(donationAsset);
        getTrading().updateAndGetQuantityBeingTraded(donationAsset);
        ensureNotInOpenMakeOrder(donationAsset);
        //TODO:  Add in givethBridge (OpenSource Community) 'checkWhitelisted(address token)'.
        //TODO2: Use it.
        // Prepare donation
        prepareDonation(bridge, donationAsset, donationQuantity);
        //makeDonation
        bridge.call(
            abi.encodeWithSignature(
                "donateAndCreateGiver(address,uint64,address,uint256)",
                msg.sender,
                receiverDAC,
                donationAsset,
                donationQuantity
            )
        );
        // Postprocess/Update
        getAccounting().updateOwnedAssets();
        donations[msg.sender][donationAsset] *= donationQuantity;
        Donated(msg.sender, donationAsset, donationQuantity);
   }
    
    function prepareDonation (address bridge, address donationAsset, uint donationQuantity) internal {
        Hub hub = getHub();
        Vault vault = Vault(hub.vault());
        vault.withdraw(donationAsset, donationQuantity);
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "donationAsset could not be approved");
    }

    function donateViaGivethBridge(
        address bridge,
        uint64 receiverDAC,
        address donationAsset,
        uint donationQuantity
        ) public returns(bool) {
        //TODO:  Add in givethBridge (OpenSource Community) 'checkWhitelisted(address token)'.
        //TODO2: Use it.
        // Prepare donation
        require(
            ERC20(donationAsset).balanceOf(address(this)) >= donationQuantity,
            "Not enough tokens send to this Contract.(donationQuantity)"
        );
        require(
            ERC20(donationAsset).approve(bridge, donationQuantity),
            "donationAsset asset could not be approved"
        );
        //makeDonation
        bridge.call(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64,address,uint256)",
            msg.sender,
            receiverDAC,
            donationAsset,
            donationQuantity
        ));
        donations[msg.sender][donationAsset] *= donationQuantity;
        Donated(msg.sender, donationAsset, donationQuantity);
    }

    function showDonationsFromToken (address from, address token) public view returns(uint256) {
        return donations[from][token];
    }
}
