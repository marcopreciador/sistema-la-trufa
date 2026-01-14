// Mock OCR Service
// In a real implementation, this would call OpenAI GPT-4o or a specialized OCR API.

export const processInvoiceImage = async (file, existingProducts = []) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 1. Simulate Provider Detection
            const provider = "INDAR"; // Mocking INDAR

            // 2. Mock Extracted Items from PDF/Image (Realistic Data)
            const rawExtractedItems = [
                {
                    code: "K7 CSKY N-14",
                    description: "CABLE ELECTRICO CAL 14 COLOR NEGRO",
                    qty: 100,
                    price: 12.50,
                    satCode: "26121600",
                    unit: "MTR" // Metro
                },
                {
                    code: "ORN-123", // Existing code example
                    description: "Tornimaster 1/2 pulgada (PDF Desc)",
                    qty: 50,
                    price: 2.50,
                    satCode: "31161500",
                    unit: "H87" // Pieza
                },
                {
                    code: "NEW-PROD-001",
                    description: "Martillo Industrial 20oz",
                    qty: 5,
                    price: 150.00,
                    satCode: "27111600",
                    unit: "H87"
                }
            ];

            // 3. Strict Mapping Logic
            const processedItems = rawExtractedItems.map(item => {
                let matchType = 'NEW';
                let matchedProduct = null;

                // Priority 1: Strict Code Match
                // We use the extracted code to find an exact match in our DB
                if (item.code) {
                    matchedProduct = existingProducts.find(p => p.code === item.code || (p.sku && p.sku === item.code));
                    if (matchedProduct) {
                        matchType = 'CODE_MATCH';
                    }
                }

                // Priority 2: NO Fuzzy Name Match (Strict Rule: Prohibido Inventar)
                // If no code match, it is NEW. We do NOT guess based on name.

                return {
                    // If matched, use System Name. If NEW, use EXACT PDF Description.
                    name: matchedProduct ? matchedProduct.name : item.description,
                    originalName: item.description,
                    quantity: item.qty,
                    unitPrice: item.price,
                    total: item.qty * item.price,
                    code: item.code,
                    satCode: item.satCode,
                    unit: item.unit,
                    matchType: matchType, // 'CODE_MATCH' or 'NEW'
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
