import axios from 'axios';

// RPC URLs for different blockchains
const rpcUrls = {
  ethereum: 'https://eth.llamarpc.com',
  base: 'https://base.llamarpc.com',
  polygon: 'https://polygon.llamarpc.com',
  bnb: 'https://binance.llamarpc.com',
  arbitrum: 'https://endpoints.omniatech.io/v1/arbitrum/one/public',
  fantom: 'https://fantom.drpc.org',
  altcoinchain: ' http://62.72.177.111:8145/',
};

// Function to fetch the latest block for EVM chains
// In-memory cache to store fetched results
const cache = {};

// Function to check cache for the latest block
const getCachedBlock = (chain) => cache[`${chain}_latestBlock`];

// Function to cache the latest block data
const cacheBlock = (chain, blockData) => {
  cache[`${chain}_latestBlock`] = blockData;
};

// Fetch the latest block with caching
const fetchLatestBlock = async (chain) => {
  // Return cached block if available
  const cachedBlock = getCachedBlock(chain);
  if (cachedBlock) return cachedBlock;

  const url = rpcUrls[chain];

  if (!url) {
    throw new Error('Invalid blockchain');
  }

  try {
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: [],
    });

    const blockNumber = parseInt(response.data.result, 16);
    cacheBlock(chain, blockNumber);  // Cache the fetched block number
    return blockNumber;
  } catch (error) {
    console.error(`Error fetching latest block for ${chain}:`, error);
    throw error;
  }
};

// Helper function to add a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle retries with exponential backoff
const fetchWithBackoff = async (requestFn, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i < retries - 1) {
        const backoffTime = 500 * 2 ** i; // Exponential backoff
        console.warn(`Retrying in ${backoffTime} ms...`);
        await delay(backoffTime);
      } else {
        throw error; // Throw error if all retries fail
      }
    }
  }
};

// Function to fetch transactions for a given block
const fetchTransactions = async (chain) => {
  try {
    if (['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom', 'altcoinchain'].includes(chain)) {
      const url = rpcUrls[chain];
      
      // Wrap the request in fetchWithBackoff for retry logic
      const response = await fetchWithBackoff(() =>
        axios.post(url, {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: ['latest', true],
        })
      );

      const data = response.data;
      if (!data?.result?.transactions) {
        throw new Error(`No transactions found for ${chain}`);
      }

      return data.result.transactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: parseInt(tx.value, 16),
      }));
    }

    throw new Error('Unsupported blockchain');
  } catch (error) {
    console.error(`Error fetching transactions for ${chain}:`, error);
    throw error;
  }
};

// Function to fetch transaction details for a given chain and hash
const fetchTransactionDetails = async (chain, hash) => {
  try {
    let url;
    let response;

    if (['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom', 'altcoinchain'].includes(chain)) {
      url = rpcUrls[chain];
      response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionByHash',
        params: [hash],
      });

      const tx = response.data.result;
      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: parseInt(tx.value, 16),
        blockNumber: tx.blockNumber,
        status: tx.blockNumber ? 'Confirmed' : 'Pending',
        action: tx.input ? 'Contract Interaction' : 'Simple Transfer',
      };
    }

    throw new Error('Unsupported blockchain');
  } catch (error) {
    console.error(`Error fetching transaction details on ${chain}:`, error);
    throw error;
  }
};

// Function to fetch address details for a given chain and address
const fetchAddressDetails = async (chain, address) => {
  const url = rpcUrls[chain];

  if (!url) {
    throw new Error('Invalid blockchain');
  }

  try {
    let ethBalance = '0';
    let ethValue = '0';
    let ethPrice = 0;

    // Fetch ETH balance
    if (['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom', 'altcoinchain'].includes(chain)) {
      const ethResponse = await axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      ethBalance = ethResponse.data.result;
      
      // Optionally, you could get the ETH price from an API like CoinGecko
      ethPrice = 3630.5; // Mocked value for ETH price (you can fetch it from an API)
      ethValue = (parseInt(ethBalance, 16) / 1e18) * ethPrice; // ETH value in USD
    }

    return {
      ethBalance: parseInt(ethBalance, 16) / 1e18, // Convert to ETH
      ethValue,
      ethPrice,
    };
  } catch (error) {
    console.error(`Error fetching address details for ${chain}:${address}:`, error);
    throw error;
  }
};

const fetchBlockDetails = async (chain, blockIdentifier) => {
  const url = rpcUrls[chain];

  if (!url) {
    throw new Error('Invalid blockchain');
  }

  try {
    let response;

    // Handle EVM chains (Ethereum, Base, Polygon, BNB)
    if (['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom', 'altcoinchain'].includes(chain)) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: [blockIdentifier, true], // Fetch block details by block number, including transactions
        }),
      });

      const data = await response.json();

      if (!data || !data.result) {
        console.error(`Error: Block not found for identifier ${blockIdentifier}`);
        throw new Error(`Block not found for identifier: ${blockIdentifier}`);
      }

      // Return block details including transactions
      return {
        blockNumber: parseInt(data.result.number, 16),  // Convert hex to decimal
        blockHash: data.result.hash,
        parentHash: data.result.parentHash,
        timestamp: new Date(parseInt(data.result.timestamp, 16) * 1000).toLocaleString(), // Convert hex timestamp to human-readable
        transactions: data.result.transactions.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: parseInt(tx.value, 16), // Convert hex value to decimal
        })),
      };
    }

    throw new Error('Unsupported blockchain');
  } catch (error) {
    console.error(`Error fetching block details on ${chain}:`, error);
    throw error;
  }
};

// Fetch network status (peer count and syncing status)
export const fetchNetworkStatus = async (chain) => {
  const url = rpcUrls[chain];
  if (!url) throw new Error('Invalid blockchain');

  try {
    const [peerResponse, syncResponse] = await Promise.all([
      axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'net_peerCount',
        params: [],
      }),
      axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_syncing',
        params: [],
      }),
    ]);

    const peerCount = parseInt(peerResponse.data.result, 16); // Convert hex to decimal
    const syncing = syncResponse.data.result;

    return {
      peerCount,
      syncing: syncing !== false,
    };
  } catch (error) {
    console.error(`Error fetching network status for ${chain}:`, error);
    throw error;
  }
};

// Fetch historical gas price data
export const fetchGasPriceHistory = async (chain, blockCount = 5) => {
  const url = rpcUrls[chain];
  if (!url) throw new Error('Invalid blockchain');

  try {
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_feeHistory',
      params: [blockCount, 'latest', []],
    });

    return response.data.result;
  } catch (error) {
    console.error(`Error fetching gas price history for ${chain}:`, error);
    throw error;
  }
};

const toHex = (number) => `0x${number.toString(16)}`;

// Function to fetch transactions for a specific address from blocks
const fetchTransactionHistory = async (chain, address) => {
  const url = rpcUrls[chain];

  if (!url) {
    throw new Error('Invalid blockchain');
  }

  try {
    const latestBlock = await fetchLatestBlock(chain); // Get the latest block

    // Fetch the latest block's transactions
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: [toHex(latestBlock), true], // Pass the latest block number as hex
    });

    // Check if transactions are present in the response
    if (!response.data.result || !response.data.result.transactions) {
      throw new Error('No transactions found in the latest block');
    }

    // Filter transactions by the address, ensuring tx.from and tx.to are not null or undefined
    const transactions = response.data.result.transactions.filter(tx => {
      const from = tx.from ? tx.from.toLowerCase() : null;
      const to = tx.to ? tx.to.toLowerCase() : null;

      // Only include transactions where the from or to address matches the provided address
      return (from && from === address.toLowerCase()) || (to && to === address.toLowerCase());
    });

    return transactions.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: parseInt(tx.value, 16), // Convert value from hex to decimal
    }));
  } catch (error) {
    console.error(`Error fetching transactions for ${chain}:${address}`, error);
    throw error;
  }
};

const fetchInternalTransactions = async (chain, address) => {
  const url = rpcUrls[chain];

  if (!url) {
    throw new Error('Invalid blockchain');
  }

  try {
    // Fetch the transaction history for the address
    const transactions = await fetchTransactionHistory(chain, address);

    // Store internal transactions to return
    const internalTransactions = [];

    for (const tx of transactions) {
      // For each transaction, use debug_traceTransaction to fetch internal transactions
      const response = await axios.post(url, {
        jsonrpc: '2.0',
        id: 1,
        method: 'debug_traceTransaction',
        params: [tx.hash, { tracer: 'callTracer' }],
      });

      if (response.data.result && response.data.result.calls) {
        // Extract internal transactions from the "calls" field in the response
        internalTransactions.push(...response.data.result.calls);
      }
    }

    // Format internal transactions
    return internalTransactions.map(tx => ({
      from: tx.from,
      to: tx.to,
      value: parseInt(tx.value, 16),  // Convert value from hex to integer
      type: tx.type,
      input: tx.input,
    }));

  } catch (error) {
    console.error(`Error fetching internal transactions for ${chain}:${address}`, error);
    throw error;
  }
};

export { fetchLatestBlock, fetchTransactions, fetchTransactionDetails, fetchAddressDetails, fetchBlockDetails, fetchTransactionHistory, fetchInternalTransactions };