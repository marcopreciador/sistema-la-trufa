const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { print } = require('pdf-to-printer');
const os = require('os');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Browser instance
let browser;

async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('Browser initialized');
    }
    return browser;
}

app.post('/', async (req, res) => {
    const { html } = req.body;

    if (!html) {
        return res.status(400).send('No HTML content provided');
    }

    console.log('Received print job...');
    const timestamp = Date.now();
    const pdfPath = path.join(tempDir, `ticket-${timestamp}.pdf`);

    try {
        const browser = await initBrowser();
        const page = await browser.newPage();

        // Set content
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF (80mm width)
        await page.pdf({
            path: pdfPath,
            width: '80mm',
            height: '200mm', // Variable height would be better but 80mm roll is continuous
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        });

        await page.close();

        // Print PDF
        // Note: This uses the default system printer. 
        // Ensure the thermal printer is set as default or specify printer name in options.
        if (os.platform() === 'win32') {
            await print(pdfPath);
        } else {
            // For Mac/Linux, we might need 'unix-print' or 'lp' command
            // Fallback for now: just log
            console.log(`PDF generated at ${pdfPath}. Printing on non-Windows requires 'lp' command configuration.`);
            require('child_process').execSync(`lp "${pdfPath}"`);
        }

        console.log('Print job sent successfully');
        res.status(200).send({ success: true });

        // Cleanup
        setTimeout(() => {
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        }, 5000);

    } catch (error) {
        console.error('Printing error:', error);
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Print Server running on http://localhost:${PORT}`);
    console.log(`1. Ensure your thermal printer is set as the DEFAULT printer.`);
    console.log(`2. Configure the POS to point to http://<YOUR_PC_IP>:${PORT}`);
});
