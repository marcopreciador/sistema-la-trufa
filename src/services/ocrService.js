// Mock OCR Service
// In a real implementation, this would call OpenAI GPT-4o or a specialized OCR API.

export const processInvoiceImage = async (file, existingProducts = []) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Simulate Provider Detection
            // In real world, we'd look for keywords like "INDAR", "COSTCO", etc.
            const provider = "INDAR"; // Mocking INDAR for this test

            // 2. Mock Extracted Items from PDF/Image
            const rawExtractedItems = [
                {
                    code: "ORN-123",
                    description: "Tornimaster 1/2 pulgada",
                    qty: 100,
                    price: 2.50,
                    satCode: "31161500",
                    unit: "H87" // Pieza
                },
                {
                    code: "TOM-BOLA", // Code that might not exist in our DB
                    description: "Tomate Bola",
                    qty: 5,
                    price: 35.00,
                    satCode: "50403800",
                    unit: "KGM" // Kilogramo
                },
                {
                    code: "UNK-999",
                    description: "Producto Nuevo Desconocido",
                    qty: 10,
                    price: 50.00,
                    satCode: "10101010",
                    unit: "H87"
                }
            ];

            // 3. Smart Mapping Logic
            const processedItems = rawExtractedItems.map(item => {
                let matchType = 'NEW';
                let matchedProduct = null;

                // Priority 1: Code Match
                if (item.code) {
                    matchedProduct = existingProducts.find(p => p.code === item.code || (p.sku && p.sku === item.code));
                    if (matchedProduct) {
                        matchType = 'CODE_MATCH';
                    }
                }

                // Priority 2: Name Match (Fuzzy Logic Simulation)
                if (!matchedProduct) {
                    // Simple "includes" check for mock fuzzy logic
                    matchedProduct = existingProducts.find(p =>
                        p.name.toLowerCase().includes(item.description.toLowerCase()) ||
                        item.description.toLowerCase().includes(p.name.toLowerCase())
                    );
                    if (matchedProduct) {
                        matchType = 'NAME_MATCH';
                    }
                }

                return {
                    name: matchedProduct ? matchedProduct.name : item.description, // Use system name if matched
                    originalName: item.description,
                    quantity: item.qty,
                    unitPrice: item.price,
                    total: item.qty * item.price,
                    code: item.code,
                    satCode: item.satCode,
                    unit: item.unit,
                    matchType: matchType, // 'CODE_MATCH', 'NAME_MATCH', 'NEW'
                    matchedProductId: matchedProduct ? matchedProduct.id : null
                };
            });

            resolve({
                success: true,
                merchant: provider,
                date: new Date().toISOString().split('T')[0],
                items: processedItems,
                totalAmount: processedItems.reduce((sum, item) => sum + item.total, 0)
            });
        }, 2000); // Simulate network delay
    });
};
