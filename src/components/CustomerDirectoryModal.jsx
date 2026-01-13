import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';

export function CustomerDirectoryModal({ isOpen, onClose }) {
    const { customers, updateCustomer } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [newAddress, setNewAddress] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        const lowerTerm = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(lowerTerm) ||
            c.phone.includes(searchTerm)
        );
    }, [customers, searchTerm]);

    const handleSave = (e) => {
        e.preventDefault();
        updateCustomer(editingCustomer);
        setEditingCustomer(null);
    };

    const handleAddAddress = () => {
        if (newAddress.trim()) {
            setEditingCustomer({
                ...editingCustomer,
                addresses: [...editingCustomer.addresses, newAddress.trim()]
            });
            setNewAddress('');
        }
    };

    const handleRemoveAddress = (index) => {
        const newAddresses = editingCustomer.addresses.filter((_, i) => i !== index);
        setEditingCustomer({
            ...editingCustomer,
            addresses: newAddresses
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Directorio de Clientes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* List */}
                    <div className={`w-1/2 border-r border-gray-100 p-4 flex flex-col ${editingCustomer ? 'hidden md:flex' : 'flex'}`}>
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                        />
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredCustomers.map(customer => (
                                <div
                                    key={customer.id}
                                    onClick={() => setEditingCustomer(customer)}
                                    className={`p-3 rounded-xl cursor-pointer transition-colors ${editingCustomer?.id === customer.id
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <p className="font-bold text-gray-900">{customer.name}</p>
                                    <p className="text-sm text-gray-500">{customer.phone}</p>
                                </div>
                            ))}
                            {filteredCustomers.length === 0 && (
                                <p className="text-center text-gray-400 text-sm mt-4">No se encontraron clientes</p>
                            )}
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className={`w-full md:w-1/2 p-6 overflow-y-auto ${editingCustomer ? 'block' : 'hidden md:block'}`}>
                        {editingCustomer ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="flex justify-between items-center md:hidden mb-4">
                                    <button type="button" onClick={() => setEditingCustomer(null)} className="text-blue-500 font-medium">
                                        ← Volver
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingCustomer.name}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        required
                                        value={editingCustomer.phone}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Direcciones</label>
                                    <div className="space-y-2 mb-3">
                                        {editingCustomer.addresses.map((addr, idx) => (
                                            <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                <span className="text-sm text-gray-700">{addr}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAddress(idx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Nueva dirección..."
                                            value={newAddress}
                                            onChange={e => setNewAddress(e.target.value)}
                                            className="flex-1 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAddress}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p>Selecciona un cliente para editar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
