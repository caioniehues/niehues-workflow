# Example Nexus Workflows

## Example 1: New Feature Development

### Scenario
Adding user authentication to web application

### Workflow Execution

#### 1. BRAINSTORM Phase
```bash
/nexus-brainstorm "user authentication system"
```

Questions asked:
- What authentication methods? (email/password, OAuth, 2FA?)
- Session management approach? (JWT, sessions, cookies?)
- Password requirements? (complexity, expiration?)
- Account recovery process? (email, SMS, security questions?)

Output: `.nexus/brainstorms/2025-09-18-auth.md`

#### 2. SPECIFY Phase
```bash
/nexus-specify "user authentication"
```

Created specifications:
- Functional requirements with test criteria
- API endpoint definitions
- Data model for users and sessions
- Security requirements

Output: `.nexus/specs/auth/specification.md`

#### 3. DESIGN Phase
```bash
/nexus-design "authentication"
```

Architecture decisions:
- JWT for stateless auth
- Bcrypt for password hashing
- Redis for session storage
- Rate limiting strategy

Output: `.nexus/design/auth/architecture.md`

#### 4. DECOMPOSE Phase
```bash
/nexus-decompose
```

Tasks created:
- [S] T001: Write auth service tests
- [M] T002: Implement auth service
- [S] T003: Write password validation tests
- [XS] T004: Implement password validation
- [P][S] T005: Write session tests
- [P][S] T006: Write rate limiter tests

Output: `.nexus/tasks/auth-tasks.md`

#### 5. IMPLEMENT Phase
```bash
/nexus-implement T001
# RED: Write failing test
# Get approval
# GREEN: Implement minimal code
# REFACTOR: Improve structure
```

Pattern detected: Error handling repeated 3x
Extracted to: `.nexus/patterns/code/auth-error-handling.md`

#### 6. VALIDATE Phase
```bash
/nexus-validate
```

Results:
- Tests: 100% passing
- Coverage: 87%
- Security: No vulnerabilities
- Guidelines: 100% compliance

Output: `.nexus/validation/auth-report.md`

#### 7. EVOLVE Phase
```bash
/nexus-evolve
```

Learnings:
- Auth pattern valuable for reuse
- Session management questions recurring
- Need specialized auth-test agent

Output: `.nexus/evolution/2025-09-18-reflection.md`

## Example 2: Bug Fix Workflow

### Scenario
Critical production bug in payment processing

### Workflow Execution

#### Fast Track with TDD Exception
```bash
# Document emergency
echo "Emergency: Payment bug affecting production" > .nexus/decision-log.md

# Jump directly to IMPLEMENT
/nexus-implement --emergency

# Fix with temporary exception
# Document: "Tests to be added within 24 hours"

# Within 24 hours
/nexus-brainstorm "payment bug root cause"
/nexus-specify "payment validation rules"
/nexus-implement --add-tests
/nexus-validate
```

## Example 3: Refactoring Workflow

### Scenario
Refactoring legacy code to patterns

### Workflow Execution

#### Start from DESIGN
```bash
# Understand existing code
/nexus-design --analyze-existing

# Identify patterns
# SecurityGuardian reviews for vulnerabilities
# Pattern detector finds repeated structures

# Decompose refactoring
/nexus-decompose --refactor

# Tasks include:
# - Write tests for existing behavior
# - Refactor to patterns
# - Validate no regression

# Pattern library grows
# Evolution captures refactoring patterns
```