# System Architecture

## Project Overview

**ContextFlow** is a Research Copilot for Developers - an AI-powered research synthesis tool that enables developers to upload, manage, and intelligently search through research documents using vector embeddings and semantic search.

### Core Value Proposition
- Upload research documents (PDF, TXT, MD)
- Automatic document processing and chunking
- Vector embeddings for semantic search
- AI-powered research synthesis and insights

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │  Next.js   │  │  Tailwind  │            │
│  │  (v19.2)   │  │  (v16.0)   │  │   (v4.1)   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Next.js App Router                     │     │
│  │  • Server Components    • API Routes               │     │
│  │  • Client Components    • Server Actions           │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   pgvector   │  │   OpenAI     │      │
│  │   (v16.11)   │  │   (v0.8.1)   │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Application Architecture

### Next.js App Router Structure

```
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home page with document management
├── globals.css             # Global styles and Tailwind config
└── api/                    # API routes (future)
    ├── documents/          # Document CRUD endpoints
    ├── search/             # Vector search endpoints
    └── embeddings/         # Embedding generation
```

### Component Architecture

```
src/components/
├── features/               # Feature-specific components
│   ├── document-upload/
│   │   └── DocumentUpload.tsx
│   │       • Drag-and-drop file upload
│   │       • File validation (type, size)
│   │       • Preview and management
│   │
│   └── document-list/
│       └── DocumentList.tsx
│           • Document display with filtering
│           • Batch selection (shift-click)
│           • Bulk delete with confirmation
│           • Relative time formatting
│
└── ui/                     # Reusable UI components
    └── ToastContainer.tsx
        • Position management
        • Progress bars and animations
        • Pause on hover
        • Action buttons
```

### Library Layer

```
src/lib/
├── db/
│   ├── connection.ts       # Database connection pool
│   └── test-db.ts          # Database test suite
│
├── toast-context.tsx       # Global toast state management
└── utils.ts                # Shared utilities (cn)
```

## Database Architecture

### Schema Design

```
┌─────────────────────────────────────────────────────────────┐
│                      documents                               │
├─────────────────┬───────────────────────────────────────────┤
│ id              │ UUID (PK)                                  │
│ name            │ TEXT                                       │
│ size            │ BIGINT                                     │
│ type            │ TEXT                                       │
│ uploaded_at     │ TIMESTAMP WITH TIME ZONE                  │
│ processing_status│ ENUM (pending, processing, ready, error) │
│ error_message   │ TEXT (nullable)                           │
│ created_at      │ TIMESTAMP WITH TIME ZONE                  │
│ updated_at      │ TIMESTAMP WITH TIME ZONE                  │
└─────────────────┴───────────────────────────────────────────┘
                            ↓ 1:N
┌─────────────────────────────────────────────────────────────┐
│                    document_chunks                           │
├─────────────────┬───────────────────────────────────────────┤
│ id              │ UUID (PK)                                  │
│ document_id     │ UUID (FK → documents.id)                  │
│ content         │ TEXT                                       │
│ chunk_index     │ INTEGER                                    │
│ page_number     │ INTEGER (nullable)                        │
│ token_count     │ INTEGER (nullable)                        │
│ metadata        │ JSONB                                      │
│ created_at      │ TIMESTAMP WITH TIME ZONE                  │
└─────────────────┴───────────────────────────────────────────┘
                            ↓ 1:1
┌─────────────────────────────────────────────────────────────┐
│                       embeddings                             │
├─────────────────┬───────────────────────────────────────────┤
│ id              │ UUID (PK)                                  │
│ chunk_id        │ UUID (FK → document_chunks.id)            │
│ embedding       │ VECTOR(1536)                              │
│ model           │ TEXT (default: text-embedding-3-small)    │
│ created_at      │ TIMESTAMP WITH TIME ZONE                  │
└─────────────────┴───────────────────────────────────────────┘
```

### Database Relationships

- **documents → document_chunks**: One-to-Many with CASCADE delete
- **document_chunks → embeddings**: One-to-One with CASCADE delete
- When a document is deleted, all associated chunks and embeddings are automatically removed

### Indexing Strategy

#### B-tree Indexes (for exact/range queries)
```sql
idx_documents_uploaded_at     ON documents(uploaded_at DESC)
idx_documents_status          ON documents(processing_status)
idx_documents_created_at      ON documents(created_at DESC)
idx_document_chunks_document_id  ON document_chunks(document_id)
idx_chunks_document_chunk     ON document_chunks(document_id, chunk_index)
idx_chunks_page_number        ON document_chunks(page_number) WHERE NOT NULL
idx_embeddings_chunk_id       ON embeddings(chunk_id)
```

#### HNSW Index (for vector similarity search)
```sql
idx_embeddings_vector         ON embeddings USING hnsw
                              (embedding vector_cosine_ops)
                              WITH (m = 16, ef_construction = 64)
```

**HNSW Parameters:**
- `m = 16`: Number of bi-directional links per node (balance between recall and build time)
- `ef_construction = 64`: Size of candidate list during index construction (higher = better quality)

## State Management Architecture

### Global State: React Context

```
┌────────────────────────────────────────────────────────┐
│                    ToastProvider                        │
│  ┌──────────────────────────────────────────────┐     │
│  │  State: toasts[]                              │     │
│  │  Actions: addToast(), removeToast()          │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
                        ↓ Provides
┌────────────────────────────────────────────────────────┐
│              Root Layout (app/layout.tsx)              │
│  ┌──────────────────────────────────────────────┐     │
│  │           All Child Components                │     │
│  │  • Can call useToast() hook                  │     │
│  │  • Access addToast() and removeToast()       │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

### Page-Level State

```typescript
// src/app/page.tsx
const [documents, setDocuments] = useState<Document[]>([]);

// Passed down to child components
<DocumentList
  documents={documents}
  onDelete={handleDelete}
/>
```

### Component-Level State

```typescript
// Local UI state (file previews, drag state, etc.)
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [isDragging, setIsDragging] = useState(false);
```

## Data Flow Patterns

### File Upload Flow

```
User Action (Drop/Select Files)
         ↓
DocumentUpload Component
         ↓
   Validation (type, size)
         ↓
    ┌─────┴─────┐
    │           │
  Valid      Invalid
    │           │
    ↓           ↓
Preview    Error Toast
    │
    ↓
[Upload Button Click]
    │
    ↓
API Route (future)
    │
    ↓
Save to PostgreSQL
    │
    ↓
Queue for Processing
    │
    ↓
Success Toast
    │
    ↓
Update Parent State
    │
    ↓
DocumentList Re-renders
```

### Vector Search Flow (Planned)

```
User Query
    ↓
API Route: /api/search
    ↓
Generate Query Embedding (OpenAI)
    ↓
Vector Similarity Search (pgvector)
    │
    ├─ Query: SELECT * FROM embeddings
    │          ORDER BY embedding <=> $query_vector
    │          LIMIT 10
    ↓
JOIN with document_chunks + documents
    ↓
Return Ranked Results
    ↓
Display to User
```

## Document Processing Pipeline (Planned)

```
Document Upload
    ↓
1. Save to PostgreSQL
   • Status: pending
   • Store metadata
    ↓
2. Extract Text
   • PDF → text extraction
   • TXT/MD → direct read
    ↓
3. Chunk Document
   • Split by tokens (e.g., 512 tokens)
   • Maintain context overlap (e.g., 50 tokens)
   • Store in document_chunks
    ↓
4. Generate Embeddings
   • Call OpenAI API (text-embedding-3-small)
   • Store 1536-dim vectors in embeddings table
    ↓
5. Update Document Status
   • Status: ready
   • Enable for search
    ↓
Error Handling
   • Status: error
   • Store error_message
```

## Connection Pool Architecture

```typescript
// Singleton Pattern
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,                    // Max connections
      min: 2,                     // Min connections
      idleTimeoutMillis: 30000,   // Close idle after 30s
      connectionTimeoutMillis: 2000 // Error after 2s
    });
  }
  return pool;
}
```

**Benefits:**
- Reuses connections across requests
- Reduces connection overhead
- Handles connection errors gracefully
- Automatic cleanup of idle connections

## API Architecture (Planned)

### RESTful Endpoints

```
POST   /api/documents              # Upload document
GET    /api/documents              # List all documents
GET    /api/documents/:id          # Get document details
DELETE /api/documents/:id          # Delete document
POST   /api/search                 # Vector similarity search
GET    /api/documents/:id/chunks   # Get document chunks
```

### Request/Response Flow

```
Client Request
    ↓
Next.js API Route Handler
    ↓
Validation & Auth (future)
    ↓
Database Query (via connection pool)
    ↓
Transform Data
    ↓
JSON Response
    ↓
Client Updates UI
```

## Toast Notification System

### Architecture

```
┌────────────────────────────────────────────────────────┐
│                 ToastProvider (Context)                 │
│  State: { toasts: Toast[], position: Position }       │
└────────────────────────────────────────────────────────┘
                        ↓ Renders
┌────────────────────────────────────────────────────────┐
│               ToastContainer Component                  │
│  • Positions toasts (4 corners)                        │
│  • Manages animations (enter/exit)                     │
│  • Handles auto-dismiss timers                         │
│  • Pause on hover                                      │
└────────────────────────────────────────────────────────┘
                        ↓ Renders
┌────────────────────────────────────────────────────────┐
│              Individual Toast Components                │
│  • Type-based styling (success, error, warning, info) │
│  • Progress bar                                        │
│  • Action buttons                                      │
│  • Close button                                        │
└────────────────────────────────────────────────────────┘
```

### Toast Types & Use Cases

| Type    | Color  | Icon | Use Case                          |
|---------|--------|------|-----------------------------------|
| success | green  | ✓    | Upload complete, data saved       |
| error   | red    | ✗    | Upload failed, validation error   |
| warning | yellow | ⚠    | Large file, slow connection       |
| info    | blue   | ℹ    | Processing started, queue update  |

## Security Architecture

### Input Validation Layers

```
1. Client-Side (DocumentUpload)
   • File type validation
   • File size validation
   • Preview validation
         ↓
2. API Route (future)
   • Re-validate on server
   • Sanitize file names
   • Check file content
         ↓
3. Database Layer
   • Parameterized queries
   • Type constraints
   • Foreign key constraints
```

### SQL Injection Prevention

```typescript
// ✅ Parameterized Query (Safe)
query('SELECT * FROM documents WHERE id = $1', [id]);

// ❌ String Concatenation (Vulnerable)
query(`SELECT * FROM documents WHERE id = '${id}'`);
```

### Environment Security

- Secrets in `.env.local` (git-ignored)
- Database credentials never in code
- API keys loaded at runtime
- No client-side exposure of secrets

## Performance Optimization

### Database Query Performance

1. **Connection Pooling**: Reuse connections (2-10 concurrent)
2. **Indexing**: B-tree for exact/range, HNSW for vectors
3. **Query Monitoring**: Log slow queries >100ms
4. **Prepared Statements**: Parameterized queries for plan caching

### Frontend Performance

1. **Static Generation**: Pre-render pages where possible
2. **Code Splitting**: Next.js automatic code splitting
3. **Image Optimization**: Next.js Image component (future)
4. **React 19 Features**: Concurrent rendering, transitions

### Vector Search Performance

```sql
-- HNSW Index provides O(log n) search complexity
-- vs O(n) for sequential scan

EXPLAIN ANALYZE
SELECT content, embedding <=> $1 as distance
FROM embeddings
ORDER BY distance
LIMIT 10;

-- With HNSW: ~10ms for 100k vectors
-- Without: ~1000ms for 100k vectors
```

## Scalability Considerations

### Current Scale (MVP)
- Single PostgreSQL instance
- Connection pool (max 10)
- In-memory Next.js server

### Future Scale
- Read replicas for query distribution
- Redis caching layer
- Background job queue (Bull/BullMQ)
- CDN for static assets
- Horizontal scaling with load balancer

## Error Handling Architecture

### Error Flow

```
Error Occurs
    ↓
Try-Catch Block
    ↓
    ├─→ Database Error
    │   • Log query context
    │   • Show user-friendly message
    │   • Rollback transaction
    │
    ├─→ Validation Error
    │   • Return specific error
    │   • Show via toast
    │   • Allow retry
    │
    └─→ Unexpected Error
        • Log stack trace
        • Generic user message
        • Alert monitoring (future)
```

### Error Categories

1. **User Errors**: Invalid input, file too large
   - Show specific message
   - Suggest correction

2. **System Errors**: Database down, network error
   - Log for debugging
   - Generic user message
   - Retry mechanism

3. **Integration Errors**: OpenAI API failure
   - Queue for retry
   - Update processing status
   - Notify user

## Development Workflow

### Local Development

```bash
# 1. Start database
npm run db:start

# 2. Run tests
npm run db:test

# 3. Start dev server
npm run dev

# 4. View database (optional)
npm run db:pgadmin
# Access at http://localhost:5050
```

### Database Management

```bash
# View logs
npm run db:logs

# Reset database (destructive!)
npm run db:reset

# Stop database
npm run db:stop
```

## Future Architecture Enhancements

### Phase 1: AI Integration
- OpenAI API integration for embeddings
- Streaming responses for chat
- Token usage tracking

### Phase 2: Advanced Search
- Hybrid search (vector + full-text)
- Filters (date, document type, etc.)
- Search result ranking

### Phase 3: Collaboration
- User authentication (NextAuth.js)
- Multi-user workspaces
- Document sharing

### Phase 4: Processing Pipeline
- Background job queue
- PDF parsing improvements
- OCR for scanned documents
- Support for more file types

### Phase 5: Analytics
- Usage tracking
- Search analytics
- Performance monitoring
- Error tracking (Sentry)

## Deployment Architecture (Future)

```
┌──────────────────────────────────────────────────┐
│                   Vercel Edge                     │
│  • Next.js hosting                               │
│  • Automatic scaling                             │
│  • Global CDN                                    │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│            PostgreSQL (Managed)                   │
│  • AWS RDS / Supabase / Railway                  │
│  • Automatic backups                             │
│  • pgvector extension                            │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│              Redis (Managed)                      │
│  • Upstash / Redis Cloud                         │
│  • Caching layer                                 │
│  • Session storage                               │
└──────────────────────────────────────────────────┘
```

## Monitoring & Observability (Planned)

- **Logging**: Winston or Pino for structured logs
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Error Tracking**: Sentry
- **Uptime**: UptimeRobot or Pingdom
- **Database**: pg_stat_statements for query analysis

## Testing Strategy (Future)

### Unit Tests
- Utility functions
- Database connection helpers
- Toast context logic

### Integration Tests
- API endpoints
- Database queries
- File upload flow

### E2E Tests
- Full user workflows
- Search functionality
- Document management

### Performance Tests
- Load testing (k6)
- Vector search benchmarks
- Connection pool stress tests
