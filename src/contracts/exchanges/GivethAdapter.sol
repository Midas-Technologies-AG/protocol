pragma solidity ^0.4.25;

import "Trading.sol";
import "Hub.sol";
import "Accounting.sol";
import "ExchangeAdapter.sol";
import "Giveth.sol";

contract GivethAdapter is ExchangeAdapter {
    //@notice Global used values.
	uint public orderId;
	address public targetExchange;

	constructor () public {
		orderId = 0;
		targetExchange = 0x279277482F13aeF92914317a0417DD591145aDc9;
	}

	//@notice Make sure if this Contract gets ETH that it will also be donated.
	function () public payable {
		Giveth(targetExchange).donateETH();
	}

	//@notice This function donates ETH to the giveth DAC.
	function donateEther() public payable {
		Giveth(targetExchange).donateETH();
	}

    /// @notice Mock make order to donate ERC20 tokens.
    function makeOrder(
        address targetExchange,
        address[6] orderAddresses,
        uint[8] orderValues,
        bytes32 identifier,
        bytes makerAssetData,
        bytes takerAssetData,
        bytes signature
    ) public onlyManager notShutDown {
        address _makerAsset = orderAddresses[2];
        address takerAsset = orderAddresses[3];
        uint makerQuantity = orderValues[0];
        uint takerQuantity = orderValues[1];

        // Order parameter checks
        Hub hub = getHub();
		ensureCanMakeOrder(_makerAsset);
        ERC20 makerAsset = ERC20(_makerAsset);
        getTrading().updateAndGetQuantityBeingTraded(makerAsset);
        ensureNotInOpenMakeOrder(makerAsset);

        Vault(Hub(getHub()).vault()).withdraw(makerAsset, makerQuantity);

        Giveth(targetExchange).donateAsset(makerAsset, makerQuantity);

        orderId += 1;
        getTrading().orderUpdateHook(
            targetExchange,
            bytes32(orderId),
            Trading.UpdateType.make,
            [address(makerAsset), address(0)],
            [makerQuantity, uint(0), uint(0)]
        );
        getAccounting().updateOwnedAssets();
    }

    /// @notice Mock take order
    function takeOrder(
        address targetExchange,
        address[6] orderAddresses,
        uint[8] orderValues,
        bytes32 identifier,
        bytes makerAssetData,
        bytes takerAssetData,
        bytes signature
    ) public {
        address makerAsset = orderAddresses[2];
        address takerAsset = orderAddresses[3];
        uint makerQuantity = orderValues[0];
        uint takerQuantity = orderValues[1];
        uint fillTakerQuantity = orderValues[6];

        getTrading().orderUpdateHook(
            targetExchange,
            bytes32(identifier),
            Trading.UpdateType.take,
            [address(makerAsset), address(takerAsset)],
            [makerQuantity, takerQuantity, fillTakerQuantity]
        );
    }

    /// @notice Mock cancel order
    function cancelOrder(
        address targetExchange,
        address[6] orderAddresses,
        uint[8] orderValues,
        bytes32 identifier,
        bytes makerAssetData,
        bytes takerAssetData,
        bytes signature
    ) public {
        Hub hub = getHub();
        address makerAsset = orderAddresses[2];

        getTrading().removeOpenMakeOrder(targetExchange, makerAsset);
        getTrading().orderUpdateHook(
            targetExchange,
            bytes32(identifier),
            Trading.UpdateType.cancel,
            [address(0), address(0)],
            [uint(0), uint(0), uint(0)]
        );
    }
}
