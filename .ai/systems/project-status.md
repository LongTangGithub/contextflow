# ContextFlow Project Status

**Last Updated:** 2026-01-25
**Current Phase:** Week 1 - Document Processing Pipeline
**Active Branch:** `ContextFlow-10/aws-s3-setup`

---

## 🎯 Project Overview

**Mission:** Build an AI-powered research copilot that enables semantic search and question answering across developer documentation using RAG (Retrieval Augmented Generation).

**Target Users:** Developers researching technical topics across scattered documents (PDFs, markdown, text files)

**Key Value Prop:** Reduce research time by 35% through semantic search + AI synthesis with citations

---

## 📊 Current Status: Foundation Complete ✅

### **Completed Features**

#### ✅ Phase 0: UI Foundation (Completed Dec 30, 2025)
- [x] Document upload component with drag-and-drop
- [x] File validation (PDF, TXT, MD only, max 10MB)
- [x] Document list with filtering (All, PDF, TXT, MD)
- [x] Batch selection and bulk delete
- [x] Individual document deletion
- [x] Global toast notification system
- [x] State management via React Context API
- [x] Unified DocumentManager component

**Key Commits:**
- `feat(upload): add document upload component`
- `feat(documents): add document list component with filters`
- `feat(toast): implement complete toast notification system`
- `refactor: connect upload component to document list`

#### ✅ Phase 1: Database Infrastructure (Completed Jan 6, 2026)
- [x] PostgreSQL 16 with pgvector extension (v0.8.1)
- [x] Docker Compose setup on port 5433
- [x] Database schema with 3 tables:
  - `documents` - File metadata tracking (updated with extracted_text and metadata columns)
  - `document_chunks` - Text segments storage
  - `embeddings` - 1536-dimensional vectors
- [x] HNSW vector index for similarity search
- [x] Connection pooling (min: 2, max: 10)
- [x] Comprehensive test suite (8 automated tests)
- [x] Foreign key cascade deletes
- [x] Auto-updating timestamps
- [x] Schema extended for text extraction support (extracted_text TEXT, metadata JSONB)

**Key Metrics:**
- All 8 database tests passing ✅
- Vector similarity search functional ✅
- Query performance: <10ms for simple queries
- HNSW index built successfully

**Key Files Created:**
- `docker/docker-compose.yml`
- `docker/init-scripts/01-init-db.sql`
- `src/lib/db/connection.ts`
- `src/lib/db/test-db.ts`
- `.env.local`

#### ✅ Phase 2: Redis + AWS S3 Infrastructure (Completed Jan 25, 2026)
- [x] Redis 7 (Alpine) added to Docker Compose
- [x] Redis AOF persistence enabled for job queue durability
- [x] Redis healthcheck configured (redis-cli ping)
- [x] AWS SDK v3 dependencies installed (@aws-sdk/client-s3, @aws-sdk/lib-storage)
- [x] BullMQ + ioredis dependencies installed for job queue
- [x] S3 client implementation with lazy initialization pattern
- [x] S3 upload/download/delete utilities created
- [x] Presigned URL generation for temporary file access
- [x] Unique S3 key generation (timestamp + random + filename)
- [x] AWS credentials configured in .env.local
- [x] S3 integration tested (upload, download, delete verified)

**Key Metrics:**
- Redis running on port 6379 ✅
- AOF persistence enabled ✅
- S3 multipart upload working (automatic for files >5MB) ✅
- Upload/download/delete operations verified ✅

**Key Files Created:**
- `src/lib/storage/s3-client.ts` - AWS S3 integration utilities
- Updated `docker/docker-compose.yml` - Added Redis service
- Updated `.env.local` - Added AWS and Redis configuration

**Architecture Decisions:**
- Lazy S3 client initialization to prevent env var loading race conditions
- Singleton pattern for S3Client (connection reuse)
- Buffer-based file processing (works for documents <100MB)
- Private S3 bucket with presigned URLs (vs public bucket)
- AWS SDK v3 modular approach (smaller bundle size)

---

## 🔨 In Progress

### **Current Sprint: Document Processing Pipeline - Backend Integration**

**Goal:** Connect upload flow to S3 storage and database, then implement background processing

**Tasks Completed:**
- [x] Update database schema to support extracted text and metadata
- [x] Set up Redis for job queue (BullMQ)
- [x] Install AWS SDK and BullMQ dependencies
- [x] Create S3 client with upload/download/delete utilities
- [x] Configure AWS credentials in .env.local
- [x] Test S3 integration end-to-end

**Next Tasks (Week 1, Days 4-5):**
- [ ] Create database query functions (insert, get, update, delete documents)
- [ ] Set up BullMQ queue configuration
- [ ] Create background worker for document processing
- [ ] Implement POST /api/documents route (upload to S3 + enqueue job)
- [ ] Implement GET /api/documents route (list all from database)
- [ ] Implement GET /api/documents/[id] route (get single document)
- [ ] Implement DELETE /api/documents/[id] route (delete from S3 + database)
- [ ] Update DocumentUpload component to call API
- [ ] Update page.tsx to fetch documents from API
- [ ] Add polling mechanism for processing status updates
- [ ] Test full pipeline (upload → S3 → queue → extract → DB → UI update)

**Recent Progress:**
- ✅ Redis added to Docker Compose with AOF persistence
- ✅ AWS S3 integration complete with lazy initialization pattern
- ✅ S3 upload/download/delete operations verified
- ✅ PDF text extraction already implemented in `src/lib/pdf/extractor.ts` (from previous session)

**Blockers:**
- ⚠️ OpenAI API key not acquired yet (needed for embeddings - Week 1, Day 5)

---

## 📅 Roadmap

### **Week 1: Document Ingestion** (Current Week)
**Days 1-2:** ✅ Database setup (COMPLETE)
**Days 3-4:** 🔨 Text extraction + chunking (IN PROGRESS)
**Day 5:** OpenAI embeddings integration

**Deliverables:**
- Working document upload → text extraction → chunking → embedding → storage pipeline
- Documents persist with vector embeddings in database

---

### **Week 2: Semantic Search**
**Days 1-2:** Build semantic search API endpoint
**Days 3-4:** Add Redis caching layer
**Day 5:** Create search UI component

**Deliverables:**
- Functional semantic search with <2s response time
- Cache hit rate >80%
- Search UI with results display

**Key Metrics to Achieve:**
- 800ms → 120ms latency (via caching)
- Support 10,000+ document uploads

---

### **Week 3: RAG Question Answering**
**Days 1-3:** Implement RAG query system
**Day 4:** Add citation tracking
**Day 5:** UI polish + metrics dashboard

**Deliverables:**
- AI-powered question answering with sources
- Citation extraction showing document + page number
- Performance metrics dashboard

**Key Metrics to Achieve:**
- 95% cache hit rate
- 35% reduction in research time (user testing)

---

## 🏗️ Architecture Status

### **Current Tech Stack:**
- **Frontend:** Next.js 16, React 19.2, TypeScript, Tailwind CSS v4
- **Database:** PostgreSQL 16 + pgvector 0.8.1 (Docker, port 5433)
- **Cache/Queue:** Redis 7 (Alpine, Docker, port 6379)
- **Cloud Storage:** AWS S3 (private bucket with presigned URLs)
- **Job Queue:** BullMQ (Redis-backed)
- **State Management:** React Context API
- **Styling:** Tailwind v4 (beta)
- **Infrastructure:** Docker Compose (local dev)

### **Completed Integrations:**
- ✅ AWS S3 via SDK v3 (@aws-sdk/client-s3, @aws-sdk/lib-storage)
- ✅ Redis 7 with AOF persistence
- ✅ BullMQ + ioredis for job queue
- ✅ PDF parsing (pdfjs-dist) - already implemented

### **Pending Integrations:**
- ⏳ OpenAI embeddings API (text-embedding-3-small) - Week 1, Day 5
- ⏳ Claude/GPT for RAG (Week 3)
- ⏳ Redis caching for search results (Week 2)

---

## 🐛 Known Issues & Technical Debt

### **Active Issues:**
- None currently blocking development ✅

### **Technical Debt:**
- [ ] Add database migration system (consider Drizzle ORM)
- [ ] Implement retry logic for OpenAI API calls
- [ ] Add rate limiting for embeddings generation
- [ ] Create seed data for development
- [ ] Add E2E tests for upload flow

### **Performance Notes:**
- Docker startup time: ~10 seconds (acceptable)
- Initial HNSW index build: <1 second for test data
- Will need to monitor index build time at scale (10k+ docs)

---

## 📈 Metrics & Goals

### **Target Metrics:**
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Documents processed | 10,000+ | 0 | 🔴 Not started |
| Search latency | <2s | N/A | 🔴 Not built |
| Cache hit rate | 95% | N/A | 🔴 Not built |
| Lighthouse score | 95+ | 100 | ✅ Achieved |
| Research time reduction | 35% | N/A | 🔴 Needs testing |

### **Portfolio Goals:**
- ✅ Demonstrate RAG pipeline implementation
- ✅ Show vector database expertise
- ✅ Production-ready code quality
- ✅ Comprehensive testing
- ⏳ Performance optimization documentation

---

## 🔐 Environment Setup

### **Required Environment Variables:**
```bash
# Database (configured ✅)
DATABASE_URL=postgresql://contextflow:***@localhost:5433/contextflowdb
POSTGRES_USER=contextflow
POSTGRES_PASSWORD=***
POSTGRES_DB=contextflowdb
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# AWS S3 (configured ✅)
AWS_REGION=us-east-1
AWS_S3_BUCKET=contextflow-dev-documents
AWS_ACCESS_KEY_ID=AKIA***
AWS_SECRET_ACCESS_KEY=***

# Redis (configured ✅)
REDIS_HOST=localhost  # For Docker: localhost
REDIS_PORT=6379

# OpenAI (pending ⏳)
OPENAI_API_KEY=sk-proj-***  # Not yet acquired
```

### **Infrastructure Services:**
- **PostgreSQL:** localhost:5433 (Docker: contextflow-postgres)
- **Redis:** localhost:6379 (Docker: contextflow-redis)
- **AWS S3 Bucket:** contextflow-dev-documents (us-east-1)
- **pgAdmin:** localhost:5050 (Optional, use `--profile tools`)

---

## 🚀 Quick Start Commands

### **Development:**
```bash
# Start all infrastructure (PostgreSQL + Redis)
npm run db:start

# Run database tests
npm run db:test

# Start Next.js dev server
npm run dev

# View logs
npm run db:logs           # PostgreSQL logs
docker logs contextflow-redis -f  # Redis logs
```

### **Database Management:**
```bash
# Stop all services (PostgreSQL + Redis)
npm run db:stop

# Reset database (wipe all data)
npm run db:reset

# Access PostgreSQL shell
docker exec -it contextflow-postgres psql -U contextflow -d contextflowdb

# Access Redis CLI
docker exec -it contextflow-redis redis-cli

# Check Redis status
docker exec contextflow-redis redis-cli ping  # Should return PONG
docker exec contextflow-redis redis-cli CONFIG GET appendonly  # Should return "yes"
```

### **AWS S3 Testing:**
```bash
# Test S3 integration (create test-s3.ts with dotenv)
import { config } from 'dotenv';
import { uploadFile, generateS3Key } from './src/lib/storage/s3-client';

config({ path: '.env.local' });
const key = generateS3Key('test.txt');
await uploadFile(Buffer.from('Test'), key);
```

### **Verify Infrastructure:**
```bash
# Check running containers
docker ps
# Should see: contextflow-postgres (5433) and contextflow-redis (6379)

# Check volumes
docker volume ls | grep contextflow
# Should see: postgres_data and redis_data
```

---

## 📝 Recent Decisions

### **Architecture Decisions:**
1. **Port 5433 for PostgreSQL** - Avoids conflict with existing fitness-tracker database on 5432
2. **pgvector over dedicated vector DB** - Simpler architecture, sufficient for target scale (<10M vectors)
3. **HNSW index** - Better accuracy than IVFFlat, handles dynamic inserts well
4. **Three-table schema** - Normalized design, enables efficient cascade deletes
5. **Docker Compose locally** - Full control, zero cost, better for learning
6. **Schema Update (Jan 6, 2026)** - Added `extracted_text` (TEXT) and `metadata` (JSONB) columns to `documents` table:
   - `extracted_text` stores processed document content (unlimited length)
   - `metadata` uses JSONB for efficient querying vs plain JSON
   - Both nullable to support gradual data population during processing
7. **Redis 7 Alpine (Jan 25, 2026)** - Lightweight Redis for BullMQ job queue:
   - AOF persistence enabled (`--appendonly yes`) for job queue durability
   - Prevents job loss on Redis crashes/restarts
   - Trade-off: ~10-20% performance cost for data safety
8. **AWS S3 for File Storage (Jan 25, 2026)** - Cloud storage vs local filesystem:
   - Scalable, durable (11 9's), works in serverless environments
   - Private bucket + presigned URLs for security
   - Multipart upload support (automatic for files >5MB)
   - Cost: ~$0.023/GB/month (free tier: 5GB)
9. **Lazy S3 Client Initialization (Jan 25, 2026)** - Critical pattern for env var loading:
   - S3Client created on first use, not at module load time
   - Prevents "credentials not valid" errors from env var timing issues
   - Works in any context (Next.js, standalone scripts, tests)
10. **AWS SDK v3 Modular Approach (Jan 25, 2026)** - Tree-shakeable imports:
    - `@aws-sdk/client-s3` instead of full `aws-sdk` v2
    - 5MB vs 50MB+ bundle size reduction
    - Faster deployments, lower memory footprint
11. **BullMQ over Bull (Jan 25, 2026)** - Modern Redis-based job queue:
    - Written in TypeScript, better type safety
    - Improved performance and features vs original Bull
    - Built on ioredis (faster than node-redis)

### **Deferred Decisions:**
- ORM selection (currently using raw SQL with pg - consider Drizzle for migrations)
- Chunking strategy (semantic vs fixed-size) - will decide during implementation
- Embedding model (text-embedding-3-small vs 3-large) - lean toward 3-small for speed
- Deployment platform (Vercel vs Railway vs self-hosted) - Vercel likely for Next.js
- S3 file retention policy (delete after extraction vs keep for re-downloads)
- BullMQ retry strategy (exponential backoff config, max retries)

---

## 🎓 Learning Objectives (Met So Far)

- ✅ Vector databases and similarity search (pgvector)
- ✅ Docker containerization and orchestration (PostgreSQL + Redis multi-container)
- ✅ PostgreSQL schema design with foreign keys
- ✅ Connection pooling patterns
- ✅ React state management at scale
- ✅ AWS S3 integration and best practices
- ✅ Multipart file uploads to S3
- ✅ Presigned URLs for temporary access
- ✅ Redis as job queue backing store
- ✅ BullMQ job queue architecture
- ✅ Lazy initialization patterns for env vars
- ✅ AWS SDK v3 modular approach
- ✅ Module loading order and timing issues
- ⏳ Background worker implementation
- ⏳ Async job processing patterns
- ⏳ RAG architecture
- ⏳ Embedding generation and optimization
- ⏳ Caching strategies (Redis for search results)

---

## 📞 Context for New Sessions

**When starting a new conversation with Claude:**

1. **Current Phase:** Week 1, Days 4-5 - Backend Integration (Database + API Routes + Background Workers)
2. **Last Completed:**
   - Redis infrastructure setup in Docker (port 6379, AOF persistence)
   - AWS S3 integration complete (`src/lib/storage/s3-client.ts`)
   - BullMQ + ioredis dependencies installed
   - S3 upload/download/delete operations tested and verified
   - AWS credentials configured in `.env.local`
3. **Next Step:** Create database query functions (`src/lib/db/documents.ts`) - **Task 4**
4. **Key Context:**
   - **PostgreSQL:** Running on port 5433 (3 tables: documents, document_chunks, embeddings)
   - **Redis:** Running on port 6379 (AOF enabled, ready for BullMQ)
   - **AWS S3:** Bucket `contextflow-dev-documents` in us-east-1 (tested working)
   - **PDF Extraction:** Already implemented in `src/lib/pdf/extractor.ts`
   - **Branch:** `ContextFlow-10/aws-s3-setup`
   - **OpenAI API key:** Still needed (Week 1, Day 5 for embeddings)

**Infrastructure Status:**
- ✅ Docker Compose running PostgreSQL + Redis
- ✅ S3 client with lazy initialization pattern
- ✅ Environment variables configured (.env.local)
- ⏳ Database query layer (next task)
- ⏳ BullMQ queue setup
- ⏳ Background worker
- ⏳ API routes

**Quick Orientation:**
- Project root: `/Users/l.t/Developer/contextflow`
- Database files: `src/lib/db/`
- Storage utilities: `src/lib/storage/s3-client.ts` ← NEW
- PDF extraction: `src/lib/pdf/extractor.ts`
- Components: `src/components/features/`
- Docker config: `docker/docker-compose.yml` (PostgreSQL + Redis)
- Env vars: `.env.local` (DATABASE_URL, AWS_*, REDIS_*)

**Task Roadmap (Remaining):**
1. **Task 4:** Database query functions (insert, get, update, delete)
2. **Task 5:** BullMQ queue configuration (`src/lib/queue/document-queue.ts`)
3. **Task 6:** Background worker (`src/lib/queue/worker.ts`)
4. **Task 7-10:** API routes (POST, GET, GET/:id, DELETE)
5. **Task 11-12:** Update UI components to use API
6. **Task 13:** Polling for processing status
7. **Task 15:** End-to-end pipeline test

**Critical Notes for Next Session:**
- S3 client uses **lazy initialization** - don't create client at module top-level
- Redis is ready but BullMQ not configured yet
- PDF extractor exists but not integrated with S3 download yet
- User is learning step-by-step - guide through each task with explanations

---

## 🏆 Success Criteria

### **MVP Complete When:**
- [x] User can upload documents ✅
- [x] Documents persist in database ✅
- [ ] Text extracted from PDFs
- [ ] Embeddings generated and stored
- [ ] Semantic search returns relevant results
- [ ] AI provides answers with citations

### **Portfolio Ready When:**
- [ ] 10,000+ test documents processed
- [ ] Performance metrics documented
- [ ] Architecture diagram created
- [ ] Demo video recorded
- [ ] README with clear setup instructions
- [ ] Deployed to production

---

## 📚 Documentation Status

- [x] Database schema documented (in SQL comments)
- [x] Connection utility documented (JSDoc)
- [x] Test suite documented
- [ ] API endpoints (not built yet)
- [ ] Component documentation
- [ ] Architecture diagram
- [ ] User guide

---

## 🚨 Important Notes for Next Session

### **Critical Info:**
1. **S3 Lazy Initialization Required:** Always use `getS3Client()` and `getBucketName()` - never create S3Client at module top level
2. **Environment Loading:** Use `dotenv` with `.env.local` for standalone scripts outside Next.js
3. **Redis AOF Enabled:** Job queue data persists across container restarts
4. **Tested & Working:** S3 upload (64 bytes), download, delete all verified
5. **Branch:** `ContextFlow-10/aws-s3-setup` - ready for PR after Task 4 complete

### **Files Modified This Session:**
- `docker/docker-compose.yml` - Added Redis service + redis_data volume
- `package.json` - Added AWS SDK, BullMQ, ioredis dependencies
- `.env.local` - Added AWS_* and REDIS_* variables
- **NEW:** `src/lib/storage/s3-client.ts` - Complete S3 integration

### **Next Immediate Steps:**
1. Start with **Task 4: Database Query Functions** (`src/lib/db/documents.ts`)
2. Implement: `insertDocument()`, `getDocuments()`, `getDocumentById()`, `updateDocument()`, `deleteDocument()`
3. Use connection pool from `src/lib/db/connection.ts`
4. Handle `processing_status` enum: 'pending', 'processing', 'completed', 'failed'

---

**End of Status Document**

---

*This file should be updated at the end of each work session or major milestone.*

*Last session: Jan 25, 2026 - Completed Redis + AWS S3 infrastructure setup (Tasks 1-3)*