import React from 'react';

export function ProductInfoModal({ product, isOpen, onClose }) {
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                    <p className="text-xl font-semibold text-blue-600 mb-4">${product.price.toFixed(2)}</p>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Descripción</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {product.description || 'Sin descripción disponible.'}
                            </p>
                        </div>

                        {product.ingredients && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Ingredientes / Detalles</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {product.ingredients}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
