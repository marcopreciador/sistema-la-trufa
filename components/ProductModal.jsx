import React, { useState, useEffect } from 'react';

export function ProductModal({ product, isOpen, onClose, onConfirm, initialQuantity = 1, initialNotes = '', isEditing = false }) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantity(initialQuantity);
            setNotes(initialNotes);
        }
    }, [isOpen, product, initialQuantity, initialNotes]);

    if (!isOpen || !product) return null;

    const handleConfirm = () => {
        onConfirm(product, quantity, notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="relative h-48">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-sm transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                        <span className="text-xl font-semibold text-gray-500">${product.price}</span>
                    </div>

                    <div className="space-y-6">
                        {/* Quantity Control */}
                        <div className="flex items-center justify-center space-x-6">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-medium text-gray-600 transition-colors"
                            >
                                -
                            </button>
                            <span className="text-3xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-medium text-gray-600 transition-colors"
                            >
                                +
                            </button>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Instrucciones</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ej. Sin cebolla, salsa aparte..."
                                className="w-full p-3 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24"
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleConfirm}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all"
                        >
                            {isEditing ? 'Guardar Cambios' : 'Agregar a la Orden'} - ${(product.price * quantity).toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
