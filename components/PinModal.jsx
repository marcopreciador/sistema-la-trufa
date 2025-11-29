import React, { useState, useEffect } from 'react';

export function PinModal({ isOpen, onClose, onConfirm, title = 'Ingrese PIN' }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError(false);
        }
    }, [isOpen]);

    const handlePinClick = (digit) => {
        if (pin.length < 4) {
            const newPin = pin + digit;
            setPin(newPin);
            setError(false);

            if (newPin.length === 4) {
                setTimeout(() => {
                    onConfirm(newPin);
                    setPin(''); // Reset for next time or if failed (parent handles error state usually, but we clear here)
                }, 100);
            }
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError(false);
    };

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            const key = e.key;
            if (/^[0-9]$/.test(key)) {
                handlePinClick(key);
            } else if (key === 'Backspace') {
                handleBackspace();
            } else if (key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, pin]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-700 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancelar</span>
                    </button>
                    <div className="text-right">
                        <p className="text-white font-bold text-lg">{title}</p>
                        <p className="text-xs text-gray-400">Autorización Requerida</p>
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
        </div>
    );
}
