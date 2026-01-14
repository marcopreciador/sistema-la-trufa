import React from 'react';

export function ConnectionStatus({ isConnected }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-white px-3 py-2 rounded-full shadow-lg border border-gray-100">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                {isConnected ? 'Sincronizado' : 'Desconectado'}
            </span>
        </div>
    );
}
