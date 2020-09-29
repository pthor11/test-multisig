pragma solidity ^0.5.8;

interface IERC20 {
    function mintTo(address account, uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

contract BasicAuth {
    address public owner;
    mapping(address => bool) mod;
    mapping(address => bool) custodian;

    modifier onlyCustodian() {
        require(
            custodian[msg.sender] || msg.sender == owner,
            "Must be custodian"
        );
        _;
    }

    function addCustodian(address _custodian) public onlyOwner {
        if (_custodian != address(0x0)) {
            custodian[_custodian] = true;
        }
    }

    function removeCustodian(address _custodian) public onlyOwner {
        if (custodian[_custodian]) {
            custodian[_custodian] = false;
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Must be owner");
        _;
    }
    modifier onlyMod() {
        require(mod[msg.sender] || msg.sender == owner, "Must be mod");
        _;
    }

    function addMod(address _mod) public onlyOwner {
        if (_mod != address(0x0)) {
            mod[_mod] = true;
        }
    }

    function removeMod(address _mod) public onlyOwner {
        if (mod[_mod]) {
            mod[_mod] = false;
        }
    }

    function changeOwner(address _newOwner) public onlyOwner {
        if (_newOwner != address(0x0)) {
            owner = _newOwner;
        }
    }

    constructor() public {
        owner = msg.sender;
    }
}

contract WrapFactory is BasicAuth {
    IERC20 token;

    constructor(address _token) public {
        token = IERC20(_token);
    }

    event Wrap(bytes32 indexed txId, address indexed toAddress, uint256 amount);
    event UnWrap(string toAddress, uint256 amount);

    uint256 minimumConfirm = 2;
    uint256 maximunConfirm = 3;

    function setConfirmSetting(uint256 _minimun, uint256 _maximun) public {
        require(msg.sender == owner, "Must be owner");
        minimumConfirm = _minimun;
        maximunConfirm = _maximun;
    }

    struct Wrapper {
        bool isSent;
        uint256 amount;
        address toAddress;
        uint256 confirmed;
    }
    mapping(bytes32 => Wrapper) public wrapper;
    mapping(bytes32 => mapping(address => bool)) isCustodianConfirm;

    function needCustodianConfirm(bytes32 _txid) public view returns (bool) {
        return wrapper[_txid].confirmed < maximunConfirm;
    }

    function custodianConfirm(
        bytes32 _txid,
        uint256 _amount,
        address _toAddress
    ) public onlyCustodian {
        Wrapper storage TX = wrapper[_txid];
        if (TX.confirmed == 0) {
            TX.amount = _amount;
            TX.toAddress = _toAddress;
            isCustodianConfirm[_txid][msg.sender] = true;
        } else {
            require(
                TX.amount == _amount && TX.toAddress == _toAddress,
                "Wrong detail!!"
            );
            require(
                !isCustodianConfirm[_txid][msg.sender],
                "Custodian already confirm"
            );
            isCustodianConfirm[_txid][msg.sender] = true;
        }
        TX.confirmed++;
        if (TX.confirmed >= minimumConfirm && TX.isSent == false) {
            TX.isSent = true;
            token.mintTo(_toAddress, _amount);
            emit Wrap(_txid, _toAddress, _amount);
        }
    }

    function unwrap(string memory toAddress, uint256 amount) public {
        token.burnFrom(msg.sender, amount);
        emit UnWrap(toAddress, amount);
    }
}
