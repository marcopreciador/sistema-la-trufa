import React, { useState, useEffect } from 'react';

export function TableCard({ table, onClick }) {
    const [elapsed, setElapsed] = useState('00:00:00');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        if (table.status !== 'occupied' || !table.startTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(table.startTime);
            const diff = Math.floor((now - start) / 1000);

            const h = Math.floor(diff / 3600).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');

            setElapsed(`${h}:${m}:${s}`);
            setIsLate(diff > 20 * 60); // 20 minutes
        }, 1000);

        return () => clearInterval(interval);
    }, [table.status, table.startTime]);

    const currentTotal = table.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const committedTotal = (table.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = currentTotal + committedTotal;

    const itemCount = table.items.length + (table.committedItems || []).length;

    // Determine styles based on status and time
    let cardStyle = 'bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md';
    let titleColor = 'text-gray-700';
    let statusBadge = null;

    if (table.mergedWith) {
        cardStyle = 'bg-blue-50/50 border-blue-200 border-dashed shadow-none opacity-90';
        titleColor = 'text-blue-900';
        statusBadge = (
            <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                🔗 Unida con Mesa {table.mergedWith}
            </span>
        );
    } else if (table.status === 'occupied') {
        if (isLate) {
            cardStyle = 'bg-orange-50 border-orange-200 shadow-orange-100 hover:shadow-orange-200';
            titleColor = 'text-orange-900';
            statusBadge = (
                <span className="flex items-center text-xs font-mono font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full animate-pulse">
                    ⏱️ {elapsed}
                </span>
            );
        } else {
            cardStyle = 'bg-blue-50 border-blue-100 shadow-blue-100 hover:shadow-blue-200';
            titleColor = 'text-blue-900';
            statusBadge = (
                <span className="flex items-center text-xs font-mono font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    ⏱️ {elapsed}
                </span>
            );
        }
    } else if (table.status === 'ordering') {
        cardStyle = 'bg-yellow-50 border-yellow-200 shadow-yellow-100 hover:shadow-yellow-200';
        titleColor = 'text-yellow-900';
        statusBadge = (
            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                Tomando Orden...
            </span>
        );
    }

    return (
        <div
            onClick={() => onClick(table)}
            className={`relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer h-48 flex flex-col justify-between ${cardStyle}`}
        >
            <div className="flex justify-between items-start">
                <h3 className={`text-xl font-bold ${titleColor}`}>
                    {table.name}
                </h3>
                {statusBadge}
            </div>

            {(table.status === 'occupied' || table.status === 'ordering') && !table.mergedWith ? (
                <div>
                    <p className={`text-sm mb-1 ${isLate ? 'text-orange-700' : 'text-gray-500'}`}>
                        {itemCount} productos
                    </p>
                    <p className={`text-3xl font-bold ${isLate ? 'text-orange-900' : 'text-gray-900'}`}>
                        ${total.toFixed(2)}
                    </p>
                </div>
            ) : table.mergedWith ? (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-sm text-blue-500 font-medium">Ver cuenta maestra</p>
                </div>
            ) : (
                <div className="flex items-center justify-center flex-1 opacity-20">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
            )}

            <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-2xl 
        ${table.mergedWith
                    ? 'bg-blue-300'
                    : table.status === 'occupied'
                        ? (isLate ? 'bg-orange-500' : 'bg-blue-500')
                        : (table.status === 'ordering' ? 'bg-yellow-400' : 'bg-transparent')
                }`}
            />
        </div>
    );
}
