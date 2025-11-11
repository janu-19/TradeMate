const express = require('express');
const finnhub = require('finnhub');
const router = express.Router();

// Setup Finnhub API client - Initialize only if API key exists
let finnhubClient = null;

try {
  if (process.env.FINNHUB_API_KEY) {
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = process.env.FINNHUB_API_KEY;
    finnhubClient = new finnhub.DefaultApi();
  } else {
    console.warn('⚠️ FINNHUB_API_KEY not found in .env - Finnhub routes will return errors');
  }
} catch (err) {
  console.error('❌ Error initializing Finnhub client:', err.message);
  console.warn('⚠️ Finnhub routes will not work until API key is configured');
}

// Get real-time quote for a symbol
router.get("/quote/:symbol", async (req, res) => {
  try {
    if (!finnhubClient) {
      return res.status(503).json({ error: "Finnhub API key not configured" });
    }

    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        console.error("Finnhub API error:", error);
        return res.status(500).json({ error: "Failed to fetch quote", details: error.message });
      } else {
        res.json(data);
      }
    });
  } catch (err) {
    console.error("Error in quote route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get company profile
router.get("/profile/:symbol", async (req, res) => {
  try {
    if (!finnhubClient) {
      return res.status(503).json({ error: "Finnhub API key not configured" });
    }

    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: "Symbol is required" });
    }

    finnhubClient.companyProfile2({ symbol: symbol }, (error, data, response) => {
      if (error) {
        console.error("Finnhub API error:", error);
        return res.status(500).json({ error: "Failed to fetch profile", details: error.message });
      } else {
        res.json(data);
      }
    });
  } catch (err) {
    console.error("Error in profile route:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get multiple quotes (batch request) - Optimized with timeout
router.post("/quotes", async (req, res) => {
  try {
    if (!finnhubClient) {
      const { symbols } = req.body || { symbols: [] };
      return res.status(503).json({ 
        error: "Finnhub API key not configured",
        quotes: (symbols || []).map(symbol => ({ symbol, error: "API key not configured" }))
      });
    }

    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: "Symbols array is required" });
    }

    // Fetch quotes for all symbols in parallel with timeout
    // Note: For Indian stocks, Finnhub may require "NSE:INFY" format
    // For US stocks, use symbols directly like "AAPL", "MSFT"
    const quotePromises = symbols.map(symbol => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ symbol, error: "Request timeout" });
        }, 2000); // 2 second timeout per request

        finnhubClient.quote(symbol, (error, data, response) => {
          clearTimeout(timeout);
          if (error) {
            // Don't log every error to avoid spam
            if (!error.message.includes('Not Found') && !error.message.includes('Invalid')) {
              console.error(`Error fetching quote for ${symbol}:`, error.message);
            }
            resolve({ symbol, error: error.message || "Failed to fetch" });
          } else if (data && data.c) {
            // Only return if we have valid price data
            resolve({ symbol, data });
          } else {
            resolve({ symbol, error: "No price data available" });
          }
        });
      });
    });

    // Wait for all requests with overall timeout (reduced to 3 seconds for faster response)
    const results = await Promise.race([
      Promise.all(quotePromises),
      new Promise((resolve) => setTimeout(() => resolve(null), 3000)) // 3 second overall timeout
    ]);

    if (results === null) {
      console.warn("⚠️ Batch quotes request timed out");
      return res.status(504).json({ 
        error: "Request timeout",
        quotes: symbols.map(symbol => ({ symbol, error: "Request timeout" }))
      });
    }

    res.json({ quotes: results });
  } catch (err) {
    console.error("Error in batch quotes route:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;

