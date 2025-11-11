import React, { useState, useEffect } from "react";
import axios from "axios";
import DoughnutChart from "./Doughnut";

const Funds = () => {
  const [availableBalance, setAvailableBalance] = useState(50000);
  const [investedAmount, setInvestedAmount] = useState(0);
  const [totalPortfolio, setTotalPortfolio] = useState(0);
  const [profitLoss, setProfitLoss] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    // Fetch holdings to calculate invested amount
    axios.get("http://localhost:3002/allHoldings")
      .then((res) => {
        const holdings = res.data.allHoldings || [];
        const invested = holdings.reduce((sum, h) => sum + (h.avg * h.qty), 0);
        const currentValue = holdings.reduce((sum, h) => sum + (h.price * h.qty), 0);
        const pl = currentValue - invested;
        
        setInvestedAmount(invested);
        setTotalPortfolio(availableBalance + currentValue);
        setProfitLoss(pl);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
      });

    // Load transactions from localStorage or fetch from backend
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [availableBalance]);

  const handleAddFunds = () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: "Add Funds",
      amount: parseFloat(addAmount),
      status: "Success",
      paymentMethod: paymentMethod
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    setAvailableBalance(prev => prev + parseFloat(addAmount));
    setAddAmount("");
    setShowAddModal(false);
    alert(`Successfully added ₹${addAmount} to your account!`);
  };

  const handleWithdrawFunds = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > availableBalance) {
      alert("Insufficient balance!");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: "Withdraw",
      amount: parseFloat(withdrawAmount),
      status: "Pending"
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    setAvailableBalance(prev => prev - parseFloat(withdrawAmount));
    setWithdrawAmount("");
    setShowWithdrawModal(false);
    alert(`Withdrawal request of ₹${withdrawAmount} submitted!`);
  };

  // Prepare chart data for fund distribution
  const fundChartData = [
    { name: 'Available Balance', price: availableBalance },
    { name: 'Invested Amount', price: investedAmount }
  ].filter(item => item.price > 0); // Only show if value > 0

  return (
    <>
      <h3 className="title">Funds Management</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Instant, zero-cost fund transfers with UPI
      </p>

      {/* Balance Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Available Balance</p>
          <h2 style={{ margin: 0, color: '#28a745' }}>₹{availableBalance.toLocaleString('en-IN')}</h2>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Invested Amount</p>
          <h2 style={{ margin: 0, color: '#007bff' }}>₹{investedAmount.toLocaleString('en-IN')}</h2>
        </div>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Portfolio</p>
          <h2 style={{ margin: 0, color: '#6c757d' }}>₹{totalPortfolio.toLocaleString('en-IN')}</h2>
        </div>

        <div style={{
          background: profitLoss >= 0 ? '#d4edda' : '#f8d7da',
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${profitLoss >= 0 ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Profit/Loss</p>
          <h2 style={{ margin: 0, color: profitLoss >= 0 ? '#28a745' : '#dc3545' }}>
            ₹{profitLoss.toLocaleString('en-IN')}
          </h2>
        </div>
      </div>

      {/* Add/Withdraw Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          className="btn btn-green"
          onClick={() => setShowAddModal(true)}
          style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
        >
          Add Funds
        </button>
        <button
          className="btn btn-blue"
          onClick={() => setShowWithdrawModal(true)}
          style={{ padding: '12px 24px', fontSize: '16px', cursor: 'pointer' }}
        >
          Withdraw Funds
        </button>
      </div>

      {/* Transaction History */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px' }}>Transaction History</h4>
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.type}</td>
                    <td>₹{transaction.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{
                        color: transaction.status === 'Success' ? '#28a745' : '#ffc107',
                        fontWeight: '500'
                      }}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Insights */}
      {fundChartData.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '15px' }}>Fund Distribution</h4>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <DoughnutChart watchlist={fundChartData} />
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Add Funds</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                placeholder="Enter amount"
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-green"
                onClick={handleAddFunds}
                style={{ flex: 1, padding: '10px' }}
              >
                Add Funds
              </button>
              <button
                className="btn btn-grey"
                onClick={() => {
                  setShowAddModal(false);
                  setAddAmount("");
                }}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>Withdraw Funds</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
                placeholder="Enter amount"
              />
              <small style={{ color: '#666' }}>
                Available: ₹{availableBalance.toLocaleString('en-IN')}
              </small>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-blue"
                onClick={handleWithdrawFunds}
                style={{ flex: 1, padding: '10px' }}
              >
                Withdraw
              </button>
              <button
                className="btn btn-grey"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount("");
                }}
                style={{ flex: 1, padding: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Funds;
