# Test Data Engine - Development Scripts

## Available NPM Scripts

### Development
- `npm start` - Start development server with hot reloading
- `npm run dev` - Alias for npm start
- `npm run watch:dev` - Start development server

### Building
- `npm run build` - Create production build
- `npm run watch` - Build and watch for changes (production build)
- `npm run build:watch` - Alias for watch script

### Testing
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

### Code Quality
- `npm run lint` - Check code linting
- `npm run lint:fix` - Fix linting issues automatically
- `npm run type-check` - Check TypeScript types

### Utilities
- `npm run clean` - Remove build directory
- `npm run serve` - Build and serve production build locally
- `npm run analyze` - Build and analyze bundle size

## Development Workflow

### For Active Development
```bash
npm start
```
This starts the development server with hot reloading.

### For Production Build Watching
```bash
npm run watch
```
This rebuilds the production build whenever files change.

### For Testing
```bash
npm run test:watch
```
This runs tests in watch mode, re-running when files change.

### For Code Quality
```bash
npm run lint:fix && npm run type-check
```
This fixes linting issues and checks TypeScript types.

## File Watching Features

- **Hot Reloading**: Changes reflect immediately in browser
- **Type Checking**: TypeScript errors show in terminal
- **Linting**: Code style issues highlighted
- **Test Running**: Tests re-run on file changes
- **Build Optimization**: Production builds optimized automatically
