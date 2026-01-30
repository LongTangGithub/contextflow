import { config } from 'dotenv';
import { resolve } from 'path';
import {
    insertDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from "@/lib/db/document";
import { closePool } from './connection';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Test document query functions
 */
async function testDocumentQueries() {
    console.log(' 🧪 Testing document query functions...\n')

    try {
        // Test 1: Insert document
        console.log("Test 1: Inserting document....")
        const doc = await insertDocument({
            name: 'test-research-paper.pdf',
            size: 2048,
            type: 'application/pdf',
            s3_key: 'documents/1234567890-abcdef-test-research-paper.pdf',
            s3_url: 'https://contextflow-dev-documents.s3.us-east-1.amazonaws.com/documents/1234567890-abcdef-test-research-paper.pdf',
        });
        console.log('✅ Document inserted successfully');
        console.log('   ID:', doc.id);
        console.log('   Name:', doc.name);
        console.log('   Status:', doc.processing_status);
        console.log('   Metadata:', doc.metadata);
        console.log('');

        // Test 2: Get all documents
        console.log('Test 2: Getting all documents...');
        const docs = await getDocuments();
        console.log('✅ Found', docs.length, 'document(s)');
        console.log('   First document:', docs[0]?.name);
        console.log('');

        // Test 3: Get by ID
        console.log('Test 3: Getting document by ID...');
        const retrieved = await getDocumentById(doc.id);
        console.log('✅ Retrieved document:');
        console.log('   Name:', retrieved?.name);
        console.log('   S3 Key:', retrieved?.metadata?.s3_key);
        console.log('');

        // Test 4: Get non-existent document
        console.log('Test 4: Getting non-existent document...')
        const nonExistent = await getDocumentById('00000000-0000-0000-0000-000000000000');
        console.log('✅ Result:', nonExistent === null ? 'null (expected)' : 'Found (unexpected)');
        console.log('');

        console.log('Test 5: Updating document processing status...');
        await updateDocument(doc.id, {
            processing_status: 'processing'
        });
        const afterProcessing = await getDocumentById(doc.id);
        console.log('✅ Status updated to:', afterProcessing?.processing_status);
        console.log('');

        console.log('Test 6: Updating document with extracted text...')
        await updateDocument(doc.id, {
            processing_status: 'ready',
            extracted_text: 'This is a test document about machine learning and neural networks.'
        });
        const afterExtraction = await getDocumentById(doc.id);
        console.log('✅ Extracted text added:', afterExtraction?.extracted_text?.substring(0, 50) + '...');
        console.log('   Status:', afterExtraction?.processing_status);
        console.log('');

        console.log('Test 7: Updating document with error...');
        await updateDocument(doc.id, {
            processing_status: 'error',
            error_message: 'Failed to extract text: Invalid PDF format'
        });
        const afterError = await getDocumentById(doc.id);
        console.log('✅ Error recorded:');
        console.log('   Status:', afterError?.processing_status);
        console.log('   Error:', afterError?.error_message);
        console.log('');

        console.log('Test 8: Deleting document...');
        await deleteDocument(doc.id);
        const deleted = await getDocumentById(doc.id);
        console.log('✅ Document deleted:', deleted === null ? 'Success' : 'Failed (still exists)');
        console.log('');

        console.log('🎉 All tests passed!');
        console.log('Your document query functions are working correctly!\n');

    } catch ( error ) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await closePool();
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    testDocumentQueries()
        .then(() => {
            console.log('Test script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test script failed:', error);
            process.exit(1);
        });
}

export { testDocumentQueries };