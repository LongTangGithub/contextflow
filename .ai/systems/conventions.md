# Coding Conventions

## General Principles

### Code Philosophy
- **Simplicity First**: Avoid over-engineering; implement only what's needed
- **No Premature Optimization**: Three similar lines are better than a premature abstraction
- **Delete Unused Code**: No backwards-compatibility hacks, no `_unused` variables
- **Trust Internal Code**: Only validate at system boundaries (user input, external APIs)
- **Self-Evident Logic**: Comments only where logic isn't obvious

### Feature Development
- Make changes that are directly requested or clearly necessary
- Don't add features beyond what was asked
- A bug fix doesn't need surrounding code cleanup
- Don't add error handling for scenarios that can't happen

## TypeScript Conventions

### Type Safety
- **Strict Mode**: Always enabled
- **Explicit Types**: Prefer explicit return types for functions
- **Interface Over Type**: Use `interface` for object shapes
- **No `any`**: Avoid `any` type; use `unknown` if type is truly unknown
- **Generics**: Use generics for reusable type-safe functions

### Type Definitions
```typescript
// ✅ Good - Explicit interface with clear naming
interface Document {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  type: string;
}

// ✅ Good - Generic with constraints
async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>>

// ❌ Bad - Using any without justification
function processData(data: any) { }
```

## File Organization

### Directory Structure
```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Page components
│   └── globals.css          # Global styles
├── components/
│   ├── features/            # Feature-specific components
│   │   └── [feature-name]/
│   │       └── Component.tsx
│   └── ui/                  # Shared UI components
│       └── Component.tsx
└── lib/
    ├── [module]/            # Module-specific code
    └── utils.ts             # Shared utilities
```

### File Naming
- **Components**: PascalCase (e.g., `DocumentUpload.tsx`)
- **Utilities**: camelCase (e.g., `toast-context.tsx`, `utils.ts`)
- **Pages**: lowercase (e.g., `page.tsx`, `layout.tsx`)
- **Types**: PascalCase interfaces/types, separate file if shared

### Component Location Rules
1. **Feature-specific components** → `src/components/features/[feature-name]/`
2. **Reusable UI components** → `src/components/ui/`
3. **One component per file** (unless tightly coupled sub-components)

## Component Conventions

### Component Structure
```typescript
"use client"; // Required for hooks/browser APIs

import { ... } from '...';

// 1. Types/Interfaces
interface ComponentProps {
  // Props definition
}

// 2. Component Definition
export default function Component({ props }: ComponentProps) {
  // 3. Hooks (in order)
  const [state, setState] = useState();
  const ref = useRef();
  useEffect(() => { }, []);

  // 4. Event Handlers
  const handleEvent = () => { };

  // 5. Render Logic
  return (
    // JSX
  );
}
```

### Component Exports
- **Default exports** for page/feature components
- **Named exports** for utilities and shared hooks

### "use client" Directive
- Required at top of any component using:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (window, document, etc.)
  - Event handlers

## React Patterns

### State Management
- **Lift State Up**: Keep state at the appropriate level
- **Page-Level State**: For data shared across features
- **Component-Level State**: For local UI state
- **Context**: For global concerns (toasts, themes, auth)

### Props Flow
```typescript
// ✅ Good - Clear, one-way data flow
<DocumentList
  documents={documents}
  onDelete={handleDelete}
/>

// ❌ Bad - Passing everything through props
<DocumentUpload
  documents={documents}
  setDocuments={setDocuments}
  onSuccess={handleSuccess}
/>
```

### Communication Patterns
- **Child → Parent**: Callback props
- **Global Notifications**: Toast system
- **No Direct State Sharing**: Between sibling components

## Styling Conventions

### Tailwind CSS Usage
```typescript
// ✅ Good - Using cn() utility for conditional classes
className={cn(
  "base-classes",
  condition && "conditional-classes",
  props.className
)}

// ✅ Good - Semantic color variables
className="bg-background text-foreground border-border"

// ❌ Bad - Hardcoded colors
className="bg-white text-black border-gray-200"
```

### Color Semantics
- `background`/`foreground` - Page-level colors
- `card`/`card-foreground` - Contained sections
- `muted`/`muted-foreground` - Secondary text
- `primary`/`primary-foreground` - Interactive elements
- `border` - Borders and dividers

### Hover & Interaction States
```typescript
// ✅ Good - Using group for parent-triggered states
<div className="group">
  <span className="group-hover:text-primary" />
</div>

// ✅ Good - Transition classes
className="transition-colors hover:bg-muted"
```

## Database Conventions

### Query Patterns
```typescript
// ✅ Good - Parameterized queries (prevents SQL injection)
const result = await query(
  'SELECT * FROM documents WHERE id = $1',
  [documentId]
);

// ❌ Bad - String concatenation
const result = await query(
  `SELECT * FROM documents WHERE id = '${documentId}'`
);
```

### Schema Naming
- **Tables**: Plural snake_case (e.g., `documents`, `document_chunks`)
- **Columns**: Snake_case (e.g., `created_at`, `processing_status`)
- **Foreign Keys**: `[table]_id` (e.g., `document_id`, `chunk_id`)
- **Indexes**: `idx_[table]_[column]` (e.g., `idx_documents_uploaded_at`)

### TypeScript to Database Mapping
```typescript
// TypeScript (camelCase)
interface Document {
  uploadedAt: Date;
  processingStatus: string;
}

// SQL (snake_case)
CREATE TABLE documents (
  uploaded_at TIMESTAMP,
  processing_status processing_status
);
```

## Git Conventions

### Branch Naming
- **Feature branches**: `ContextFlow-{number}/{description}`
  - Example: `ContextFlow-05/database-setup`
- **Bug fixes**: `fix/{description}`
- **Hotfixes**: `hotfix/{description}`

### Commit Messages
```
feat: add user authentication system
fix: resolve race condition in file upload
refactor: simplify document list component
docs: update API documentation
chore: upgrade dependencies
test: add unit tests for toast system
```

### Commit Footer (Required)
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Error Handling

### Security-First Validation
```typescript
// ✅ Good - Validate user input
if (!['application/pdf', 'text/plain', 'text/markdown'].includes(file.type)) {
  throw new Error('Invalid file type');
}

// ✅ Good - User-friendly error messages
addToast('File too large. Maximum size is 10MB.', 'error');

// ❌ Bad - Generic error messages
addToast('Error', 'error');
```

### Error Categories
- **Validation Errors**: Return clear, actionable messages to users
- **Database Errors**: Log with query context, show generic message to users
- **Unexpected Errors**: Log full stack trace, show user-friendly message

## Toast Notification Standards

### Usage Pattern
```typescript
const { addToast } = useToast();

// Success
addToast('Document uploaded successfully!', 'success', {
  description: 'test-file.pdf',
  duration: 5000
});

// Error
addToast('Upload failed', 'error', {
  description: error.message,
  duration: 7000
});

// Warning
addToast('Large file detected', 'warning', {
  description: 'This may take a few moments',
  duration: 6000
});

// Info
addToast('Processing started', 'info', {
  description: '3 documents queued',
  duration: 4000
});
```

### When to Use Toasts
- ✅ File upload success/failure
- ✅ Data mutations (create, update, delete)
- ✅ Background process updates
- ✅ Validation errors
- ❌ Don't use for form validation (use inline errors)
- ❌ Don't use for permanent information (use UI elements)

## Comment Conventions

### When to Comment
```typescript
// ✅ Good - Complex business logic explanation
// Calculate cosine distance for vector similarity
// Lower distance = more similar documents
const distance = embedding1 <=> embedding2;

// ✅ Good - Non-obvious browser API quirk
// Use dragCounter to handle nested drag events correctly
const dragCounter = useRef(0);

// ❌ Bad - Self-evident code
// Set the name to the file name
setName(file.name);
```

### Documentation Comments
```typescript
/**
 * Execute a database query with parameterized values
 * @param text - SQL query string
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query result
 */
export async function query<T>(text: string, params?: any[]): Promise<QueryResult<T>>
```

## Testing Conventions

### Test File Location
- Co-locate tests with source files
- Use `.test.ts` or `.spec.ts` suffix
- Integration tests in separate `__tests__` directory

### NPM Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Run linter
- `npm run db:test` - Database tests
- `npm run db:start` - Start database

## Import Organization

### Import Order
```typescript
// 1. External packages
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal aliases
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/toast-context';

// 3. Relative imports
import { DocumentList } from './DocumentList';

// 4. Types (if separate)
import type { Document } from '@/types';
```

## Security Conventions

### OWASP Top 10 Awareness
- **SQL Injection**: Always use parameterized queries
- **XSS**: React escapes by default; avoid `dangerouslySetInnerHTML`
- **CSRF**: Next.js handles CSRF tokens automatically
- **Authentication**: Never trust client-side data
- **File Uploads**: Validate type, size, and content

### Environment Variables
- Never commit `.env.local` to git
- Use `process.env.` prefix for access
- Validate required env vars on startup
- Use `NEXT_PUBLIC_` prefix only for client-side vars

## Performance Best Practices

### React Performance
- Use `React.memo()` only when profiling shows benefit
- Avoid inline function definitions in props
- Use `useCallback` for expensive callbacks
- Use `useMemo` for expensive computations

### Database Performance
- Connection pooling enabled (already configured)
- Indexes on frequently queried columns
- HNSW index for vector similarity search
- Monitor slow queries (>100ms logged)

## Accessibility

### Semantic HTML
- Use semantic elements (`<button>`, `<nav>`, `<main>`)
- Proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- Alt text for images
- ARIA labels where needed

### Keyboard Support
- All interactive elements keyboard accessible
- Focus visible indicators
- Escape key for dismissing modals/toasts
- Tab order logical and intuitive
