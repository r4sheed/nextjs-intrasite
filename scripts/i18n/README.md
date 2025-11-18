# i18n Scripts Expansion Plan - Strings-First Approach

## Overview

This document outlines the comprehensive plan for expanding the i18n scripts to implement a strings-first approach where `strings.ts` files become the single source of truth for translations.

## Current System Analysis

### Existing Structure

- **JSON-first approach**: Domain JSON files are manually edited, constants are generated from them
- **File organization**:
  - `src/locales/{lang}/{domain}.json` - Domain-specific translation files
  - `src/locales/{lang}.json` - Merged locale files (generated)
  - `src/features/{feature}/lib/strings.ts` - Feature constants (generated)
  - `src/lib/errors/strings.ts` - Core error constants (generated)

### Current Scripts

- `manage.ts` - CRUD operations for translation keys
- `sync.ts` - Sync JSON → constants (JSON-first)
- `validate.ts` - Basic validation of translations
- `merge.ts` - Merge domain JSONs into single locale files
- `sort.ts` - Sort keys in JSON and constants files

### Current Workflow

1. Edit domain JSON files manually
2. Run `sync` to update constants
3. Run `merge` to create merged locale files
4. Run `validate` to check consistency

## Target System Requirements

### Strings-First Approach

- **Source of truth**: `strings.ts` files contain all translation keys and values
- **Generated artifacts**: JSON files are generated from constants
- **Bidirectional sync**: Support both directions during migration
- **Custom object handling**: Support special objects like `NAVIGATION_SECTIONS`

### Enhanced Validation

- **Detailed analysis**: Show exactly what's missing where with file paths
- **Format validation**: Strict validation of key formats (camelCase, kebab-case)
- **Source tracking**: Track which strings.ts file defines each key
- **Custom object validation**: Validate special mappings

### Maintainable Architecture

- **Modular design**: Small, focused modules with clear responsibilities
- **Configuration-driven**: Custom object mappings defined in config
- **Testable**: Comprehensive test coverage for all components
- **Error handling**: Clear error messages with actionable fixes

## Watch Mode (`watch.ts`)

Automatically syncs i18n files when `strings.ts` files change during development.

### Usage

```bash
# Start watching in live mode (modifies files)
npm run i18n:watch

# Start watching in dry-run mode (shows changes without modifying files)
npm run i18n:watch -- --dry-run
```

### Features

- **Real-time sync**: Automatically runs sync when strings.ts files change
- **Debounced execution**: Waits 500ms after last change to avoid rapid syncs
- **Dry-run support**: Test changes without modifying files
- **Graceful shutdown**: Proper cleanup on Ctrl+C
- **File tracking**: Shows which files are being watched
- **Error handling**: Continues watching even if sync fails

### How It Works

1. Scans for all `strings.ts` files using the same logic as sync
2. Sets up file watchers for each strings file
3. When a file changes, waits 500ms for stability
4. Runs the full sync process (parse → map → generate → merge → validate)
5. Reports results and continues watching

### Example Output

```
👀 Starting i18n watch mode...

📂 Found 3 strings files:
   - src/lib/errors/strings.ts
   - src/features/auth/lib/strings.ts
   - src/features/navigation/lib/strings.ts

🔍 Initial scan complete. Watching:
   📄 src/lib/errors/strings.ts
   📄 src/features/auth/lib/strings.ts
   📄 src/features/navigation/lib/strings.ts

📊 Total files being watched: 3
🔄 Mode: LIVE (files will be updated)

💡 Press Ctrl+C to stop watching

📝 src/features/auth/lib/strings.ts changed, syncing...
🔄 Running live sync...

✅ Sync completed for src/features/auth/lib/strings.ts
```

### Development Workflow

1. Start watch mode: `npm run i18n:watch`
2. Edit strings.ts files in your IDE
3. Save changes - watch mode automatically syncs
4. Check console output for sync results
5. Stop with Ctrl+C when done

This provides instant feedback during i18n development without manual sync commands.

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Create Parser Module (`scripts/i18n/parser.ts`)

**Purpose**: Parse TypeScript `strings.ts` files to extract constants

**Responsibilities**:

- Parse `export const X = { ... } as const` declarations
- Extract key-value pairs from object literals
- Handle multiline strings and complex expressions
- Return structured data: `{ constantName, keys: [{key, value}] }`

**Implementation**:

- Use TypeScript compiler API or regex-based parsing
- Handle `as const` assertions
- Support nested objects (future extension)
- Return typed interfaces

**Testing**:

- Parse various strings.ts files
- Handle edge cases (multiline, complex values)
- Validate extracted data structure

#### 1.2 Create Mapper Module (`scripts/i18n/mapper.ts`)

**Purpose**: Map constants to JSON structure and domains

**Responsibilities**:

- Detect domain from constant name (e.g., `NAVIGATION_LABELS` → `navigation` domain)
- Detect category from constant name (e.g., `*_LABELS` → `labels` category)
- Handle custom object mappings (e.g., `NAVIGATION_SECTIONS` → special handling)
- Generate JSON paths from constants

**Implementation**:

- Configuration-driven mapping system
- Support for custom object definitions
- Domain/category detection logic
- Path generation utilities

**Testing**:

- Test domain detection for various constant names
- Test category detection
- Test custom object mappings
- Validate generated paths

#### 1.3 Create Custom Objects Configuration (`scripts/i18n/custom-objects.ts`)

**Purpose**: Define mappings for special objects that don't follow standard patterns

**Structure**:

```typescript
interface CustomObjectConfig {
  constantName: string;
  jsonPath: string; // e.g., 'navigation.sections'
  valueTransform?: (value: string) => string;
  validation?: (value: string) => boolean;
}
```

**Initial Mappings**:

- `NAVIGATION_SECTIONS` → `navigation.sections`
- Future: Add more as needed

**Testing**:

- Validate configuration structure
- Test value transformations
- Test validation rules

### Phase 2: Strings-First Sync (Week 2)

#### 2.1 Implement Strings-First Sync Script (`scripts/i18n/sync-strings-first.ts`)

**Purpose**: Generate JSON files from `strings.ts` constants

**Workflow**:

1. Parse all `strings.ts` files
2. Map constants to JSON structure
3. Generate/update domain JSON files
4. Trigger merge and sort operations
5. Run validation

**Features**:

- `--dry-run` support
- Detailed change reporting
- Error handling for malformed constants
- Backup of existing files

**Implementation**:

- Integrate parser and mapper modules
- Handle file I/O operations
- Support incremental updates
- Preserve existing JSON structure for unmapped keys

**Testing**:

- Full sync test (parse → map → generate → merge → validate)
- Dry-run verification
- Error handling tests
- Incremental update tests

#### 2.2 Update Helpers for Dynamic Detection (`scripts/i18n/helpers.ts`)

**Purpose**: Enhance feature and domain detection

**New Functions**:

- `getStringsFiles()` - Find all strings.ts files recursively
- `detectDomainsFromConstants()` - Extract domains from constant names
- `detectCategoriesFromConstants()` - Extract categories from constant names
- `validateConstantFormat()` - Check naming conventions

**Implementation**:

- File system scanning utilities
- Pattern matching for constant names
- Validation helpers

**Testing**:

- Test file discovery
- Test domain/category detection
- Test validation functions

### Phase 3: Enhanced Validation (Week 3)

#### 3.1 Enhance Validation Script (`scripts/i18n/validate.ts`)

**Purpose**: Provide detailed analysis with source tracking

**New Features**:

- **Source tracking**: Show which strings.ts file defines each key
- **Format validation**: Strict camelCase/kebab-case validation
- **Custom object validation**: Validate special mappings
- **Detailed reporting**: Group errors by file and type
- **Actionable suggestions**: Provide fix commands

**Error Types**:

- `INVALID_FORMAT`: Wrong case (e.g., `NEW_PASSWORD_TITLE`)
- `MISSING_TRANSLATION`: Key exists in strings.ts but not in JSON
- `EXTRA_TRANSLATION`: Key exists in JSON but not in strings.ts
- `CUSTOM_OBJECT_ERROR`: Issues with special object mappings

**Implementation**:

- Integrate with parser and mapper
- Enhanced error reporting system
- Validation pipeline with multiple checks

**Testing**:

- Test all error types
- Test validation pipeline
- Test error reporting format

#### 3.2 Add Validation Tests (`scripts/i18n/__tests__/validate.test.ts`)

**Purpose**: Comprehensive testing of validation logic

**Test Cases**:

- Valid strings.ts files
- Invalid formats (wrong case, special chars)
- Missing/extra translations
- Custom object validation
- Error message formatting

### Phase 4: Integration and Migration (Week 4)

#### 4.1 Update Manage Script (`scripts/i18n/manage.ts`)

**Purpose**: Support strings-first operations

**New Features**:

- Add keys to strings.ts files instead of JSON
- Update existing keys in strings.ts
- Remove keys from strings.ts
- Validate format before adding

**Implementation**:

- Modify CRUD operations to work with strings.ts
- Add format validation
- Update help text and examples

**Testing**:

- Test add/update/remove operations
- Test format validation
- Test integration with sync

#### 4.2 Create Migration Utilities (`scripts/i18n/migrate.ts`)

**Purpose**: Convert JSON-first domains to strings-first

**Features**:

- Analyze existing JSON structure
- Generate strings.ts files from JSON
- Validate generated files
- Support gradual migration

**Implementation**:

- Reverse engineering from JSON to constants
- Template generation for strings.ts
- Migration tracking

**Testing**:

- Test migration of various domains
- Test generated file validation
- Test gradual migration workflow

#### 4.3 Update Package Scripts (`package.json`)

**Purpose**: Add new npm scripts for strings-first workflow

**New Scripts**:

- `i18n:sync-strings` - Run strings-first sync
- `i18n:validate-strings` - Run enhanced validation
- `i18n:migrate` - Run migration utilities
- `i18n:check` - Run full validation pipeline

**Implementation**:

- Update scripts section
- Add script descriptions
- Update README with new workflow

### Phase 5: Testing and Documentation (Week 5)

#### 5.1 Comprehensive Test Suite

**Purpose**: Ensure reliability of the entire system

**Test Categories**:

- **Unit tests**: Individual module testing
- **Integration tests**: End-to-end workflow testing
- **Regression tests**: Ensure existing functionality still works
- **Performance tests**: Handle large codebases efficiently

**Coverage Goals**:

- 90%+ code coverage
- All error paths tested
- All edge cases covered

#### 5.2 Documentation Updates

**Purpose**: Document new workflow and maintenance procedures

**Documentation**:

- Update README with strings-first workflow
- Create troubleshooting guide
- Document custom object configuration
- Create migration guide for teams

## Testing Strategy

### Test Organization

- `scripts/i18n/__tests__/` - All test files
- Separate test files for each module
- Integration tests for full workflows

### Test Types

- **Parser tests**: Test TypeScript parsing accuracy
- **Mapper tests**: Test domain/category detection
- **Sync tests**: Test full sync pipeline
- **Validation tests**: Test all validation rules
- **Integration tests**: Test complete workflows

### Test Data

- Mock strings.ts files with various patterns
- Mock JSON files for comparison
- Edge cases and error conditions

## Migration Strategy

### Gradual Migration

1. **Phase 1**: Implement strings-first alongside existing JSON-first
2. **Phase 2**: Migrate one domain at a time (start with simple ones)
3. **Phase 3**: Update team workflows and documentation
4. **Phase 4**: Deprecate JSON-first editing
5. **Phase 5**: Remove JSON-first code paths

### Backward Compatibility

- Support mixed mode during transition
- Clear error messages for deprecated workflows
- Migration tools for existing domains

## Maintenance Guidelines

### Code Organization

- Keep modules small and focused
- Clear separation of concerns
- Comprehensive error handling
- Detailed logging for debugging

### Configuration Management

- Custom object mappings in dedicated config files
- Version control for configuration changes
- Documentation for adding new mappings

### Performance Considerations

- Efficient file parsing for large codebases
- Caching for repeated operations
- Memory-efficient processing

### Error Handling

- Clear, actionable error messages
- File path and line number reporting
- Suggestions for fixes
- Non-breaking error handling

## Success Criteria

### Functional Requirements

- ✅ Strings.ts files are single source of truth
- ✅ JSON files generated automatically from constants
- ✅ Detailed validation with source tracking
- ✅ Custom object support (NAVIGATION_SECTIONS, etc.)
- ✅ Dynamic feature/domain detection
- ✅ Backward compatibility during migration

### Quality Requirements

- ✅ Comprehensive test coverage (90%+)
- ✅ Clear error messages and documentation
- ✅ Maintainable, modular code structure
- ✅ Performance suitable for large codebases
- ✅ Easy to extend and modify

### Process Requirements

- ✅ Gradual migration path
- ✅ Team workflow documentation
- ✅ Troubleshooting guides
- ✅ Configuration management procedures

## Timeline and Milestones

- **Week 1**: Core infrastructure (parser, mapper, custom objects)
- **Week 2**: Strings-first sync implementation
- **Week 3**: Enhanced validation system
- **Week 4**: Integration, migration utilities, package scripts
- **Week 5**: Comprehensive testing, documentation, final validation

## Risk Mitigation

### Technical Risks

- **Parsing complexity**: Start with regex-based parsing, upgrade to AST if needed
- **Performance issues**: Implement streaming processing for large files
- **Edge cases**: Comprehensive test coverage for real-world scenarios

### Process Risks

- **Migration complexity**: Gradual migration with rollback capabilities
- **Team adoption**: Clear documentation and training materials
- **Breaking changes**: Maintain backward compatibility during transition

## Conclusion

This plan provides a comprehensive roadmap for implementing strings-first i18n with enhanced validation, custom object handling, and maintainable architecture. The phased approach ensures minimal disruption while building a robust, scalable system.
