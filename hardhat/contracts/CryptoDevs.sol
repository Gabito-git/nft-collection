// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable{

   /**
      * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
      * token will be the concatenation of the `baseURI` and the `tokenId`.
      */
    string _baseTokenURI;

     // boolean to keep track of whether presale started or not
    bool public presaleStarted;

    // Whitelist contract instance
    IWhitelist whitelist;

     // timestamp for when presale would end
    uint256 public presaleEnded;

      // max number of CryptoDevs
    uint256 public maxTokenIds = 20;

      // total number of tokenIds minted
    uint256 public tokenIds;

      //  _price is the price of one Crypto Dev NFT
    uint256 public _price = 0.01 ether;

     // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    event TokenMinted(uint);

    modifier onlyWhenNotPaused{
      require(!_paused, "Contract currently paused");
      _;
    }

  /**
  * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
  * name in our case is `Crypto Devs` and symbol is `CD`.
  * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
  * It also initializes an instance of whitelist interface.
  */
  constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD"){
    _baseTokenURI = baseURI;
    whitelist = IWhitelist( whitelistContract );
  }

   /**
    * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
    * returned an empty string for the baseURI
    */
  function _baseURI() internal view virtual override returns (string memory) {
      return _baseTokenURI;
  }

  /**
  * @dev setPaused makes the contract paused or unpaused
    */
  function setPaused(bool val) public onlyOwner {
      _paused = val;
  }

  /** onlyOwner is a modifier from Ownable */
  function startPresale() public onlyOwner{
    presaleStarted = true;

    // Set presaleEnded time as current timestamp + 5 minutes
    // Solidity has cool syntax for timestamps (seconds, minutes, hours, days, years)
    presaleEnded = block.timestamp + 5 minutes;

  }

  function presaleMint() public onlyWhenNotPaused payable{
    require(presaleStarted && block.timestamp <  presaleEnded, "Presale ended");
    require(whitelist.whitelistedAddresses(msg.sender), "You're not in whitelist");
    require(tokenIds < maxTokenIds, "Exceeded limit");
    require(msg.value > _price, "Ether sent not correct");

    tokenIds++;
    emit TokenMinted( tokenIds );
    //_safeMint is a safer version of the _mint function as it ensures that
    // if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
    // If the address being minted to is not a contract, it works the same way as _mint
    _safeMint(msg.sender, tokenIds);

  }

  // La unica diferencia con presaleMint es que aca no necesitamos el whitelist ya que
  // este es el mint publico
  function mint() public onlyWhenNotPaused payable{
    require(presaleStarted && block.timestamp > presaleEnded, "Presale has not ended yet");
    require(tokenIds < maxTokenIds, "Exceeded limit");
    require(msg.value > _price, "Ether sent not correct");

    tokenIds++;
    emit TokenMinted( tokenIds );
    //_safeMint is a safer version of the _mint function as it ensures that
    // if the address being minted to is a contract, then it knows how to deal with ERC721 tokens
    // If the address being minted to is not a contract, it works the same way as _mint
    _safeMint(msg.sender, tokenIds);
  }

  function withdraw() public onlyOwner{
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent,) = _owner.call{ value: amount }("");
    require(sent, "Failed to send ether");
  }
  
     // Function to receive Ether. msg.data must be empty
  receive() external payable {}

  // Fallback function is called when msg.data is not empty
  fallback() external payable {}       


}