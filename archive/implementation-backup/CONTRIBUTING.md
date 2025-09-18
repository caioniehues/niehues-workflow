# Contributing to Nexus Workflow

Thank you for your interest in contributing to Nexus Workflow! This document provides comprehensive guidelines for contributing to the project while maintaining our constitutional standards and quality requirements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Constitutional Compliance](#constitutional-compliance)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Release Process](#release-process)

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inspiring community for all. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- **Respectful Communication:** Using welcoming and inclusive language
- **Constructive Feedback:** Being respectful of differing viewpoints and experiences
- **Graceful Acceptance:** Gracefully accepting constructive criticism
- **Community Focus:** Focusing on what is best for the community
- **Empathy:** Showing empathy towards other community members

Examples of unacceptable behavior include:

- **Harassment:** The use of sexualized language or imagery, and unwelcome sexual attention or advances
- **Trolling:** Insulting/derogatory comments, and personal or political attacks
- **Privacy Violations:** Publishing others' private information without explicit permission
- **Professional Misconduct:** Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly. The project team is obligated to maintain confidentiality with regard to the reporter of an incident.

## Constitutional Compliance

**⚖️ CRITICAL: All contributions must adhere to Nexus's constitutional framework.**

### Immutable Principles

Before contributing, you must understand and commit to these non-negotiable principles:

1. **Test-Driven Development**
   - All code changes must be preceded by failing tests
   - No production code without corresponding tests
   - Minimum 80% test coverage required

2. **Quality Gates**
   - All quality checks must pass
   - No bypassing of quality gates
   - Constitutional compliance cannot be overridden

3. **Context Preservation**
   - All decisions must be documented
   - Context cannot be lost or ignored
   - Audit trail must be maintained

4. **Interactive Validation**
   - Human oversight required for critical decisions
   - Automated validation supplemented by manual review

5. **Question Everything, Assume Nothing**
   - Ambiguities must be resolved
   - Assumptions must be documented
   - Confidence thresholds must be met

### Constitutional Violations

The following actions are constitutional violations and will result in contribution rejection:

- ❌ Committing code without tests
- ❌ Bypassing quality gates
- ❌ Removing constitutional enforcement
- ❌ Ignoring context preservation requirements
- ❌ Submitting changes without proper documentation

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Git** ≥ 2.40.0
- **VS Code** (recommended) or another TypeScript-compatible editor

### First-Time Setup

1. **Fork and Clone**
   ```bash
   # Fork on GitHub first, then:
   git clone https://github.com/YOUR-USERNAME/nexus-workflow.git
   cd nexus-workflow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Verify Installation**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Initialize Development Environment**
   ```bash
   # Initialize Nexus for development
   npx nexus init --name "nexus-development"
   ```

### Understanding the Codebase

Before making changes, familiarize yourself with:

- [Architecture Documentation](docs/architecture.md)
- [API Reference](docs/api.md)
- [User Guide](docs/user-guide.md)
- Existing tests in `tests/` directory
- Code style in existing implementation

## Development Setup

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes Using TDD**
   ```bash
   # Always start with failing tests
   npm run test:watch

   # Write your tests first
   # Then implement the minimal code to pass
   # Finally refactor for quality
   ```

3. **Verify Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   npm run typecheck
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "[NEXUS] feature: Add new functionality

   Constitutional Compliance: ✅
   TDD Cycle: Red ➜ Green ➜ Refactor
   Context Preserved: ✅
   Quality Gates: Passed"
   ```

### Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development mode with hot reload |
| `npm run build` | Build the project |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues automatically |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run clean` | Clean build artifacts |

## Contribution Guidelines

### Types of Contributions

We welcome the following types of contributions:

#### 🐛 Bug Fixes
- Identify and fix bugs
- Must include regression tests
- Follow TDD cycle: test first, then fix

#### ✨ Feature Enhancements
- New functionality or improvements
- Must be preceded by design discussion
- Requires comprehensive tests and documentation

#### 📚 Documentation
- Improve existing documentation
- Add missing documentation
- Fix documentation errors

#### 🧪 Test Improvements
- Add missing test coverage
- Improve test quality
- Add integration or end-to-end tests

#### 🔧 Infrastructure
- Build system improvements
- CI/CD enhancements
- Development tooling

### Contribution Process

1. **Check Existing Issues**
   - Search [GitHub Issues](https://github.com/your-username/nexus-workflow/issues)
   - Avoid duplicate work
   - Comment on relevant issues

2. **Create Issue (if needed)**
   - Use appropriate issue template
   - Provide detailed description
   - Include reproduction steps for bugs

3. **Design Discussion (for features)**
   - Discuss approach in issue comments
   - Get maintainer approval before implementation
   - Consider constitutional implications

4. **Implementation**
   - Follow TDD principles strictly
   - Maintain constitutional compliance
   - Write comprehensive tests

5. **Submit Pull Request**
   - Use PR template
   - Link to related issues
   - Provide detailed description

## Pull Request Process

### PR Requirements

**Before submitting a PR, ensure:**

- ✅ All tests pass (`npm test`)
- ✅ Code lints successfully (`npm run lint`)
- ✅ Type checking passes (`npm run typecheck`)
- ✅ Build succeeds (`npm run build`)
- ✅ Test coverage ≥ 80% for new code
- ✅ Documentation updated if needed
- ✅ Constitutional compliance verified

### PR Template

Use this template for all pull requests:

```markdown
## Description
Brief description of the changes and their purpose.

## Constitutional Compliance ⚖️
- [ ] All new code follows TDD cycle (tests first)
- [ ] Test coverage ≥ 80% for modified code
- [ ] Quality gates pass
- [ ] Context preservation maintained
- [ ] No constitutional violations introduced

## Changes Made
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] End-to-end tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Self-review completed
- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Changelog updated (for significant changes)

## Related Issues
Fixes #(issue_number)
Related to #(issue_number)

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Additional Notes
[Any additional information for reviewers]
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs automatically
   - Constitutional compliance verified
   - Quality gates must pass

2. **Peer Review**
   - At least one maintainer review required
   - Code quality and design review
   - Constitutional compliance double-check

3. **Final Approval**
   - All feedback addressed
   - All checks passing
   - Maintainer approval obtained

### Merge Requirements

**PRs will only be merged when:**

- All CI checks pass ✅
- Code review approved ✅
- Constitutional compliance verified ✅
- Documentation complete ✅
- No merge conflicts ❌

## Code Standards

### TypeScript Standards

#### Code Style

```typescript
// Use clear, descriptive names
class UserAuthenticationService {
  private readonly tokenService: TokenService;

  constructor(tokenService: TokenService) {
    this.tokenService = tokenService;
  }

  // Methods should have single responsibility
  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    // Implementation
  }
}

// Use interfaces for contracts
interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Use enums for constants
enum AuthError {
  INVALID_CREDENTIALS = 'invalid_credentials',
  ACCOUNT_LOCKED = 'account_locked',
  EMAIL_NOT_VERIFIED = 'email_not_verified'
}
```

#### Type Safety

```typescript
// Always use strict types
interface User {
  id: string;           // Specific types, not 'any'
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: Date;
}

// Use discriminated unions for variants
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Use generics appropriately
class Repository<T extends { id: string }> {
  async findById(id: string): Promise<T | null> {
    // Implementation
  }
}
```

### Error Handling

```typescript
// Custom error classes
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Proper error handling
async function authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await passwordService.verify(
      credentials.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials', 'INVALID_CREDENTIALS');
    }

    return { success: true, user, token: await tokenService.generate(user) };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { success: false, error: error.message };
    }

    // Log unexpected errors
    logger.error('Unexpected authentication error:', error);
    return { success: false, error: 'Authentication service unavailable' };
  }
}
```

### File Organization

```
src/
├── commands/           # CLI command implementations
│   ├── CommandHandler.ts
│   └── NexusInitCommand.ts
├── core/              # Core system components
│   ├── context/       # Context management
│   ├── database/      # Database layer
│   └── questions/     # Questioning engine
├── types/             # TypeScript type definitions
│   └── database.ts
├── utils/             # Utility functions
│   └── BrainstormFormatter.ts
└── index.ts           # Main entry point

tests/                 # Test files mirror src structure
├── unit/             # Unit tests
├── integration/      # Integration tests
└── e2e/              # End-to-end tests
```

## Testing Requirements

### Test-Driven Development

**MANDATORY:** All code changes must follow the TDD cycle:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code quality while keeping tests green

### Test Categories

#### Unit Tests

```typescript
// tests/unit/services/AuthService.test.ts
describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockTokenService = createMockTokenService();
    authService = new AuthService(mockUserRepository, mockTokenService);
  });

  describe('authenticateUser', () => {
    test('should return success with token for valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'password123' };
      const user = createTestUser(credentials.email);
      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockTokenService.generate.mockResolvedValue('jwt-token');

      // Act
      const result = await authService.authenticateUser(credentials);

      // Assert
      expect(result.success).toBe(true);
      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual(user);
    });

    test('should return failure for invalid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await authService.authenticateUser(credentials);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.token).toBeUndefined();
    });
  });
});
```

#### Integration Tests

```typescript
// tests/integration/AuthWorkflow.test.ts
describe('Authentication Workflow', () => {
  let app: Application;
  let database: Database;

  beforeAll(async () => {
    app = await createTestApp();
    database = await createTestDatabase();
  });

  afterAll(async () => {
    await database.close();
    await app.close();
  });

  test('complete user registration and login flow', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'integration@test.com',
        password: 'SecurePass123',
        name: 'Integration Test User'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.message).toContain('verification email sent');

    // Verify email (simulate)
    const user = await database.users.findOne({ email: 'integration@test.com' });
    await database.users.updateOne(
      { _id: user._id },
      { $set: { isVerified: true } }
    );

    // Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'SecurePass123'
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe('integration@test.com');

    // Access protected route
    const protectedResponse = await request(app)
      .get('/user/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.user.email).toBe('integration@test.com');
  });
});
```

#### End-to-End Tests

```typescript
// tests/e2e/NexusWorkflow.test.ts
describe('Nexus Workflow E2E', () => {
  test('complete workflow from init to implement', async () => {
    const tempDir = await createTempDirectory();

    // Initialize project
    const initResult = await runNexusCommand('init', {
      projectPath: tempDir,
      name: 'e2e-test-project'
    });
    expect(initResult.success).toBe(true);

    // Brainstorm phase
    const brainstormResult = await runNexusCommand('brainstorm', {
      projectPath: tempDir,
      output: 'test-brainstorm.md'
    });
    expect(brainstormResult.success).toBe(true);

    // Verify brainstorm output
    const brainstormContent = await fs.readFile(
      path.join(tempDir, 'test-brainstorm.md'),
      'utf-8'
    );
    expect(brainstormContent).toContain('## Selected Approach');

    // Continue with other phases...
  });
});
```

### Coverage Requirements

- **Minimum Coverage**: 80% for all new code
- **Line Coverage**: ≥80%
- **Branch Coverage**: ≥80%
- **Function Coverage**: ≥80%
- **Statement Coverage**: ≥80%

### Test Utilities

```typescript
// tests/utils/testHelpers.ts

// Mock factories
export function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

// Test data factories
export function createTestUser(email?: string): User {
  return {
    id: randomUUID(),
    email: email || 'test@example.com',
    passwordHash: 'hashed-password',
    name: 'Test User',
    isVerified: true,
    createdAt: new Date(),
    lastLogin: new Date()
  };
}

// Constitutional compliance helpers
export async function expectTDDCompliance(testSuiteName: string): Promise<void> {
  const tddResults = await checkTDDCompliance(testSuiteName);
  expect(tddResults.testsFirst).toBe(true);
  expect(tddResults.redGreenRefactor).toBe(true);
}
```

## Documentation Standards

### Code Documentation

```typescript
/**
 * Authenticates a user with email and password credentials.
 *
 * This method implements secure authentication following constitutional
 * TDD principles. It validates credentials, checks account status,
 * and generates JWT tokens for successful authentication.
 *
 * @param credentials - User login credentials
 * @param credentials.email - User's email address
 * @param credentials.password - User's password (plain text)
 * @returns Promise resolving to authentication result
 *
 * @throws {AuthenticationError} When credentials are invalid
 * @throws {RateLimitExceededError} When rate limit is exceeded
 *
 * @example
 * ```typescript
 * const result = await authService.authenticateUser({
 *   email: 'user@example.com',
 *   password: 'securePassword'
 * });
 *
 * if (result.success) {
 *   console.log('User authenticated:', result.user);
 *   localStorage.setItem('token', result.token);
 * }
 * ```
 *
 * @constitutional This method enforces TDD principles and must maintain
 * audit trail for all authentication attempts.
 */
async authenticateUser(
  credentials: LoginCredentials
): Promise<AuthResult> {
  // Implementation...
}
```

### README Files

Each major component should include a README:

```markdown
# Component Name

Brief description of the component's purpose and role in the system.

## Constitutional Compliance

- ✅ Follows TDD principles
- ✅ Maintains quality gates
- ✅ Preserves context

## Usage

```typescript
// Usage examples
```

## API Reference

### Methods

#### `methodName(param: Type): ReturnType`

Description of method purpose and behavior.

**Parameters:**
- `param` (Type): Parameter description

**Returns:**
- `ReturnType`: Return value description

**Example:**
```typescript
const result = await component.methodName(value);
```

## Testing

How to test this component:

```bash
npm run test -- --testPathPattern=ComponentName
```

## Contributing

Guidelines specific to this component.
```

### Inline Documentation

```typescript
// Use comments to explain WHY, not WHAT
class UserAuthenticationService {
  // Rate limiting prevents brute force attacks (constitutional requirement)
  private readonly rateLimiter = new RateLimiter({
    maxAttempts: 5,
    windowMs: 60000 // 1 minute
  });

  async authenticateUser(credentials: LoginCredentials): Promise<AuthResult> {
    // Check rate limit first to prevent abuse
    await this.rateLimiter.checkLimit(credentials.email);

    // Constitutional requirement: audit all authentication attempts
    await this.auditLogger.logAttempt({
      email: credentials.email,
      timestamp: new Date(),
      ipAddress: this.getClientIP()
    });

    // Implementation continues...
  }
}
```

## Release Process

### Version Management

We use [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

### Pre-release Checklist

Before releasing:

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped appropriately
- [ ] Constitutional compliance verified
- [ ] Performance benchmarks run
- [ ] Security scan completed

### Release Steps

1. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0
   ```

2. **Update Version**
   ```bash
   npm version minor  # or major/patch
   ```

3. **Update Changelog**
   ```markdown
   ## [1.2.0] - 2024-01-15

   ### Added
   - New authentication service
   - Enhanced context management

   ### Changed
   - Improved error handling
   - Updated dependencies

   ### Fixed
   - Fixed memory leak in context manager
   - Resolved constitutional compliance edge case
   ```

4. **Create Pull Request**
   - Target: `main` branch
   - Include release notes
   - Tag maintainers for review

5. **Post-Release**
   - Create GitHub release
   - Update documentation site
   - Announce in community channels

### Hotfix Process

For critical bug fixes:

1. **Create Hotfix Branch**
   ```bash
   git checkout -b hotfix/critical-security-fix main
   ```

2. **Fix Issue** (following TDD)

3. **Fast-track Review**
   - Security team review
   - Constitutional compliance check
   - Immediate merge approval

4. **Emergency Release**
   - Patch version bump
   - Immediate deployment
   - Post-release monitoring

---

Thank you for contributing to Nexus Workflow! Your adherence to our constitutional principles and commitment to quality helps maintain the integrity of this TDD-enforced development system. Together, we're building a tool that ensures high-quality software development through immutable principles and systematic approaches.

For questions about contributing, please:

1. Check existing documentation
2. Search GitHub issues and discussions
3. Ask in community channels
4. Contact maintainers directly

**Remember: Every contribution, no matter how small, strengthens our constitutional commitment to quality software development. 🚀**