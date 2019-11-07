pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "GivethBridge.sol";

/*GivethAdapter enables  ERC20funds on @melonproject/protocol to donate giveth DAC's. (DecentralizedAltruisticCommun) */

/**
 * The GivethAdapter contract does this and that...
 */
contract GivethAdapter {
    constructor() {
    }
  
    function tester (
        address _bridge,
        uint64 _targetDAC,
        address _token,
        uint _amount
    ) public payable returns(bool) {
        require(ERC20(_token).approve(_bridge, _amount));        
        GivethBridge(_bridge).donateAndCreateGiver(
            msg.sender,
            _targetDAC,
            _token,
            _amount
        );
        return true;
    }
}
