import React, { useState, useEffect } from 'react';
import { fetchNetworkStatus, fetchGasPriceHistory } from '../services/blockchainService'; // Import your service functions
import './styles/HomeStats.css';

const HomeStats = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chains = ['ethereum', 'base', 'polygon', 'bnb', 'arbitrum', 'fantom'];

  const fetchData = async () => {
    try {
      const results = {};
      for (const chain of chains) {
        const status = await fetchNetworkStatus(chain);
        const gasHistoryData = await fetchGasPriceHistory(chain);
        results[chain] = { 
          status, 
          gasHistory: gasHistoryData.baseFeePerGas.map(fee => parseInt(fee, 16) / 1e9) // Convert to gwei 
        };
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

  const isMobile = window.innerWidth <= 768;

  const truncate = (str, length = 20) => {
    if (!str) return '';
    if (str.length <= length) return str;
    const partLength = Math.floor((length - 3) / 2);
    return `${str.slice(0, partLength)}...${str.slice(-partLength)}`;
  };

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="home-stats-container">
      {chains.map((chain) => (
        <div key={chain} className="home-stats">
          <h3>Network Status: {chain.charAt(0).toUpperCase() + chain.slice(1)}</h3>
          <div>
            <p>Peer Count: {data[chain].status.peerCount || 'Loading...'}</p>
            <p>Syncing: {data[chain].status.syncing ? 'Yes' : 'No'}</p>
          </div>

          <h4>Gas Price History (Gwei):</h4>
          <ul>
            {data[chain].gasHistory.slice(0, 5).map((price, index) => (
              <li key={index}>{price.toFixed(2)} Gwei</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HomeStats;