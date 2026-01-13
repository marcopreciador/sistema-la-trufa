import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';

export function CustomerSelectionModal({ isOpen, onClose, onSelect }) {
    const { customers, addCustomer, updateCustomer } = useProducts();
    const [view, setView] = useState('search'); // 'search' | 'create'
    const [searchTerm, setSearchTerm] = useState('');

    // New Address State
    const [addingAddressTo, setAddingAddressTo] = useState(null); // Customer ID
    const [newAddress, setNewAddress] = useState('');

    // New Customer Form State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        addresses: ['']
    });

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return [];
        const lowerTerm = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(lowerTerm) ||
            c.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const handleCreate = (e) => {
        e.preventDefault();
        const customer = addCustomer({
            name: newCustomer.name,
            phone: newCustomer.phone,
            addresses: newCustomer.addresses.filter(a => a.trim() !== '')
        });
        // Auto select the first address
        onSelect(customer, customer.addresses[0]);
        onClose();
        resetForm();
    };

    const handleAddAddress = (customer) => {
        if (newAddress.trim()) {
            const updatedCustomer = {
                ...customer,
                addresses: [...customer.addresses, newAddress.trim()]
            };
            updateCustomer(updatedCustomer);
            onSelect(updatedCustomer, newAddress.trim());
            onClose();
            setAddingAddressTo(null);
            setNewAddress('');
        }
    };

    const resetForm = () => {
        setNewCustomer({ name: '', phone: '', addresses: [''] });
        setView('search');
        setSearchTerm('');
        setAddingAddressTo(null);
        setNewAddress('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {view === 'search' ? 'Seleccionar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {view === 'search' ? (
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {filteredCustomers.map(customer => (
                                    <div key={customer.id} className="p-3 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-900">{customer.name}</p>
                                                <p className="text-sm text-gray-500">{customer.phone}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {customer.addresses.map((addr, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        onSelect(customer, addr);
                                                        onClose();
                                                    }}
                                                    className="block w-full text-left text-xs py-1.5 px-3 bg-gray-100 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                                                >
                                                    Entregar en: {addr}
                                                </button>
                                            ))}

                                            {/* Add New Address Inline */}
                                            {addingAddressTo === customer.id ? (
                                                <div className="flex space-x-2 mt-2 animate-fade-in">
                                                    <input
                                                        type="text"
                                                        placeholder="Nueva dirección..."
                                                        value={newAddress}
                                                        onChange={e => setNewAddress(e.target.value)}
                                                        className="flex-1 p-1.5 text-xs border border-blue-300 rounded focus:outline-none"
                                                        autoFocus
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') handleAddAddress(customer);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleAddAddress(customer)}
                                                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                    >
                                                        OK
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAddingAddressTo(customer.id);
                                                        setNewAddress('');
                                                    }}
                                                    className="block w-full text-left text-xs py-1.5 px-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium border border-dashed border-blue-200 mt-1"
                                                >
                                                    + Nueva Dirección
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {searchTerm && filteredCustomers.length === 0 && (
                                    <div className="text-center py-4 text-gray-400">
                                        No se encontraron clientes
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setView('create')}
                                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                + Crear Nuevo Cliente
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input
                                    type="tel"
                                    required
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Principal</label>
                                <input
                                    type="text"
                                    required
                                    value={newCustomer.addresses[0]}
                                    onChange={e => {
                                        const newAddrs = [...newCustomer.addresses];
                                        newAddrs[0] = e.target.value;
                                        setNewCustomer({ ...newCustomer, addresses: newAddrs });
                                    }}
                                    placeholder="Calle, Número, Colonia..."
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setView('search')}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all"
                                >
                                    Guardar y Seleccionar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
