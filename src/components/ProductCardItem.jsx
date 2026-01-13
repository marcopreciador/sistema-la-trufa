import React from 'react';

export function ProductCardItem({ product, onAdd }) {
    return (
        <div
            onClick={() => onAdd(product)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group active:scale-95 border border-gray-100"
        >
            <div className="h-48 w-full overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-500 font-medium">${product.price.toFixed(2)}</p>
            </div>
        </div>
    );
}
