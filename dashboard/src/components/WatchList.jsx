import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";

import { watchlist } from "../data/data";

// Simple arrow icons as components
const KeyboardArrowDown = ({ className }) => (
  <span className={className}>▼</span>
);

const KeyboardArrowUp = ({ className }) => (
  <span className={className}>▲</span>
);

const BarChartOutlined = ({ className }) => (
  <span className={className}>📊</span>
);

const MoreHoriz = ({ className }) => (
  <span className={className}>⋯</span>
);

const WatchList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter watchlist based on search query
  const filteredWatchlist = watchlist.filter((stock) => {
    if (!searchQuery.trim()) {
      return true; // Show all if search is empty
    }
    
    const query = searchQuery.toLowerCase().trim();
    const stockName = stock.name.toLowerCase();
    const stockPrice = stock.price.toString();
    const stockPercent = stock.percent.toLowerCase();
    
    // Search by name, price, or percentage
    return (
      stockName.includes(query) ||
      stockPrice.includes(query) ||
      stockPercent.includes(query)
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
            className="search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999',
                padding: '0 5px'
              }}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <span className="counts">
          {filteredWatchlist.length} / {watchlist.length}
        </span>
      </div>

      <ul className="list">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map((stock, index) => (
            <WatchListItem stock={stock} key={index} />
          ))
        ) : (
          <li style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#999',
            listStyle: 'none'
          }}>
            No stocks found matching "{searchQuery}"
          </li>
        )}
      </ul>
    </div>
  );
};

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>
          {stock.name}
        </p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">
            {typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
          </span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions stock={stock} />}
    </li>
  );
};

const WatchListActions = ({ stock }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    if (generalContext && generalContext.openBuyWindow) {
      // Pass the entire stock object instead of just the name
      generalContext.openBuyWindow(stock);
    } else {
      console.log("Opening buy window for:", stock);
    }
  };

  const handleSellClick = () => {
    if (generalContext && generalContext.openSellWindow) {
      // Pass the entire stock object instead of just the name
      generalContext.openSellWindow(stock);
    } else {
      console.log("Opening sell window for:", stock);
    }
  };

  return (
    <span className="actions">
      <span>
        <button className="buy" onClick={handleBuyClick} title="Buy (B)">
          Buy
        </button>
        <button className="sell" onClick={handleSellClick} title="Sell (S)">
          Sell
        </button>
        <button className="action" title="Analytics (A)">
          <BarChartOutlined className="icon" />
        </button>
        <button className="action" title="More">
          <MoreHoriz className="icon" />
        </button>
      </span>
    </span>
  );
};

export default WatchList;
