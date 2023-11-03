import address from '@/artifacts/contractAddress.json';
import abi from '@/artifacts/contracts/Lazy.sol/Lazy.json';
import { getGlobalState, setGlobalState } from '@/store';
import { ethers } from 'ethers';

const ContractAddress = address.address;
const ContractAbi = abi.abi;
let tx, ethereum;

if (typeof window !== 'undefined') {
  ethereum = window.ethereum;
}

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

const getEthereumContract = async () => {
  try {
    const connectedAccount = getGlobalState('connectedAccount');

    // Check if there's a connected account
    if (connectedAccount) {
      // Set up the provider using the Web3Provider
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      // Create the contract instance
      const contract = new ethers.Contract(ContractAddress, ContractAbi, signer);

      return contract;
    } else {
      // No connected account, use a JsonRpcProvider
      const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/bGSRkDSiQSUHrPtU6vcoPSWqtQUDFlgy');
      const signer = provider.getSigner('0x608944A35F65C097e6ea54c0f6D8AB07d7F1790A');

      // Create the contract instance
      const contract = new ethers.Contract(ContractAddress, ContractAbi, signer);

      return contract;
    }
  } catch (error) {
    // Log the error and handle it as needed
    console.error('Error in getEthereumContract:', error);
    // You may choose to throw the error again or return some default value here
    throw error;
  }
};


const ssrEthereumContract = async () => {
  const provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/bGSRkDSiQSUHrPtU6vcoPSWqtQUDFlgy')
  const wallet = ethers.Wallet.createRandom()
  const signer = provider.getSigner(wallet.address)
  const contract = new ethers.Contract(ContractAddress, ContractAbi, signer)
  return contract
}


const isWalletConnected = async () => {
  try {
    if (!ethereum) return reportError('Please install Metamask');
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async () => {
      setGlobalState('connectedAccount', accounts[0]);
      await isWalletConnected();
    });

    if (accounts.length) {
      setGlobalState('connectedAccount', accounts[0]);
    } else {
      reportError('Please connect wallet.');
      console.log('No accounts found.');
    }
  } catch (error) {
    console.log('I am here error');
    reportError(error);
  }
};

const connectWallet = async () => {
  try {
    if (!ethereum) return reportError('Please install Metamask');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setGlobalState('connectedAccount', accounts[0]);
  } catch (error) {
    reportError(error);
  }
};

const mintNft = async ({ name, description, imageUrl, price, loyalty }) => {
  if (!ethereum) return reportError('Please install Metamask');
  return new Promise(async (resolve, reject) => {
    try {
      const contract = await getEthereumContract();
     
      // Assuming that `loyaltyPercentage` is a parameter, you can add it to the mint function
      tx = await contract.mint(name, description, imageUrl, toWei(price), loyalty, {
        value: toWei(0.02),
      });

      await tx.wait();
      resolve(tx);
    } catch (error) {
      console.log('Error in minting nfts:', error);
      reportError(error);
      reject(error);
    }
  });
};

const buyNft = async (tokenId, price) => {
  try {
    // Check if Metamask is installed and connected
    if (!ethereum) {
      throw new Error('Please install Metamask');
    }

    const connectedAccount = getGlobalState('connectedAccount');
    const provider = new ethers.providers.Web3Provider(ethereum);
    const contract = await getEthereumContract();

    // Convert the price to Wei
    const priceWei = toWei(price);

    // Check if the connected account has enough funds to buy the NFT
    const balance = await provider.getBalance(connectedAccount);
    if (balance.lt(priceWei)) {
      throw new Error('Insufficient funds to buy the NFT');
    }

    // Call the buyNFT function in the smart contract
    const tx = await contract.buyNFT(tokenId, {
      value: priceWei,
    });

    await tx.wait();
    return tx;
  } catch (error) {
    reportError(error);
    throw error;
  }
};




const loadNFTs = async () => {
  const contract = await getEthereumContract();
  const nfts = await contract.getNFTs();
  console.log("nfts from backend")
  console.log(nfts);
  return structuredNFTs(nfts);
};

const structuredNFTs = (nfts) =>
  nfts
    .map((nft) => ({
      tokenId: nft.tokenId.toNumber(),
      owner: nft.owner.toLowerCase(),
      name: nft.name,
      description: nft.description,
      imageUrl: nft.imageUrl,
      price: fromWei(nft.price),
      royalty : (nft.royalty.toNumber())
    }))
    .reverse();

const reportError = (error) => {
  console.log('I am the only error');
  console.log(error);
};

export { isWalletConnected, connectWallet, mintNft, loadNFTs, buyNft };
