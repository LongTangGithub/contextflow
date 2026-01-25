import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * AWS S3 Configuration
 * Uses lazy initialization to ensure environment variables are loaded
 */
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }
    return s3Client;
}

function getBucketName(): string {
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
        throw new Error('AWS_S3_BUCKET environment variable is not set');
    }
    return bucketName;
}

/**
 * Upload a file to S3
 * Uses multipart upload for files > 5MB (automatic with @aws-sdk/lib-storage)
 * 
 * @param file - The file to upload (File object or Buffer)
 * @param key - S3 key (path) for the file
 * @returns Object with key and url
 */
export async function uploadFile(
    file: File | Buffer,
    key: string
): Promise<{key: string; url: string}> {
    try {
        // Convert File to Buffer if needed
        const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

        // Use Upload for multipart upload support
        const upload = new Upload({
            client: getS3Client(),
            params: {
                Bucket: getBucketName(),
                Key: key,
                Body: buffer,
                ContentType: file instanceof File ? file.type : 'application/octet-stream',
            },
        });

        // Track upload progress (optional - can add event listeners)
        upload.on('httpUploadProgress', (progress) => {
            console.log(`Upload progress: ${progress.loaded}/${progress.total} bytes`);
        });

        // Execute upload
        await upload.done();

        // Construct URL
        const url = `https://${getBucketName()}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
        
        return { key, url };
    } catch ( error ) {
        console.error('S3 upload error:', error);
        throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Download a file from S3 
 * Used by background worker to retrieve file for processing
 * 
 * @param key - S3 key of the file
 * @returns File content as Buffer
 */
export async function downloadFile(key: string): Promise<Buffer> {
    try {
        const command = new GetObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        const response = await getS3Client().send(command);

        // Convert stream to buffer
        if (!response.Body) {
            throw new Error('Empty response from S3');
        }

        const chunks: Uint8Array[] = [];
        for await ( const chunk of response.Body as any ) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);
    } catch ( error ) {
        console.error('S3 download error:', error);
        throw new Error(`Failed to download file from S3: ${error instanceof Error ? error.message : 'Uknown error'}`);
    }
}

/**
 * Delete a file from S3
 * Called when user deletes a document
 * 
 * @param key - S3 key of the file to delete
 */
export async function deleteFile(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        await getS3Client().send(command);
        console.log(`Deleted file from S3: ${key}`);
    } catch ( error ) {
        console.error('S3 delete error:', error);
        throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a presigned URL for temporary file access
 * USeful for allowing users to download original files without making bucket public
 * 
 * @param key - S3 key of the file
 * @param expiresIn - URL expiration time in seconds ( default: 1 hour )
 * @returns Presigned URL
 */
export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: getBucketName(),
            Key: key,
        });

        const url = await getSignedUrl(getS3Client(), command, { expiresIn });
        return url;
    } catch ( error ) {
        console.error('S3 presigned URL error:', error);
        throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a unique S3 key for a file
 * Format: documents/{timestamp}-{random}-{filename}
 * 
 * @param filename - Original filename
 * @returns Unique S3 key
 */
export function generateS3Key(filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `documents/${timestamp}-${randomString}-${sanitizedFilename}`;
}