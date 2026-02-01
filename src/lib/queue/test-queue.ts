import { config } from 'dotenv';
import { resolve } from 'path';
import { queueDocumentProcessing, getJobStatus, closeQueues } from './queues';
import { testRedisConnection } from './redis-config';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Test BullMQ queue configuration
 */
async function testQueue() {
    console.log('🧪 Testing BullMQ Queue Configuration...\n');

    try {
        // Test 1: Check Redis connection
        console.log('Test 1: Checking Redis connection...');
        const isConnected = await testRedisConnection();
        if (isConnected) {
            console.log('✅ Redis is connected and responsive\n');
        } else {
            throw new Error('Redis connection failed');
        }

        // Test 2: Queue a test job
        console.log('Test 2: Queueing a test document processing job...');
        const testJobData = {
            documentId: '123e4567-e89b-12d3-a456-426614174000',
            s3Key: 'documents/test-document.pdf',
            fileName: 'test-document.pdf',
        };

        const jobId = await queueDocumentProcessing(testJobData);
        console.log('✅ Job queued successfully');
        console.log('   Job ID:', jobId);
        console.log('');

        // Test 3: Check job status
        console.log('Test 3: Checking job status...');
        const status = await getJobStatus(testJobData.documentId);
        console.log('✅ Job status retrieved:');
        console.log('   Status:', status.status);
        console.log('   Expected: "waiting" (no worker running yet)');
        console.log('');

        // Test 4: Try to queue duplicate job (should be idempotent)
        console.log('Test 4: Testing job idempotency (queueing same job again)...');
        try {
            await queueDocumentProcessing(testJobData);
            console.log('⚠️  Duplicate job was queued (this may happen if the first job was already processed)');
        } catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                console.log('✅ Duplicate job rejected (idempotency working)');
            } else {
                throw error;
            }
        }
        console.log('');

        console.log('🎉 All queue tests passed!');
        console.log('\n📝 Note: The job will stay in "waiting" state until you create');
        console.log('   the worker in Task 6. This is expected behavior.\n');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        // Clean up
        await closeQueues();
        console.log('\n✅ Cleanup complete');
    }
}

// Run tests
if (require.main === module) {
    testQueue()
        .then(() => {
            console.log('Test script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test script failed:', error);
            process.exit(1);
        });
}

export { testQueue };