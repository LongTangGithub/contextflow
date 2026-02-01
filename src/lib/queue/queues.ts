import { Queue } from 'bullmq';
import { getRedisConfig } from './redis-config';

/**
 * Job Data Types
 * These define the structure of data passed to background workers
 */
export interface DocumentProcessingJobData {
    documentId: string;     // UUID from database
    s3Key: string;         // S3 object key for download
    fileName: string;     // Original filename for logging
}

/**
 * Job Result Types
 * Returned by worker after successful processing
 */
export interface DocumentProcessingResult {
    documentId: string;
    extractedText: string;
    pageCount: number;
    processingTimeMs: number;
}

/**
 * Queue Names
 * Centralized constants for queue identification
 */
export const QUEUE_NAMES = {
    DOCUMENT_PROCESSING: 'document-processing',
} as const;

/**
 * Document Processing Queue (singleton)
 * Handles PDF text extraction jobs
 */
let documentQueue: Queue<DocumentProcessingJobData, DocumentProcessingResult> | null = null;

/**
 * Get or create the document processing queue
 */
export function getDocumentQueue(): Queue<DocumentProcessingJobData, DocumentProcessingResult> {
    if (!documentQueue) {
        documentQueue = new Queue(
            QUEUE_NAMES.DOCUMENT_PROCESSING,
            {
                connection: getRedisConfig(),
                defaultJobOptions: {
                    attempts: 3,                  // Retry up to 3 times on failure
                    backoff: {
                        type: 'exponential',    // Wait longer between each retry
                        delay: 5000,           // Start with 5 second delay
                    },
                    removeOnComplete: {
                        age: 24 * 3600,      // Keep completed jobs for 24 hours
                        count: 1000,        // Keep max 1000 completed jobs
                    },
                    removeOnFail: {
                        age: 7 * 24 * 3600,  // Keep failed jobs for 7 days
                    },
                },
            }
        );
        console.log('✅ Document processing queue initialized');
    }

    return documentQueue;
}

/**
 * Add a document processing job to the queue
 * Called by API route after S3 upload
 */
export async function queueDocumentProcessing(
    data: DocumentProcessingJobData
): Promise<string> {
    const queue = getDocumentQueue();

    const job = await queue.add(
        'process-document',         // Job name
        data,
        {
            jobId: data.documentId,      // Use document ID as job ID for idempotency
            priority: 1,                // Default priority (lower number = higher priority)
        }
    );

    console.log(`📋 Queued document processing job: ${job.id}`);
    return job.id || data.documentId;
}

/**
 * Get job status by document ID
 * Useful for checking processing process
 */
export async function getJobStatus(documentId: string): Promise<{
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
    progress?: number;
    error?: string;
}> {
   try {
       const queue = getDocumentQueue();
       const job = await queue.getJob(documentId);

       if (!job) {
           return { status: 'unknown'};
       }

       const state = await job.getState();
       const progress = job.progress;
       const failedReason = job.failedReason;

       return {
           status: state as any,
           progress: typeof progress === 'number' ? progress : undefined,
           error: failedReason || undefined,
       };
   } catch ( error ) {
       console.error('Failed to get job status:', error);
       return { status: 'unknown' };
   }
}

/**
 * Close all queues gracefully
 * Call during application shutdown
 */
export async function closeQueues(): Promise<void> {
    if (documentQueue) {
        await documentQueue.close();
        documentQueue = null;
        console.log('Document queue closed');
    }
}