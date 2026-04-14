"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

// Base data for common currencies (Flags & Symbols)
const CURRENCY_DATABASE = {
  USD: { symbol: '$',  name: 'US Dollar',       flag: '🇺🇸' },
  EGP: { symbol: 'EGP', name: 'Egyptian Pound',  flag: '🇪🇬' },
  SAR: { symbol: 'SR',  name: 'Saudi Riyal',     flag: '🇸🇦' },
  AED: { symbol: 'AED', name: 'UAE Dirham',      flag: '🇦🇪' },
  EUR: { symbol: '€',  name: 'Euro',             flag: '🇪🇺' },
  GBP: { symbol: '£',  name: 'British Pound',   flag: '🇬🇧' },
  TRY: { symbol: '₺',  name: 'Turkish Lira',    flag: '🇹🇷' },
  MAD: { symbol: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
  KWD: { symbol: 'KWD', name: 'Kuwaiti Dinar',   flag: '🇰🇼' },
  QAR: { symbol: 'QAR', name: 'Qatari Riyal',    flag: '🇶🇦' },
  CAD: { symbol: 'C$',  name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { symbol: 'A$',  name: 'Australian Dollar', flag: '🇦🇺' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1 });
  const [isReady, setIsReady] = useState(false);

  // 🌍 Global Intelligence: Fetch Rates & Detect Location
  const initializeFinancials = useCallback(async () => {
    try {
      // 1. Fetch Live Exchange Rates (Cached for 24h)
      const cachedRates = localStorage.getItem('keestore_rates');
      const cacheTime = localStorage.getItem('keestore_rates_time');
      const now = Date.now();

      let currentRates = { USD: 1 };

      if (cachedRates && cacheTime && (now - cacheTime < 24 * 60 * 60 * 1000)) {
        currentRates = JSON.parse(cachedRates);
      } else {
        const res = await axios.get('https://open.er-api.com/v6/latest/USD', { withCredentials: false });
        currentRates = res.data.rates;
        localStorage.setItem('keestore_rates', JSON.stringify(currentRates));
        localStorage.setItem('keestore_rates_time', now.toString());
      }
      setRates(currentRates);

      // 2. Detect User Currency via IP (Only if no manual preference set)
      const savedCurrency = localStorage.getItem('keestore-currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
      } else {
        try {
          const locRes = await axios.get('https://ipapi.co/json/', { withCredentials: false });
          const detectedCode = locRes.data.currency;
          if (currentRates[detectedCode]) {
             setCurrency(detectedCode);
             localStorage.setItem('keestore-currency', detectedCode);
          }
        } catch (ipErr) {
          console.warn("[CURRENCY] IP Detection failed, defaulting to USD.");
          setCurrency('USD');
        }
      }
    } catch (err) {
      console.error("[CURRENCY] Critical Failure:", err.message);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    initializeFinancials();
  }, [initializeFinancials]);

  const changeCurrency = (code) => {
    if (rates[code]) {
      setCurrency(code);
      localStorage.setItem('keestore-currency', code);
    }
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount && usdAmount !== 0) return '—';
    const rate = rates[currency] || 1;
    const info = CURRENCY_DATABASE[currency] || { symbol: currency, flag: '🌐' };
    
    const converted = (usdAmount * rate).toFixed(2);
    // Add comma formatting
    const formatted = parseFloat(converted).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${info.symbol} ${formatted}`;
  };

  const currentCurrencyInfo = {
    code: currency,
    ...(CURRENCY_DATABASE[currency] || { symbol: currency, name: currency, flag: '🌐' }),
    rate: rates[currency] || 1
  };

  return (
    <CurrencyContext.Provider value={{ 
        currency, 
        changeCurrency, 
        formatPrice, 
        currentCurrencyInfo, 
        allRates: rates,
        allCurrencies: CURRENCY_DATABASE, // Restore this to fix Dashboard/Admin crashes
        isReady 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
