# Project Instructions

## Tech Stack

- **Next.js**: Use the latest version with App Router
- **React**: Use the latest version
- **Tailwind CSS**: Use Tailwind CSS 4
- **TypeScript**: Use the latest version
- **Shadcn/ui**: UI components based on Radix UI
- **Convex**: Real-time backend (queries, mutations, actions)
- **Better Auth**: Authentication system
- **Vitest**: Testing framework
- **Testing Library**: For React component tests
- **Biome**: Linting and formatting (replaces ESLint and Prettier)

## Code Style

- For files use lower kebab case for file names and folders
- Use Biome for linting and formatting (DO NOT use ESLint or Prettier)
- Follow Next.js App Router conventions
- Use strict TypeScript
- Functional components with React hooks
- Prefer server components when possible
- Use Shadcn/ui for common UI components
- Install the shadcn/ui components using the command: `pnpm dlx shadcn@latest add <component>`

## Structure and Conventions

- **Components**: Place in `components/` using PascalCase
- **Utilities**: Place in `lib/` using camelCase
- **Convex**: Place queries/mutations/actions in `convex/`
- **Tests**: Place next to files with `.test.ts` or `.test.tsx` extension
- **Routes**: Use Next.js App Router (folders in `app/`)

## Testing

- Use Vitest for unit tests
- Use Testing Library for component tests
- Write tests for critical logic and complex components
- Follow the Arrange-Act-Assert pattern

## Backend (Convex)

- Use queries for data reading
- Use mutations for data writing
- Use actions for async operations or external calls
- Implement validation in mutations and actions
- Use indexes when necessary to optimize queries
- Use lower snake case for table names and fields

## Authentication

- Use Better Auth for session management
- Protect routes and actions as needed
- Use middleware when appropriate

## UI/UX

- Use Shadcn/ui components as base
- Apply Tailwind CSS 4 for styles
- Follow accessible design principles
- Optimize for mobile devices (mobile-first)

## Conventional Commits

- Use Conventional Commits format for all commit messages
- Format: `type(scope): subject`
- Allowed types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Formatting changes (don't affect code)
  - `refactor`: Code refactoring
  - `test`: Add or modify tests
  - `chore`: Maintenance tasks (deps, config, etc.)
  - `perf`: Performance improvements
  - `ci`: CI/CD changes
- Optional scope: affected area (e.g., `feat(ui): add dark mode toggle`)
- Subject in lowercase, imperative, no trailing period
- Examples:
  - `feat(auth): add login form`
  - `fix(convex): resolve task query error`
  - `refactor(components): extract card component`
  - `docs(readme): update setup instructions`
