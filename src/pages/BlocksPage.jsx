import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLatestBlock, fetchTransactions } from '../services/blockchainService';
import { formatEther } from 'ethers';
import './styles/BlocksPage.css';

// Utility function to truncate long strings
const truncate = (str, length = 30) => {
  if (typeof str !== 'string') return ''; 
  if (str.length <= length) return str;
  const partLength = Math.floor((length - 3) / 2); 
  return `${str.slice(0, partLength)}...${str.slice(-partLength)}`;
};

// Utility function to return the correct token symbol for the selected chain
const getTokenSymbol = (chain) => {
  switch (chain) {
    case 'ethereum':
      return 'ETH';
    case 'base':
      return 'BASE';
    case 'polygon':
      return 'MATIC';
    case 'bnb':
      return 'BNB';
    case 'arbitrum':
      return 'ARB';
    case 'fantom':
      return 'FTM';
    default:
      return 'Unknown';
  }
};

const BlocksPage = ({ selectedChain, onChainSelect }) => {
  const [latestBlock, setLatestBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlockData = async (chain) => {
    setLoading(true);
    try {
      const block = await fetchLatestBlock(chain);
      setLatestBlock(block);
      const blockTransactions = await fetchTransactions(chain);
      setTransactions(blockTransactions);
      setLoading(false);
    } catch (error) {
      setError('Error fetching blockchain data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockData(selectedChain);

    // Poll every 10 seconds for the latest block and transactions
    const intervalId = setInterval(() => fetchBlockData(selectedChain), 60000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedChain]);

  if (loading) return <p>Loading block...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="blocks-container">
     <h2 className="blocks-header">Latest Block</h2>
<p>
  <strong>Block Number:</strong>
  <Link to={`/block/${selectedChain}/0x${latestBlock.toString(16)}`} className="block-number-link">
    {latestBlock}
  </Link>
</p>
      <h3>{selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)} Block Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions available for this block.</p>
      ) : (
        <table className="blocks-table">
          <thead>
            <tr>
              <th>Block Number</th>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value ({getTokenSymbol(selectedChain)})</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/block/${selectedChain}/0x${latestBlock.toString(16)}`}>
                    {latestBlock}
                  </Link>
                </td>
                <td>
                  <Link to={`/tx/${selectedChain}/${tx.hash || ''}`}>{truncate(tx.hash || '')}</Link>
                </td>
                <td>
                  <Link to={`/tx/address/${selectedChain}/${tx.from || ''}`}>{truncate(tx.from || '')}</Link>
                </td>
                <td>
                  <Link to={`/tx/address/${selectedChain}/${tx.to || ''}`}>{truncate(tx.to || '')}</Link>
                </td>
                <td className="green-bold">
  {tx.value ? formatEther(window.BigInt(tx.value)) : '0'} {getTokenSymbol(selectedChain)}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BlocksPage;