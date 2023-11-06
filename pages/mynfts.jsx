import Head from 'next/head'
import { loadNFTs } from '@/services/blockchain'
import { useGlobalState } from '@/store'
import Card from '@/components/Card'
import Header from '@/components/Header'

export default function Home({ nfts }) {
    const [connectedAccount] = useGlobalState('connectedAccount');
    const ownedNFTs = nfts.filter((nft) => nft.owner === connectedAccount);
    const totalPrices = ownedNFTs.reduce((total, nft) => total + parseFloat(nft.price), 0);

    return (
        <div>
            <Head>
                <title>Stamps- MyNfts</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />
            <div className="container mx-auto p-6">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-3xl font-bold mb-6">Your Collection</h1>

                    <p className="text-lg">
                        You own <span className="text-blue-500 font-semibold">{ownedNFTs.length}</span> NFTs.
                    </p>

                    <p className="text-lg">
                        Total Prices of Your NFTs: <span className="text-green-500 font-semibold">{totalPrices} ETH</span>
                    </p>

                    <div className="address-info mt-6">
                        <p className="text-lg">
                            Your Address: <span className="text-gray-600 font-semibold">{connectedAccount}</span>
                        </p>
                    </div>
                </div>
          

            {ownedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4 lg:gap-3 py-2.5">
                    {ownedNFTs.map((nft, i) => (
                        <Card key={i} nftData={nft} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">You don't own any NFTs yet.</p>
            )}
        </div>
    </div >
  );
}

export const getServerSideProps = async () => {
    const data = await loadNFTs();
    return {
        props: { nfts: JSON.parse(JSON.stringify(data)) },
    };
}
