# NFT OWNERSHIP HISTORY API


## A STEP-BY-STEP GUIDE TO BUILDING AN NFT OWNERSHIP HISTORY TRACKER WITH BLOCKSPAN API AND REACTJS

In the fast-evolving landscape of Non-Fungible Tokens (NFTs), traceability and transparency are paramount. Ownership history plays a crucial role in establishing an NFT's authenticity and value. To help developers build applications that facilitate this, Blockspan offers robust APIs. In this post, we'll guide you through building an NFT Ownership History Tracker using Blockspan's API and ReactJS.

The Importance of Tracking NFT Ownership
Ownership tracking in the NFT ecosystem provides a clear picture of an asset's provenance. It assures potential buyers about the authenticity of the NFT, deters fraudulent activities, and enhances overall transparency.


## PREREQUISITES:

Before we begin, ensure you have the following:

- Node.js and npm installed
- A basic understanding of ReactJS and JavaScript
- A Blockspan API key


## STEP 1: SETTING UP THE REACT APP

First, let's create a new React application. Open your terminal and run:

`npx create-react-app nft-ownership-history`

This command will create a new React application named "nft-ownership-history".
Navigate into the new directory:

`cd nft-ownership-history`


## STEP 2: INSTALL AXIOS

We will use Axios, a promise-based HTTP client for the browser and Node.js, to make requests to the Blockspan API. To install Axios, run the following command:

`npm install axios`

## STEP 3: CREATING THE NFT DISPLAY COMPONENT

Now we're going to create the component that displays the NFT's details. 

Create a file called `NFTDisplay.js` in the `src` directory and add the following code:

```
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

```

Don't forget to replace `YOUR_BLOCKSPAN_API_KEY` with your actual Blockspan API key!

## STEP 4: UPDATING THE STYLES WITHIN CSS FILE

To enhance the user interface in the browser, replace all code in the `App.css` file with the following:

```
.App {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
}

.title {
  margin-top: 20px;
  margin-bottom: 0;
  text-align: center;
}

.errorMessage {
  text-align: center;
  color: red;
  font-weight: bold;
}

.message {
  text-align: center;
}

.image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.inputContainer {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.inputContainer input {
  padding: 10px;
  font-size: 1em;
  width: 200px;
}

.inputContainer button {
  padding: 10px;
  font-size: 1em;
  background-color: #007BFF;
  color: white;
  border: none;
  cursor: pointer;
}

.inputContainer button:hover {
  background-color: #0056b3;
}

.imageContainer {
  display: flex;
  justify-content: center;
  width: 100%; 
}

.imageContainer img {
  width: 100%; 
  max-width: 500px;
  height: auto; 
}
.nftData {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.nftData .image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nftData h2 {
  margin: 10px 0;
}

.nftData p {
  font-size: 1.2em;
  font-weight: bold;
}

td {
  padding: 10px;
  text-align: left;
}

th {
  padding: 10px;
  text-align: left;
}

.tableContainer {
  display: flex;
  justify-content: center;
}
```

## STEP 5: INTEGRATING COMPONENTS IN THE APP

Finally, let's use the `Wrapper` component in our main `App` component.

Open `App.js` and modify it as follows:

```
import React from 'react';
import Wrapper from './NFTDisplay';
import './App.css';

function App() {
  return (
    <div className="App">
      <Wrapper/>
    </div>
  );
}

export default App;

```

Now, start the app with the following command:

`npm start`

You should now see the following:
- A drop down menu to select a blockchain
- Text boxes for contract address and token id
- A view ownership history button

Input the data of the NFT you want to track, and click the view ownership history button. You should then see an image of the NFT and a table with the NFT ownership history. 

That's it! You've built an NFT ownership history tracker using Blockspan API and ReactJS! This is a simple example, but with the power of Blockspan API, you can build even more comprehensive and interactive NFT explorers. Happy coding!


## CONCLUSION AND NEXT STEPS

In this tutorial, we've built an NFT ownership history tracker using Blockspan API and ReactJS. We've used the "get single NFT" and "get all transfers of NFT" API endpoints provided by Blockspan to fetch detailed information about an NFT and its transfer history.

Although this is a simple example, it demonstrates how powerful Blockspan API can be when building applications related to blockchain and NFTs. You could extend this application to include more features, such as searching for NFTs by different parameters, displaying additional NFT details, or creating a more interactive UI for browsing transfer history.





