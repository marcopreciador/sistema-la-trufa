import React from 'react';

export function AccountSummaryModal({ isOpen, onClose, activeOrder, total, onPay, isProcessing }) {
    if (!isOpen || !activeOrder) return null;

    const committedItems = activeOrder.committedItems || [];

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white shadow-sm z-10">
                <h2 className="text-xl font-bold text-gray-900">Resumen de Consumo</h2>
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {committedItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p>No hay consumo registrado aún</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {committedItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-gray-900 w-6">{item.quantity}x</span>
                                    <span className="text-gray-700">{item.name}</span>
                                </div>
                                <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-lg">Total Consumido</span>
                    <span className="text-3xl font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>

                <button
                    onClick={onPay}
                    disabled={total === 0 || isProcessing}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 
                        ${total === 0
                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                            : 'bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow-green-600/30'
                        }`}
                >
                    {isProcessing ? 'Procesando...' : 'Cerrar Mesa'}
                </button>
            </div>
        </div>
    );
}
