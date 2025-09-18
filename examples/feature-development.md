# Example: Feature Development Workflow

## Scenario
Developing a user registration feature for a web application.

## Full Workflow Execution

### Step 1: Initialize Project
```bash
/nexus-init
```

Output:
```
Detecting project type... Node.js with Express
Creating .nexus directory structure...
Generating guidelines based on project type...
Nexus initialized successfully!
```

### Step 2: Brainstorm Approaches
```bash
/nexus-brainstorm "user registration system"
```

Questions asked:
- What information do you collect during registration?
- Email and password? Social login? Both?
- Do you need email verification?
- What password requirements?
- GDPR compliance needed?
- Rate limiting for registration?
- What happens after successful registration?

Approaches generated:

**Approach A: Simple Email/Password**
- Basic registration with email/password
- Email verification via link
- Standard session management
- Pros: Simple, well-understood
- Cons: Limited features

**Approach B: Comprehensive Auth System**
- Email/password + OAuth providers
- Two-factor authentication option
- JWT with refresh tokens
- Pros: Feature-rich, scalable
- Cons: More complex

**Approach C: Passwordless**
- Magic link authentication
- No password management
- Token-based sessions
- Pros: Better UX, more secure
- Cons: Email dependency

Selected: **Approach B** (most flexible for future needs)

### Step 3: Create Specification
```bash
/nexus-specify "user registration"
```

Specification created:
```markdown
## Functional Requirements

### FR-001: User Registration
Users can register with email/password or OAuth providers

**Acceptance Criteria:**
- Valid email required
- Password minimum 8 characters
- Password must include number and special character
- Duplicate emails rejected
- Success returns JWT tokens

### FR-002: Email Verification
Users must verify email before access

**Acceptance Criteria:**
- Verification email sent on registration
- Link valid for 24 hours
- Clicking link verifies account
- Resend option available

### FR-003: OAuth Registration
Support Google and GitHub OAuth

**Acceptance Criteria:**
- OAuth flow completes successfully
- User profile created from OAuth data
- Email extracted and stored
- Tokens properly managed
```

### Step 4: Design Architecture
```bash
/nexus-design "user registration"
```

Architecture components:
- **RegistrationController**: HTTP request handling
- **AuthService**: Business logic
- **UserRepository**: Database operations
- **EmailService**: Verification emails
- **TokenManager**: JWT operations
- **OAuthHandler**: OAuth provider integration

Security analysis:
- Rate limiting on registration endpoint
- Password hashing with bcrypt
- JWT secrets in environment variables
- SQL injection prevention
- XSS protection on inputs

### Step 5: Decompose into Tasks
```bash
/nexus-decompose "user registration"
```

Tasks created:
```yaml
T001: [S] Write registration controller tests
T002: [M] Implement registration controller
T003: [S] Write auth service tests
T004: [M] Implement auth service
T005: [P][S] Write user repository tests
T006: [P][S] Write email service tests
T007: [M] Implement user repository
T008: [M] Implement email service
T009: [S] Write OAuth handler tests
T010: [L] Implement OAuth handler
T011: [S] Integration tests
T012: [S] E2E tests
```

Critical path: T001 → T002 → T003 → T004 → T011 → T012
Parallel opportunities: T005/T006 can run simultaneously

### Step 6: Implementation Phase
```bash
/nexus-implement T001
```

Writing test first:
```javascript
// test/controllers/registration.test.js
describe('RegistrationController', () => {
  it('should register user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecureP@ss123'
    };

    const response = await request(app)
      .post('/api/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
  });
});
```

Test failing ✓

Implementing:
```javascript
// src/controllers/registration.js
async function register(req, res) {
  const { email, password } = req.body;

  // Minimal implementation to pass test
  const user = await authService.register(email, password);
  const tokens = tokenManager.generateTokens(user);

  res.status(201).json(tokens);
}
```

Test passing ✓

Pattern extracted: Token generation pattern saved to library

### Step 7: Validation
```bash
/nexus-validate "user registration"
```

Results:
```
Tests: 24/24 passing
Coverage: 89% (exceeds 80% requirement)
Security scan: No vulnerabilities
Guidelines: 100% compliant
Performance: Registration < 200ms

Validation PASSED ✓
```

### Step 8: Evolution and Learning
```bash
/nexus-evolve
```

Patterns extracted:
1. **Token Generation Pattern**: Used 3 times
2. **Validation Middleware Pattern**: Used 4 times
3. **Repository Pattern**: Used 5 times

Learnings:
- OAuth implementation took 40% longer than estimated
- Email service tests could be better isolated
- Rate limiting pattern should be standardized

Guidelines updated:
- Added OAuth testing guidelines
- Updated estimation factors for third-party integrations

### Step 9: Maintenance
Two weeks later, bug reported:
```bash
/nexus-maintain bug-fix "Registration fails for Gmail addresses with +"
```

Process:
1. Reproduce with test:
```javascript
it('should handle Gmail + addresses', async () => {
  const userData = {
    email: 'user+tag@gmail.com',
    password: 'SecureP@ss123'
  };
  // Test fails, confirming bug
});
```

2. Fix implementation
3. Test now passes
4. All regression tests pass
5. Pattern extracted: Email validation pattern

## Metrics from This Feature

- Total time: 16 hours
- Tasks completed: 12/12
- Tests written: 24
- Coverage achieved: 89%
- Patterns extracted: 4
- Guidelines updated: 2

## Lessons Learned

1. **OAuth complexity** - Underestimated by 40%, adjust future estimates
2. **Parallel execution** - Saved 2 hours by running T005/T006 simultaneously
3. **Pattern value** - Token generation pattern reused 3 times already
4. **TDD benefit** - Bug fix was trivial with test-first approach

## What Worked Well

- Comprehensive questioning revealed GDPR requirement early
- Three approaches gave clear trade-off visibility
- Security analysis prevented vulnerabilities
- Pattern extraction improved subsequent features
- Evolution captured valuable learnings

## Next Features Can Leverage

- Extracted patterns (token generation, validation, repository)
- Improved OAuth estimates
- Email service can be reused
- Testing strategies proven effective