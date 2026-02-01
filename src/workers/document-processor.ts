import { Worker, Job } from 'bullmq';
import { getRedisConfig } from "@/lib/queue/redis-config";
import { QUEUE_NAMES, DocumentProcessingJobData, DocumentProcessingResult } from "@/lib/queue/queues";
import { downloadFile } from "@/lib/storage/s3-client";
import { extractTextFromPDF } from "@/lib/pdf/extractor";
import { getDocumentById, updateDocument } from "@/lib/db/document";
import { closePool } from "@/lib/db/connection";

/**
 * Convert Buffer to File-like object for PDF extractor
 * The PDF extractor expects a File object, but S3 returns Buffer
 */
function bufferToFile(buffer: Buffer, filename: string, mimeType: string): File {
    // Convert Buffer tp Uint8Array (compatible with Blob)
    const uint8Array = new Uint8Array(buffer);

    // Create a Blob from the Uint8Array
    const blob = new Blob([uint8Array], { type: mimeType });

    // Create a File from the Blob
    // @ts-ignore - File constructor works in Node.js with undici
    return new File([blob], filename, { type: mimeType });
}

/**
 * Process a document extraction job
 * Called by BullMQ worker for each job in the queue
 */
async function processDocument(
    job: Job<DocumentProcessingJobData>
): Promise<DocumentProcessingResult> {
    const { documentId, s3Key, fileName } = job.data;
    const startTime = Date.now();

    console.log(`\n📄 Processing document: ${fileName} (ID: ${documentId})`);

    try {
        console.log('  ⏳ Setting status to processing...');
        await updateDocument(documentId, { processing_status: 'processing' });

        // Verify document exists in S3
        const document = await getDocumentById( documentId );
        if ( !document ) {
            throw new Error(`Document not found: ${documentId}`);
        }

        // Download PDF from S3
        console.log(`  ⬇️  Downloading from S3: ${s3Key}`);
        const pdfBuffer = await downloadFile(s3Key);
        console.log(`  ✅ Downloaded ${pdfBuffer.length} bytes`);

        // Convert Buffer to File for PDF extractor
        const pdfFile = bufferToFile(pdfBuffer, fileName, 'application/pdf');

        // Extract text from PDF
        console.log('  📖 Extracting text from PDF...');
        const extractionResult = await extractTextFromPDF(pdfFile);
        console.log(`  ✅ Extracted ${extractionResult.text.length} characters from ${extractionResult.pageCount} pages`);

        // Update database with extracted text
        console.log('  💾 Saving extracted text to database...');
        await updateDocument(documentId, {
            processing_status: 'ready',
            extracted_text: extractionResult.text,
            metadata: {
                ...document.metadata,
                pageCount: extractionResult.pageCount,
                extractedAt: new Date().toISOString(),
                pdfMetadata: extractionResult.metadata,
            },
        });

        const processingTimeMs = Date.now() - startTime;
        console.log(`  🎉 Processing complete in ${processingTimeMs}ms\n`);

        // Return result for job completion
        return {
            documentId,
            extractedText: extractionResult.text,
            pageCount: extractionResult.pageCount,
            processingTimeMs,
        };
    } catch (error) {
        // Handle errors: update document status to 'error'
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ Processing failed: ${errorMessage}`);

        await updateDocument(documentId, {
            processing_status: 'error',
            error_message: errorMessage,
        });

        // Re-throw error so BullMQ can retry
        throw error;
    }
}

/**
 * Create and start the document processing worker
 */
export function createDocumentWorker(): Worker<DocumentProcessingJobData, DocumentProcessingResult> {
    const worker = new Worker(
        QUEUE_NAMES.DOCUMENT_PROCESSING,
        processDocument,
        {
            connection: getRedisConfig(),
            concurrency: 2,              // Process up to 2 documents simultaneously
            limiter: {
                max: 10,                // Maximum 10 jobs
                duration: 60000,       // Per 60 seconds (prevents overwhelming the system)
            },
        }
    );

    // Worker event listeners
    worker.on('ready', () => {
        console.log('🚀 Document processing worker ready');
        console.log('   Listening for jobs on queue:\', QUEUE_NAMES.DOCUMENT_PROCESSING');
        console.log('   Concurrency:', 2);
    });

    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, error) => {
        console.error(`❌ Job ${job?.id} failed:`, error.message);
        console.log(`   Attempts: ${job?.attemptsMade}/${job?.opts.attempts}`);
    });

    worker.on('error', (error) => {
        console.error('🔥 Worker error:', error);
    });

    return worker;
}

/**
 * Start the worker ( standalone execution )
 */
async function startWorker() {
    console.log('🔧 Starting document processing worker...\n');

    const worker = createDocumentWorker();

    // Gracefully shutdown handling
    const shutdown = async () => {
        console.log('\n🛑 Shutting down worker...');
        await worker.close();
        await closePool();
        console.log('✅ Worker shutdown complete');
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

// Run worker if executed directly
if ( require.main === module ) {
    startWorker().catch((error) => {
        console.error('Failed to start worker:', error);
        process.exit(1);
    });
}