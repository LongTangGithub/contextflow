import { query } from './connection';

/**
 * document.ts will export:
 * Typescript interfaces for type safety
 * 5 CRUD operations for document management
 * Proper error handling and logging
 */

/**
 * TypeScript Types for Documents
 */
export interface Document {
    id: string;                                 // UUID
    name: string;                              // Filename
    size: number;                             // File size in bytes
    type: string;                            // MIME type (application/pdf, text/plain, etc)
    uploaded_at: Date;                      // When file was uploaded
    processing_status: ProcessingStatus;   // Current Status
    error_message: string | null;         // Error details if status is 'error'
    extracted_text: string | null;       // Full text extracted from PDF
    metadata: Record<string, any> | null;  // JSONB - stores s3_key, s3_url, etc
    created_at: Date;
    updated_at: Date;                   // Auto-updated via database trigger
}

export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface InsertDocumentData {
    name: string;
    size: number;
    type: string;
    s3_key: string;     // S3 object key for later retrieval
    s3_url: string;    // Full S3 URL (can regenerate with presigned URLs later)
}

export interface UpdateDocumentData {
    processing_status?: ProcessingStatus;
    error_message?: string;
    extracted_text?: string;
    metadata?: Record<string, any>;
}

/**
 * CRUD Functions
 */

// Insert a new document record - Called after S3 upload succeeds
export async function insertDocument(data: InsertDocumentData): Promise<Document> {
    // Store S3 info in metadata JSONB column
    const metadata = {
        s3_key: data.s3_key,
        s3_url: data.s3_url,
    };

    const result = await query<Document>(
        `
            INSERT INTO documents (name, size, type, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `,
        [data.name, data.size, data.type, JSON.stringify(metadata)]
    );
    return result.rows[0];
}

/**
 * Get all documents ordered by most recent first
 * Used by document list UI
 */
export async function getDocuments(): Promise<Document[]> {
    const result = await query<Document>(
        `
            SELECT * FROM documents 
            ORDER BY created_at DESC
        `
    );
    return result.rows;
}

/**
 * Get a single document by ID
 * Returns null if not found
 */
export async function getDocumentById(id: string): Promise<Document | null> {
    const result = await query<Document>(
        `
            SELECT * FROM documents 
            WHERE id = $1
        `,
        [id]
    );
    return result.rows[0] || null;
}

/**
 * Update document fields (typically called by background worker)
 * Only updates fields that are provided in the updates object
 */
export async function updateDocument(
    id: string,
    updates: UpdateDocumentData
): Promise<void> {
    // Build dynamic UPDATE query - only update provided fields
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.processing_status !== undefined) {
        fields.push(`processing_status = $${paramCount++}`);
        values.push(updates.processing_status);
    }

    if (updates.error_message !== undefined) {
        fields.push(`error_message = $${paramCount++}`);
        values.push(updates.error_message);
    }

    if (updates.extracted_text !== undefined) {
        fields.push(`extracted_text = $${paramCount++}`);
        values.push(updates.extracted_text);
    }

    if (updates.metadata !== undefined) {
        fields.push(`metadata = $${paramCount++}`);
        values.push(JSON.stringify(updates.metadata));
    }

    // If no fields to update, return early
    if (fields.length === 0) return;

    // Add id as the last parameter
    values.push(id);

    await query(
        `
            UPDATE documents
            SET ${fields.join(', ')}
            WHERE id = $${paramCount}
        `,
        values
    );
}

/**
 * Delete a document by ID
 * CASCADE will automatically delete related chunks and embeddings
 */
export async function deleteDocument(id: string): Promise<void> {
    await query(
        `
            DELETE FROM documents
            WHERE id = $1    
        `,
        [id]
    );
}