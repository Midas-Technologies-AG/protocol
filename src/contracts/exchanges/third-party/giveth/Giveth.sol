pragma solidity ^0.4.25;

contract Giveth {

  // @notice Just some global used stuff.
	mapping (address => mapping (address => uint)) public donations;
	address public givethBridge;
	uint64 public receiverDAC;


	// @notice If _token = address(0), this means the token is ether itself.
	event donated(address _donator,address _token, uint _amount);

	// @notice These values are for the Testnet-Setup.(Ropsten) 
	constructor () public {
		givethBridge = 0x279277482F13aeF92914317a0417DD591145aDc9;
		receiverDAC = uint64(51); //FreshFruitForFun
	}
	
	//@notice Just sending Ether to this Contract forwards the sended Amount to the givethDAC.
    function () 
    public payable{
    	donateETH();
    }
    
    //@notice This function sends Ethereum to the implemented Giveth DAC.
    function donateETH ()
    public payable {
    	uint value = msg.value;
    	address sender = msg.sender;

    	require (value > 0,
    		"There is nothing to donate.");
    	
        require(givethBridge.call.value(address(this).balance).gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64)",
            sender,
            receiverDAC
            )),
        "Donation wasn't successfull. Please try again.");
        donations[address(0x0)][sender] += value;
        emit donated(sender,address(0x0), value);
    }

    //@notice This function makes it possible to send ERC20 token to the implemented Giveth DAC.
    function donateAsset (
    	address AssetAddress,
        uint AssetQuantity
        )
    public {
    	address sender = msg.sender;
        require(givethBridge.delegatecall.gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64,address,uint)",
            sender,
            receiverDAC,
            AssetAddress,
            AssetQuantity
            )),
        "Donation wasn't successfull. Please try again.");
        donations[AssetAddress][sender] += AssetQuantity;
        emit donated(sender, address(AssetAddress), AssetQuantity);
    }

    //@notice This function shows the donated value of _asset from donator _from.
    function showDonations (
    	address from,
    	address asset
    	) 
    public view returns(uint value){
    	return donations[asset][from];
    }
}
