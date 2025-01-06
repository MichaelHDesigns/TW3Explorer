import React, { useState, useEffect } from 'react';
import { fetchLatestBlock, fetchTransactions } from '../services/blockchainService';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';

const HomePage = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chains = ['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom'];

  const fetchData = async () => {
    try {
      const results = {};
      for (const chain of chains) {
        const block = await fetchLatestBlock(chain);
        const transactions = await fetchTransactions(chain);
        results[chain] = { block, transactions };
      }
      setData(results);
      setLoading(false);
    } catch (err) {
      setError('Error fetching data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(() => {
      fetchData(); // Fetch every minute
    }, 60000); // 60000 milliseconds = 1 minute

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, []); // Empty dependency array to run only on mount

  const truncate = (str, length = 20) => {
    if (!str) return '';
    if (str.length <= length) return str;
    const partLength = Math.floor((length - 3) / 2);
    return `${str.slice(0, partLength)}...${str.slice(-partLength)}`;
  };

  const isMobile = window.innerWidth <= 768;

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="homepage-container">
      <h2>Last Transactions</h2>
      <div className="blockchain-data-container">
        {chains.map((chain) => (
          <div key={chain} className="chain-row">
            <div className="transactions-container">
              <h3>{chain.charAt(0).toUpperCase() + chain.slice(1)} Transactions</h3>
              <ul>
                {data[chain].transactions.slice(0, 5).map((tx, index) => (
                  <li key={index}>
                    <Link to={`/tx/${chain}/${tx.hash}`}>
                      {isMobile ? truncate(tx.hash, 20) : tx.hash}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <h2>Last Block Height</h2>
      <div className="blockchain-data-container">
        {chains.map((chain) => (
          <div key={chain} className="chain-row">
            <div className="block-container">
              <h3>{chain.charAt(0).toUpperCase() + chain.slice(1)} Block</h3>
              <ul>
                <li>
                  <Link to={`/block/${chain}/0x${data[chain].block.toString(16)}`}>
                    {isMobile ? truncate(data[chain].block.toString(), 10) : data[chain].block.toString()}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;