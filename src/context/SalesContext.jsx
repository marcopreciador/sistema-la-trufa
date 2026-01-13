import React, { createContext, useState, useContext, useEffect } from 'react';
import { SalesService } from '../services/SalesService';

const SalesContext = createContext();

export function useSales() {
    return useContext(SalesContext);
}

export function SalesProvider({ children }) {
    const [sales, setSales] = useState([]);

    // Load initial sales
    useEffect(() => {
        const loadSales = async () => {
            const data = await SalesService.getSales();
            setSales(data);
        };
        loadSales();
    }, []);

    // Sync periodically (every 5 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            SalesService.syncPendingSales();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const addSale = async (saleData) => {
        const newSale = await SalesService.addSale(saleData);
        setSales(prev => [...prev, newSale]);
        return newSale;
    };

    const cancelSale = async (saleId) => {
        await SalesService.cancelSale(saleId);
        setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'cancelled' } : s));
    };

    const getSalesByDate = (date) => {
        const targetDate = new Date(date).toLocaleDateString();
        return sales.filter(sale =>
            new Date(sale.date).toLocaleDateString() === targetDate
        );
    };

    const getDailyTotal = (date) => {
        const dailySales = getSalesByDate(date);
        return dailySales.reduce((sum, sale) => sum + sale.total, 0);
    };

    const getSalesByRange = (startDate, endDate) => {
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        const end = new Date(endDate).setHours(23, 59, 59, 999);

        return sales.filter(sale => {
            const saleDate = new Date(sale.date).getTime();
            return saleDate >= start && saleDate <= end;
        });
    };

    return (
        <SalesContext.Provider value={{
            sales,
            addSale,
            cancelSale,
            getSalesByDate,
            getDailyTotal,
            getSalesByRange
        }}>
            {children}
        </SalesContext.Provider>
    );
}
