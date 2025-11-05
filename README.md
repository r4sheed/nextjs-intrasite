# Next.js Enterprise Intrasite

A production-ready Next.js application with TypeScript, authentication, and enterprise-level error handling.

## Tech Stack

- **Next.js 15+** - App Router with Turbopack
- **TypeScript 5+** - Strict mode with ES2022 target
- **Next-Auth v5** - Authentication with Credentials + OAuth
- **Prisma** - Type-safe database access
- **TanStack Query** - Server state management
- **Zod** - Runtime validation
- **Vitest** - Unit testing (103 tests passing)
- **Tailwind CSS 4** - Styling with shadcn/ui components

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database and auth provider credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript compiler check
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:feature <name>  # Run tests for specific feature (e.g., npm run test:feature auth)

# Feature scaffolding
npm run feature:create <name>  # Generate new feature scaffold

# i18n management
npm run i18n:add <key> <en> <hu>  # Add new translation
npm run i18n:validate             # Validate translations
npm run i18n:sync                 # Sync translations
```

**See [i18n Scripts Reference](docs/i18n-scripts-reference.md) for detailed i18n management guide.**

---

## Creating a New Feature

Use the automated scaffolding script:

```bash
npm run feature:create bookmarks
```

This generates a complete feature structure with:

- Server actions
- Services (business logic)
- Data layer (database access)
- Schemas (Zod validation)
- Error handlers
- i18n translations
- Tests boilerplate

**See [Feature Creation Guide](.github/prompts/feature-creation.prompt.md) for details.**

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main app routes
│   ├── (auth)/            # Auth pages (login, signup, etc.)
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared app components
├── features/              # Feature modules
│   └── auth/             # Authentication feature
│       ├── actions/      # Server actions
│       ├── components/   # Feature components
│       ├── data/         # Data access layer
│       ├── hooks/        # Custom hooks
│       ├── lib/          # Utilities & errors
│       ├── schemas/      # Zod schemas
│       ├── services/     # Business logic
│       ├── types/        # TypeScript types
│       └── __tests__/    # Tests
├── hooks/                 # Global React hooks
├── lib/                   # Shared utilities
│   ├── errors/           # Error handling system
│   └── response/         # Response types
├── locales/              # i18n translations (en, hu)
└── styles/               # Global styles

.github/
└── instructions/         # Project guidelines for AI/developers
```

---

## Guidelines & Documentation

This project follows strict guidelines to ensure consistency:

- **[Error Handling](.github/instructions/error-handling-guidelines.instructions.md)** - Response pattern, AppError, layer responsibilities
- **[Naming Conventions](.github/instructions/naming-conventions.instructions.md)** - File/function naming patterns
- **[Messages & Codes](.github/instructions/messages-and-codes.instructions.md)** - Error codes, i18n keys
- **[Next.js Patterns](.github/instructions/nextjs.instructions.md)** - App Router best practices
- **[TypeScript Rules](.github/instructions/typescript-5-es2022.instructions.md)** - TypeScript 5 + ES2022 guidelines
- **[Guidelines Governance](.github/instructions/guidelines-governance.instructions.md)** - How to maintain guidelines

---

## Key Features

### ✅ Type-Safe Error Handling

All server actions return `Response<T>`:

```typescript
type Response<T> =
  | { status: 'success'; data: T; message?: Message }
  | { status: 'error'; code: string; message: Message; httpStatus: number }
  | { status: 'partial'; data: T; errors: PartialError[] };
```

### ✅ Layer Separation

- **Actions** - Validate input, call services
- **Services** - Business logic, orchestration
- **Data** - Pure database access (never throws)

### ✅ i18n Ready

All messages use translation keys with parameters:

```typescript
{ key: 'auth.errors.invalid-credentials', params: { email } }
```

### ✅ Consistent Naming

- Files: `kebab-case`
- Functions: `camelCase`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE` (primitives), `camelCase` (objects)

---

## Authentication

Supports multiple auth providers:

- Credentials (email + password)
- Google OAuth
- GitHub OAuth

Features:

- Email verification
- Password reset
- Protected routes
- Session management (JWT)

---

## Testing

113 tests covering:

- Server actions
- Services
- Data layer
- Error handling
- Response utilities

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:feature auth   # Run only auth feature tests
```

---

## Configuration

### TypeScript

- **Strict mode** enabled
- **noUncheckedIndexedAccess** - Prevents undefined array access
- **noImplicitReturns** - All code paths must return
- **noFallthroughCasesInSwitch** - Explicit switch cases

### ESLint

- Next.js recommended config
- TypeScript ESLint
- Import ordering (Prettier plugin)
- Custom rules for consistency

### Prettier

- Single quotes
- 2-space indentation
- Trailing commas (ES5)
- Import sorting (custom order)

---

## Contributing

1. Follow the [Guidelines](.github/instructions/)
2. Create features using `npm run feature:create`
3. Write tests for all new code
4. Run `npm run typecheck` and `npm test` before committing
5. Use conventional commit messages

---

## License

MIT

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next-Auth Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Query](https://tanstack.com/query/latest)
