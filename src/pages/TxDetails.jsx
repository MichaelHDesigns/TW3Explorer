import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link for navigation
import { fetchTransactionDetails } from '../services/blockchainService'; // Use the fetchTransactionDetails service
import { formatEther } from 'ethers'; // Import formatEther from ethers.js
import './styles/TxDetails.css'; // Import your CSS for styling

// Utility function to truncate long strings
const truncate = (str, length = 30) => {
  if (!str) return ''; // Return an empty string if str is null or undefined
  if (str.length <= length) return str;
  const partLength = Math.floor((length - 3) / 2); // Subtract 3 for "..." and divide evenly
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
    case 'fantom': return 'FTM';
    default:
      return 'Unknown';
  }
};

const TxDetails = () => {
  const { chain, hash } = useParams(); // Get the chain and hash parameters from the URL
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionDetailsHandler = async () => {
      setLoading(true);
      try {
        const txDetails = await fetchTransactionDetails(chain, hash); // Get the transaction details
        setTransaction(txDetails);
        setLoading(false);
      } catch (error) {
        setError('Error fetching transaction details');
        setLoading(false);
      }
    };

    fetchTransactionDetailsHandler();
  }, [chain, hash]);

  if (loading) return <p>Loading transaction details...</p>;
  if (error) return <p>{error}</p>;
  if (!transaction) return <p>No transaction details found.</p>;

  // Utility function to safely format Ether values
  const safeFormatEther = (value) => {
    try {
      const etherValue = formatEther(window.BigInt(value)); // Convert Wei to Ether
      return etherValue; // Return the Ether value
    } catch (error) {
      console.error("Error formatting ether:", error);
      return value.toString(); // Fallback to raw value if formatting fails
    }
  };
  
  const blockNumberHex = `0x${transaction.blockNumber.toString(16)}`;

  return (
    <div className="tx-details-container">
      <h2>Transaction Details</h2>
      <div className="tx-overview">
  <div><strong>Transaction Hash:</strong> {transaction.hash}</div>
  <div><strong>Status:</strong> {transaction.status || 'Pending'}</div>
  <div>
    <strong>Block:</strong>
    <Link to={`/block/${chain}/${transaction.blockNumber}`}>
      {transaction.blockNumber !== 'N/A' ? parseInt(transaction.blockNumber, 16) : 'N/A'}
    </Link>
  </div>
  <div><strong>Transaction Action:</strong> {transaction.action || 'N/A'}</div>
</div>
      <div className="tx-fees">
        <h3>Transaction Fee Details</h3>
        <div>
  <strong>Value:</strong> 
  <span className="green-bold">
    {transaction.value ? safeFormatEther(transaction.value) : '0'} 
  </span>
  {getTokenSymbol(chain)}
</div>
        <div><strong>Transaction Fee:</strong> {transaction.gasUsed && transaction.gasPrice
          ? safeFormatEther(transaction.gasUsed * transaction.gasPrice) 
          : '0'} {getTokenSymbol(chain)}</div>
        <div><strong>Gas Price:</strong> {transaction.gasPrice ? safeFormatEther(transaction.gasPrice) : '0'} Gwei</div>
      </div>
    </div>
  );
};

export default TxDetails;