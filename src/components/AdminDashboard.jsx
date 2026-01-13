import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { useUsers } from '../context/UserContext';
import { ProductFormModal } from './ProductFormModal';
import { ReportsDashboard } from './ReportsDashboard';
import { CashCutDashboard } from './CashCutDashboard';

export function AdminDashboard({ onClose }) {
    const { products, addProduct, updateProduct, deleteProduct, resetToDefault, expenses, addExpense, deleteExpense, inventory, addIngredient, deleteIngredient } = useProducts();
    const { users, addUser, deleteUser, currentUser } = useUsers();

    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reports' | 'users' | 'cash-cut' | 'expenses' | 'inventory'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // User Form State
    const [newUser, setNewUser] = useState({ name: '', role: 'Mesero', pin: '' });

    // Expense Form State
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'Insumos' });

    // Inventory Form State
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'Pieza', stock: '' });

    // Filter expenses for today
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const todayExpenses = safeExpenses.filter(e =>
        new Date(e.date).toLocaleDateString() === new Date().toLocaleDateString()
    );

    // Extract unique categories from products
    const categories = [...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            deleteProduct(id);
        }
    };

    const handleSave = (productData) => {
        if (editingProduct) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        if (newUser.name.trim() && newUser.pin.length === 4) {
            addUser(newUser);
            setNewUser({ name: '', role: 'Mesero', pin: '' });
        } else {
            alert('Por favor ingresa un nombre y un PIN de 4 dígitos.');
        }
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount) {
            alert('Por favor completa todos los campos');
            return;
        }

        addExpense({
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            category: newExpense.category,
            userName: 'Admin'
        });
        setNewExpense({ description: '', amount: '', category: 'Insumos' });
    };

    const handleAddIngredient = (e) => {
        e.preventDefault();
        if (!newIngredient.name || !newIngredient.stock) {
            alert('Por favor completa todos los campos');
            return;
        }

        addIngredient({
            name: newIngredient.name,
            unit: newIngredient.unit,
            stock: parseFloat(newIngredient.stock)
        });
        setNewIngredient({ name: '', unit: 'Pieza', stock: '' });
    };

    // Backup & Restore Logic
    const handleExportData = () => {
        const data = {};
        // Collect all la-trufa keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('la-trufa-')) {
                data[key] = JSON.parse(localStorage.getItem(key));
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Respaldo_LaTrufa_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (window.confirm('ADVERTENCIA: Esta acción BORRARÁ todos los datos actuales y los reemplazará con los del archivo de respaldo. ¿Estás seguro de continuar?')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Clear current data
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith('la-trufa-')) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));

                    // Restore data
                    Object.keys(data).forEach(key => {
                        localStorage.setItem(key, JSON.stringify(data[key]));
                    });

                    alert('Restauración completada con éxito. La página se recargará.');
                    window.location.reload();
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Error al leer el archivo de respaldo. Asegúrate de que sea un archivo JSON válido.');
                }
            };
            reader.readAsText(file);
        }
        // Reset input
        event.target.value = '';
    };

    const isAdmin = currentUser?.role === 'Admin';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-sm text-gray-500">Gestión del Negocio</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Menú
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Reportes
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Usuarios
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setActiveTab('cash-cut')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'cash-cut' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Corte de Caja
                            </button>
                            <button
                                onClick={() => setActiveTab('expenses')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Gastos
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Inventario
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                Configuración
                            </button>
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    {activeTab === 'products' && isAdmin && (
                        <>
                            <button
                                onClick={resetToDefault}
                                className="text-sm text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Restaurar Original
                            </button>
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setIsModalOpen(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center space-x-2"
                            >
                                <span>+ Nuevo Producto</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'reports' ? (
                        <ReportsDashboard />
                    ) : activeTab === 'cash-cut' ? (
                        <CashCutDashboard />
                    ) : activeTab === 'settings' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Backup Section */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Copia de Seguridad</h3>
                                        <p className="text-sm text-gray-500">Exportar datos</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Descarga un archivo con toda la información de tu sistema (Ventas, Productos, Inventario, Usuarios, etc.) para guardarlo en tu computadora.
                                </p>
                                <button
                                    onClick={handleExportData}
                                    className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <span>Descargar Respaldo (.json)</span>
                                </button>
                            </div>

                            {/* Restore Section */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Restaurar Sistema</h3>
                                        <p className="text-sm text-gray-500">Importar datos</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    Sube un archivo de respaldo previamente descargado para recuperar tu información.
                                    <br />
                                    <span className="text-red-500 font-bold text-sm">⚠️ ADVERTENCIA: Esto borrará los datos actuales.</span>
                                </p>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImportData}
                                        className="hidden"
                                        id="restore-file-input"
                                    />
                                    <label
                                        htmlFor="restore-file-input"
                                        className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-2"
                                    >
                                        <span>Seleccionar Archivo de Respaldo</span>
                                    </label>
                                </div>
                            </div>

                            {/* Logo Personalization Section */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Personalización</h3>
                                        <p className="text-sm text-gray-500">Logo del Ticket</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <p className="text-gray-600 mb-4">
                                            Sube el logo de tu restaurante para que aparezca en el encabezado de los tickets impresos.
                                            Se recomienda una imagen en blanco y negro o con alto contraste.
                                        </p>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            localStorage.setItem('la-trufa-logo', reader.result);
                                                            // Force re-render or alert
                                                            alert('Logo actualizado correctamente');
                                                            window.location.reload(); // Simple way to refresh state if needed, or just let React handle it if we had state
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-600/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center space-x-2"
                                            >
                                                <span>Subir Logo</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="w-48 h-48 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                        {localStorage.getItem('la-trufa-logo') ? (
                                            <>
                                                <img
                                                    src={localStorage.getItem('la-trufa-logo')}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-contain p-2"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (confirm('¿Eliminar logo?')) {
                                                            localStorage.removeItem('la-trufa-logo');
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    title="Eliminar Logo"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm text-center px-4">Sin Logo</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Table Configuration Section */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 md:col-span-2">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Configuración de Mesas</h3>
                                        <p className="text-sm text-gray-500">Capacidad del Salón</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-end gap-6">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Mesas en el Salón</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            defaultValue={localStorage.getItem('la-trufa-table-count') || 10}
                                            id="table-count-input"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-lg"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Si reduces la cantidad, las mesas sobrantes se ocultarán (incluso si están ocupadas).
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const input = document.getElementById('table-count-input');
                                            const count = parseInt(input.value);
                                            if (count > 0) {
                                                localStorage.setItem('la-trufa-table-count', count);
                                                alert('Configuración guardada. La página se recargará para aplicar los cambios.');
                                                window.location.reload();
                                            } else {
                                                alert('Por favor ingresa un número válido mayor a 0.');
                                            }
                                        }}
                                        className="w-full md:w-auto py-3 px-8 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'expenses' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Expenses List */}
                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Gastos del Día</h3>
                                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Hora</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Descripción</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Categoría</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Monto</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {todayExpenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 text-sm text-gray-500">
                                                    {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{expense.description}</td>
                                                <td className="px-6 py-3">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-bold text-gray-900 text-right">
                                                    ${expense.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => deleteExpense(expense.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {todayExpenses.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                                    No hay gastos registrados hoy
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Create Expense Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Gasto</h3>
                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Compra de Hielo"
                                            value={newExpense.description}
                                            onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={newExpense.amount}
                                            onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                        <select
                                            value={newExpense.category}
                                            onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="Insumos">Insumos</option>
                                            <option value="Servicios">Servicios</option>
                                            <option value="Sueldos">Sueldos</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black shadow-lg transition-all"
                                    >
                                        Registrar Gasto
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : activeTab === 'inventory' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Inventory List */}
                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Inventario de Insumos</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Insumo</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Unidad</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Stock Actual</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {inventory.map((item) => (
                                            <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.stock < 5 ? 'bg-red-50' : ''}`}>
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-3 text-gray-600">{item.unit}</td>
                                                <td className={`px-6 py-3 font-bold text-right ${item.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {item.stock}
                                                    {item.stock < 5 && (
                                                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Bajo</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => deleteIngredient(item.id)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {inventory.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                                    No hay insumos registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Create Ingredient Form */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo Insumo</h3>
                                <form onSubmit={handleAddIngredient} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Insumo</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ej. Carne Arrachera"
                                            value={newIngredient.name}
                                            onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                                        <select
                                            value={newIngredient.unit}
                                            onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="Pieza">Pieza</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Litro">Litro</option>
                                            <option value="Paquete">Paquete</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            placeholder="0"
                                            value={newIngredient.stock}
                                            onChange={e => setNewIngredient({ ...newIngredient, stock: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                                    >
                                        Registrar Insumo
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : activeTab === 'users' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* User List */}
                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900">Equipo de Trabajo</h3>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Nombre</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Rol</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => deleteUser(user.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Create User Form - Admin Only */}
                            {isAdmin && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Nuevo Usuario</h3>
                                    <form onSubmit={handleCreateUser} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                required
                                                value={newUser.name}
                                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                            <select
                                                value={newUser.role}
                                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="Mesero">Mesero</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 dígitos)</label>
                                            <input
                                                type="password"
                                                required
                                                maxLength="4"
                                                pattern="\d{4}"
                                                value={newUser.pin}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 4) setNewUser({ ...newUser, pin: val });
                                                }}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none tracking-widest"
                                                placeholder="****"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
                                        >
                                            Crear Usuario
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o categoría..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full max-w-md p-3 pl-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                                />
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Producto</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Categoría</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Precio</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        />
                                                        <span className="font-medium text-gray-900">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">
                                                    ${product.price.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {isAdmin && (
                                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                Borrar
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredProducts.length === 0 && (
                                    <div className="p-12 text-center text-gray-400">
                                        No se encontraron productos
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={editingProduct}
                categories={categories}
            />
        </div>
    );
}
