# Kanban Hub

Una plataforma para crear y gestionar múltiples paneles kanban con colaboración en tiempo real.

## Características

- Múltiples paneles kanban
- Colaboración en tiempo real
- Autenticación de usuarios
- Interfaz moderna y responsive

## Stack Tecnológico

- **Framework**: Next.js (App Router)
- **UI**: Shadcn/ui + Tailwind CSS 4
- **Backend**: Convex
- **Autenticación**: Better Auth
- **Testing**: Vitest + Testing Library
- **Linting/Formatting**: Biome

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Ejecutar tests
pnpm test

# Build para producción
pnpm build
```
# Linting y formatting
pnpm lint


## Estructura del Proyecto

```
kanban-hub/
├── app/              # Next.js App Router
├── components/       # Componentes React (Shadcn/ui)
├── lib/              # Utilidades y helpers
├── convex/           # Backend Convex (queries, mutations, actions)
└── tests/            # Tests unitarios
```
