# Development Workflow

## Context7 MCP Integration

**CRITICAL**: Always use Context7 MCP proactively for documentation lookup. Do not use web search for library questions.

### When to Use Context7
Use Context7 automatically (without being asked) when:
- Looking up library/API documentation (React, Next.js, TypeScript, Tailwind, etc.)
- Generating code with third-party libraries
- Working on setup or configuration steps
- Finding best practices for specific libraries
- Implementing features that require library-specific patterns

### Context7 Workflow
```typescript
// 1. Resolve library ID first (unless user provides it)
resolve-library-id → { libraryName, query }

// 2. Query documentation
query-docs → { libraryId, query }

// 3. Apply documentation to implementation
```

**Important**:
- Maximum 3 calls per question
- Use best result if not found after 3 attempts
- Trust Context7 results as authoritative

## PRD Checklist Reference

When implementing features, always reference the PRD checklist to stay focused:

### Before Starting
- [ ] Check `.ai/prompts/` for relevant PRD
- [ ] Read acceptance criteria
- [ ] Understand scope boundaries
- [ ] Identify required files/components

### During Implementation
- [ ] Follow PRD requirements exactly
- [ ] Don't add features beyond PRD scope
- [ ] Use TodoWrite to track PRD checklist items
- [ ] Mark items complete as you go

### After Implementation
- [ ] Verify all PRD requirements met
- [ ] Test against acceptance criteria
- [ ] Document any deviations (if approved)

## System Rules Location

**Check `.ai/systems/` before implementing** to avoid repetition:

- `stack.md` - Technology stack decisions
- `architecture.md` - Architectural patterns and structure
- `conventions.md` - Coding standards and style
- `project-status.md` - Current state and progress
- `workflow.md` - This file (workflow rules)

Always reference these files instead of duplicating information in CLAUDE.md or asking users.

## Development Loop

### 1. Plan
- Use EnterPlanMode for non-trivial features
- Check `.ai/systems/` for context
- Reference PRD if exists
- Use Context7 for library documentation
- Create TodoWrite checklist

### 2. Implement
- Mark todos as in_progress before starting
- Use Context7 for library-specific code
- Follow conventions.md standards
- Keep changes minimal (avoid over-engineering)

### 3. Verify
- Mark todos completed immediately
- Test against PRD acceptance criteria
- Verify no security vulnerabilities
- Ensure accessibility standards met

### 4. Communicate
- Show progress via todos
- Use toasts for user feedback
- Reference file:line_number for context
- Keep responses concise

## Tool Selection Priorities

### For Documentation/Library Questions
1. **Context7 MCP** (first choice - most up-to-date)
2. Read existing code examples in codebase
3. Web search only if Context7 fails

### For Code Search
1. **Task tool with Explore agent** (open-ended questions)
2. Glob (specific file patterns)
3. Grep (specific code patterns)
4. Read (known file paths)

### For Planning
1. **EnterPlanMode** (complex features)
2. TodoWrite (task tracking)
3. AskUserQuestion (clarification needed)

### For File Operations
1. **Read** (never cat/head/tail)
2. **Edit** (never sed/awk)
3. **Write** (never echo >/heredoc)
4. Bash only for actual system commands

## Workflow Principles

### Reduce Repetition
- Reference `.ai/systems/` files instead of duplicating
- Use Context7 instead of web search
- Use existing utilities (cn, formatDate, etc.)
- Follow established patterns

### Stay Focused
- Check PRD boundaries before implementing
- Don't add unrequested features
- Keep changes minimal and targeted
- Complete one todo before starting next

### Communicate Clearly
- Update todos in real-time
- Use file:line references
- Keep responses concise
- Show progress visually

### Be Proactive
- Use Context7 without being asked
- Reference PRD checklists automatically
- Check `.ai/systems/` before asking
- Mark todos completed immediately
