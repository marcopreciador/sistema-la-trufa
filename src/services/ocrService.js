// Mock OCR Service
// In a real implementation, this would call OpenAI GPT-4o or a specialized OCR API.

export const processInvoiceImage = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate AI extraction
            resolve({
                success: true,
                merchant: "Proveedor Ejemplo S.A.",
                date: new Date().toISOString().split('T')[0],
                items: [
                    {
                        name: "Coca Cola 355ml", // Matches existing product
                        quantity: 24,
                        unitPrice: 15.50, // Higher than current? (Need to check logic)
                        total: 372.00
                    },
                    {
                        name: "Harina de Trigo", // Potential new product or ingredient
                        quantity: 10,
                        unitPrice: 22.00,
                        total: 220.00
                    },
                    {
                        name: "Tomate Bola",
                        quantity: 5,
                        unitPrice: 35.00,
                        total: 175.00
                    }
                ],
                totalAmount: 767.00
            });
        }, 2000); // Simulate network delay
    });
};
