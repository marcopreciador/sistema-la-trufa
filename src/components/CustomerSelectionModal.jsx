import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { supabase } from '../services/supabase';

export function CustomerSelectionModal({ isOpen, onClose, onSelect }) {
    const { customers, addCustomer, updateCustomer } = useProducts();
    const [phoneSearch, setPhoneSearch] = useState('');
    const [name, setName] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [existingCustomer, setExistingCustomer] = useState(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPhoneSearch('');
            setName('');
            setAddresses([]);
            setSelectedAddress('');
            setIsNewCustomer(false);
            setExistingCustomer(null);
        }
    }, [isOpen]);

    // Smart Search Logic
    useEffect(() => {
        const performSearch = async () => {
            if (phoneSearch.length >= 3) {
                // 1. Global Search (Supabase First)
                let remoteFound = null;
                if (phoneSearch.length >= 7 && supabase) { // Lowered threshold to 7 for faster lookup
                    try {
                        const { data, error } = await supabase
                            .from('clients')
                            .select('*')
                            .eq('phone', phoneSearch)
                            .single();

                        if (data && !error) {
                            remoteFound = data;
                        }
                    } catch (err) {
                        // Ignore "Row not found" errors, just log others
                        if (err.code !== 'PGRST116') {
                            console.error("Error searching client:", err);
                        }
                    }
                }

                // 2. Local Fallback (if not found remotely)
                const localFound = customers.find(c => c.phone.includes(phoneSearch));

                if (remoteFound) {
                    setExistingCustomer(remoteFound);
                    setName(remoteFound.name);

                    // Lógica de protección obligatoria
                    let addressOptions = [];
                    if (Array.isArray(remoteFound.addresses)) {
                        addressOptions = remoteFound.addresses;
                    } else if (typeof remoteFound.addresses === 'string') {
                        try {
                            addressOptions = JSON.parse(remoteFound.addresses);
                            if (!Array.isArray(addressOptions)) addressOptions = [addressOptions];
                        } catch (e) {
                            addressOptions = [remoteFound.addresses];
                        }
                    } else if (remoteFound.addresses) {
                        // Fallback for other truthy types
                        addressOptions = [remoteFound.addresses];
                    }

                    setAddresses(addressOptions);
                    if (addressOptions.length > 0) {
                        setSelectedAddress(addressOptions[0]);
                    }
                    setIsNewCustomer(false);
                } else if (localFound) {
                    setExistingCustomer(localFound);
                    setName(localFound.name);
                    setAddresses(localFound.addresses || []);
                    if (localFound.addresses && localFound.addresses.length > 0) {
                        setSelectedAddress(localFound.addresses[0]);
                    }
                    setIsNewCustomer(false);
                } else {

                    if (remoteFound) {
                        setExistingCustomer(remoteFound);
                        setName(remoteFound.name);

                        // Lógica de protección obligatoria
                        let addressOptions = [];
                        if (Array.isArray(remoteFound.addresses)) {
                            addressOptions = remoteFound.addresses;
                        } else if (typeof remoteFound.addresses === 'string') {
                            try {
                                addressOptions = JSON.parse(remoteFound.addresses);
                                if (!Array.isArray(addressOptions)) addressOptions = [addressOptions];
                            } catch (e) {
                                addressOptions = [remoteFound.addresses];
                            }
                        } else if (remoteFound.addresses) {
                            addressOptions = [remoteFound.addresses];
                        }

                        setAddresses(addressOptions);
                        if (addressOptions.length > 0) {
                            setSelectedAddress(addressOptions[0]);
                        }
                        setIsNewCustomer(false);
                    } else {
                        setExistingCustomer(null);
                        // Only set new customer mode if phone is long enough to be real
                        if (phoneSearch.length >= 10) {
                            setIsNewCustomer(true);
                            setName('');
                            setAddresses([]);
                            setSelectedAddress('');
                        }
                    }
                }
            } else {
                setExistingCustomer(null);
                setIsNewCustomer(false);
            }
        };
        performSearch();
    }, [phoneSearch, customers]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAndSelect = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        // Validate
        if (!phoneSearch || !name || !selectedAddress) {
            alert("Por favor completa todos los campos.");
            return;
        }

        setIsSaving(true);

        try {
            let finalCustomer;

            // Simple Save Logic: If it has an ID, update. If not, create.
            if (existingCustomer && existingCustomer.id) {
                const updatedAddresses = existingCustomer.addresses.includes(selectedAddress)
                    ? existingCustomer.addresses
                    : [...existingCustomer.addresses, selectedAddress];

                finalCustomer = {
                    ...existingCustomer,
                    name: name,
                    addresses: updatedAddresses
                };
                await updateCustomer(finalCustomer);
            } else {
                finalCustomer = await addCustomer({
                    name: name,
                    phone: phoneSearch,
                    addresses: [selectedAddress]
                });
            }

            onSelect(finalCustomer, selectedAddress);
            onClose();
        } catch (error) {
            console.error("Error saving customer:", error);
            const status = error.status || error.code || 'Unknown';
            alert(`Error de Conexión: ${JSON.stringify(error, null, 2)}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isSaving ? 'Guardando...' : 'Nuevo Pedido'}
                    </h2>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSaveAndSelect} className="p-6 space-y-6">
                    {/* 1. Phone Input (Focus) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Teléfono del Cliente
                        </label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={phoneSearch}
                                onChange={(e) => setPhoneSearch(e.target.value)}
                                placeholder="Ingresa el número..."
                                autoFocus
                                className="w-full pl-4 pr-10 py-3 text-lg bg-gray-50 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-all font-mono"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                        </div>
                        {existingCustomer && (
                            <p className="text-xs text-green-600 mt-1 font-semibold flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                Cliente Encontrado
                            </p>
                        )}
                    </div>

                    {/* 2. Name (Auto-filled or Editable) */}
                    <div className={`transition-all duration-300 ${phoneSearch.length > 3 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre del cliente"
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* 3. Address Selector & Manager */}
                    <div className={`transition-all duration-300 ${phoneSearch.length > 3 ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2'}`}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>

                        {addresses.length > 0 ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={selectedAddress}
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                        className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                                    >
                                        {addresses.map((addr, idx) => (
                                            <option key={idx} value={addr}>{addr}</option>
                                        ))}
                                        <option value="new">+ Nueva Dirección...</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {selectedAddress === 'new' && (
                                    <input
                                        type="text"
                                        placeholder="Escribe la nueva dirección..."
                                        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none animate-fade-in"
                                        autoFocus
                                        onBlur={(e) => {
                                            if (e.target.value) setSelectedAddress(e.target.value);
                                        }}
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                    />
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={selectedAddress}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                                placeholder="Calle, Número, Colonia..."
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        type="submit"
                        disabled={!phoneSearch || !name || !selectedAddress || isSaving}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
                            ${(!phoneSearch || !name || !selectedAddress || isSaving)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
                            }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            existingCustomer ? 'Confirmar Datos' : 'Crear y Continuar'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
