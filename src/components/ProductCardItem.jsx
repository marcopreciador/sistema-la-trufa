import React from 'react';

export function ProductCardItem({ product, onAdd, onInfo }) {
    return (
        <div
            onClick={() => onAdd(product)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group active:scale-95 border border-gray-100"
        >

            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onInfo(product);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-blue-600 rounded-full shadow-sm backdrop-blur-sm transition-colors z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-500 font-medium">${product.price.toFixed(2)}</p>
            </div>
        </div >
    );
}
