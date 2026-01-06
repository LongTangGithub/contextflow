import { extractTextFromPDF } from './extractor';
import { readFileSync } from 'fs';
import { join } from 'path';

async function testExtraction() {
    try {
        // Need to provide a test PDF file
        // For now, this shows how to test
        console.log('🔍 Testing PDF extraction...');
        console.log('============================\n')

        // Example: Create a File object from filesystem (for testing)
        // In production, this comes from the browser upload
        const pdfPath = join(process.cwd(), 'test-sample.pdf');

        // Uncomment when you have a test PDF
        const buffer = readFileSync(pdfPath);
        const file = new File([buffer], 'test-sample.pdf', { type: 'application/pdf' });
        const result = await extractTextFromPDF(file);

        console.log('✅ Extraction successful!');
        console.log(`Pages: ${result.pageCount}`);
        console.log(`Text length: ${result.text.length} characters`);
        console.log(`Title: ${result.metadata.title || 'N/A'}`);
        console.log(`Author: ${result.metadata.author || 'N/A'}`);
        console.log('\nFirst 200 characters:');
        console.log(result.text.substring(0, 200));

        console.log('⚠️  Add a test PDF file named "test-sample.pdf" to project root');
        console.log('Then uncomment the test code above');

    } catch ( error ) {
        console.error('❌Extraction failed:', error);
    }
}

testExtraction()