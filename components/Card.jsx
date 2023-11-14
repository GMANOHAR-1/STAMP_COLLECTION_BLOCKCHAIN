import React, { useState } from 'react'; // Import useState from React
import { mintNft, buyNft, deleteNft } from '@/services/blockchain';
import { truncate, useGlobalState } from '@/store';
import { useRouter } from 'next/router';
import { FaEthereum } from 'react-icons/fa';
import { IoIosAlert, IoIosArrowUp, IoIosCart, IoIosCheckmark, IoIosFlame, IoIosMedal, IoIosWallet } from 'react-icons/io';
import { toast } from 'react-toastify';

const Card = ({ nftData, btn }) => {
  const [connectedAccount] = useGlobalState('connectedAccount');
  const router = useRouter();
  const isOwner = connectedAccount === nftData.owner;
  const [showOverlay, setShowOverlay] = useState(false); // State to control overlay visibility

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
              <p className="text-green-500 font-semibold">✨You own this✨</p> 
             
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
{isMinted && (
  <div className="flex justify-between items-center mt-4">
    <p className="text-gray-500">
      Royalty: {nftData.royalty}%
    </p>
    <button
      onClick={() => setShowOverlay(true)} // Show overlay on button click
      className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-gray-200 transition-colors duration-300"
    >
      View
    </button>
  </div>
)}


{/* Overlay */}
{showOverlay && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white max-w-4xl p-8 rounded-lg shadow-lg text-center">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{nftData.name}</h2>
        <button
          onClick={() => setShowOverlay(false)}
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <img src={nftData.imageUrl} alt={nftData.name} className="h-60 object-contain mt-4" />
      <p className="text-gray-700 text-xl mt-4">{nftData.description}</p>
      <div className="flex flex-col items-center mt-4">
        <span className="text-gray-600 mb-2">Owner: {shortOwnerAddress}</span>
        <span className="text-blue-600 mb-2">Price: {nftData.price}</span>
        <span className="text-green-600">Royalty: {nftData.royalty}%</span>
      </div>
      <button
        onClick={() => setShowOverlay(false)} // Close the overlay
        className="bg-blue-500 text-white px-6 py-3 rounded-lg mt-6 hover:bg-gray-200 transition-colors duration-300"
      >
        Close
      </button>
    </div>
  </div>
)}


    </div>
  );
};

export default Card;
