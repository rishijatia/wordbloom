# WordBloom-TS Development Guide

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compiler first)
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build
- `npx vitest` - Run all tests
- `npx vitest <test-file-path>` - Run specific test file
- `npx vitest --coverage` - Run tests with coverage report

## Code Style
- **TypeScript**: Use strict mode, properly type all variables and function parameters
- **Imports**: Group by source (React, third-party, local) with empty line between groups
- **Components**: Use functional components with React.FC typing
- **State**: Use context API for global state and hooks for local state
- **Naming**: PascalCase for components/types, camelCase for functions/variables/instances
- **File Structure**: One component per file, named same as component
- **Error Handling**: Use try/catch blocks and proper error messages for user feedback
- **UI Structure**: Follow existing component hierarchy and styled-components patterns
- **Testing**: Component tests should render with testing-library and verify UI behaviors