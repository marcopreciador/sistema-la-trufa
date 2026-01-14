import { supabase } from './supabase';

const LOCAL_STORAGE_KEY = 'la-trufa-sales-history';

export const SalesService = {
    // Add a new sale
    addSale: async (saleData) => {
        const newSale = { ...saleData, id: saleData.id || Date.now(), synced: false };

        // 1. Mandatory Supabase Write
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('sales')
                    .insert([{
                        id: newSale.id,
                        date: newSale.date,
                        total: newSale.total,
                        items: newSale.items,
                        user_data: newSale.user,
                        payment_method: newSale.paymentMethod,
                        order_number: newSale.orderNumber,
                        status: newSale.status || 'completed'
                    }]);

                if (error) throw error;
                newSale.synced = true;
            } catch (err) {
                console.error('CRITICAL: Supabase insert failed:', err);
                // We still save to local storage as backup, but we log the error loudly
                // alert("Error al guardar en la nube. Se guardará localmente.");
            }
        }

        // 2. Local Storage Backup
        const localSales = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        localSales.push(newSale);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSales));

        return newSale;
    },

    // Cancel a sale
    cancelSale: async (saleId) => {
        const localSales = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const updatedSales = localSales.map(s =>
            s.id === saleId ? { ...s, status: 'cancelled', synced: false } : s
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSales));

        if (supabase) {
            try {
                // Update status in Supabase
                await supabase
                    .from('sales')
                    .update({ status: 'cancelled' })
                    .eq('id', saleId);

                // Mark as synced again
                const resyncedSales = updatedSales.map(s =>
                    s.id === saleId ? { ...s, synced: true } : s
                );
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resyncedSales));
            } catch (err) {
                console.warn('Supabase update failed:', err);
            }
        }

        return updatedSales.find(s => s.id === saleId);
    },

    // Get all sales (prefer local for speed, sync in background could be added later)
    getSales: async () => {
        // For now, we rely on LocalStorage as the source of truth for the POS UI
        // to ensure it works offline.
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    },

    // Sync unsynced sales (can be called periodically)
    syncPendingSales: async () => {
        if (!supabase) return;

        const localSales = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const pendingSales = localSales.filter(s => !s.synced);

        if (pendingSales.length === 0) return;

        for (const sale of pendingSales) {
            try {
                const { error } = await supabase
                    .from('sales')
                    .upsert([{ // Use upsert to handle updates (like cancellations)
                        id: sale.id,
                        date: sale.date,
                        total: sale.total,
                        items: sale.items,
                        user_data: sale.user,
                        payment_method: sale.paymentMethod,
                        order_number: sale.orderNumber,
                        status: sale.status || 'completed'
                    }]);

                if (!error) {
                    sale.synced = true;
                }
            } catch (err) {
                console.error('Sync failed for sale:', sale.id, err);
            }
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSales));
    }
};
