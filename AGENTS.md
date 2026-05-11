# AGENTS.md - Lotto Scan Development Guide

This document provides instructions for AI coding agents working in this repository.

## Project Overview

A React 19 + TypeScript application for managing scratcher ticket inventory, audits, and employee shifts. Uses Firebase (Auth + Firestore) for backend, Tailwind CSS v4 for styling, and Vite for build tooling.

## Commands

### Development
```bash
npm run dev        # Start dev server on port 3000
```

### Build & Deployment
```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run clean      # Remove dist folder
```

### Linting & Type Checking
```bash
npm run lint       # Run TypeScript type check (tsc --noEmit)
```

**Note:** This project has no test framework configured. There are no test commands available.

## Code Style Guidelines

### File Naming
- **Components & Pages:** PascalCase (e.g., `Inventory.tsx`, `DashboardLayout.tsx`)
- **Utils & Hooks:** camelCase (e.g., `utils.ts`, `useAuth.ts`)
- **Context Providers:** PascalCase with `Context` suffix (e.g., `AuthContext.tsx`)

### Imports
- Use `@/` path alias for src-relative imports: `import { cn } from '@/lib/utils'`
- Use relative imports for sibling components: `import { Sidebar } from './Sidebar'`
- Group imports: React → external libs → internal aliased imports → relative imports

### TypeScript
- Use `interface` for object shapes (especially Firestore documents)
- Use `type` for unions, utility types
- Define all data types in context files or dedicated types files
- Avoid `any` - use `unknown` with type guards when necessary

### Components
- Use named exports: `export function Inventory() { ... }`
- Use function components only (no class components)
- Destructure props explicitly
- Props types inline for simple components, interfaces for complex ones

### Error Handling
- Wrap async Firebase operations in try/catch
- Use `handleFirestoreError()` utility from StoreContext for consistent error formatting
- Log errors with console.error before throwing
- Show user-friendly alerts for auth errors (see AuthContext.tsx)

### Tailwind CSS
- Use `@tailwindcss/vite` plugin (Tailwind v4)
- Use `cn()` utility from `@/lib/utils` for conditional class merging
- Use slate color palette as default: `text-slate-900`, `bg-slate-50`
- Use numeric scale for colors: `bg-blue-600`, `bg-blue-700` for hover states

### React Patterns
- Use `lazy()` with `Suspense` for route-based code splitting
- Use context for global state (AuthContext, StoreContext)
- Custom hooks expose typed context: `export function useAuth() { ... }`
- Use `useMemo` for expensive computations, `useCallback` for passed callbacks

### Firebase/Firestore
- Use Firestore with user-scoped collections (`where('userId', '==', user.uid)`)
- Use `onSnapshot` for real-time listeners, cleanup in useEffect return
- Use `serverTimestamp()` for createdAt/updatedAt fields
- Document IDs often match barcode values or UUIDs

### Project Structure
```
src/
├── components/       # Reusable UI components
│   └── layout/       # Layout components (Sidebar, Header, DashboardLayout)
├── contexts/         # React contexts (AuthContext, StoreContext)
├── lib/              # Utilities (utils.ts)
├── pages/            # Route page components
├── App.tsx           # Root app with routing
├── main.tsx          # Entry point
└── firebase.ts       # Firebase initialization
```

### Naming Conventions
- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE for config values, camelCase for others
- CSS classes: kebab-case (Tailwind default)

### Additional Notes
- HMR can be disabled via `DISABLE_HMR` env var for AI Studio compatibility
- Environment variables: create `.env.local` with `GEMINI_API_KEY`
- Firebase config loaded from `firebase-applet-config.json`

## Chrome DevTools MCP

This project includes Chrome DevTools MCP configuration for browser automation and debugging. The MCP server is configured in `opencode.json`.

### Configuration (OpenCode)
OpenCode will automatically load the MCP server from `opencode.json`. It provides:
- Browser automation and control
- DOM inspection
- Performance profiling
- Network request debugging
- Screenshot capture
- Console output access

### OpenCode MCP Config
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"],
      "enabled": true
    }
  }
}
```

### Requirements
- Node.js v20+
- Chrome browser (current stable)
- The MCP server will automatically launch Chrome when needed