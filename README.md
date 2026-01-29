# Kanban Hub

A platform to create and manage multiple kanban boards with real-time collaboration.

## Features

- Multiple kanban boards
- Real-time collaboration
- User authentication
- Modern and responsive interface

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: Shadcn/ui + Tailwind CSS 4
- **Backend**: Convex
- **Authentication**: Better Auth
- **Testing**: Vitest + Testing Library
- **Linting/Formatting**: Biome

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Linting and formatting
pnpm lint
```


## Project Structure

```
kanban-hub/
├── app/              # Next.js App Router
├── components/       # React components (Shadcn/ui)
├── lib/              # Utilities and helpers
├── convex/           # Convex backend (queries, mutations, actions)
└── tests/            # Unit tests
```
