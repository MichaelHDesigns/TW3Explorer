import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HomeStats from './pages/HomeStats';
import BlocksPage from './pages/BlocksPage';
import BlockDetails from './pages/BlocksDetails';
import TransactionsPage from './pages/TransactionsPage';
import TxDetails from './pages/TxDetails';
import TxAddress from './pages/TxAddress';
import MidNav from './components/MidNav';
import TopNav from './components/TopNav';
import Search from './components/Search';
import './App.css';

function App() {
  const [selectedChain, setSelectedChain] = useState('ethereum'); // Default chain is Ethereum

  const handleChainSelect = (chain) => {
    setSelectedChain(chain); // Update the selected chain
  };

  return (
    <Router>
      <div className="App">
        <TopNav selectedChain={selectedChain} onChainSelect={handleChainSelect} />
        <h1 className="app-title">
          <img src="/TW3.png" alt="Logo" className="app-logo" />
          TW3 MultiChain Explorer
        </h1>
        <Search selectedChain={selectedChain} />
        <MidNav selectedChain={selectedChain} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stats" element={<HomeStats selectedChain={selectedChain} />} />
          <Route
            path="/blocks"
            element={<BlocksPage selectedChain={selectedChain} onChainSelect={handleChainSelect} />}
          />
          <Route
            path="/transactions"
            element={<TransactionsPage selectedChain={selectedChain} onChainSelect={handleChainSelect} />}
          />
          <Route path="/tx/:chain/:hash" element={<TxDetails />} />
          <Route path="/tx/address/:chain/:address" element={<TxAddress />} />
          <Route path="/block/:chain/:blockNumber" element={<BlockDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;