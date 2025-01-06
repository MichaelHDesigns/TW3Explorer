import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAddressDetails, fetchTransactionHistory, fetchInternalTransactions } from '../services/blockchainService';
import { formatEther, parseUnits } from 'ethers';
import './styles/TxAddress.css';

const getTokenSymbol = (chain) => {
  switch (chain) {
    case 'ethereum': return 'ETH';
    case 'base': return 'BASE';
    case 'polygon': return 'MATIC';
    case 'bnb': return 'BNB';
    case 'arbitrum': return 'ARB';
    case 'fantom': return 'FTM';
    case 'altcoinchain': return 'ALT';
    default: return 'Unknown';
  }
};

const TxAddress = () => {
  const { chain, address } = useParams();
  const [addressDetails, setAddressDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [internalTransactions, setInternalTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('transactions'); // Set the default tab to 'transactions'

  // Fetch address details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const addressDetailsData = await fetchAddressDetails(chain, address);
        setAddressDetails(addressDetailsData);
        setLoading(false);
      } catch (error) {
        setError('Error fetching address details');
        setLoading(false);
      }
    };
    fetchDetails();
  }, [chain, address]);

  // Fetch transactions based on active tab
  useEffect(() => {
    if (activeTab === 'transactions') {
      const fetchTransactionsHandler = async () => {
        setLoading(true);
        try {
          const txs = await fetchTransactionHistory(chain, address);
          setTransactions(txs);
          setLoading(false);
        } catch (error) {
          setError('Error fetching transactions');
          setLoading(false);
        }
      };
      fetchTransactionsHandler();
    } else if (activeTab === 'internalTransactions') {
      const fetchInternalTransactionsHandler = async () => {
        setLoading(true);
        try {
          const internalTxs = await fetchInternalTransactions(chain, address);
          setInternalTransactions(internalTxs);
          setLoading(false);
        } catch (error) {
          setError('Error fetching internal transactions');
          setLoading(false);
        }
      };
      fetchInternalTransactionsHandler();
    }
  }, [chain, address, activeTab]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!addressDetails) return <p>No address details found.</p>;

  const ethBalanceFormatted = addressDetails.ethBalance
    ? formatEther(parseUnits(addressDetails.ethBalance.toString(), 18))
    : '0';

  return (
    <div className="address-details-container">
      <div className="address-overview-container">
        <div className="address-details">
          <h2>Address Details</h2>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>{getTokenSymbol(chain)} Balance:</strong> <span className="balanceValue">{ethBalanceFormatted} {getTokenSymbol(chain)}</span></p>
<p><strong>{getTokenSymbol(chain)} Value:</strong> <span className="balanceValue">${addressDetails.ethValue} (@ {addressDetails.ethPrice}/{getTokenSymbol(chain)})</span></p>
        </div>

        <div className="overview">
          <h3>Overview</h3>
          <p><strong>{getTokenSymbol(chain)} Balance:</strong> <span className="addressDetails ethBalance">{ethBalanceFormatted} {getTokenSymbol(chain)}</span></p>
          <p><strong>{getTokenSymbol(chain)} Value:</strong> <span className="addressDetails ethValue">${addressDetails.ethValue} (@ {addressDetails.ethPrice}/{getTokenSymbol(chain)})</span></p>
        </div>
      </div>

      {/* Tab buttons to switch between different transaction types */}
      <div className="tabs">
        <button onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'active' : ''}>Transactions</button>
        <button onClick={() => setActiveTab('internalTransactions')} className={activeTab === 'internalTransactions' ? 'active' : ''}>Internal Transactions</button>
      </div>

      {/* Conditional rendering of content based on active tab */}
      {activeTab === 'transactions' && (
        <div className="transaction-history">
          <h3>Transaction History</h3>
          {transactions.length === 0 ? <p>No transactions found for this address.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Transaction Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td><Link to={`/tx/${chain}/${tx.hash}`}>{truncate(tx.hash)}</Link></td>
                    <td><Link to={`/tx/address/${chain}/${tx.from}`}>{truncate(tx.from)}</Link></td>
                    <td><Link to={`/tx/address/${chain}/${tx.to}`}>{truncate(tx.to)}</Link></td>
                    <td><span className="transactionValue">{tx.value} {getTokenSymbol(chain)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'internalTransactions' && (
        <div className="internal-transaction-history">
          <h3>Internal Transaction History</h3>
          {internalTransactions.length === 0 ? <p>No internal transactions found for this address.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Transaction Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {internalTransactions.map((tx, index) => (
                  <tr key={index}>
                    <td><Link to={`/tx/${chain}/${tx.hash}`}>{truncate(tx.hash)}</Link></td>
                    <td><Link to={`/tx/address/${chain}/${tx.from}`}>{truncate(tx.from)}</Link></td>
                    <td><Link to={`/tx/address/${chain}/${tx.to}`}>{truncate(tx.to)}</Link></td>
                    <td>{tx.value} {getTokenSymbol(chain)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const truncate = (str) => {
  if (!str) return ''; // If the string is undefined or null, return an empty string
  return `${str.substring(0, 6)}...${str.substring(str.length - 4)}`;
};

export default TxAddress;