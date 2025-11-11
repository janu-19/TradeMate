import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
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
  const [livePrices, setLivePrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Fetch real-time prices from Finnhub - Optimized
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const fetchLivePrices = async () => {
      if (!isMounted) return;
      
      setIsLoadingPrices(true);
      try {
        // Get all unique stock symbols (limit to first 10 for faster performance)
        const symbols = [...new Set(watchlist.map(stock => stock.name))].slice(0, 10);
        
        // Fetch quotes for all symbols in batch with shorter timeout
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await axios.post(
          "http://localhost:3002/api/finnhub/quotes",
          { symbols },
          { 
            signal: controller.signal,
            timeout: 3000 // 3 second timeout for faster response
          }
        );

        if (isMounted && response.data && response.data.quotes) {
          const priceMap = {};
          let successCount = 0;
          
          response.data.quotes.forEach(({ symbol, data, error }) => {
            if (data && !error && data.c) {
              // Finnhub returns: c (current price), d (change), dp (percent change)
              priceMap[symbol] = {
                price: data.c || 0,
                change: data.d || 0,
                percentChange: data.dp || 0,
                isDown: (data.d || 0) < 0
              };
              successCount++;
            }
          });
          
          if (successCount > 0) {
            setLivePrices(priceMap);
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
          console.error("Error fetching live prices:", error.message);
        }
        // Continue with static data if API fails
      } finally {
        if (isMounted) {
          setIsLoadingPrices(false);
        }
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Fetch immediately
    fetchLivePrices();

    // Update every 10 seconds (reduced frequency to avoid rate limits)
    const interval = setInterval(() => {
      if (isMounted) {
        fetchLivePrices();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Merge static watchlist with live prices
  const enhancedWatchlist = watchlist.map(stock => {
    const liveData = livePrices[stock.name];
    if (liveData) {
      return {
        ...stock,
        price: liveData.price,
        percent: liveData.percentChange >= 0 
          ? `+${liveData.percentChange.toFixed(2)}%` 
          : `${liveData.percentChange.toFixed(2)}%`,
        isDown: liveData.isDown,
        isLive: true
      };
    }
    return { ...stock, isLive: false };
  });

  // Filter watchlist based on search query
  const filteredWatchlist = enhancedWatchlist.filter((stock) => {
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
          {isLoadingPrices && <span style={{ marginLeft: '5px', fontSize: '10px', color: '#999' }}>🔄</span>}
        </span>
      </div>

      <ul className="list">
        {filteredWatchlist.length > 0 ? (
          filteredWatchlist.map((stock, index) => {
            return <WatchListItem stock={stock} key={index} />;
          })
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
          {stock.isLive && <span style={{ fontSize: '8px', marginLeft: '4px', color: '#28a745' }}>●</span>}
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
