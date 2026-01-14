import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { ExtractionReviewTable } from './ExtractionReviewTable';
import { processInvoiceImage } from '../services/ocrService';

export function InventoryView({ onBack }) {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'history', 'stock'
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState(null);

    const handleFileSelect = async (file) => {
        setIsProcessing(true);
        try {
            const result = await processInvoiceImage(file);
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
        // Here we would call the context function to update inventory
        alert("¡Inventario actualizado con éxito! (Simulación)");
        setExtractedData(null);
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
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto">
                {!extractedData ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
            </div>
        </div>
    );
}
