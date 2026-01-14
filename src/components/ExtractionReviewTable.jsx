import React from 'react';

export function ExtractionReviewTable({ items, onUpdateItem, onRemoveItem, inventory }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SAT / Unidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => {
                        const existingItem = inventory?.find(i => i.name.toLowerCase() === item.name.toLowerCase());
                        const lastCost = existingItem ? existingItem.lastCost : 0;
                        const isPriceIncreased = lastCost > 0 && item.unitPrice > lastCost;
                        const priceDiff = item.unitPrice - lastCost;

                        return (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.matchType === 'CODE_MATCH' && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center w-fit">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            Código
                                        </span>
                                    )}
                                    {item.matchType === 'NAME_MATCH' && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center w-fit">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Nombre
                                        </span>
                                    )}
                                    {item.matchType === 'NEW' && (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full flex items-center w-fit">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            Nuevo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 p-0"
                                        />
                                        {item.matchType !== 'NEW' && item.originalName !== item.name && (
                                            <span className="text-xs text-gray-400">PDF: {item.originalName}</span>
                                        )}
                                        {item.code && <span className="text-xs text-gray-500">Código: {item.code}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-1">
                                        <input
                                            type="text"
                                            placeholder="SAT Code"
                                            value={item.satCode || ''}
                                            onChange={(e) => onUpdateItem(index, 'satCode', e.target.value)}
                                            className="w-24 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-600"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unidad"
                                            value={item.unit || ''}
                                            onChange={(e) => onUpdateItem(index, 'unit', e.target.value)}
                                            className="w-24 bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-600"
                                        />
                                    </div>
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
                                            className={`w-24 pl-6 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 ${isPriceIncreased
                                                ? 'bg-red-50 border-red-300 text-red-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                        />
                                        {isPriceIncreased && (
                                            <div className="absolute -top-3 -right-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full border border-red-200 flex items-center shadow-sm">
                                                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                                +${priceDiff.toFixed(2)}
                                            </div>
                                        )}
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
