# Technology Stack

## Overview
ContextFlow is a Research Copilot for Developers - an AI-powered research synthesis tool with modern web technologies and vector database capabilities.

## Frontend Stack

### Core Framework
- **Next.js**: 16.0.0 (App Router)
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - File-based routing with App Router
  - Built-in API routes
  - Turbopack for fast development builds

### React
- **Version**: 19.2.0 (latest)
- **Features**:
  - React Server Components
  - Concurrent rendering
  - Automatic batching
  - Transitions API

### TypeScript
- **Version**: 5.9.3
- **Configuration**: Strict mode enabled
- **Module Resolution**: Bundler strategy
- **JSX**: `react-jsx` runtime
- **Path Aliases**: `@/*` maps to `src/*`

### Styling
- **Tailwind CSS**: 4.1.16
  - New `@theme` directive syntax
  - `oklch()` color space for better perceptual uniformity
  - Dark mode prepared (currently commented out)
  - Custom CSS variables for semantic colors
- **PostCSS**: 8.5.6
- **Supporting Libraries**:
  - `tailwind-merge`: 3.3.1 - Merge Tailwind classes intelligently
  - `clsx`: 2.1.1 - Conditional class names
  - `class-variance-authority`: 0.7.1 - Component variants

### UI Components
- **lucide-react**: 0.548.0 - Icon library
- Custom components built with Tailwind CSS
- Toast notification system with React Context

## Backend Stack

### Database
- **PostgreSQL**: 16.11
  - Running in Docker container
  - Port: 5433 (mapped to avoid conflicts)
  - Image: `pgvector/pgvector:pg16`

### Vector Database Extension
- **pgvector**: 0.8.1
  - Vector similarity search
  - HNSW indexing for fast cosine distance queries
  - Support for 1536-dimensional embeddings (OpenAI text-embedding-3-small)

### Database Client
- **pg**: 8.16.3
  - Native PostgreSQL client for Node.js
  - Connection pooling (min: 2, max: 10)
  - Parameterized queries for SQL injection prevention
  - **@types/pg**: 8.16.0 - TypeScript definitions

### Environment Management
- **dotenv**: 17.2.3
  - Load environment variables from `.env.local`
  - Used for database credentials and API keys

## Development Tools

### Build Tools
- **Turbopack**: Built into Next.js 16
- **PostCSS**: For Tailwind CSS processing

### Linting & Code Quality
- **ESLint**: 9.38.0
- **eslint-config-next**: 16.0.0
- TypeScript compiler for type checking

### TypeScript Execution
- **tsx**: 4.21.0
  - Execute TypeScript files directly
  - Used for database test scripts

### Container Management
- **Docker Compose**: For PostgreSQL and pgAdmin
- **Docker Images**:
  - `pgvector/pgvector:pg16` - PostgreSQL with vector extension
  - `dpage/pgadmin4:latest` - Database management UI (optional)

## AI/ML Stack (Planned)

### Embeddings
- **OpenAI API** (to be integrated)
  - Model: `text-embedding-3-small`
  - Dimension: 1536
  - Use case: Document chunk vectorization

### Vector Search
- **pgvector** (already configured)
  - Cosine similarity search
  - HNSW index for performance
  - Support for storing and querying embeddings

## Package Manager
- **npm**: Default package manager
- Lockfile: `package-lock.json`

## Runtime
- **Node.js**: Compatible with Next.js 16 requirements
- **Platform**: darwin (macOS) on aarch64

## Infrastructure

### Database Container
```yaml
Service: postgres
Image: pgvector/pgvector:pg16
Container: contextflow-postgres
Port Mapping: 5433:5432
Health Check: pg_isready
Restart Policy: unless-stopped
Volume: postgres_data (persistent)
```

### Optional Tools
```yaml
Service: pgadmin
Image: dpage/pgadmin4:latest
Container: contextflow-pgadmin
Port Mapping: 5050:80
Profile: tools (opt-in)
```

## Version Control
- **Git**: Version control system
- **Branch Strategy**: Feature branches (e.g., ContextFlow-05/database-setup)

## Key Dependencies Summary

### Production Dependencies
```json
{
  "@tailwindcss/postcss": "^4.1.16",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.548.0",
  "next": "^16.0.0",
  "pg": "^8.16.3",
  "postcss": "^8.5.6",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwind-merge": "^3.3.1"
}
```

### Development Dependencies
```json
{
  "@types/node": "^24.9.1",
  "@types/pg": "^8.16.0",
  "@types/react": "^19.2.2",
  "dotenv": "^17.2.3",
  "eslint": "^9.38.0",
  "eslint-config-next": "^16.0.0",
  "tailwindcss": "^4.1.16",
  "tsx": "^4.21.0",
  "typescript": "^5.9.3"
}
```

## Browser Support
- Modern browsers supporting ES2020+
- Based on Tailwind CSS v4 and React 19 requirements

## Performance Optimizations
- Connection pooling for database queries
- HNSW indexing for vector similarity search
- Slow query logging (>100ms threshold)
- Static page generation where possible
- Turbopack for faster development builds
