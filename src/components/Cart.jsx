import React from 'react';

export function Cart({ items, activeOrder, total, committedTotal = 0, discount = 0, onSendToKitchen, onPay, onUpdateQuantity, onEditItem, onVoid, onApplyDiscount, onPrintPreCheck, onConfirmDelivery, isProcessing = false }) {
    const grandTotal = total + committedTotal;

    return (
        <div className="bg-white h-full flex flex-col shadow-xl border-l border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Orden Actual</h2>
                <p className="text-gray-400 text-sm mt-1">{items.length} productos nuevos</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                        <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p>No hay productos nuevos</p>
                        {committedTotal > 0 && (
                            <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                Cuenta Abierta: ${committedTotal.toFixed(2)}
                            </p>
                        )}
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            onClick={() => onEditItem(index, item)}
                            className="flex flex-col p-3 bg-gray-50 rounded-xl animate-fade-in group cursor-pointer hover:bg-gray-100 transition-colors border border-transparent hover:border-blue-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(index, item.quantity - 1);
                                        }}
                                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="font-semibold text-gray-900 w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(index, item.quantity + 1);
                                        }}
                                        className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {item.notes && (
                                <div className="mt-2 pl-[3.75rem]">
                                    <p className="text-xs text-gray-500 italic bg-white/50 p-1.5 rounded-md border border-gray-100">
                                        "{item.notes}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                {/* Placeholder Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <button className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Dividir Cuenta
                    </button>
                    <button
                        onClick={onApplyDiscount}
                        className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Descuento
                    </button>
                    <button className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Combos
                    </button>
                </div>

                <div className="space-y-2">
                    {committedTotal > 0 && (
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Acumulado</span>
                            <span>${committedTotal.toFixed(2)}</span>
                        </div>
                    )}
                    {items.length > 0 && (
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Orden Actual</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-red-500 font-medium">
                            <span>Descuento</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-900 font-bold text-lg">Total a Pagar</span>
                        <span className="text-3xl font-bold text-gray-900">${(grandTotal - discount).toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Void Button */}
                    {/* Void Button Removed per user request */}

                    {/* Kitchen vs Cashier Workflow */}
                    {activeOrder.type === 'delivery' ? (
                        <button
                            onClick={onConfirmDelivery} // Use onConfirmDelivery for "One Click" flow
                            disabled={items.length === 0 && committedTotal === 0 || isProcessing}
                            className={`col-span-2 py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2
                                ${items.length === 0 && committedTotal === 0
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow-green-600/30'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <span>Pagar y Mandar a Cocina</span>
                            )}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onSendToKitchen}
                                disabled={items.length === 0}
                                className={`py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 
                                    ${items.length === 0
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-blue-500 hover:bg-blue-600 active:scale-95 hover:shadow-blue-500/30'
                                    }`}
                            >
                                Enviar a Cocina
                            </button>

                            <button
                                onClick={onPay}
                                disabled={grandTotal === 0}
                                className={`py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200 
                                    ${grandTotal === 0
                                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                        : 'bg-green-500 hover:bg-green-600 active:scale-95 hover:shadow-green-500/30'
                                    }`}
                            >
                                Cerrar Mesa
                            </button>
                        </>
                    )}
                </div>

                {committedTotal > 0 && (
                    <button
                        onClick={onPrintPreCheck}
                        className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        <span>Imprimir Cuenta</span>
                    </button>
                )}
            </div>
        </div>
    );
}
