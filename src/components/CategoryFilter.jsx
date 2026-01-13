import React from 'react';

export function CategoryFilter({ categories, activeCategory, onSelect }) {
    return (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
            ${activeCategory === category
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
