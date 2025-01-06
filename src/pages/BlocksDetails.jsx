import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlockDetails } from '../services/blockchainService';
import { formatEther } from 'ethers';
import './styles/BlocksDetails.css';

// Utility function to return the correct token symbol for the selected chain
const getTokenSymbol = (chain) => {
  switch (chain) {
    case 'ethereum':
      return 'ETH';
    case 'solana':
      return 'SOL';
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

const BlocksDetails = () => {
  const { chain, blockNumber } = useParams();
  const [blockDetails, setBlockDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchBlockDetails(chain, blockNumber);
        setBlockDetails(details);
        setLoading(false);
      } catch (err) {
        setError('Error fetching block details');
        setLoading(false);
      }
    };

    fetchDetails();
  }, [chain, blockNumber]);

  if (loading) return <div>Loading block details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!blockDetails) return <div>No block details found</div>;

  return (
    <div className="block-details-container">
      <h2>Block Details</h2>
      <div>
        <strong>Block Number:</strong> {blockDetails.blockNumber}
      </div>
      <div>
        <strong>Block Hash:</strong> {blockDetails.blockHash || 'N/A'}
      </div>
      <div>
        <strong>Parent Hash:</strong> {blockDetails.parentHash || 'N/A'}
      </div>
      <div>
        <strong>Timestamp:</strong> {blockDetails.timestamp}
      </div>
      <div>
        <strong>Timestamp:</strong> {blockDetails.timestamp}
      </div>

      <h3>Transactions</h3>
      {blockDetails.transactions.length > 0 ? (
        <ul>
          {blockDetails.transactions.map((tx, index) => (
            <li key={index}>
              <div>
  <strong>Transaction Hash:</strong> 
  <Link to={`/tx/${chain}/${tx.hash}`}>{tx.hash}</Link>
</div>
<div>
  <strong>From:</strong> 
  <Link to={`/tx/address/${chain}/${tx.from}`}>{tx.from || 'N/A'}</Link>
</div>
<div>
  <strong>To:</strong> 
  <Link to={`/tx/address/${chain}/${tx.to}`}>{tx.to || 'N/A'}</Link>
</div>
<div>
  <strong className="value-label">Value:</strong> 
  <span className="green-bold value-spacing">
    {tx.value ? formatEther(window.BigInt(tx.value)) : '0'}
  </span>
  <span className="token-symbol">{getTokenSymbol(chain)}</span>
</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No transactions found for this block.</div>
      )}
    </div>
  );
};

export default BlocksDetails;