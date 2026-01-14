import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { ExtractionReviewTable } from './ExtractionReviewTable';
import { processInvoiceImage } from '../services/ocrService';
import { useProducts } from '../context/ProductContext';

export function InventoryView({ onBack }) {
    const { recordPurchase, inventory, purchases } = useProducts();
    const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'history', 'stock'
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState(null);

    const handleFileSelect = async (file) => {
        setIsProcessing(true);
        try {
            const result = await processInvoiceImage(file, inventory);
            setExtractedData(result);
        } catch (error) {
            console.error("Error processing invoice:", error);
            alert("Error al procesar la factura. Intenta de nuevo.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateItem = (index, field, value) => {
        const newItems = [...extractedData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate total for item
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }

        // Recalculate invoice total
        const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);

        setExtractedData({
            ...extractedData,
            items: newItems,
            totalAmount: newTotal
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = extractedData.items.filter((_, i) => i !== index);
        const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
        setExtractedData({
            ...extractedData,
            items: newItems,
            totalAmount: newTotal
        });
    };

    const handleConfirmInventory = () => {
        if (!extractedData) return;

        recordPurchase(extractedData);
        alert("¡Inventario actualizado con éxito!");
        setExtractedData(null);
        setActiveTab('stock'); // Redirect to stock view to see changes
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
                        <p className="text-gray-500">Carga facturas y actualiza tu stock con IA</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload'
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Cargar Factura
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Historial de Compras
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'stock'
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Stock Actual
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto">
                {activeTab === 'upload' && (
                    <>
                        {!extractedData ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Cargar Nueva Factura</h2>
                                <FileUploader onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Revisión de Factura</h2>
                                            <p className="text-sm text-gray-500">Proveedor: {extractedData.merchant} | Fecha: {extractedData.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Factura</p>
                                            <p className="text-2xl font-bold text-blue-600">${extractedData.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <ExtractionReviewTable
                                        items={extractedData.items}
                                        onUpdateItem={handleUpdateItem}
                                        onRemoveItem={handleRemoveItem}
                                        inventory={inventory}
                                    />

                                    <div className="mt-8 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setExtractedData(null)}
                                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleConfirmInventory}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-colors"
                                        >
                                            Confirmar y Actualizar Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Historial de Compras</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {purchases.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No hay compras registradas aún.
                                            </td>
                                        </tr>
                                    ) : (
                                        purchases.map((purchase) => (
                                            <tr key={purchase.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(purchase.date).toLocaleDateString()} {new Date(purchase.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {purchase.merchant || 'Desconocido'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {purchase.items.length} items
                                                    <span className="text-xs text-gray-400 block truncate max-w-xs">
                                                        {purchase.items.map(i => i.name).join(', ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    ${purchase.totalAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Stock de Insumos</h2>
                            <span className="text-sm text-gray-500">{inventory.length} items en inventario</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Último Costo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inventory.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                El inventario está vacío.
                                            </td>
                                        </tr>
                                    ) : (
                                        inventory.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.stock <= 5 ? 'bg-red-100 text-red-800' :
                                                        item.stock <= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {parseFloat(item.stock).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {item.unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    ${item.lastCost ? parseFloat(item.lastCost).toFixed(2) : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
