import React from 'react';
import { useUsers } from '../context/UserContext';

export function UserSelectorModal({ isOpen, onClose }) {
    const { users, currentUser, switchUser } = useUsers();

    if (!isOpen) return null;

    const handleSelect = (userId) => {
        switchUser(userId);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Cambiar Usuario</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => handleSelect(user.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${currentUser.id === user.id
                                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${currentUser.id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className={`font-bold ${currentUser.id === user.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {user.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                            </div>
                            {currentUser.id === user.id && (
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
