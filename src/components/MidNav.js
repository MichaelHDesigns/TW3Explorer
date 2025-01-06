import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MidNav.css';

const MidNav = ({ selectedChain }) => {
  const location = useLocation();

  return (
    <div className="mid-nav">
      <Link to="/transactions" className={location.pathname === '/transactions' ? 'active' : ''}>
        Transactions
      </Link>
      <Link to="/blocks" className={location.pathname === '/blocks' ? 'active' : ''}>
        Blocks
      </Link>
    </div>
  );
};

export default MidNav;