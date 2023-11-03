import { mintNft, buyNft, deleteNft } from '@/services/blockchain';
import { truncate, useGlobalState } from '@/store';
import { useRouter } from 'next/router';
import { FaEthereum } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Card = ({ nftData, btn }) => {
  const [connectedAccount] = useGlobalState('connectedAccount');
  const router = useRouter();

  const isOwner = connectedAccount === nftData.owner;

  // Shorten the owner's address and NFT address with '...' if they are too long
  const shortOwnerAddress = `${nftData.owner.slice(0, 6)}...${nftData.owner.slice(-4)}`;

  // Increase the card shadow
  const cardStyle = {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  };

  const isMinted = nftData.owner !== '0x0000000000000000000000000000000000000000';

  const handleMint = async () => {
    if (!connectedAccount) return toast.warning('Please connect wallet...');

    await toast.promise(
      new Promise(async (resolve, reject) => {
        await mintNft(nftData)
          .then(async () => {
            const deleted = await onDelete();
            if (deleted) {
              router.push('/');
              resolve();
            } else {
              reject();
            }
          })
          .catch((error) => {
            alert(JSON.stringify(error));
            reject(error);
          });
      }),
      {
        pending: 'Listing NFT...',
        success: 'NFT Listed successfully...',
        error: 'Encountered an error',
      }
    );
  };

  const handleDelete = async () => {
    if (!isOwner) return toast.warning('Unauthorized...');

    await toast.promise(
      new Promise(async (resolve, reject) => {
        const deleted = await onDelete();
        if (deleted) {
          resolve(deleted);
        } else {
          reject(deleted);
        }
      }),
      {
        pending: 'Deleting NFT...',
        success: 'NFT deleted successfully 👌',
        error: 'Encountered error 🤯',
      }
    );
  };

  const onDelete = async () => {
    try {
      const response = await fetch('/api/nfts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      if (response.ok) {
        window.location.reload();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      return false;
    }
  };

  const handleBuy = async () => {
    if (!connectedAccount) return toast.warning('Please connect wallet...');

    await toast.promise(
      new Promise(async (resolve, reject) => {
        const priceInEth = parseFloat(nftData.price);
        console.log("ether price ", priceInEth);
        await buyNft(nftData.tokenId, priceInEth)
          .then(async () => {
            router.push('/');
            resolve();
          })
          .catch((error) => {
            alert(JSON.stringify(error));
            reject(error);
          });
      }),
      {
        pending: 'Buying NFT...',
        success: 'NFT purchased successfully...',
        error: 'Encountered an error',
      }
    );
  };

  return (
    <div className="bg-white rounded-lg p-6" style={cardStyle}>
      <img src={nftData.imageUrl} alt={nftData.name} className="w-full h-56 object-cover mb-4" />
      <h2 className="text-xl font-bold">{nftData.name}</h2>
      <p className="text-gray-500 mb-4">{truncate(nftData.description, 100, 0, 103)}</p>
      <p className="text-gray-500 mb-4">{`Owner: ${shortOwnerAddress}`}</p>
      
      {btn ? (
        <div className="flex justify-between items-center">
          {isMinted ? (
            isOwner ? (
              <button
                onClick={handleMint}
                className="bg-blue-500 text-white px-2 py-1 rounded-md
                hover:bg-gray-200 transition-colors duration-300"
              >
                <p className="flex justify-start items-center space-x-1">
                  <FaEthereum />
                  <span>{nftData.price} List</span>
                </p>
              </button>
            ) : (
              <>
                <button
                  onClick={handleBuy}
                  className="bg-green-500 text-white px-2 py-1 rounded-md
                  hover-bg-gray-200 transition-colors duration-300"
                >
                  <p className="flex justify-start items-center space-x-1">
                    <FaEthereum />
                    <span>Buy for {nftData.price}</span>
                  </p>
                </button>
              </>
            )
          ) : (
            <>
              <button
                onClick={handleMint}
                className="bg-blue-500 text-white px-2 py-1 rounded-md
                hover:bg-gray-200 transition-colors duration-300"
              >
                <p className="flex justify-start items-center space-x-1">
                  <FaEthereum />
                  <span>{nftData.price} List</span>
                </p>
              </button>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-2 py-1 rounded-md
                  hover-bg-gray-200 transition-colors duration-300"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          {isMinted ? (
            isOwner ? (
              <p className="text-green-500 font-semibold">You own this</p>
            ) : (
              <button
                onClick={handleBuy}
                className="bg-green-500 text-white px-2 py-1 rounded-md
                hover-bg-gray-200 transition-colors duration-300"
              >
                <p className="flex justify-start items-center space-x-1">
                  <FaEthereum />
                  <span>Buy for {nftData.price}</span>
                </p>
              </button>
            )
          ) : (
            <button
              onClick={handleMint}
              className="bg-blue-500 text-white px-2 py-1 rounded-md
              hover-bg-gray-200 transition-colors duration-300"
            >
              <p className="flex justify-start items-center space-x-1">
                <FaEthereum />
                <span>{nftData.price} List</span>
              </p>
            </button>
          )}
        </div>
      )}
    {console.log(nftData)}
   
      {isMinted && (
        // Add the loyalty percentage and an elegant symbol here
        <div className="flex justify-between items-center mt-4">
          <p className="text-gray-500">Loyalty: {nftData.royalty}%</p>
        </div>
      )}
    </div>
  );
};

export default Card;
