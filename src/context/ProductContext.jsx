import React, { createContext, useState, useEffect, useContext } from 'react';
import { products as defaultProducts } from '../data/products';

const ProductContext = createContext();

export function useProducts() {
    return useContext(ProductContext);
}

export function ProductProvider({ children }) {
    // Products State
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('la-trufa-products');
        return savedProducts ? JSON.parse(savedProducts) : defaultProducts;
    });

    // Customers State
    const [customers, setCustomers] = useState(() => {
        const savedCustomers = localStorage.getItem('la-trufa-customers');
        return savedCustomers ? JSON.parse(savedCustomers) : [];
    });

    // Cash Cuts State
    const [cashCuts, setCashCuts] = useState(() => {
        const savedCuts = localStorage.getItem('la-trufa-cash-cuts');
        return savedCuts ? JSON.parse(savedCuts) : [];
    });

    // Expenses State
    const [expenses, setExpenses] = useState(() => {
        try {
            const savedExpenses = localStorage.getItem('la-trufa-expenses');
            const parsed = savedExpenses ? JSON.parse(savedExpenses) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    });

    // Purchases History State
    const [purchases, setPurchases] = useState(() => {
        try {
            const savedPurchases = localStorage.getItem('la-trufa-purchases');
            const parsed = savedPurchases ? JSON.parse(savedPurchases) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading purchases:', error);
            return [];
        }
    });

    // Inventory State
    const [inventory, setInventory] = useState(() => {
        const savedInventory = localStorage.getItem('la-trufa-inventory');
        return savedInventory ? JSON.parse(savedInventory) : [];
    });

    // Table Drafts State
    const [tableDrafts, setTableDrafts] = useState(() => {
        const savedDrafts = localStorage.getItem('la-trufa-table-drafts');
        return savedDrafts ? JSON.parse(savedDrafts) : {};
    });

    // Order Sequence State
    const [orderSequence, setOrderSequence] = useState(() => {
        const savedSeq = localStorage.getItem('la-trufa-order-sequence');
        return savedSeq ? parseInt(savedSeq, 10) : 1000;
    });

    // Persistence
    useEffect(() => {
        localStorage.setItem('la-trufa-products', JSON.stringify(products));
    }, [products]);

    // salesHistory effect removed

    useEffect(() => {
        localStorage.setItem('la-trufa-customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('la-trufa-cash-cuts', JSON.stringify(cashCuts));
    }, [cashCuts]);

    useEffect(() => {
        localStorage.setItem('la-trufa-expenses', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('la-trufa-purchases', JSON.stringify(purchases));
    }, [purchases]);

    useEffect(() => {
        localStorage.setItem('la-trufa-inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('la-trufa-table-drafts', JSON.stringify(tableDrafts));
    }, [tableDrafts]);

    useEffect(() => {
        localStorage.setItem('la-trufa-order-sequence', orderSequence.toString());
    }, [orderSequence]);

    // Product Actions
    const addProduct = (product) => {
        const newProduct = { ...product, id: Date.now() };
        setProducts([...products, newProduct]);
    };

    const updateProduct = (updatedProduct) => {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const resetToDefault = () => {
        if (window.confirm('¿Estás seguro de restaurar el menú original? Se perderán los cambios.')) {
            setProducts(defaultProducts);
        }
    };

    // Sales Actions removed (moved to SalesContext)
    // Inventory logic moved to processSaleInventory (below)

    // Customer Actions
    const addCustomer = (customer) => {
        const newCustomer = {
            id: Date.now(),
            ...customer
        };
        setCustomers([...customers, newCustomer]);
        return newCustomer;
    };

    const updateCustomer = (updatedCustomer) => {
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    // Cash Cut Actions
    const addCashCut = (cut) => {
        const newCut = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...cut
        };
        setCashCuts([newCut, ...cashCuts]);
    };

    // Expense Actions
    const addExpense = (expense) => {
        const newExpense = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...expense
        };
        setExpenses([newExpense, ...expenses]);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    // Inventory Actions
    const addIngredient = (ingredient) => {
        const newIngredient = {
            id: Date.now(),
            ...ingredient
        };
        setInventory([...inventory, newIngredient]);
    };

    const updateIngredient = (updatedIngredient) => {
        setInventory(inventory.map(i => i.id === updatedIngredient.id ? updatedIngredient : i));
    };

    const deleteIngredient = (id) => {
        setInventory(inventory.filter(i => i.id !== id));
    };

    // Purchase & Stock Update Logic (OCR Integration)
    const recordPurchase = (purchaseData) => {
        // 1. Record the Purchase in History
        const newPurchase = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...purchaseData
        };
        setPurchases([newPurchase, ...purchases]);

        // 2. Record as Expense automatically
        addExpense({
            description: `Compra: ${purchaseData.merchant || 'Proveedor Desconocido'}`,
            amount: purchaseData.totalAmount,
            category: 'Insumos',
            userName: 'Sistema (OCR)'
        });

        // 3. Update Inventory Stock & Last Cost
        let currentInv = [...inventory];

        purchaseData.items.forEach(item => {
            const existingItemIndex = currentInv.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());

            if (existingItemIndex >= 0) {
                // Update existing
                const existingItem = currentInv[existingItemIndex];
                currentInv[existingItemIndex] = {
                    ...existingItem,
                    stock: parseFloat(existingItem.stock) + parseFloat(item.quantity),
                    lastCost: item.unitPrice, // Update last cost
                    unit: existingItem.unit || 'Pieza' // Preserve unit
                };
            } else {
                // Add new ingredient if not exists
                currentInv.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    stock: parseFloat(item.quantity),
                    unit: 'Pieza', // Default
                    lastCost: item.unitPrice
                });
            }
        });

        setInventory(currentInv);
    };

    // Process Inventory for Sale (Sniper Mode Logic)
    const processSaleInventory = (items) => {
        try {
            const currentInv = JSON.parse(localStorage.getItem('la-trufa-inventory') || '[]');
            const currentProds = JSON.parse(localStorage.getItem('la-trufa-products') || '[]');
            let stockChanged = false;

            if (items && Array.isArray(items)) {
                items.forEach(item => {
                    const masterProd = currentProds.find(p => p.name === item.name);
                    if (masterProd && masterProd.recipe) {
                        masterProd.recipe.forEach(ing => {
                            const stockItem = currentInv.find(i => i.name === ing.name);
                            if (stockItem) {
                                const deduction = (parseFloat(ing.quantity) * item.quantity);
                                stockItem.stock -= deduction;
                                stockChanged = true;
                                console.log('Descontado: ' + deduction + ' de ' + ing.name + '. Nuevo: ' + stockItem.stock);
                            }
                        });
                    }
                });

                if (stockChanged) {
                    localStorage.setItem('la-trufa-inventory', JSON.stringify(currentInv));
                    setInventory(currentInv);
                    console.log('Inventario actualizado y guardado (Sniper Mode).');
                }
            }
        } catch (e) {
            console.error("Sniper error:", e);
        }
    };

    const deductStock = (soldItems) => {
        // Legacy alias
        processSaleInventory(soldItems);
    };

    // Draft Actions
    const saveDraft = (tableId, items) => {
        setTableDrafts(prev => ({
            ...prev,
            [tableId]: items
        }));
    };

    const removeDraft = (tableId) => {
        setTableDrafts(prev => {
            const newDrafts = { ...prev };
            delete newDrafts[tableId];
            return newDrafts;
        });
    };

    const getNextOrderNumber = () => {
        const next = orderSequence + 1;
        setOrderSequence(next);
        return next;
    };

    return (
        <ProductContext.Provider value={{
            products,
            addProduct,
            updateProduct,
            deleteProduct,
            resetToDefault,
            // salesHistory removed (moved to SalesContext)
            // addSale removed (moved to SalesContext)
            processSaleInventory, // New exposed method
            customers,
            addCustomer,
            updateCustomer,
            cashCuts,
            addCashCut,
            expenses,
            addExpense,
            deleteExpense,
            inventory,
            addIngredient,
            updateIngredient,
            deleteIngredient,
            purchases,
            recordPurchase,
            deductStock,
            // Drafts
            tableDrafts,
            saveDraft,
            removeDraft,
            getNextOrderNumber
        }}>
            {children}
        </ProductContext.Provider>
    );
}
