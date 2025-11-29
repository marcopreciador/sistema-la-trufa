import jsPDF from 'jspdf';

export const TicketService = {
    generateKitchenTicket: (table, items, orderNumber) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200]
        });

        let y = 10;

        // Logic to ensure Folio exists
        let currentFolio = orderNumber;
        if (!currentFolio) {
            // Fallback: Try to get from table object
            currentFolio = table.orderNumber;
        }

        // If still no folio, generate one (Safety Net)
        if (!currentFolio) {
            let savedSeq = localStorage.getItem('la-trufa-order-sequence');
            let nextSeq = savedSeq ? parseInt(savedSeq, 10) + 1 : 1000;
            localStorage.setItem('la-trufa-order-sequence', nextSeq.toString());
            currentFolio = nextSeq;
        }

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('LA TRUFA', 40, y, { align: 'center' });
        y += 8;

        // FOLIO DISPLAY (GIANT)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`FOLIO: #${currentFolio}`, 40, y, { align: 'center' });
        y += 8;

        doc.setFontSize(12);
        doc.text('TICKET DE COCINA', 40, y, { align: 'center' });
        y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Mesa: ${table.name}`, 5, y);
        y += 5;
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, y);
        y += 8;

        // Items
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CANT  PRODUCTO', 5, y);
        y += 5;
        doc.line(5, y, 75, y);
        y += 5;

        items.forEach(item => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${item.quantity}`, 5, y);

            // Wrap text for long product names
            const splitTitle = doc.splitTextToSize(item.name, 55);
            doc.text(splitTitle, 20, y);

            y += (splitTitle.length * 5);

            if (item.notes) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(10);
                const splitNotes = doc.splitTextToSize(`Nota: ${item.notes}`, 65);
                doc.text(splitNotes, 10, y);
                y += (splitNotes.length * 4) + 2;
                doc.setFontSize(12);
            } else {
                y += 2;
            }
        });

        // Auto print
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    },

    generateCustomerTicket: (table, items, total, user, paymentMethod = 'Efectivo', discount = 0, tip = 0, isPreCheck = false) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 297] // A bit longer for customer ticket
        });

        let y = 10;

        // Logic to ensure Folio exists
        let currentFolio = table.orderNumber;
        if (!currentFolio && !isPreCheck) { // Only generate folio if NOT pre-check
            // Auto-generate Folio if missing (e.g. Takeout)
            let savedSeq = localStorage.getItem('la-trufa-order-sequence');
            let nextSeq = savedSeq ? parseInt(savedSeq, 10) + 1 : 1000;
            localStorage.setItem('la-trufa-order-sequence', nextSeq.toString());
            currentFolio = nextSeq;

            // Note: We are generating it for the PRINT, but ideally it should be saved to the order object too.
            // Since this is a service, we can't easily update the React state from here without a callback.
            // However, for the purpose of the printed ticket, this ensures a number appears.
        }

        // Header
        const logo = localStorage.getItem('la-trufa-logo');
        if (logo) {
            try {
                doc.addImage(logo, 'PNG', 25, y, 30, 30); // Centered approx
                y += 32;
            } catch (e) {
                console.error("Error printing logo", e);
                // Fallback text if logo fails
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('LA TRUFA', 40, y, { align: 'center' });
                y += 6;
            }
        } else {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('LA TRUFA', 40, y, { align: 'center' });
            y += 6;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Matamoros #501, Zona Centro', 40, y, { align: 'center' });
        y += 5;
        doc.text('Tel: 313 126 6125', 40, y, { align: 'center' });
        y += 8;

        // TITLE
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(isPreCheck ? 'CUENTA' : 'TICKET DE VENTA', 40, y, { align: 'center' });
        y += 8;

        // FOLIO DISPLAY (Only for final ticket or if already exists)
        if (!isPreCheck || currentFolio) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`FOLIO: #${currentFolio || 'PENDIENTE'}`, 40, y, { align: 'center' });
            y += 6;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Mesa: ${table.name}`, 5, y);
        doc.text(`Atendió: ${user ? user.name : 'General'}`, 75, y, { align: 'right' });
        y += 5;
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, y);
        y += 8;

        // Items
        doc.line(5, y, 75, y);
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('CANT  DESCRIPCION', 5, y);
        doc.text('IMPORTE', 75, y, { align: 'right' });
        y += 5;
        doc.line(5, y, 75, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        items.forEach(item => {
            doc.text(`${item.quantity}`, 5, y);

            const splitTitle = doc.splitTextToSize(item.name, 45);
            doc.text(splitTitle, 15, y);

            const amount = (item.price * item.quantity).toFixed(2);
            doc.text(`$${amount}`, 75, y, { align: 'right' });

            y += (splitTitle.length * 5) + 2;
        });

        y += 5;
        doc.line(5, y, 75, y);
        y += 8;

        // Totals
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        // Subtotal (if discount exists)
        if (discount > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Subtotal:', 40, y, { align: 'right' });
            doc.text(`$${(total + discount).toFixed(2)}`, 75, y, { align: 'right' });
            y += 5;
            doc.setTextColor(200, 0, 0); // Red for discount
            doc.text('Descuento:', 40, y, { align: 'right' });
            doc.text(`-$${discount.toFixed(2)}`, 75, y, { align: 'right' });
            doc.setTextColor(0, 0, 0); // Reset
            y += 5;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
        }

        doc.text('TOTAL:', 40, y, { align: 'right' });
        doc.text(`$${total.toFixed(2)}`, 75, y, { align: 'right' });
        y += 8;

        if (tip > 0 && !isPreCheck) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Propina (Opcional):', 40, y, { align: 'right' });
            doc.text(`$${tip.toFixed(2)}`, 75, y, { align: 'right' });
            y += 5;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('GRAN TOTAL:', 40, y, { align: 'right' });
            doc.text(`$${(total + tip).toFixed(2)}`, 75, y, { align: 'right' });
            y += 8;
        }

        if (!isPreCheck) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Pago: ${paymentMethod}`, 5, y);
            y += 10;
        } else {
            y += 5;
            // Clean ticket: No extra text
            y += 5;
        }

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('¡Gracias por su preferencia!', 40, y, { align: 'center' });
        y += 5;
        doc.text('Este no es un comprobante fiscal', 40, y, { align: 'center' });

        // Auto print
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    },

    generateCancellationTicket: (table, user) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 150]
        });

        let y = 10;

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('LA TRUFA', 40, y, { align: 'center' });
        y += 8;

        doc.setFontSize(14);
        doc.text('CANCELACIÓN', 40, y, { align: 'center' });
        y += 8;

        if (table.orderNumber) {
            doc.setFontSize(16);
            doc.text(`ORDEN #${table.orderNumber}`, 40, y, { align: 'center' });
            y += 8;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Mesa: ${table.name}`, 5, y);
        y += 5;
        doc.text(`Autorizó: ${user ? user.name : 'Admin'}`, 5, y);
        y += 5;
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDEN ANULADA', 40, y, { align: 'center' });
        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('No preparar / Desechar', 40, y, { align: 'center' });

        // Auto print
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    },

    generateCashCutTicket: (cutData, user) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200]
        });

        let y = 10;

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('CORTE DE CAJA', 40, y, { align: 'center' });
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date(cutData.date).toLocaleString()}`, 5, y);
        y += 5;
        doc.text(`Realizado por: ${user ? user.name : 'Sistema'}`, 5, y);
        y += 8;

        doc.line(5, y, 75, y);
        y += 5;

        // Financials
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMEN FINANCIERO', 5, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Sales Breakdown
        doc.text('Ventas Efectivo:', 5, y);
        doc.text(`$${cutData.cashSales.toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;

        doc.text('Ventas Digitales:', 5, y);
        doc.text(`$${cutData.digitalSales.toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Venta Total:', 5, y);
        doc.text(`$${cutData.systemSales.toFixed(2)}`, 75, y, { align: 'right' });
        y += 8;
        doc.setFont('helvetica', 'normal');

        doc.text('(-) Gastos:', 5, y);
        doc.text(`$${cutData.expenses.toFixed(2)}`, 75, y, { align: 'right' });
        y += 8;

        doc.line(5, y, 75, y);
        y += 5;

        // Cash Reconciliation
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('ARQUEO DE CAJA', 5, y);
        y += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        doc.text('Esperado en Caja:', 5, y);
        doc.text(`$${cutData.expected.toFixed(2)}`, 75, y, { align: 'right' });
        y += 8;

        doc.text('(+) Efectivo Contado:', 5, y);
        doc.text(`$${cutData.counted.toFixed(2)}`, 75, y, { align: 'right' });
        y += 8;

        doc.line(5, y, 75, y);
        y += 5;

        const diff = cutData.difference;
        doc.setFont('helvetica', 'bold');
        doc.text('Diferencia:', 5, y);
        doc.setTextColor(diff < 0 ? 255 : 0, diff < 0 ? 0 : 128, 0); // Red if negative, Green if positive/zero
        doc.text(`$${diff.toFixed(2)}`, 75, y, { align: 'right' });
        doc.setTextColor(0, 0, 0); // Reset color
        y += 8;

        doc.text('Retiro (A Casa):', 5, y);
        doc.text(`$${cutData.withdraw.toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;

        doc.text('Dejar en Caja:', 5, y);
        doc.text(`$${cutData.leftInDrawer.toFixed(2)}`, 75, y, { align: 'right' });
        y += 10;

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Firma de Conformidad', 40, y, { align: 'center' });
        y += 15;
        doc.line(20, y, 60, y);

        // Auto print
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    }
};
