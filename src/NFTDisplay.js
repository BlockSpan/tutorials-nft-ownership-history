import React, { useState } from 'react';
import axios from 'axios';

const NFTDisplay = ({ nft , error }) => {
  if (nft === null) {
    return null;
  }
  if (!nft) {
    return (
      <div className='errorMessage'>
        {error}
      </div>
    );
  }
  return (
    <div className='nftData'>
      <h2>{nft.name}</h2>
      <div className='imageContainer'>
        {nft.cached_images && nft.cached_images.medium_500_500 ? (
          <img
            className='image'
            src={nft.cached_images.medium_500_500}
            alt={nft.name}
          />
        ) : (
          <div className='message'>Image not available.</div>
        )}
      </div>
      <p className='message'>
        Id: {checkData(nft.id)} | Token Name: {checkData(nft.token_name)} |{' '}
        Rarity: {checkData(nft.rarity_rank)} | Recent Price USD:{' '}
        {nft.recent_price && nft.recent_price.price_usd
          ? parseFloat(nft.recent_price.price_usd).toFixed(2)
          : 'N/A'} | Recent Price Native Currency:{' '}
        {nft.recent_price && nft.recent_price.price
          ? `${parseFloat(nft.recent_price.price).toFixed(5)} ${
              nft.recent_price.price_currency
            }`
          : 'N/A'}
      </p>
    </div>
  );
};

const NFTTable = ({ transfers }) => {
  if (!transfers) return null;
  return (
    <div className='tableContainer'>
      <table>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>From</th>
            <th>To</th>
            <th>Transfer Type</th>
            <th>Block Timestamp</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white',
              }}
            >
              <td>{checkData(transfer.from_address)}</td>
              <td>{checkData(transfer.to_address)}</td>
              <td>{checkData(transfer.transfer_type)}</td>
              <td>{checkData(transfer.block_timestamp)}</td>
              <td>{checkData(transfer.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const checkData = (data) => (data ? data : 'N/A');

const Wrapper = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [blockchain, setBlockchain] = useState('eth-main');
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [nft, setNFT] = useState(null);
  const [transfers, setTransfers] = useState(null);
  const [error, setError] = useState(null)

  const API_KEY = 'YOUR_BLOCKSPAN_API_KEY';

  const getAllTransfers = async (contractAddress, tokenId, blockchain) => {
    const options = {
      method: 'GET',
      url: `https://api.blockspan.com/v1/transfers/contract/${contractAddress}/token/${tokenId}?chain=${blockchain}&page_size=25`,
      headers: {
        accept: 'application/json',
        'X-API-KEY': API_KEY,
      },
    };
  
    try {
      const response = await axios.request(options);
      return response.data.results;
    } catch (error) {
      error.response.status === 401 ?
        setError('Invalid blockspan API key!') :
        setError('Error: Verify that chain, contract address, and token ID are all valid!')
      console.error(error)
    }
  };
  
  const getSingleNFT = async (contractAddress, tokenId, blockchain) => {
    const options = {
      method: 'GET',
      url: `https://api.blockspan.com/v1/nfts/contract/${contractAddress}/token/${tokenId}?chain=${blockchain}`,
      headers: {
        accept: 'application/json',
        'X-API-KEY': API_KEY,
      },
    };
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      error.response.status === 401 ?
        setError('Invalid blockspan API key!') :
        setError('Error: Verify that chain, contract address, and token ID are all valid!')
      console.error(error)
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const nftData = await getSingleNFT(contractAddress, tokenId, blockchain);
      setNFT(nftData);
      const transfersData = await getAllTransfers(
        contractAddress,
        tokenId,
        blockchain
      );
      setTransfers(transfersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockchainChange = (event) => {
    setBlockchain(event.target.value);
  };

  return (
    <div>
      <h1 className='title'>NFT Ownership History</h1>
      <p className='message'>
        Select a chain and input contract address and NFT token ID below to see
        the ownership history of the NFT.
      </p>
      <div className='inputContainer'>
        <select
          name='blockchain'
          value={blockchain}
          onChange={handleBlockchainChange}
        >
          <option value='eth-main'>eth-main</option>
          <option value='arbitrum-main'>arbitrum-main</option>
          <option value='optimism-main'>optimism-main</option>
          <option value='poly-main'>poly-main</option>
          <option value='bsc-main'>bsc-main</option>
          <option value='eth-goerli'>eth-goerli</option>
        </select>
        <input
          type='text'
          placeholder='Contract Address'
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <input
          type='text'
          placeholder='Token ID'
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button onClick={fetchData}>View Ownership History</button>
      </div>
      <>
        {loading ? (
          <div className='message'>Loading...</div>
        ) : (
          <>
            <NFTDisplay nft={nft} error={error}/>
            <NFTTable transfers={transfers} />
          </>
        )}
      </>
    </div>
  );
};

export default Wrapper;
