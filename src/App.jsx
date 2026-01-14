import React, { useState, useMemo, useEffect } from 'react';
import { ProductProvider, useProducts } from './context/ProductContext';
import { UserProvider, useUsers } from './context/UserContext';
import { SalesProvider, useSales } from './context/SalesContext';
import { ProductCardItem } from './components/ProductCardItem';
import { Cart } from './components/Cart';
import { ProductModal } from './components/ProductModal';
import { CategoryFilter } from './components/CategoryFilter';
import { SearchBar } from './components/SearchBar';
import { TableCard } from './components/TableCard';
import { AdminDashboard } from './components/AdminDashboard';
import { TicketService } from './utils/TicketService';
import { CustomerSelectionModal } from './components/CustomerSelectionModal';
import { CustomerDirectoryModal } from './components/CustomerDirectoryModal';
import { LoginScreen } from './components/LoginScreen';
import { PinModal } from './components/PinModal';
import ErrorBoundary from './components/ErrorBoundary';
import { products as defaultProducts } from './data/products';

const TABS = ['Salón / Mesas', 'Para Llevar'];

// Initialize tables dynamically based on configuration
const getInitialTables = () => {
  const savedCount = localStorage.getItem('la-trufa-table-count');
  const count = savedCount ? parseInt(savedCount, 10) : 10;

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Mesa ${i + 1}`,
    status: 'free', // 'free' | 'ordering' | 'occupied'
    items: [],
    committedItems: [],
    startTime: null,
    mergedWith: null, // ID of the table this table is merged with (master table)
  }));
};

function POSApp() {
  const { products, processSaleInventory, tableDrafts, saveDraft, removeDraft, getNextOrderNumber } = useProducts();
  const { currentUser, logout, users } = useUsers(); // Need users to verify admin PIN
  const { addSale } = useSales();

  // Global State
  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('la-trufa-tables-state');
    return saved ? JSON.parse(saved) : getInitialTables();
  });

  const [deliveryOrders, setDeliveryOrders] = useState(() => {
    const saved = localStorage.getItem('la-trufa-delivery-orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('la-trufa-tables-state', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('la-trufa-delivery-orders', JSON.stringify(deliveryOrders));
  }, [deliveryOrders]);
  const [activeOrderId, setActiveOrderId] = useState(null); // Can be table ID (number) or delivery ID (string)
  const [activeTab, setActiveTab] = useState('Salón / Mesas');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // POS State
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null); // Index of item being edited

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Efectivo');
  const [tipAmount, setTipAmount] = useState(0);

  // Derived State
  const activeOrder = useMemo(() => {
    if (!activeOrderId) return null;
    if (typeof activeOrderId === 'number') {
      return tables.find(t => t.id === activeOrderId);
    } else {
      return deliveryOrders.find(o => o.id === activeOrderId);
    }
  }, [activeOrderId, tables, deliveryOrders]);

  const categories = useMemo(() => {
    const cats = ['Todos', ...new Set(products.map(p => p.category))];
    const preferredOrder = ['Todos', 'Desayunos', 'Entradas', 'Asada y Arrachera', 'Antojitos Mexicanos', 'Guisados', 'Otros', 'Bebidas'];
    return [...new Set([...preferredOrder, ...cats])];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      // Smart Search: Prioritize startsWith
      const query = searchQuery.toLowerCase();
      const aStarts = a.name.toLowerCase().startsWith(query);
      const bStarts = b.name.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchQuery]);

  const currentTotal = activeOrder ? activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const committedTotal = activeOrder ? (activeOrder.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  // Handlers
  // Initialize tables with drafts
  useEffect(() => {
    setTables(prev => prev.map(t => {
      const draftItems = tableDrafts[t.id];
      if (draftItems && draftItems.length > 0 && t.status === 'free') {
        return { ...t, status: 'ordering', items: draftItems };
      }
      return t;
    }));
  }, []);

  const handleTableClick = (table) => {
    if (table.mergedWith) {
      setActiveOrderId(table.mergedWith);
    } else {
      setActiveOrderId(table.id);
      if (table.status !== 'occupied') {
        const draftItems = tableDrafts[table.id];
        if (draftItems && draftItems.length > 0) {
          updateOrder(table.id, { items: draftItems, status: 'ordering' });
        }
      }
    }
  };

  const handleDeliveryOrderClick = (order) => {
    setActiveOrderId(order.id);
  };

  const handleCreateDeliveryOrder = (customer, address) => {
    const newOrder = {
      id: `del-${Date.now()}`,
      name: `Pedido ${customer.name.split(' ')[0]}`,
      type: 'delivery',
      customer: customer || { name: 'Cliente', phone: '', address: '' },
      deliveryAddress: address || '',
      status: 'ordering',
      items: [],
      committedItems: [],
      startTime: new Date().toISOString(),
      discount: 0,
      orderNumber: null,
      mergedWith: null
    };
    setDeliveryOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
  };

  const updateOrder = (orderId, updates) => {
    if (typeof orderId === 'number') {
      setTables(prev => prev.map(t => {
        if (t.id === orderId) {
          return { ...t, ...updates };
        }
        if (t.mergedWith === orderId && updates.status) {
          return { ...t, status: updates.status };
        }
        return t;
      }));
    } else {
      setDeliveryOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    }
  };

  const handleMergeTables = (targetTableId) => {
    if (!activeOrder || typeof activeOrder.id !== 'number') return;

    const sourceTableId = activeOrder.id;
    const targetTable = tables.find(t => t.id === Number(targetTableId));

    if (!targetTable) return;

    setTables(prev => prev.map(t => {
      if (t.id === Number(targetTableId)) {
        return {
          ...t,
          mergedWith: sourceTableId,
          status: activeOrder.status,
          items: [],
          committedItems: []
        };
      }
      return t;
    }));
    setIsMergeModalOpen(false);
  };

  const handleUnmergeTable = () => {
    if (!activeOrder || typeof activeOrder.id !== 'number') return;

    setTables(prev => prev.map(t => {
      if (t.mergedWith === activeOrder.id) {
        return {
          ...t,
          mergedWith: null,
          status: 'free',
          items: [],
          committedItems: []
        };
      }
      return t;
    }));
  };

  const handleEditCartItem = (index, item) => {
    setSelectedProduct(item);
    setEditingItemIndex(index);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product, quantity, notes) => {
    if (!activeOrder) return;

    if (editingItemIndex !== null) {
      const newItems = [...activeOrder.items];
      newItems[editingItemIndex] = { ...newItems[editingItemIndex], quantity, notes };
      updateOrder(activeOrder.id, { items: newItems });
      setEditingItemIndex(null);
    } else {
      const newItems = [...activeOrder.items, { ...product, quantity, notes }];
      updateOrder(activeOrder.id, { items: newItems });
    }

    // Speed UX: Auto-clear search
    setSearchQuery('');

    if (activeOrder.status === 'free' && typeof activeOrder.id === 'number') {
      updateOrder(activeOrder.id, { status: 'ordering' });
    }
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (!activeOrder) return;
    if (newQuantity < 1) {
      const newItems = activeOrder.items.filter((_, i) => i !== index);
      updateOrder(activeOrder.id, { items: newItems });
    } else {
      const newItems = [...activeOrder.items];
      newItems[index] = { ...newItems[index], quantity: newQuantity };
      updateOrder(activeOrder.id, { items: newItems });
    }
  };

  const handleSendToKitchen = () => {
    if (!activeOrder || activeOrder.items.length === 0) return;

    // Generate Order Number if not exists
    let orderNumber = activeOrder.orderNumber;
    if (!orderNumber) {
      orderNumber = getNextOrderNumber();
    }

    const newItems = activeOrder.items;

    // Print to Kitchen (Thermal)
    TicketService.printKitchenTicket(activeOrder, newItems, orderNumber);

    // Update Table State
    const updatedOrder = {
      ...activeOrder,
      status: 'occupied',
      orderNumber: orderNumber,
      items: [], // Clear new items
      committedItems: [...(activeOrder.committedItems || []), ...newItems], // Move to committed
      startTime: activeOrder.startTime || new Date().toISOString()
    };

    if (typeof activeOrder.id === 'number') {
      setTables(prev => prev.map(t => t.id === activeOrder.id ? updatedOrder : t));
    } else {
      setDeliveryOrders(prev => prev.map(o => o.id === activeOrder.id ? updatedOrder : o));
    }

    // Clear Draft
    removeDraft(activeOrder.id);

    setShowSuccessModal(true);
    setLastCompletedOrder({ type: 'kitchen', table: activeOrder.name });
  };

  const handleVoidOrder = () => {
    setIsPinModalOpen(true);
  };

  const confirmVoidOrder = (pin) => {
    if (pin === '1234') {
      TicketService.generateCancellationTicket(activeOrder, currentUser);

      if (typeof activeOrder.id === 'number') {
        removeDraft(activeOrder.id);
        updateOrder(activeOrder.id, {
          status: 'free',
          items: [],
          committedItems: [],
          startTime: null,
          mergedWith: null,
          orderNumber: null
        });
      } else {
        setDeliveryOrders(prev => prev.filter(o => o.id !== activeOrder.id));
      }

      setIsPinModalOpen(false);
      setActiveOrderId(null);
    } else {
      alert('PIN Incorrecto');
    }
  };

  const handlePay = () => {
    if (!activeOrder) return;
    setIsPaymentModalOpen(true);
    setSelectedPaymentMethod('Efectivo');
    setTipAmount(0);
  };

  const confirmPayment = () => {
    if (!activeOrder) return;

    const discount = activeOrder.discount || 0;
    const subtotal = currentTotal + committedTotal;
    const grandTotal = subtotal - discount;

    const allItems = [...(activeOrder.committedItems || []), ...activeOrder.items];

    let finalOrderNumber = activeOrder.orderNumber;
    if (!finalOrderNumber) {
      finalOrderNumber = getNextOrderNumber();
    }
    const orderForTicket = { ...activeOrder, orderNumber: finalOrderNumber };

    try {
      TicketService.printCustomerTicket(orderForTicket, allItems, grandTotal, currentUser, selectedPaymentMethod, discount, parseFloat(tipAmount || 0));
    } catch (error) {
      console.error("Error generating ticket:", error);
      alert("Error al imprimir ticket. La venta se guardará.");
    }

    let originName = '';
    if (activeOrder.type === 'delivery') {
      originName = 'Pedido ' + (activeOrder.customer?.name || 'Mostrador');
    } else {
      originName = activeOrder.name || `Mesa ${activeOrder.id}`;
    }

    const completedOrderData = {
      ...activeOrder,
      items: allItems,
      total: grandTotal,
      orderNumber: finalOrderNumber,
      customer: activeOrder.customer || null
    };

    addSale({
      items: allItems,
      subtotal: subtotal,
      discount: discount,
      total: grandTotal,
      tip: parseFloat(tipAmount || 0),
      customer: activeOrder.customer || null,
      userName: currentUser.name,
      paymentMethod: selectedPaymentMethod,
      orderNumber: finalOrderNumber,
      sequence: finalOrderNumber,
      tableName: originName,
      status: 'completed'
    });

    // Defer cleanup: Show Success Modal
    setLastCompletedOrder(completedOrderData);
    setShowSuccessModal(true);
    setIsPaymentModalOpen(false);
  };

  const handleFinishSale = () => {
    if (!lastCompletedOrder) return;

    const orderId = lastCompletedOrder.id;

    if (typeof orderId === 'number') {
      const mergedTables = tables.filter(t => t.mergedWith === orderId);
      removeDraft(orderId);

      let updatedTables = tables.map(t => t.id === orderId ? {
        ...t,
        status: 'free',
        items: [],
        committedItems: [],
        startTime: null,
        mergedWith: null,
        orderNumber: null,
        discount: 0
      } : t);

      if (mergedTables.length > 0) {
        updatedTables = updatedTables.map(t => {
          if (t.mergedWith === orderId) {
            return {
              ...t,
              status: 'free',
              items: [],
              committedItems: [],
              startTime: null,
              mergedWith: null,
              orderNumber: null,
              discount: 0
            };
          }
          return t;
        });
      }
      setTables(updatedTables);
    } else {
      setDeliveryOrders(prev => prev.filter(o => o.id !== orderId));
    }

    setShowSuccessModal(false);
    setLastCompletedOrder(null);
    setActiveOrderId(null);
  };

  const handleSendWhatsAppFromModal = () => {
    if (!lastCompletedOrder) return;

    const phone = lastCompletedOrder.customer?.phone;
    const allItems = lastCompletedOrder.items || [];
    const messageItems = allItems.map(item => `${item.quantity} x ${item.name}`).join('%0A');
    const grandTotal = lastCompletedOrder.total || 0;
    const message = `Hola ${lastCompletedOrder.customer?.name || ''}, tu pedido %23${lastCompletedOrder.orderNumber} en La Trufa:%0A${messageItems}%0ATotal: $${grandTotal.toFixed(2)}%0A¡Gracias por tu compra!`;

    let url = '';
    if (phone) {
      url = `https://wa.me/521${phone}?text=${message}`;
    } else {
      url = `https://wa.me/?text=${message}`;
    }
    window.open(url, '_blank');
  };

  const processSale = () => {
    if (!activeOrder) return;

    const currentTotal = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const committedTotal = (activeOrder.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = activeOrder.discount || 0;
    const subtotal = currentTotal + committedTotal;
    const grandTotal = subtotal - discount;

    const allItems = [...(activeOrder.committedItems || []), ...activeOrder.items];

    let finalOrderNumber = activeOrder.orderNumber;
    if (!finalOrderNumber) {
      finalOrderNumber = getNextOrderNumber();
    }
    const orderForTicket = { ...activeOrder, orderNumber: finalOrderNumber };

    try {
      TicketService.printCustomerTicket(orderForTicket, allItems, grandTotal, currentUser, selectedPaymentMethod, discount, parseFloat(tipAmount || 0));
    } catch (error) {
      console.error("Error generating ticket:", error);
      alert("Error al imprimir ticket. La venta se guardará.");
    }

    let originName = '';
    if (activeOrder.type === 'delivery') {
      originName = 'Pedido ' + (activeOrder.customer?.name || 'Mostrador');
    } else {
      originName = activeOrder.name || `Mesa ${activeOrder.id}`;
    }

    const completedOrderData = {
      ...activeOrder,
      items: allItems,
      total: grandTotal,
      orderNumber: finalOrderNumber,
      customer: activeOrder.customer || null
    };

    // 1. Add to Sales History (SalesContext)
    addSale({
      items: allItems,
      subtotal: subtotal,
      discount: discount,
      total: grandTotal,
      tip: parseFloat(tipAmount || 0),
      customer: activeOrder.customer || null,
      userName: currentUser.name,
      paymentMethod: selectedPaymentMethod,
      orderNumber: finalOrderNumber,
      sequence: finalOrderNumber,
      tableName: originName,
      status: 'completed'
    });

    // 2. Update Inventory (ProductContext)
    processSaleInventory(allItems);

    // Clear Table/Order
    if (typeof activeOrderId === 'number') {
      setTables(prev => prev.map(t => t.id === activeOrderId ? {
        ...t,
        status: 'free',
        items: [],
        committedItems: [],
        orderNumber: null,
        startTime: null
      } : t));
    } else {
      setDeliveryOrders(prev => prev.filter(o => o.id !== activeOrderId));
    }

    // Defer cleanup: Show Success Modal
    setLastCompletedOrder(completedOrderData);
    setShowSuccessModal(true);
    setIsPaymentModalOpen(false);
  };

  const handleApplyDiscount = (amount) => {
    if (!activeOrder) return;

    let discountValue = 0;
    const total = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
      (activeOrder.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (typeof amount === 'string' && amount.includes('%')) {
      const percentage = parseFloat(amount.replace('%', ''));
      discountValue = (total * percentage) / 100;
    } else {
      discountValue = parseFloat(amount);
    }

    if (isNaN(discountValue)) discountValue = 0;

    updateOrder(activeOrder.id, { discount: discountValue });
  };

  const handlePrintPreCheck = () => {
    if (!activeOrder) return;

    const currentTotal = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const committedTotal = (activeOrder.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = activeOrder.discount || 0;
    const grandTotal = currentTotal + committedTotal - discount;
    const allItems = [...(activeOrder.committedItems || []), ...activeOrder.items];

    TicketService.printCustomerTicket(activeOrder, allItems, grandTotal, currentUser, 'Pendiente', discount, 0, true);
  };

  const handleBackToTables = () => {
    if (activeOrder && typeof activeOrder.id === 'number') {
      if (activeOrder.items.length === 0) {
        removeDraft(activeOrder.id);
        if (activeOrder.status === 'ordering' && (!activeOrder.committedItems || activeOrder.committedItems.length === 0)) {
          updateOrder(activeOrder.id, { status: 'free' });
        }
      } else {
        saveDraft(activeOrder.id, activeOrder.items);
        if (activeOrder.status !== 'occupied') {
          updateOrder(activeOrder.id, { status: 'ordering' });
        }
      }
    }
    setActiveOrderId(null);
  };

  // --- SECURITY GUARD ---
  if (!currentUser) {
    return <LoginScreen />;
  }

  if (isAdminOpen) {
    return <AdminDashboard onClose={() => setIsAdminOpen(false)} />;
  }

  // --- RENDER DASHBOARD ---
  if (!activeOrderId) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">La Trufa</h1>
            <p className="text-gray-500 mt-1">Gestión de Espacios</p>

            <div className="mt-6 flex space-x-1 bg-white p-1 rounded-xl w-fit shadow-sm">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100 group"
              title="Cerrar Sesión / Cambiar Usuario"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{currentUser.name}</p>
                <p className="text-xs text-gray-500 leading-none mt-1 group-hover:text-red-500 transition-colors">
                  Bloquear
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="p-3 bg-white rounded-full shadow-sm hover:shadow-md text-gray-500 hover:text-gray-900 transition-all"
                title="Administración"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {activeTab === 'Salón / Mesas' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                onClick={handleTableClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDirectoryOpen(true)}
                className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold shadow-sm border border-gray-200 transition-all flex items-center space-x-2"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Ver Clientes</span>
              </button>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center space-x-2"
              >
                <span>+ Nuevo Pedido</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleDeliveryOrderClick(order)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{order.name}</h3>
                      <p className="text-sm text-gray-500">{order.customer?.phone || 'Sin teléfono'}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      Delivery
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 line-clamp-2">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {(order.items.length + (order.committedItems || []).length)} productos
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      ${((order.items.reduce((s, i) => s + i.price * i.quantity, 0)) + (order.committedItems || []).reduce((s, i) => s + i.price * i.quantity, 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {deliveryOrders.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p>No hay pedidos activos</p>
                </div>
              )}
            </div>
          </div>
        )}

        <CustomerSelectionModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelect={handleCreateDeliveryOrder}
        />

        <CustomerDirectoryModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
        />
      </div>
    );
  }

  // --- RENDER POS (ACTIVE ORDER) ---
  if (activeOrderId && !activeOrder) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Cargando pedido...</div>;
  }

  const mergedTables = tables.filter(t => t.mergedWith === activeOrder.id);
  const hasMergedTables = mergedTables.length > 0;

  const safeActiveOrder = activeOrder || {
    name: 'Orden',
    items: [],
    committedItems: [],
    status: 'free',
    customer: null,
    orderNumber: null,
    type: 'dine-in'
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Main Content - Menu */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="px-4 md:px-8 pt-4 md:pt-8 pb-4 bg-gray-100 z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToTables}
                className="p-2 hover:bg-white rounded-full transition-colors text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{safeActiveOrder.name}</h1>
                  {safeActiveOrder.orderNumber ? (
                    <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      #{safeActiveOrder.orderNumber}
                    </span>
                  ) : null}
                  {hasMergedTables && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      + {mergedTables.map(t => t.name).join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {safeActiveOrder.type === 'delivery'
                    ? (safeActiveOrder.customer?.name || 'Cliente')
                    : 'Mesa de Servicio'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar platillo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-64 shadow-sm"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Merge Tables Button (Only for Tables) */}
              {safeActiveOrder.type !== 'delivery' && (
                <button
                  onClick={hasMergedTables ? handleUnmergeTable : () => setIsMergeModalOpen(true)}
                  className={`px-4 py-2.5 rounded-xl font-bold shadow-sm border transition-all flex items-center space-x-2 ${hasMergedTables
                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{hasMergedTables ? 'Desvincular' : 'Unir Mesas'}</span>
                </button>
              )}
            </div>
          </div>

          <CategoryFilter
            categories={categories}
            activeCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20">
            {filteredProducts.map(product => (
              <ProductCardItem
                key={product.id}
                product={product}
                onAdd={(p) => {
                  setSelectedProduct(p);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Sidebar - Cart */}
      <aside className="w-full md:w-96 h-auto md:h-full z-20 border-t md:border-t-0 md:border-l border-gray-200 bg-white shadow-xl md:shadow-none">
        <Cart
          items={activeOrder.items}
          activeOrder={activeOrder}
          total={currentTotal}
          committedTotal={committedTotal}
          discount={activeOrder.discount || 0}
          onSendToKitchen={handleSendToKitchen}
          onPay={handlePay}
          onUpdateQuantity={handleUpdateQuantity}
          onEditItem={handleEditCartItem}
          onVoid={currentUser.role === 'Admin' ? handleVoidOrder : undefined}
          onApplyDiscount={handleApplyDiscount}
          onPrintPreCheck={handlePrintPreCheck}
        />
      </aside>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItemIndex(null);
        }}
        onConfirm={handleAddToCart}
        initialQuantity={editingItemIndex !== null ? activeOrder.items[editingItemIndex].quantity : 1}
        initialNotes={editingItemIndex !== null ? activeOrder.items[editingItemIndex].notes : ''}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={confirmVoidOrder}
        title="Autorización Requerida"
        message="Ingresa el PIN de administrador para anular la orden."
      />

      {/* Merge Tables Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Unir Mesas</h2>
              <p className="text-gray-500 text-sm mt-1">Selecciona una mesa para unir con {safeActiveOrder.name}</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {tables
                  .filter(t => t.id !== activeOrder.id && !t.mergedWith && t.status !== 'occupied') // Only show free/ordering tables? Or occupied too? Requirement says "Si uno la Mesa 1 con la Mesa 2". Usually implies merging bills.
                  .map(table => (
                    <button
                      key={table.id}
                      onClick={() => handleMergeTables(table.id)}
                      className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                    >
                      <span className="font-bold text-gray-700 group-hover:text-blue-700">{table.name}</span>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${table.status === 'free' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        <span className="text-xs text-gray-500 capitalize">{table.status === 'free' ? 'Libre' : 'Ocupada'}</span>
                      </div>
                    </button>
                  ))}
                {tables.filter(t => t.id !== activeOrder.id && !t.mergedWith).length === 0 && (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No hay otras mesas disponibles para unir.
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Venta Registrada!</h2>
            <p className="text-gray-500 mb-8">
              La orden <span className="font-bold text-gray-900">#{lastCompletedOrder.orderNumber}</span> se cobró correctamente.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSendWhatsAppFromModal}
                className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>Enviar Ticket por WhatsApp</span>
              </button>

              <button
                onClick={lastCompletedOrder.type === 'kitchen'
                  ? () => setShowSuccessModal(false)
                  : handleFinishSale
                }
                className={`w-full py-4 font-bold rounded-xl transition-colors ${lastCompletedOrder.type === 'kitchen'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {lastCompletedOrder.type === 'kitchen' ? 'Continuar Agregando' : 'Cerrar / Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {isPaymentModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Cobrar Cuenta</h2>
              <p className="text-center text-gray-500 text-sm mt-1">{activeOrder.name}</p>
            </div>

            <div className="p-8 flex flex-col items-center">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total a Pagar</span>
              <span className="text-5xl font-bold text-gray-900 mb-8">
                ${((activeOrder.committedItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                  activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)}
              </span>

              <div className="w-full space-y-3">
                {['Efectivo', 'Tarjeta', 'Transferencia'].map(method => (
                  <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`w-full py-4 px-6 rounded-xl flex justify-between items-center transition-all ${selectedPaymentMethod === method
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    <span className="font-bold text-lg">{method}</span>
                    {selectedPaymentMethod === method && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 bg-gray-50 flex space-x-4">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={processSale}
                  className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  Confirmar Cobro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = () => {
      try {
        console.log('--- VERIFICANDO DATOS INICIALES ---');

        // 1. Users
        const users = localStorage.getItem('la-trufa-users');
        if (!users || JSON.parse(users).length === 0) {
          console.log('Inicializando Usuarios por defecto...');
          const defaultUsers = [
            { id: 1, name: 'Marco', pin: '1234', role: 'Admin' },
            { id: 2, name: 'Diana', pin: '2020', role: 'Admin' }
          ];
          localStorage.setItem('la-trufa-users', JSON.stringify(defaultUsers));
        }

        // 2. Products
        const products = localStorage.getItem('la-trufa-products');
        if (!products) {
          console.log('Inicializando Productos por defecto...');
          localStorage.setItem('la-trufa-products', JSON.stringify(defaultProducts));
        }

        // 3. Sales History & Others
        const sales = localStorage.getItem('la-trufa-sales');
        if (!sales) {
          localStorage.setItem('la-trufa-sales', JSON.stringify([]));
        }

        // Ensure other critical arrays exist to prevent map errors
        if (!localStorage.getItem('la-trufa-customers')) localStorage.setItem('la-trufa-customers', JSON.stringify([]));
        if (!localStorage.getItem('la-trufa-inventory')) localStorage.setItem('la-trufa-inventory', JSON.stringify([]));

      } catch (error) {
        console.error('Error durante la inicialización:', error);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Cargando Sistema...</h2>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <UserProvider>
        <ProductProvider>
          <SalesProvider>
            <POSApp />
          </SalesProvider>
        </ProductProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
