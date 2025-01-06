import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';  
import { fetchTransactions } from '../services/blockchainService';
import { formatEther } from 'ethers';
import './styles/TransactionsPage.css';

// Utility function to truncate long strings
const truncate = (str, length = 30) => {
  if (!str) return '';  
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

const TransactionsPage = ({ selectedChain }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);  
  const observer = useRef();

  useEffect(() => {
    const fetchTransactionsHandler = async () => {
      setLoading(true);
      try {
        const txs = await fetchTransactions(selectedChain, page); 
        setTransactions(prev => [...prev, ...txs]);
        setLoading(false);
      } catch (error) {
        setError('Error fetching transactions');
        setLoading(false);
      }
    };

    fetchTransactionsHandler();

    // Poll every 10 seconds for new transactions
    const intervalId = setInterval(fetchTransactionsHandler, 60000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [selectedChain, page]);

  const loadMoreRef = useRef();

  useEffect(() => {
    const observerInstance = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);  
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observerInstance.observe(loadMoreRef.current);
    }

    return () => observerInstance.disconnect();  
  }, []);

  if (loading && page === 1) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="transactionsExplorer-container">
      <h2>Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        <table className="transactionsExplorer-table">
          <thead>
            <tr>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/tx/${selectedChain}/${tx.hash}`}>{truncate(tx.hash)}</Link>
                </td>
                <td>
                  <Link to={`/tx/address/${selectedChain}/${tx.from}`}>{truncate(tx.from)}</Link>
                </td>
                <td>
                  <Link to={`/tx/address/${selectedChain}/${tx.to}`}>{truncate(tx.to)}</Link>
                </td>
                <td className="green-bold">
  {tx.value ? formatEther(window.BigInt(tx.value)) : '0'} {getTokenSymbol(selectedChain)}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {loading && <p>Loading more transactions...</p>}
      <div ref={loadMoreRef} style={{ height: '20px' }} />
    </div>
  );
};

export default TransactionsPage;