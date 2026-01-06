-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ENUM for document processing status
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'ready', 'error');

-- ============================================
-- Table 1: documents
-- Stores metadata about uploaded files
-- ============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processing_status processing_status DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for documents table
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- ============================================
-- Table 2: document_chunks
-- Stores text segments extracted from documents
-- ============================================
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for document_chunks table
CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_chunks_document_chunk ON document_chunks(document_id, chunk_index);
CREATE INDEX idx_chunks_page_number ON document_chunks(page_number) WHERE page_number IS NOT NULL;

-- ============================================
-- Table 3: embeddings
-- Stores vector representation of chunks
-- ============================================
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    embedding VECTOR(1536) NOT NULL,  -- OpenAI text-embedding-3-small dimension
    model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for embeddings table
CREATE INDEX idx_embeddings_chunk_id ON embeddings(chunk_id);

-- HNSW index for fast similarity search (cosine distance)
-- This is the magic that makes vector search FAST ⚡
CREATE INDEX idx_embeddings_vector ON embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================
-- Helper function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification: Check pgvector installation
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'pgvector extension installed: %', 
        (SELECT installed_version FROM pg_available_extensions WHERE name = 'vector');
END $$;
