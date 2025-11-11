import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3002/allOrders");
      setAllOrders(response.data.allOrders || []);
      console.log("✅ Orders fetched:", response.data.allOrders?.length || 0);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders on component mount and when route changes
  useEffect(() => {
    fetchOrders();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="orders">
        <h3 className="title">Orders</h3>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="orders">
        <h3 className="title">Orders (0)</h3>
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="title">Orders ({allOrders.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Total</th>
              <th>Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order, index) => {
              const total = order.qty * order.price;
              const modeClass = order.mode === "BUY" ? "profit" : "loss";

              return (
                <tr key={order._id || index}>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>₹{order.price ? order.price.toFixed(2) : '0.00'}</td>
                  <td>₹{total.toFixed(2)}</td>
                  <td className={modeClass}>{order.mode}</td>
                  <td>Completed</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Orders;