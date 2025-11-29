import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import { useUsers } from '../context/UserContext';
import { TicketService } from '../utils/TicketService';

export function CashCutDashboard() {
    const { salesHistory, addCashCut, cashCuts, expenses } = useProducts();
    const { currentUser } = useUsers();

    const [countedCash, setCountedCash] = useState('');
    const [leftInCash, setLeftInCash] = useState('');

    // Calculate Sales Breakdown
    const { cashSales, digitalSales, totalSales, totalTips, cancelledCount, cancelledTotal } = useMemo(() => {
        let cash = 0;
        let digital = 0;
        let tips = 0;
        let cCount = 0;
        let cTotal = 0;

        salesHistory.forEach(sale => {
            const saleDate = new Date(sale.date).toLocaleDateString();
            if (saleDate === new Date().toLocaleDateString()) {
                if (sale.status === 'cancelled') {
                    cCount++;
                    cTotal += sale.total;
                } else {
                    // Active Sales
                    if (sale.paymentMethod === 'Efectivo') {
                        cash += sale.total;
                    } else {
                        digital += sale.total;
                    }
                    // Tips are separate from 'total' (revenue)
                    if (sale.tip) {
                        tips += sale.tip;
                    }
                }
            }
        });

        return {
            cashSales: cash,
            digitalSales: digital,
            totalSales: cash + digital,
            totalTips: tips,
            cancelledCount: cCount,
            cancelledTotal: cTotal
        };
    }, [salesHistory]);

    // Calculate Expenses for Today
    const totalExpenses = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return expenses
            .filter(expense => new Date(expense.date).toLocaleDateString() === today)
            .reduce((sum, expense) => sum + expense.amount, 0);
    }, [expenses]);

    // Expected Cash Formula: Cash Sales - Expenses
    // Digital sales are NOT in the drawer.
    const expectedCash = cashSales - totalExpenses;

    const difference = useMemo(() => {
        const counted = parseFloat(countedCash) || 0;
        return counted - expectedCash;
    }, [countedCash, expectedCash]);

    const toWithdraw = useMemo(() => {
        const counted = parseFloat(countedCash) || 0;
        const left = parseFloat(leftInCash) || 0;
        return Math.max(0, counted - left);
    }, [countedCash, leftInCash]);

    const handlePerformCut = () => {
        const counted = parseFloat(countedCash);
        const left = parseFloat(leftInCash);

        if (isNaN(counted)) {
            alert('Por favor ingresa la cantidad de efectivo contado.');
            return;
        }

        if (isNaN(left)) {
            alert('Por favor ingresa el monto a dejar en caja.');
            return;
        }

        if (window.confirm('¿Estás seguro de realizar el corte de caja?')) {
            const cutData = {
                userName: currentUser.name,
                expected: expectedCash,
                cashSales: cashSales,
                digitalSales: digitalSales,
                totalSales: totalSales,
                expenses: totalExpenses,
                counted: counted,
                difference: difference,
                leftInCash: left,
                toWithdraw: counted - left
            };

            addCashCut(cutData);
            TicketService.generateCashCutTicket({ ...cutData, date: new Date().toISOString() });
            setCountedCash('');
            setLeftInCash('');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Cards - Sales Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Ventas Efectivo</p>
                    <p className="text-2xl font-bold text-green-600">${cashSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Ventas Tarjeta/Digital</p>
                    <p className="text-2xl font-bold text-blue-600">${digitalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Propinas (Tarjeta)</p>
                    <p className="text-2xl font-bold text-purple-600">${totalTips.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Venta Total del Día</p>
                    <p className="text-3xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
                    {cancelledCount > 0 && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                            Notas: Se han cancelado {cancelledCount} ventas por un total de ${cancelledTotal.toFixed(2)}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cut Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Arqueo de Caja (Dinero Físico)</h2>

                    <div className="space-y-6">
                        {/* Calculation Explanation */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                            <div className="flex justify-between text-green-700 font-medium">
                                <span>(+) Efectivo Recibido</span>
                                <span>${cashSales.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-600 font-medium">
                                <span>(-) Gastos del Turno</span>
                                <span>- ${totalExpenses.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-900 font-bold text-lg">
                                <span>(=) ESPERADO EN CAJA</span>
                                <span>${expectedCash.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">
                                    Efectivo Contado (Real)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={countedCash}
                                        onChange={(e) => setCountedCash(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 p-4 text-2xl font-bold text-gray-900 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">
                                    Fondo a Dejar
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={leftInCash}
                                        onChange={(e) => setLeftInCash(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-10 p-4 text-2xl font-bold text-gray-900 bg-white border-2 border-gray-100 rounded-xl focus:border-gray-500 focus:ring-4 focus:ring-gray-500/20 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Difference Alert */}
                        <div className={`p-4 rounded-xl border ${difference === 0 ? 'bg-green-50 border-green-200' :
                            difference > 0 ? 'bg-green-50 border-green-200' :
                                'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex justify-between items-center">
                                <span className={`font-medium ${difference === 0 ? 'text-green-700' :
                                    difference > 0 ? 'text-green-700' :
                                        'text-red-700'
                                    }`}>
                                    {difference === 0 ? 'Cuadra perfecto' :
                                        difference > 0 ? 'Sobrante (Propina/Extra)' :
                                            'Faltante en Caja'}
                                </span>
                                <span className={`text-xl font-bold ${difference === 0 ? 'text-green-700' :
                                    difference > 0 ? 'text-green-700' :
                                        'text-red-700'
                                    }`}>
                                    {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Withdrawal Calculation */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <p className="text-sm text-blue-600 font-bold uppercase tracking-wide mb-1">Efectivo a Retirar</p>
                            <p className="text-4xl font-black text-blue-900">
                                ${toWithdraw.toFixed(2)}
                            </p>
                            <p className="text-xs text-blue-400 mt-2">
                                (Contado - Fondo)
                            </p>
                        </div>

                        <button
                            onClick={handlePerformCut}
                            className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-xl hover:bg-black shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                            Realizar Corte e Imprimir
                        </button>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Historial de Cortes</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Fecha</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Usuario</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs text-right">Retirado</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs text-right">Diferencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cashCuts.slice(0, 10).map((cut) => (
                                    <tr key={cut.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {new Date(cut.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(cut.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cut.userName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">
                                            ${(cut.toWithdraw || 0).toFixed(2)}
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-bold text-right ${cut.difference === 0 ? 'text-green-600' :
                                            cut.difference > 0 ? 'text-green-600' :
                                                'text-red-600'
                                            }`}>
                                            {cut.difference > 0 ? '+' : ''}{cut.difference.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {cashCuts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm">
                                            No hay cortes registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
