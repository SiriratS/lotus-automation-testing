import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportReportToPDF() {
    console.log('📄 Starting PDF export...');

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Path to the HTML report
    const reportPath = path.join(__dirname, '../playwright-report/index.html');
    const pdfPath = path.join(__dirname, '../test-report.pdf');

    console.log(`📂 Opening report: ${reportPath}`);

    try {
        // Open the HTML report
        await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });

        // Wait for report to fully load
        await page.waitForTimeout(2000);

        console.log('💾 Generating PDF...');

        // Export to PDF with nice formatting
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Playwright Test Report</div>',
            footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
        });

        console.log(`✅ Report exported successfully to: ${pdfPath}`);
    } catch (error) {
        console.error('❌ Error exporting report:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

exportReportToPDF().catch(console.error);
