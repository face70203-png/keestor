"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import axios from 'axios';

const WishlistContext = createContext();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();
  const { addToast } = useToast();

  // Load from localStorage on init (unauthenticated) or sync if logged in
  useEffect(() => {
    const saved = localStorage.getItem('keestore_wishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('keestore_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const exists = wishlist.find(p => p._id === product._id);
    if (exists) {
      setWishlist(wishlist.filter(p => p._id !== product._id));
      addToast(
        "Removed from Favorites",
        `${product.title} has been removed.`,
        "info"
      );
    } else {
      setWishlist([...wishlist, product]);
      addToast(
        "Added to Wishlist ❤️",
        `${product.title} is now in your favorites.`,
        "success"
      );
    }
  };

  const isInWishlist = (productId) => wishlist.some(p => p._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
