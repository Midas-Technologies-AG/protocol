pragma solidity ^0.4.25;

contract Giveth {

  // @notice Just some global used stuff.
	mapping (address => mapping (address => uint)) public donations;
	mapping (address => uint64) public giverIDs;
	address public _targetExchange;
	uint64 public _receiverID;


	// @notice If _token = address(0), this means the token is ether itself.
	event donated(address _donator,address _token, uint _amount);

	// @notice These values are for the Testnet-Setup.(Ropsten) 
	constructor () public {
		_targetExchange = 0x279277482F13aeF92914317a0417DD591145aDc9;
		_receiverID = uint64(127);
	}
	
	//@notice Just sending Ether to this Contract forwards the sended Amount to the givethDAC.
    function () 
    public payable{
    	donateETH();
    }
    
    //@notice This function sends Ethereum to the implemented Giveth DAC.
    function donateETH ()
    public payable {
    	uint val = msg.value;
    	address sender = msg.sender;

    	require (val > 0,
    		"There is nothing to donate.");
    	
        require(_targetExchange.call.value(address(this).balance).gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64)",
            sender,
            _receiverID
            )),
        "Donation wasn't successfull. Please try again.");
        giverIDs[sender] = uint64(sender);
        donations[address(0x0)][sender] += val;
        emit donated(sender,address(0x0), val);
    }

    //@notice This function makes it possible to send ERC20 token to the implemented Giveth DAC.
    function donateAsset (
    	address _makerAsset,
        uint _makerQuantity
        )
    public {
    	address sender = msg.sender;
        require(_targetExchange.delegatecall.gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64,address,uint)",
            sender,
            _receiverID,
            _makerAsset,
            _makerQuantity
            )),
        "Donation wasn't successfull. Please try again.");
        giverIDs[sender] = uint64(sender);
        donations[_makerAsset][sender] += _makerQuantity;
        emit donated(sender, address(_makerAsset), _makerQuantity);
    }
}
