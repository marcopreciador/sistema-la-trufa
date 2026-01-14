import React from 'react';

export function ExtractionReviewTable({ items, onUpdateItem, onRemoveItem }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                        // Logic to detect price increase would go here if we had historical data passed in
                        // For now, we'll just render the table
                        return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateItem(index, 'quantity', parseFloat(e.target.value))}
                                        className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="relative">
                                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => onUpdateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                            className="w-24 pl-6 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onRemoveItem(index)}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
