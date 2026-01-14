import React from 'react';
import { Cart } from './Cart';

export function SmartCartModal({ isOpen, onClose, cartProps }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-900">Resumen de Orden</h2>
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                <Cart {...cartProps} />
            </div>
        </div>
    );
}
