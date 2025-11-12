import React,{useState,useEffect} from "react";

import { holdings } from "../data/data";
import axios from 'axios';
import VerticalGraph from "./VerticalGraph.jsx";
const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);

  // Fetch holdings from backend
  useEffect(() => {
    axios.get("http://localhost:3002/allHoldings")
      .then((res) => {
        setAllHoldings(res.data.allHoldings || []);
      })
      .catch((err) => {
        console.error("Error fetching holdings:", err);
        // Fallback to local data if API fails
        setAllHoldings(holdings);
      });
  }, []);

  const lables = allHoldings.map((stock) => stock.name);
  const chartData = allHoldings.map((stock) => stock.qty);
  const datasets = [
    {
      label: 'Holdings',
      data: chartData,
    },
  ];
  const data = {
    labels: lables,
    datasets: datasets,
  };
  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const currentPrice = stock.price;
              const curValue = currentPrice * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              
              const dayChange = stock.day || 'N/A';
              const dayClass = stock.isLoss ? "loss" : "profit";

              return (
                <tr key={index}>
                  <td>
                    {stock.name}
                  </td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg ? stock.avg.toFixed(2) : '0.00'}</td>
                  <td>
                    {currentPrice ? currentPrice.toFixed(2) : '0.00'}
                  </td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>
                    {(curValue - stock.avg * stock.qty).toFixed(2)}
                  </td>
                  <td className={profClass}>{stock.net || 'N/A'}</td>
                  <td className={dayClass}>{dayChange}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;