"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://keestor.onrender.com";

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings`);
            setSettings(res.data);
            
            // 🎨 Dynamic Branding: Inject primary color into CSS variables
            if (res.data.primaryColor && typeof document !== 'undefined') {
                document.documentElement.style.setProperty('--primary', res.data.primaryColor);
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
