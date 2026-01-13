import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';

export function ProductFormModal({ isOpen, onClose, onSave, product = null, categories }) {
    const { inventory } = useProducts();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        image: ''
    });
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Recipe State
    const [recipe, setRecipe] = useState([]); // Array of { ingredientId, quantity }
    const [selectedIngredientId, setSelectedIngredientId] = useState('');
    const [ingredientQuantity, setIngredientQuantity] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    image: product.image
                });
                setRecipe(product.recipe || []);
                setIsCustomCategory(!categories.includes(product.category));
                if (!categories.includes(product.category)) {
                    setCustomCategory(product.category);
                }
            } else {
                setFormData({
                    name: '',
                    price: '',
                    category: categories[0] || 'Otros',
                    image: ''
                });
                setRecipe([]);
                setIsCustomCategory(false);
                setCustomCategory('');
            }
            setSelectedIngredientId('');
            setIngredientQuantity('');
        }
    }, [isOpen, product, categories]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddIngredientToRecipe = () => {
        if (!selectedIngredientId || !ingredientQuantity) {
            console.warn("Missing ingredient or quantity");
            return;
        }

        // Ensure we compare numbers to numbers
        const idToFind = Number(selectedIngredientId);
        const ingredient = inventory.find(i => i.id === idToFind);

        if (!ingredient) {
            console.error("Ingredient not found in inventory:", selectedIngredientId);
            return;
        }

        setRecipe(prev => {
            const newRecipe = [
                ...prev,
                {
                    ingredientId: idToFind,
                    name: ingredient.name,
                    unit: ingredient.unit,
                    quantity: parseFloat(ingredientQuantity)
                }
            ];
            console.log("Updated Recipe State:", newRecipe);
            return newRecipe;
        });

        setSelectedIngredientId('');
        setIngredientQuantity('');
    };

    const handleRemoveIngredientFromRecipe = (index) => {
        setRecipe(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCategory = isCustomCategory ? customCategory : formData.category;

        const productData = {
            ...product, // Keep ID if editing
            ...formData,
            price: Number(formData.price),
            category: finalCategory,
            recipe: recipe // Explicitly include recipe
        };

        console.log("Saving Product Data:", productData);
        onSave(productData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.5"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    value={isCustomCategory ? 'custom' : formData.category}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomCategory(true);
                                        } else {
                                            setIsCustomCategory(false);
                                            setFormData({ ...formData, category: e.target.value });
                                        }
                                    }}
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                    <option value="custom">+ Nueva Categoría</option>
                                </select>
                            </div>
                        </div>

                        {isCustomCategory && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
                                <input
                                    type="text"
                                    required
                                    value={customCategory}
                                    onChange={e => setCustomCategory(e.target.value)}
                                    placeholder="Ej. Postres"
                                    className="w-full p-2.5 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-blue-900"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    {formData.image && (
                                        <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="URL de imagen (https://...)"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                                        />
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="w-full p-2.5 bg-white border border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                                                O subir archivo local (clic aquí)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recipe Section */}
                        <div className="border-t border-gray-100 pt-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Receta / Descuento de Inventario</h3>

                            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                <div className="flex space-x-2">
                                    <select
                                        value={selectedIngredientId}
                                        onChange={e => setSelectedIngredientId(e.target.value)}
                                        className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">Seleccionar Insumo...</option>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.unit})
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Cant."
                                        min="0"
                                        step="0.001"
                                        value={ingredientQuantity}
                                        onChange={e => setIngredientQuantity(e.target.value)}
                                        className="w-20 p-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddIngredientToRecipe}
                                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                {recipe.length > 0 && (
                                    <div className="space-y-2">
                                        {recipe.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200 text-sm">
                                                <span className="text-gray-700">
                                                    {item.quantity} {item.unit} de <strong>{item.name}</strong>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredientFromRecipe(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {recipe.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center italic">
                                        No hay insumos vinculados a este producto.
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex space-x-3 shrink-0 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
