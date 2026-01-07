import React, { createContext, useContext, useEffect, useState } from 'react';
import socket from '../API/socket';

const AlertsContext = createContext(null);

export const AlertsProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log('Initializing WebSocket connection for alerts...');

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('opsgenieAlert', (alert) => {
            console.log('Received opsgenieAlert:', alert);
            setAlerts((prev) => [alert, ...prev]); // prepend newest
        });

        // Cleanup
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('opsgenieAlert');
        };
    }, []);

    const clearAlerts = () => setAlerts([]);

    const value = {
        alerts,
        isConnected,
        clearAlerts,
    };

    return (
        <AlertsContext.Provider value={value}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlerts = () => {
    const ctx = useContext(AlertsContext);
    if (!ctx) {
        throw new Error('useAlerts must be used within an AlertsProvider');
    }
    return ctx;
};
