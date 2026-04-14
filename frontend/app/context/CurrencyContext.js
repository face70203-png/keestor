"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Approximate conversion rates from USD (updated periodically)
const CONVERSION_RATES = {
  USD: { rate: 1,     symbol: '$',  name: 'US Dollar',       flag: '🇺🇸' },
  EGP: { rate: 50.5,  symbol: 'EGP', name: 'Egyptian Pound',  flag: '🇪🇬' },
  SAR: { rate: 3.75,  symbol: 'SAR', name: 'Saudi Riyal',     flag: '🇸🇦' },
  AED: { rate: 3.67,  symbol: 'AED', name: 'UAE Dirham',      flag: '🇦🇪' },
  EUR: { rate: 0.92,  symbol: '€',  name: 'Euro',             flag: '🇪🇺' },
  GBP: { rate: 0.79,  symbol: '£',  name: 'British Pound',   flag: '🇬🇧' },
  TRY: { rate: 32.5,  symbol: '₺',  name: 'Turkish Lira',    flag: '🇹🇷' },
  MAD: { rate: 10.1,  symbol: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const saved = localStorage.getItem('keestore-currency') || 'USD';
    if (CONVERSION_RATES[saved]) setCurrency(saved);
  }, []);

  const changeCurrency = (code) => {
    if (CONVERSION_RATES[code]) {
      setCurrency(code);
      localStorage.setItem('keestore-currency', code);
    }
  };

  const formatPrice = (usdAmount) => {
    if (!usdAmount && usdAmount !== 0) return '—';
    const { rate, symbol } = CONVERSION_RATES[currency];
    const converted = (usdAmount * rate).toFixed(2);
    return `${symbol} ${converted}`;
  };

  const currentCurrencyInfo = CONVERSION_RATES[currency];
  const allCurrencies = CONVERSION_RATES;

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, currentCurrencyInfo, allCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
