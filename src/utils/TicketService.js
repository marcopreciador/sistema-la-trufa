import { PrintConfig } from '../config/PrintConfig';

const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const generateHTMLTicket = (content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Ticket</title>
        <style>
            body {
                font-family: 'Courier New', Courier, monospace;
                width: 80mm;
                margin: 0;
                padding: 5px;
                font-size: 12px;
                line-height: 1.2;
                color: black;
                background: white;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 20px; }
            .text-sm { font-size: 10px; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .mb-1 { margin-bottom: 4px; }
            .border-b { border-bottom: 1px dashed black; padding-bottom: 5px; margin-bottom: 5px; }
            .border-t { border-top: 1px dashed black; padding-top: 5px; margin-top: 5px; }
            .flex { display: flex; justify-content: space-between; }
            .logo { max-width: 60px; margin: 0 auto 10px auto; display: block; }
            @media print {
                @page { margin: 0; size: 80mm auto; }
                body { width: 100%; }
            }
        </style>
    </head>
    <body>
        ${content}
        <script>
            window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
            }
        </script>
    </body>
    </html>
    `;
};

const print = async (htmlContent) => {
    // 1. Remote Print via Supabase Queue (for iPhone/Remote Devices)
    // If we are on a mobile device (simple check) or configured to use remote
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile || (PrintConfig.useRemoteServer && PrintConfig.serverUrl)) {
        try {
            // Option A: Direct HTTP to Print Server (if accessible)
            if (PrintConfig.serverUrl && !isMobile) {
                const response = await fetch(PrintConfig.serverUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html: htmlContent })
                });
                if (!response.ok) throw new Error('Error printing remotely');
                return;
            }

            // Option B: Supabase Print Queue (Reliable for iPhone -> Mac)
            // We insert a job into a 'print_queue' table. The Mac (Print Server) listens to this table.
            // Assuming 'print_queue' table exists or we use a workaround.
            // Workaround: Use 'system_events' or similar if 'print_queue' doesn't exist.
            // Let's assume we create/use 'print_jobs' table.
            const { error } = await import('../services/supabase').then(({ supabase }) =>
                supabase.from('print_jobs').insert([{
                    content: htmlContent,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }])
            );

            if (error) throw error;
            console.log('Print job queued in Supabase');
            alert('Ticket enviado a la cola de impresión (Mac)');
            return;

        } catch (error) {
            console.error('Remote print failed:', error);
            alert('Error al enviar ticket a la Mac. Verifique conexión.');
        }
    }

    // 2. Local Browser Print (Fallback / Desktop)
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
        printWindow.document.write(generateHTMLTicket(htmlContent));
        printWindow.document.close();
    } else {
        alert('Por favor permite las ventanas emergentes para imprimir.');
    }
};

export const TicketService = {
    printKitchenTicket: (table, items, orderNumber) => {
        const date = formatDate(new Date());
        let folio = orderNumber || table.orderNumber || 'PEND';

        const content = `
            <div class="text-center font-bold text-xl mb-1">LA TRUFA</div>
            <div class="text-center font-bold text-lg border-b">COCINA</div>
            
            <div class="my-2">
                <div class="font-bold text-xl text-center">FOLIO: #${folio}</div>
                <div class="text-lg">Mesa: ${table.name}</div>
                <div class="text-sm">${date}</div>
            </div>

            <div class="border-b font-bold flex">
                <span>CANT</span> <span>PRODUCTO</span>
            </div>
            
            ${items.map(item => `
                <div class="mb-1">
                    <div class="font-bold text-lg">${item.quantity} x ${item.name}</div>
                    ${item.notes ? `<div class="text-sm italic ml-2">Nota: ${item.notes}</div>` : ''}
                </div>
            `).join('')}
        `;

        print(content);
    },

    printCustomerTicket: (table, items, total, user, paymentMethod = 'Efectivo', discount = 0, tip = 0, isPreCheck = false) => {
        const date = formatDate(new Date());
        const logo = localStorage.getItem('la-trufa-logo');
        let folio = table.orderNumber || 'PEND';

        const content = `
            ${logo ? `<img src="${logo}" class="logo" />` : ''}
            <div class="text-center font-bold text-xl mb-1">LA TRUFA</div>
            <div class="text-center text-sm">Matamoros #501, Zona Centro</div>
            <div class="text-center text-sm border-b">Tel: 313 126 6125</div>
            
            <div class="text-center font-bold text-lg my-2">${isPreCheck ? 'PRE-CUENTA' : 'TICKET DE VENTA'}</div>
            
            <div class="mb-1">
                ${(!isPreCheck || folio !== 'PEND') ? `<div class="text-center font-bold text-lg">FOLIO: #${folio}</div>` : ''}
                <div class="flex"><span>Mesa: ${table.name}</span> <span>${user ? user.name : ''}</span></div>
                <div class="text-sm">${date}</div>
            </div>

            <div class="border-b border-t font-bold flex">
                <span>CANT DESC</span> <span>IMPORTE</span>
            </div>

            ${items.map(item => `
                <div class="flex mb-1">
                    <div style="flex: 1">${item.quantity} ${item.name}</div>
                    <div class="text-right">${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `).join('')}

            <div class="border-t my-2"></div>

            ${discount > 0 ? `
                <div class="flex text-sm">
                    <span>Subtotal:</span> <span>${formatCurrency(total + discount)}</span>
                </div>
                <div class="flex text-sm font-bold">
                    <span>Descuento:</span> <span>-${formatCurrency(discount)}</span>
                </div>
            ` : ''}

            <div class="flex font-bold text-lg">
                <span>TOTAL:</span> <span>${formatCurrency(total)}</span>
            </div>

            ${(tip > 0 && !isPreCheck) ? `
                <div class="flex text-sm mt-1">
                    <span>Propina:</span> <span>${formatCurrency(tip)}</span>
                </div>
                <div class="flex font-bold mt-1">
                    <span>GRAN TOTAL:</span> <span>${formatCurrency(total + tip)}</span>
                </div>
            ` : ''}

            ${!isPreCheck ? `
                <div class="text-center mt-2 text-sm">Pago: ${paymentMethod}</div>
            ` : ''}

            <div class="text-center mt-4 text-sm">
                ¡Gracias por su preferencia!<br>
                Este no es un comprobante fiscal
            </div>
        `;

        print(content);
    },

    printCancellationTicket: (table, user) => {
        const date = formatDate(new Date());

        const content = `
            <div class="text-center font-bold text-xl mb-1">LA TRUFA</div>
            <div class="text-center font-bold text-lg border-b">CANCELACIÓN</div>
            
            <div class="my-2">
                ${table.orderNumber ? `<div class="text-center font-bold text-lg">ORDEN #${table.orderNumber}</div>` : ''}
                <div>Mesa: ${table.name}</div>
                <div>Autorizó: ${user ? user.name : 'Admin'}</div>
                <div class="text-sm">${date}</div>
            </div>

            <div class="text-center font-bold text-xl border-t border-b py-2">
                ORDEN ANULADA
            </div>
            <div class="text-center text-sm mt-1">No preparar / Desechar</div>
        `;

        print(content);
    },

    printCashCutTicket: (cutData, user) => {
        const date = formatDate(new Date(cutData.date));

        const content = `
            <div class="text-center font-bold text-xl mb-1">CORTE DE CAJA</div>
            <div class="text-center text-sm border-b">${date}</div>
            <div class="text-sm mb-2">Realizado por: ${user ? user.name : 'Sistema'}</div>

            <div class="font-bold border-b mb-1">RESUMEN FINANCIERO</div>
            <div class="flex"><span>Efectivo:</span> <span>${formatCurrency(cutData.cashSales)}</span></div>
            <div class="flex"><span>Digital:</span> <span>${formatCurrency(cutData.digitalSales)}</span></div>
            <div class="flex font-bold"><span>Venta Total:</span> <span>${formatCurrency(cutData.systemSales)}</span></div>
            <div class="flex text-sm"><span>(-) Gastos:</span> <span>${formatCurrency(cutData.expenses)}</span></div>

            <div class="font-bold border-b border-t my-2 mb-1">ARQUEO DE CAJA</div>
            <div class="flex"><span>Esperado:</span> <span>${formatCurrency(cutData.expected)}</span></div>
            <div class="flex"><span>Contado:</span> <span>${formatCurrency(cutData.counted)}</span></div>
            
            <div class="flex font-bold mt-1">
                <span>Diferencia:</span> 
                <span>${formatCurrency(cutData.difference)}</span>
            </div>

            <div class="flex mt-2"><span>Retiro:</span> <span>${formatCurrency(cutData.withdraw)}</span></div>
            <div class="flex font-bold"><span>En Caja:</span> <span>${formatCurrency(cutData.leftInDrawer)}</span></div>

            <div class="mt-8 border-t w-3/4 mx-auto"></div>
            <div class="text-center text-sm">Firma de Conformidad</div>
        `;

        print(content);
    }
};
