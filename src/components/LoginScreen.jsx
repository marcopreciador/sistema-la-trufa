import React, { useState, useEffect } from 'react';
import { useUsers } from '../context/UserContext';

export function LoginScreen() {
    const { users, login } = useUsers();
    const [selectedUser, setSelectedUser] = useState(null);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setPin('');
        setError(false);
    };

    const handlePinClick = (digit) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            setError(false);

            // Auto-submit on 4th digit
            if (newPin.length === 4) {
                setTimeout(() => handleLogin(newPin), 100);
            }
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleLogin = (inputPin) => {
        const success = login(selectedUser.id, inputPin);
        if (!success) {
            setError(true);
            setPin('');
        }
    };

    const handleBack = () => {
        setSelectedUser(null);
        setPin('');
        setError(false);
    };

    // Keyboard Support
    useEffect(() => {
        if (!selectedUser) return;

        const handleKeyDown = (e) => {
            const key = e.key;

            if (/^[0-9]$/.test(key)) {
                handlePinClick(key);
            } else if (key === 'Backspace') {
                handleBackspace();
            } else if (key === 'Enter') {
                if (pin.length === 4) {
                    handleLogin(pin);
                }
            } else if (key === 'Escape') {
                handleBack();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedUser, pin]); // Re-bind when pin changes to capture current state if needed, though functional updates are safer.

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2">La Trufa</h1>
                    <p className="text-gray-400">Punto de Venta</p>
                </div>

                {!selectedUser ? (
                    /* User Selection */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                        {users.map(user => (
                            <button
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-2xl p-6 flex flex-col items-center transition-all transform hover:scale-105 group"
                            >
                                <div className="w-20 h-20 rounded-full bg-gray-700 group-hover:bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-4 transition-colors">
                                    {user.name.charAt(0)}
                                </div>
                                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                                <p className="text-sm text-gray-400">{user.role}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* PIN Pad */
                    <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-700">
                        <div className="flex justify-between items-center mb-8">
                            <button
                                onClick={handleBack}
                                className="text-gray-400 hover:text-white flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Volver (Esc)</span>
                            </button>
                            <div className="text-right">
                                <p className="text-white font-bold text-lg">{selectedUser.name}</p>
                                <p className="text-xs text-gray-400">Ingresa tu PIN</p>
                            </div>
                        </div>

                        {/* PIN Display */}
                        <div className="flex justify-center space-x-4 mb-8">
                            {[0, 1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full transition-all ${i < pin.length
                                            ? error ? 'bg-red-500' : 'bg-blue-500'
                                            : 'bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="text-red-500 text-center text-sm mb-4 animate-pulse">PIN Incorrecto</p>
                        )}

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePinClick(num.toString())}
                                    className="h-16 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold transition-colors active:scale-95"
                                >
                                    {num}
                                </button>
                            ))}
                            <div className="col-span-1"></div>
                            <button
                                onClick={() => handlePinClick('0')}
                                className="h-16 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold transition-colors active:scale-95"
                            >
                                0
                            </button>
                            <button
                                onClick={handleBackspace}
                                className="h-16 rounded-xl bg-gray-700 hover:bg-gray-600 text-red-400 flex items-center justify-center transition-colors active:scale-95"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
