import Head from 'next/head';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useGlobalState } from '@/store';
import { toast } from 'react-toastify';
import { uploadFileToIPFS, uploadJSONToIPFS } from '../services/pinata'; // Import the IPFS service functions

export default function CreateNFTPage() {
  const [connectedAccount] = useGlobalState('connectedAccount');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    file: null, // Add a 'file' field to store the uploaded image file
    royalty: '', // Add the 'royalty' field with a default value
  });

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        toast.loading('Uploading image to IPFS');
        // Upload the file to IPFS and get the IPFS URL
        const ipfsImageUrl = await uploadFileToIPFS(file);
        if (ipfsImageUrl.success === true) {
          // Set the imageUrl and preserve the royalty
          setFormData((prevData) => ({
            ...prevData,
            imageUrl: ipfsImageUrl.pinataURL,
          }));
          console.log(formData);
          toast.dismiss();
          toast.success('Image uploaded to IPFS successfully 👌');
        } else {
          toast.error('Failed to upload image to IPFS');
        }
      } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        toast.error('Failed to upload image to IPFS');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connectedAccount) return toast.warning('Please connect wallet...');
    toast.loading('Lazy Minting...');
    // Submit data to MongoDB
    try {
      const response = await fetch('/api/nfts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, owner: connectedAccount }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert data into MongoDB');
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.dismiss();
      return toast.error('Failed to create NFT in MongoDB');
    }

    // Create a JSON object with your data
    const nftData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      imageUrl: formData.imageUrl,
      owner: connectedAccount,
      royalty: formData.royalty, // Include the royalty
    };
console.log(nftData)
    // Upload the JSON object to IPFS
    try {
      const ipfsJsonUrl = await uploadJSONToIPFS(nftData);
      console.log(nftData);
      console.log('IPFS JSON URL:', ipfsJsonUrl);
    } catch (error) {
      toast.dismiss();
      console.error('Error uploading JSON data to IPFS:', error);
      toast.error('Failed to upload data to IPFS');
    }

    // Reset the form data
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      file: null,
      royalty: 0,
    });
    toast.dismiss();
    toast.success('NFT created successfully 👌');
  };

  return (
    <div>
      <Head>
        <title>Dapp Lazy - Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="container mx-auto py-10 w-2/5">
        <h1 className="text-3xl font-bold mb-6">Create NFT</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block font-semibold mb-2">
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="file" className="block font-semibold mb-2">
              Upload File
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              accept="image/*" // Allow only image files
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="royalty" className="block font-semibold mb-2">
              royalty Percentage
            </label>
            <input
              type="number"
              id="royalty"
              name="royalty"
              value={formData.royalty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Create NFT
          </button>
        </form>
      </div>
    </div>
  );
}
