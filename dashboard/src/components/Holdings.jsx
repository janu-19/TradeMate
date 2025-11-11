import React,{useState,useEffect} from "react";

import { holdings } from "../data/data";
import axios from 'axios';
import VerticalGraph from "./VerticalGraph.jsx";
const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

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

  // Fetch real-time prices for holdings - Optimized
  useEffect(() => {
    if (allHoldings.length === 0) return;

    let isMounted = true;
    let timeoutId = null;

    const fetchLivePrices = async () => {
      if (!isMounted) return;

      setIsLoadingPrices(true);
      try {
        // Get all unique stock symbols from holdings
        const symbols = [...new Set(allHoldings.map(holding => holding.name))];
        
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
                percentChange: data.dp || 0
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
          console.error("Error fetching live prices for holdings:", error.message);
        }
        // Continue with static prices if API fails
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
  }, [allHoldings]);
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
      <h3 className="title">
        Holdings ({allHoldings.length})
        {isLoadingPrices && (
          <span style={{ fontSize: '12px', marginLeft: '10px', color: '#999', fontWeight: 'normal' }}>
            Updating prices...
          </span>
        )}
      </h3>

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
              // Use live price if available, otherwise use stored price
              const currentPrice = livePrices[stock.name]?.price || stock.price;
              const livePercentChange = livePrices[stock.name]?.percentChange;
              
              const curValue = currentPrice * stock.qty;
              const isProfit = curValue - stock.avg * stock.qty >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              
              // Calculate day change from live data or use stored value
              const dayChange = livePercentChange !== undefined 
                ? (livePercentChange >= 0 ? `+${livePercentChange.toFixed(2)}%` : `${livePercentChange.toFixed(2)}%`)
                : (stock.day || 'N/A');
              const dayClass = livePercentChange !== undefined 
                ? (livePercentChange < 0 ? "loss" : "profit")
                : (stock.isLoss ? "loss" : "profit");

              return (
                <tr key={index}>
                  <td>
                    {stock.name}
                    {livePrices[stock.name] && (
                      <span style={{ fontSize: '8px', marginLeft: '4px', color: '#28a745' }} title="Live">●</span>
                    )}
                  </td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg ? stock.avg.toFixed(2) : '0.00'}</td>
                  <td>
                    {currentPrice ? currentPrice.toFixed(2) : '0.00'}
                    {isLoadingPrices && livePrices[stock.name] && (
                      <span style={{ fontSize: '10px', marginLeft: '4px', color: '#999' }}>🔄</span>
                    )}
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