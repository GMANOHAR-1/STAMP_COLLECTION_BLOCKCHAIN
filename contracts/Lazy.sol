// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Lazy is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private totalItems;

    struct NFTStruct {
        string name;
        string description;
        string imageUrl;
        uint tokenId;
        address owner;
        uint price;
        uint royalty;  
    }

    uint listingPrice = 0.0001 ether;
    mapping(uint => NFTStruct) collection;

    constructor() ERC721("Lazy Coin", "LZC") {}

    function mint(
        string memory name,
        string memory description,
        string memory imageUrl,
        uint price,
        uint royalty
    ) public payable {
        require(msg.value >= listingPrice, "Insufficient amount");
        require(price >= 0 ether, "Price cannot be empty");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(imageUrl).length > 0, "ImageUrl cannot be empty");
        require(royalty >= 0 && royalty <= 100, "Royalty percentage must be between 0 and 100");

        totalItems.increment();
        uint tokenId = totalItems.current();
        _mint(msg.sender, tokenId);

        NFTStruct memory item;
        item.tokenId = tokenId;
        item.name = name;
        item.description = description;
        item.imageUrl = imageUrl;
        item.price = price;
        item.owner = msg.sender;
        item.royalty = royalty;  

        collection[tokenId] = item;
    }

    function buyNFT(uint tokenId) public payable {
        require(_exists(tokenId), "NFT does not exist");
        require(ownerOf(tokenId) != address(0), "NFT is not available");
        require(ownerOf(tokenId) != msg.sender, "You cannot buy your own NFT");
        require(msg.value >= collection[tokenId].price, "Insufficient funds");

        address seller = ownerOf(tokenId);
        uint royaltyAmount = (collection[tokenId].price * collection[tokenId].royalty) / 100;
        uint sellerProceeds = collection[tokenId].price - royaltyAmount;

        collection[tokenId].owner = msg.sender;
        _transfer(seller, msg.sender, tokenId);

        payable(seller).transfer(sellerProceeds);
        payable(owner()).transfer(royaltyAmount); // Transfer the royalty fee to the contract owner
    }

    function getNFTs() public view returns (NFTStruct[] memory NFTs) {
        NFTs = new NFTStruct[](totalItems.current());

        for (uint i = 0; i < totalItems.current(); i++) {
            NFTs[i] = collection[i + 1];
        }
    }
}
