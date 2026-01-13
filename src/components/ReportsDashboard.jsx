import React, { useMemo, useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useSales } from '../context/SalesContext';

export function ReportsDashboard() {
    const { expenses, products } = useProducts();
    const { sales: salesHistory, cancelSale } = useSales();

    // State for Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [folioSearch, setFolioSearch] = useState('');

    const stats = useMemo(() => {
        // Normalize selected date to local date string for comparison if needed, 
        // but comparing YYYY-MM-DD from ISO is safer if stored as ISO.
        // sale.date is ISO.

        // Filter out cancelled sales for calculations
        const validSales = salesHistory.filter(sale => sale.status !== 'cancelled');

        const todaysSales = validSales.filter(sale => {
            // Convert sale date to YYYY-MM-DD in local time
            const saleDate = new Date(sale.date);
            const saleDateStr = saleDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            // Wait, en-CA gives YYYY-MM-DD. 
            // selectedDate from input is YYYY-MM-DD.
            // Let's ensure consistency.
            // Actually, let's just use string comparison on the date part if timezone isn't a huge issue.
            // But new Date(sale.date) uses browser timezone.
            // input type="date" is just a date.
            // Let's match them.
            return saleDateStr === selectedDate;
        });

        const totalSales = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
        const ticketCount = todaysSales.length;
        const averageTicket = ticketCount > 0 ? totalSales / ticketCount : 0;

        // Calculate Expenses for Selected Date
        const totalExpenses = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date).toLocaleDateString('en-CA');
                return expenseDate === selectedDate;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

        const netProfit = totalSales - totalExpenses;

        // Product Performance (All Products)
        const productCounts = {};
        // Initialize with 0 for all existing products
        products.forEach(p => {
            productCounts[p.name] = 0;
        });

        todaysSales.forEach(sale => {
            sale.items.forEach(item => {
                if (productCounts[item.name] !== undefined) {
                    productCounts[item.name] += item.quantity;
                } else {
                    productCounts[item.name] = item.quantity;
                }
            });
        });

        const sortedProducts = Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const topProducts = sortedProducts.slice(0, 5).filter(p => p.count > 0);
        const bottomProducts = [...sortedProducts].reverse().slice(0, 5);

        const bestSeller = topProducts.length > 0 ? topProducts[0].name : 'N/A';

        // Peak Hours Analysis
        const hoursDistribution = Array(15).fill(0); // 8am to 10pm
        const startHour = 8;

        todaysSales.forEach(sale => {
            const hour = new Date(sale.date).getHours();
            if (hour >= startHour && hour <= 22) {
                hoursDistribution[hour - startHour] += sale.total;
            }
        });

        const maxHourlySales = Math.max(...hoursDistribution, 1);
        const peakHoursData = hoursDistribution.map((total, index) => ({
            hour: `${startHour + index}:00`,
            total,
            percentage: (total / maxHourlySales) * 100
        }));

        // Category Sales Analysis
        const categorySales = {};
        todaysSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.name === item.name);
                const category = product ? product.category : 'Otros';

                if (!categorySales[category]) categorySales[category] = 0;
                categorySales[category] += (item.price * item.quantity);
            });
        });

        const sortedCategories = Object.entries(categorySales)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        const maxCategorySales = Math.max(...sortedCategories.map(c => c.total), 1);

        return {
            totalSales,
            ticketCount,
            averageTicket,
            totalExpenses,
            netProfit,
            topProducts,
            bottomProducts,
            bestSeller,
            peakHoursData,
            sortedCategories,
            maxCategorySales,
            recentSales: todaysSales // Only valid sales for charts/KPIs
        };
    }, [salesHistory, expenses, products, selectedDate]);

    // Filtered History for Table (Includes Cancelled, Filtered by Date and Search)
    const filteredHistory = useMemo(() => {
        return salesHistory.filter(sale => {
            const saleDate = new Date(sale.date).toLocaleDateString('en-CA');
            const matchesDate = saleDate === selectedDate;

            const folio = (sale.sequence || sale.orderNumber || '').toString();
            const matchesSearch = folioSearch === '' || folio.includes(folioSearch);

            return matchesDate && matchesSearch;
        });
    }, [salesHistory, selectedDate, folioSearch]);

    const handleCancelSale = (saleId) => {
        const pin = window.prompt('Ingrese PIN de Administrador para cancelar venta:');
        if (pin === '1234') {
            if (window.confirm('¿Seguro que desea cancelar esta venta? Esta acción afectará el corte de caja.')) {
                cancelSale(saleId);
            }
        } else if (pin !== null) {
            alert('PIN Incorrecto');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Controls */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Reporte Diario</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-600">Fecha:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 1. KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Ventas Totales</p>
                            <h3 className="text-3xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Ticket Promedio</p>
                            <h3 className="text-3xl font-bold text-gray-900">${stats.averageTicket.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Producto Estrella</p>
                            <h3 className="text-xl font-bold text-gray-900 truncate max-w-[200px]" title={stats.bestSeller}>
                                {stats.bestSeller}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Fila de Análisis de Producto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top 5 Más Vendidos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">🌟</span> Top 5 Más Vendidos
                    </h3>
                    <div className="space-y-4">
                        {stats.topProducts.length === 0 ? (
                            <p className="text-gray-400 text-sm">No hay datos suficientes</p>
                        ) : (
                            stats.topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-gray-700 font-medium">{product.name}</span>
                                    </div>
                                    <span className="text-gray-900 font-bold">{product.count} <span className="text-xs text-gray-400 font-normal">unid.</span></span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top 5 MENOS Vendidos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="mr-2">📉</span> Top 5 Menos Vendidos (Estancados)
                    </h3>
                    <div className="space-y-4">
                        {stats.bottomProducts.length === 0 ? (
                            <p className="text-gray-400 text-sm">No hay datos suficientes</p>
                        ) : (
                            stats.bottomProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-red-100 text-red-700">
                                            !
                                        </span>
                                        <span className="text-gray-700 font-medium">{product.name}</span>
                                    </div>
                                    <span className="text-red-600 font-bold">{product.count} <span className="text-xs text-red-400 font-normal">unid.</span></span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Fila de Gráficos Visuales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Horas Pico */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Horas Pico (Ventas)</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {stats.peakHoursData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                        ${data.total.toFixed(0)}
                                    </div>
                                    {/* Bar */}
                                    <div
                                        style={{ height: `${Math.max(data.percentage, 5)}%` }} // Min height 5% for visibility
                                        className={`w-full max-w-[20px] rounded-t-lg transition-all duration-500 ${data.percentage > 80 ? 'bg-blue-600' :
                                            data.percentage > 40 ? 'bg-blue-400' : 'bg-blue-200'
                                            }`}
                                    ></div>
                                </div>
                                {/* Label (Show only even hours to avoid clutter) */}
                                <span className="text-[10px] text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                                    {index % 2 === 0 ? data.hour : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ventas por Categoría */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Ventas por Categoría</h3>
                    <div className="space-y-4">
                        {stats.sortedCategories.length === 0 ? (
                            <p className="text-gray-400 text-sm">No hay ventas hoy</p>
                        ) : (
                            stats.sortedCategories.map((cat, index) => (
                                <div key={cat.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        <span className="font-bold text-gray-900">${cat.total.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            style={{ width: `${(cat.total / stats.maxCategorySales) * 100}%` }}
                                            className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-purple-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                    index === 2 ? 'bg-green-500' : 'bg-gray-400'
                                                }`}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Historial Detallado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Historial Detallado de Ventas</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por Folio..."
                            value={folioSearch}
                            onChange={(e) => setFolioSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Folio</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Hora</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Mesa</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Vendedor</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs">Método</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs text-right">Total</th>
                                <th className="px-4 py-3 font-semibold text-gray-600 text-xs text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredHistory.map((sale) => (
                                <tr key={sale.id} className={`hover:bg-gray-50 transition-colors ${sale.status === 'cancelled' ? 'opacity-50 bg-gray-50' : ''}`}>
                                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                                        #{sale.sequence || sale.orderNumber || 'S/N'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                        {sale.tableName || sale.mesa || 'General'}
                                        {sale.status === 'cancelled' && <span className="ml-2 text-xs text-red-500 font-bold">(CANCELADO)</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{sale.userName || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{sale.paymentMethod || 'Efectivo'}</td>
                                    <td className={`px-4 py-3 text-sm font-bold text-right ${sale.status === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        ${sale.total.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {sale.status === 'cancelled' ? (
                                            <span className="text-xs font-bold text-red-500">CANCELADO</span>
                                        ) : (
                                            <button
                                                onClick={() => handleCancelSale(sale.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredHistory.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-400 text-sm">
                                        No hay ventas registradas para esta fecha/búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
