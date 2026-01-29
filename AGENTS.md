# Project Instructions

## Stack Tecnológico

- **Next.js**: Usar la última versión con App Router
- **React**: Usar la última versión
- **Tailwind CSS**: Usar Tailwind CSS 4
- **TypeScript**: Usar la última versión
- **Shadcn/ui**: Componentes UI basados en Radix UI
- **Convex**: Backend en tiempo real (queries, mutations, actions)
- **Better Auth**: Sistema de autenticación
- **Vitest**: Framework de testing
- **Testing Library**: Para tests de componentes React
- **Biome**: Linting y formatting (reemplaza ESLint y Prettier)

## Code Style

- Usar Biome para linting y formatting (NO usar ESLint o Prettier)
- Seguir las convenciones de Next.js App Router
- Usar TypeScript estricto
- Componentes funcionales con hooks de React
- Preferir server components cuando sea posible
- Usar Shadcn/ui para componentes UI comunes

## Estructura y Convenciones

- **Componentes**: Colocar en `components/` usando PascalCase
- **Utilidades**: Colocar en `lib/` usando camelCase
- **Convex**: Colocar queries/mutations/actions en `convex/`
- **Tests**: Colocar junto a los archivos con extensión `.test.ts` o `.test.tsx`
- **Rutas**: Usar App Router de Next.js (carpetas `app/`)

## Testing

- Usar Vitest para tests unitarios
- Usar Testing Library para tests de componentes
- Escribir tests para lógica crítica y componentes complejos
- Seguir el patrón Arrange-Act-Assert

## Backend (Convex)

- Usar queries para lectura de datos
- Usar mutations para escritura de datos
- Usar actions para operaciones asíncronas o llamadas externas
- Implementar validación en mutations y actions
- Usar índices cuando sea necesario para optimizar queries

## Autenticación

- Usar Better Auth para gestión de sesiones
- Proteger rutas y acciones según sea necesario
- Usar middleware cuando sea apropiado

## UI/UX

- Usar componentes de Shadcn/ui como base
- Aplicar Tailwind CSS 4 para estilos
- Seguir principios de diseño accesible
- Optimizar para dispositivos móviles (mobile-first)

## Conventional Commits

- Usar el formato de Conventional Commits para todos los mensajes de commit
- Formato: `type(scope): subject`
- Tipos permitidos:
  - `feat`: Nueva funcionalidad
  - `fix`: Corrección de bugs
  - `docs`: Cambios en documentación
  - `style`: Cambios de formato (no afectan el código)
  - `refactor`: Refactorización de código
  - `test`: Añadir o modificar tests
  - `chore`: Tareas de mantenimiento (deps, config, etc.)
  - `perf`: Mejoras de rendimiento
  - `ci`: Cambios en CI/CD
- Scope opcional: área afectada (ej: `feat(ui): add dark mode toggle`)
- Subject en minúsculas, imperativo, sin punto final
- Ejemplos:
  - `feat(auth): add login form`
  - `fix(convex): resolve task query error`
  - `refactor(components): extract card component`
  - `docs(readme): update setup instructions`
