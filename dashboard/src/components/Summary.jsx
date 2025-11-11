import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import DoughnutChart from "./Doughnut";
import { watchlist } from "../data/data";

const Summary = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    // Fetch recent orders
    axios.get("http://localhost:3002/allOrders")
      .then((res) => {
        const orders = res.data.allOrders || [];
        setRecentOrders(orders.slice(-5).reverse()); // Last 5 orders, most recent first
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      });

    // Fetch holdings
    axios.get("http://localhost:3002/allHoldings")
      .then((res) => {
        setHoldings(res.data.allHoldings || []);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
      });
  }, []);

  // Calculate top gainers and losers from watchlist
  const topGainers = [...watchlist]
    .filter(stock => !stock.isDown)
    .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent))
    .slice(0, 3);

  const topLosers = [...watchlist]
    .filter(stock => stock.isDown)
    .sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent))
    .slice(0, 3);

  // Calculate holdings stats
  const totalInvestment = holdings.reduce((sum, h) => sum + (h.avg * h.qty), 0);
  const currentValue = holdings.reduce((sum, h) => sum + (h.price * h.qty), 0);
  const totalPL = currentValue - totalInvestment;
  const plPercent = totalInvestment > 0 ? ((totalPL / totalInvestment) * 100).toFixed(2) : 0;
  return (
    <>
      <div className="username">
        <h6>Hi, {user?.name || 'User'}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={totalPL >= 0 ? "profit" : "loss"}>
              ₹{(totalPL / 1000).toFixed(2)}k <small>{plPercent >= 0 ? '+' : ''}{plPercent}%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>₹{(currentValue / 1000).toFixed(2)}k</span>{" "}
            </p>
            <p>
              Investment <span>₹{(totalInvestment / 1000).toFixed(2)}k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Recent Orders</p>
        </span>
        <div className="data">
          {recentOrders.length > 0 ? (
            <div style={{ width: '100%' }}>
              {recentOrders.map((order, index) => (
                <div key={order._id || index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: index < recentOrders.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{order.name}</span>
                  <span style={{ color: order.mode === 'BUY' ? '#28a745' : '#dc3545' }}>
                    {order.mode} {order.qty} @ ₹{order.price?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No recent orders</p>
          )}
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Top Gainers</p>
        </span>
        <div className="data">
          {topGainers.length > 0 ? (
            <div style={{ width: '100%' }}>
              {topGainers.map((stock, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: index < topGainers.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{stock.name}</span>
                  <span className="profit">{stock.percent}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No gainers</p>
          )}
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Top Losers</p>
        </span>
        <div className="data">
          {topLosers.length > 0 ? (
            <div style={{ width: '100%' }}>
              {topLosers.map((stock, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: index < topLosers.length - 1 ? '1px solid #eee' : 'none'
                }}>
                  <span>{stock.name}</span>
                  <span className="loss">{stock.percent}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No losers</p>
          )}
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Watchlist Distribution ({watchlist.length} stocks)</p>
        </span>
        <div style={{ maxWidth: '400px', margin: '20px auto', minHeight: '300px' }}>
          <DoughnutChart watchlist={watchlist} />
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;