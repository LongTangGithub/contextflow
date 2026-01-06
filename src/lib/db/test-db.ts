import { config } from 'dotenv';
import { resolve } from 'path';
import { query, testConnection, testPgVector, closePool } from './connection';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Test database setup and pgvector functionality
 */

async function testDatabaseSetup() {
    console.log('🧪 Testing database setup...\n')

    try {
        // Test 1: Basic connection test
        console.log('🔍 Testing database connection...')
        const connectionOk = await testConnection();
        if (!connectionOk) {
            throw new Error('Database connection failed');
        }
        console.log('✅ Database connection successful!\n');

        // Test 2: pgvector extension 
        console.log('🔍 Testing pgvector extension...')
        const pgVectorOk = await testPgVector();
        if (!pgVectorOk) {
            throw new Error('pgvector extension not installed');
        }
        console.log('✅ pgvector extension installed!\n');

        // Test 3: Create test tables and data
        console.log('Test 3: Database Schema');
        const tablesResult = await query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;   
        `)
        console.log('Tables found:', tablesResult.rows.map(r => r.table_name).join(', '));

        const expectedTables = ['documents', 'document_chunks', 'embeddings'];
        const actualTables = tablesResult.rows.map(r => r.table_name);
        const allTablesExist = expectedTables.every(table => actualTables.includes(table));

        if (!allTablesExist) {
            throw new Error('Missing required tables');
        }
        console.log('✅ All required tables exist!\n');
        
        // Test 4: Insert test document 
        console.log('Test 4: Inserting test document...');
        const docResult = await query(`
            INSERT INTO documents (name, size, type, processing_status)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, created_at    
        `, ['test-document.pdf', 1024, 'application/pdf', 'ready']);

        const documentId = docResult.rows[0].id;
        console.log('✅ Document inserted:', docResult.rows[0])
        
        // Test 5: Insert test document chunk
        console.log('Test 5: Insert Test Chunk');
        const chunkResult = await query(`
            INSERT INTO document_chunks (document_id, content, chunk_index, page_number, token_count)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, content
        
        `, [documentId, 'This is a test chunk about machine learning and neural networks.', 0, 1, 15]);

        const chunkId = chunkResult.rows[0].id;
        console.log('✅ Chunk inserted:', chunkResult.rows[0].content);
        console.log('   Chunk ID:', chunkId, '\n');

        // Test 6: Insert test embedding (mock vector )
        console.log('Test 6: Inserting test embedding...');
        // Create a random 1536-dimensional vector (normally from OpenAI)
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random());

        const embeddingResult = await query(`
            INSERT INTO embeddings (chunk_id, embedding, model)
            VALUES ($1, $2, $3)
            RETURNING id, model, created_at
        `, [chunkId, JSON.stringify(mockEmbedding), 'text-embedding-3-small']);

        console.log('✅ Embedding inserted:', embeddingResult.rows[0]);
        console.log('   Embedding ID:', embeddingResult.rows[0].id, '\n')

        // Test 7: Vector similarity search
        console.log('Test 7: Vector similarity search...');
        const searchVector = Array.from({ length: 1536 }, () => Math.random());

        const searchResult = await query(`
            SELECT
            dc.content,
            d.name as document_name,
            e.embedding <=> $1::vector as distance
        FROM embeddings e
        JOIN document_chunks dc ON dc.id = e.chunk_id
        JOIN documents d ON d.id = dc.document_id
        ORDER BY e.embedding <=> $1::vector
        LIMIT 5    
        `, [JSON.stringify(searchVector)]);

        console.log('✅ Similarity search successful');
        console.log('   Results found:', searchResult.rows.length);
        console.log('   Top Result:', searchResult.rows[0]?.content);
        console.log('   Distance:', searchResult.rows[0]?.distance, '\n');

        // Test 8: Cleanup test data
        console.log('Test 8: Cleanup Test Data');
        await query(`DELETE FROM documents WHERE id = $1`, [documentId]);
        console.log('✅ Test data cleaned up!\n');

        console.log('🎉 All tests passed!');
        console.log('Your database is ready for ContextFlow!\n');
        
    } catch (error) {
        console.error('❌ Database setup and pgvector functionality test failed:', error);
        throw error;
    } finally {
        await closePool();
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testDatabaseSetup()
        .then(() => {
            console.log('Test script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test script failed:', error);
            process.exit(1);
        });
}

export { testDatabaseSetup };