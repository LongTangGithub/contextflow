# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ContextFlow is a **Research Copilot for Developers** - an AI-powered research synthesis tool built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. The application allows users to upload and manage research documents (PDF, TXT, MD) with a modern, polished UI.

## Development Commands

```bash
# Development server (with TurboPack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Project Architecture

### Core Technology Stack

- **Framework**: Next.js 16 with App Router
- **React**: Version 19 (latest)
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS v4 (using new @theme directive syntax)
- **Path Aliases**: `@/*` maps to `src/*`

### Application Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with ToastProvider
│   ├── page.tsx           # Home page with document management
│   └── globals.css        # Tailwind CSS v4 configuration
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── document-upload/
│   │   │   └── DocumentUpload.tsx    # Drag-and-drop file upload
│   │   └── document-list/
│   │       └── DocumentList.tsx      # Document list with filtering & batch actions
│   └── ui/                # Shared UI components
│       └── ToastContainer.tsx        # Toast notification system
└── lib/
    ├── toast-context.tsx  # Global toast state management
    └── utils.ts           # cn() utility for className merging
```

### Key Architectural Patterns

#### 1. Global Toast System

The application uses a **centralized toast notification system** with React Context:

- **Provider**: `ToastProvider` in `src/lib/toast-context.tsx` wraps the entire app in `layout.tsx`
- **Hook**: `useToast()` provides `addToast()` and `removeToast()` functions
- **Container**: `ToastContainer` in `src/components/ui/ToastContainer.tsx` renders all toasts
- **Features**:
  - 4 position options (top-left, top-right, bottom-left, bottom-right)
  - 4 types (success, error, warning, info) with distinct colors and icons
  - Progress bars, pause on hover, action buttons, and optional sound effects
  - Auto-dismiss with configurable duration

**Usage Pattern**:
```tsx
const { addToast } = useToast();

addToast("Success!", "success", {
  description: "Operation completed",
  duration: 5000,
  sound: true,
  actions: [{ label: "Undo", onClick: () => {} }]
});
```

#### 2. Document Management

Documents are managed at the **page level** (`src/app/page.tsx`) with state lifted up:

- **State**: `documents` array maintained in `Home` component
- **Type**: Document interface with `id`, `name`, `size`, `uploadedAt`, `type`
- **Props Flow**:
  - `DocumentUpload` component doesn't receive documents (handles its own upload state)
  - `DocumentList` receives `documents` and `onDelete` callback

#### 3. Component Communication

- **Upload → List**: Upload component uses toast notifications; no direct state sharing
- **List → Parent**: List component calls `onDelete(id)` to remove documents
- **Global Notifications**: All user feedback flows through the toast system

### Tailwind CSS v4 Configuration

The project uses **Tailwind CSS v4** with the new `@theme` directive in `globals.css`:

- Color system uses `oklch()` color space for better perceptual uniformity
- Custom CSS variables defined: `--color-background`, `--color-foreground`, `--color-card`, etc.
- Dark mode is **commented out** but prepared for future implementation
- Import style: `@import "tailwindcss"` (not the v3 directives)

### File Upload System

`DocumentUpload.tsx` implements a sophisticated drag-and-drop system:

- **Validation**: File type (PDF/TXT/MD only) and size (10MB max)
- **Drag State**: Uses `dragCounter` ref to handle nested drag events correctly
- **Error Handling**: Individual file validation with detailed error messages via toast
- **Features**: Preview of selected files, individual removal, clear all, file size formatting

### Document List Features

`DocumentList.tsx` provides advanced document management:

- **Filtering**: Filter by file type (All, PDF, TXT, MD) with tab UI
- **Batch Selection**: Select multiple documents with checkboxes (shift-click for range selection)
- **Bulk Delete**: Delete multiple documents at once with confirmation dialog
- **Delete Confirmation**: Individual delete requires 2 clicks (auto-cancels after 3s)
- **Date Formatting**: Relative time display ("5 min ago", "2 hours ago")
- **Keyboard Support**: Escape key clears selection

### Styling Conventions

- **Class Utilities**: Use `cn()` from `src/lib/utils.ts` to merge Tailwind classes with conditional logic
- **Color Semantics**:
  - `background`/`foreground` for page-level colors
  - `card`/`card-foreground` for contained sections
  - `muted`/`muted-foreground` for secondary text
  - `primary`/`primary-foreground` for interactive elements
  - `border` for borders
- **Animations**: Tailwind's `animate-in`, `fade-in`, `slide-in` utilities for enter/exit transitions
- **Hover Effects**: Use `group` and `group-hover:` for parent-triggered child states

## Development Workflow

### When Adding New Features

1. **Toast Notifications**: Always use `useToast()` for user feedback instead of creating local notification state
2. **Component Location**:
   - Put feature-specific components in `src/components/features/[feature-name]/`
   - Put reusable UI components in `src/components/ui/`
3. **Styling**: Follow the existing pattern of Tailwind classes with semantic color variables
4. **State Management**: Keep state at the appropriate level (page vs component)

### When Working with Forms/Uploads

- File validation should return user-friendly error messages
- Use toast notifications for success/error feedback
- Always reset file inputs after processing: `event.target.value = ""`
- Handle drag-and-drop with proper event prevention and drag counter pattern

### Common Utilities

- **Class Merging**: `cn(...)` from `@/lib/utils` for conditional Tailwind classes
- **Date Formatting**: See `formatDate()` in `DocumentList.tsx` for relative time
- **File Size Formatting**: See `formatFileSize()` in `DocumentUpload.tsx` for human-readable sizes
- **Toast ID Generation**: Pattern: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

## TypeScript Configuration

- **Strict Mode**: Enabled
- **JSX**: Uses `react-jsx` runtime (React 19)
- **Module Resolution**: `bundler` strategy
- **Paths**: `@/*` → `src/*`

## Known Patterns & Conventions

1. **"use client"**: Required at top of any component using hooks or browser APIs
2. **TODO Comments**: Some components have TODO/HINT comments for learning purposes - these can be removed
3. **CHANGE Comments**: Document modifications from baseline implementations
4. **Component Exports**: Default exports for page/feature components
5. **Interface Definitions**: Define at component level unless shared across files
