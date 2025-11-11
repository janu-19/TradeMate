import React, { useState, useContext, useEffect } from "react";

import axios from "axios";

import GeneralContext from "./GeneralContext";

import "./BuyActionWindow.css";

const SellActionWindow = ({ stock }) => {
  // Debug: Log the stock object when component mounts or stock changes
  useEffect(() => {
    console.log("📦 SellActionWindow - Stock received:", stock);
    if (!stock) {
      console.error("❌ SellActionWindow - No stock object received!");
    } else if (!stock.name) {
      console.error("❌ SellActionWindow - Stock object missing 'name' property:", stock);
    }
  }, [stock]);

  // Extract price from stock object, default to 0 if not available
  const defaultPrice = stock?.price ? parseFloat(stock.price) : 0;
  
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(defaultPrice);
  const [isLoading, setIsLoading] = useState(false);
  const generalContext = useContext(GeneralContext);

  // Update price when stock changes
  useEffect(() => {
    if (stock?.price) {
      setStockPrice(parseFloat(stock.price));
    }
  }, [stock]);

  const handleSellClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Debug: Log stock object before validation
    console.log("🛒 Sell button clicked - Stock object:", stock);
    console.log("🛒 Stock name:", stock?.name);
    console.log("🛒 Stock price:", stock?.price);
    
    // Check if stock exists
    if (!stock) {
      alert("❌ Error: Stock information is missing. Please try clicking the Sell button again from the watchlist.");
      console.error("Stock is null or undefined");
      return;
    }
    
    // Get stock name - use name from stock object
    const stockName = stock.name || stock.instrument || stock.symbol || "";
    
    if (!stockName || !stockName.trim()) {
      alert(`❌ Error: Stock name is missing.\n\nReceived stock object: ${JSON.stringify(stock, null, 2)}\n\nPlease try clicking the Sell button again from the watchlist.`);
      console.error("Stock name is missing. Full stock object:", stock);
      return;
    }
    
    // Validation - check for valid numbers, not just truthy values
    const qty = Number(stockQuantity);
    const price = Number(stockPrice);
    
    if (!qty || qty <= 0 || isNaN(qty)) {
      alert("Please enter a valid quantity (greater than 0)");
      return;
    }
    
    if (!price || price <= 0 || isNaN(price)) {
      alert("Please enter a valid price (greater than 0)");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        name: stockName,
        qty: qty,
        price: price,
        mode: "SELL",
      };
      
      console.log("🛒 Sending sell order to backend:", orderData);
      
      const response = await axios.post("http://localhost:3002/newOrder", orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      console.log("✅ Sell order placed successfully:", response.data);
      alert(`✅ Sell order placed successfully!\n\nStock: ${stockName}\nQuantity: ${qty}\nPrice: ₹${price}\nTotal: ₹${(qty * price).toFixed(2)}`);
      
      // Reset form
      setStockQuantity(1);
      
      // Close window after short delay
      setTimeout(() => {
        if (generalContext && generalContext.closeSellWindow) {
          generalContext.closeSellWindow();
        }
      }, 500);
      
    } catch (error) {
      console.error("❌ Error placing sell order:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Unknown error occurred";
      
      alert(`❌ Failed to place sell order:\n\n${errorMessage}\n\nPlease try again or check if the backend server is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (generalContext && generalContext.closeSellWindow) {
      generalContext.closeSellWindow();
    }
  };

  // Display stock name for debugging (visible in UI)
  const displayStockName = stock?.name || stock?.instrument || stock?.symbol || 'Unknown Stock';
  
  if (!stock) {
    console.error("❌ SellActionWindow rendered without stock prop");
    return (
      <div className="container" id="sell-window">
        <div className="header">
          <h3>Error: No stock selected</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Please select a stock from the watchlist to place a sell order.</p>
          <button onClick={handleCancelClick}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="header">
        <h3>Sell {displayStockName}</h3>
        <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0', color: '#666' }}>
          Current Price: ₹{stock?.price || '0.00'}
        </p>
      </div>
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              disabled={isLoading}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              disabled={isLoading}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockQuantity * stockPrice).toFixed(2) || '0.00'}</span>
        <div>
          <button 
            className="btn btn-red" 
            onClick={handleSellClick} 
            type="button"
            disabled={isLoading}
            style={{ backgroundColor: '#dc3545', color: 'white' }}
          >
            {isLoading ? "Processing..." : "Sell"}
          </button>
          <button 
            className="btn btn-grey" 
            onClick={handleCancelClick} 
            type="button"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;

