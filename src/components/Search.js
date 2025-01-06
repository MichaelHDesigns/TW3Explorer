import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchResults.css'; // Optional: Add styles for the search component

const Search = ({ selectedChain }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Check if the search term is a valid transaction hash, address, or block number
      if (searchTerm.length === 42 && searchTerm.startsWith('0x')) {
        // Navigate to the address details page
        navigate(`/tx/address/${selectedChain}/${searchTerm}`);
      } else if (!isNaN(searchTerm)) {
        // Navigate to the block details page
        navigate(`/block/${selectedChain}/0x${parseInt(searchTerm, 10).toString(16)}`);
      } else {
        // Navigate to the transaction details page
        navigate(`/tx/${selectedChain}/${searchTerm}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        placeholder="Search for transactions, blocks, or addresses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">Search</button>
    </form>
  );
};

export default Search;
