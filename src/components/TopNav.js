import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select'; // Import react-select
import './TopNav.css'; // Optional: Add styles if needed

const TopNav = ({ selectedChain, onChainSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleChainChange = (selectedOption) => {
    const chain = selectedOption.value;
    onChainSelect(chain); // Update the selected chain in the parent component
    navigate(`/transactions`); // Navigate to the Transactions page
  };

  // Options for the dropdown
  const options = [
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'bnb', label: 'Binance' },
    { value: 'arbitrum', label: 'Arbitrum' },
    { value: 'fantom', label: 'Fantom' },
    { value: 'altcoinchain', label: 'Altcoinchain' },
  ];

  return (
    <nav className="top-nav">
      <div className="links-container">
        <Link to="/" className="nav-link home-link">Home</Link>
        <Link to="/stats" className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}>Stats</Link>
      </div>
      <Select
        value={options.find(option => option.value === selectedChain)} // Set the selected option
        onChange={handleChainChange} // Handle the change event
        options={options} // Pass the options to react-select
        className="chain-dropdown" // Custom class for styling
        classNamePrefix="react-select" // Prefix for styling the react-select components
      />
    </nav>
  );
};

export default TopNav;