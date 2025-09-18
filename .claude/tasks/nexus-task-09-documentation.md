<?xml version="1.0" encoding="UTF-8"?>
<task id="9" name="Documentation and Examples" parallel_group="documentation">
  <metadata>
    <title>Comprehensive Documentation and Examples</title>
    <description>Create user guides, command references, and working examples</description>
    <assigned_to>documentation-specialist</assigned_to>
    <priority>high</priority>
    <t_shirt_size>XL</t_shirt_size>
    <estimated_hours>6</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#documentation</context_source>
  </metadata>

  <requirements>
    <requirement id="DOC-001" priority="critical">
      Create comprehensive user guide
    </requirement>
    <requirement id="DOC-002" priority="critical">
      Document all commands with examples
    </requirement>
    <requirement id="DOC-003" priority="high">
      Create working workflow examples
    </requirement>
    <requirement id="DOC-004" priority="high">
      Build troubleshooting guide
    </requirement>
    <requirement id="DOC-005" priority="medium">
      Create quick start guide
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. User Guide -->
    <deliverable id="DD-001" type="documentation">
      <path>docs/user-guide.md</path>
      <description>Complete user documentation</description>
      <content_structure>
# Nexus Enhanced Workflow - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Philosophy](#philosophy)
3. [Getting Started](#getting-started)
4. [Pipeline Overview](#pipeline)
5. [Working with Tasks](#tasks)
6. [Evolution and Learning](#evolution)
7. [Best Practices](#best-practices)

## Introduction

Nexus Enhanced Workflow v5 is a comprehensive development methodology that emphasizes:
- Test-Driven Development (TDD)
- Unlimited adaptive questioning
- Continuous learning and evolution
- Pattern extraction and reuse

This is NOT software you install - it's a workflow methodology you practice using Claude.

## Philosophy

### Core Principles

#### 1. Unlimited Questioning
No artificial limits on clarification. Continue asking until complete understanding is achieved.

#### 2. Test-First Development
Tests before code is the strong default, with documented exceptions for:
- Exploratory spikes (max 2 hours)
- Emergency hotfixes (tests within 24 hours)
- Proof of concepts (clearly marked)

#### 3. Continuous Evolution
Learn from every:
- Pattern repetition (3+ times)
- Question frequency (5+ times)
- Task failure (2+ times)
- Security issue (immediate rule)

### Why Nexus?

Traditional development often:
- Rushes into coding without understanding
- Skips tests to "save time"
- Repeats mistakes
- Loses knowledge

Nexus ensures:
- Complete understanding before coding
- Quality through testing
- Learning from patterns
- Knowledge preservation

## Getting Started

### Prerequisites
- Claude Desktop or API access
- Git repository
- Basic TDD understanding
- Commitment to the methodology

### Initial Setup

1. **Initialize Nexus**
   ```
   /nexus-init
   ```
   This creates the `.nexus/` directory structure and guidelines.

2. **Review Guidelines**
   Check `.nexus/guidelines.md` and customize for your project.

3. **Start Your First Feature**
   ```
   /nexus-brainstorm "user authentication"
   ```

### Directory Structure

```
.nexus/
├── guidelines.md        # Your project guidelines
├── project-dna.md       # Technology and patterns
├── decision-log.md      # Decision tracking
├── brainstorms/         # Ideation sessions
├── specs/               # Formal specifications
├── design/              # Architecture designs
├── tasks/               # Task breakdowns
├── patterns/            # Extracted patterns
├── evolution/           # Learning outputs
└── metrics/             # Performance tracking
```

## Pipeline Overview

### The Nexus Pipeline

```
BRAINSTORM ← → SPECIFY ← → DESIGN ← → DECOMPOSE ← → IMPLEMENT ← → VALIDATE
                                                          ↓
                                                      MAINTAIN
```

### Phase Descriptions

#### BRAINSTORM
Generate multiple solution approaches through unlimited questioning.
- Minimum 3 approaches
- Complete trade-off analysis
- Pattern identification
- Risk assessment

#### SPECIFY
Create formal, testable specifications.
- All requirements testable
- Acceptance criteria defined
- API contracts specified
- Edge cases documented

#### DESIGN
Architect the solution with security focus.
- Component architecture
- Security threat modeling
- Technology selection
- Pattern application

#### DECOMPOSE
Break into sized, executable tasks.
- T-shirt sizing (XS-XL)
- Dependency mapping
- Parallel opportunities
- Context embedding

#### IMPLEMENT
Execute with TDD discipline.
- RED: Write failing test
- GREEN: Minimal code to pass
- REFACTOR: Improve structure
- Pattern extraction

#### VALIDATE
Comprehensive quality verification.
- All tests passing
- Coverage ≥ 80%
- Security scan clean
- Guidelines met

#### MAINTAIN
Ongoing support and improvement.
- Bug fixes with tests
- Security patches
- Performance optimization
- Technical debt management

### Backward Navigation

You can return to earlier phases when needed:
- Unclear requirements → Back to SPECIFY
- Design issues → Back to DESIGN
- Missing context → Back to BRAINSTORM

This is realistic and encouraged!

## Working with Tasks

### Task States

Tasks progress through 12 states:

1. **PENDING** - Not started
2. **BLOCKED** - Waiting on dependency
3. **WRITING_TEST** - Creating test
4. **TEST_FAILING** - Test written, failing
5. **IMPLEMENTING** - Writing code
6. **TEST_PASSING** - Code works
7. **REVIEWING** - Under review
8. **NEEDS_REWORK** - Issues found
9. **REFACTORING** - Improving code
10. **PAUSED** - Temporarily stopped
11. **CANCELLED** - Abandoned
12. **FAILED** - Cannot complete
13. **DONE** - Complete

### Task Sizing

| Size | Duration | When to Use |
|------|----------|-------------|
| XS | &lt; 30min | Trivial changes |
| S | 30-60min | Simple features |
| M | 1-2hr | Moderate complexity |
| L | 2-4hr | Significant work |
| XL | > 4hr | MUST SPLIT! |

### Parallel Execution

Tasks marked with [P] can run simultaneously:
```
[P] T001: Write auth tests
[P] T002: Write user tests
    T003: Implement auth (depends on T001)
```

## Evolution and Learning

### Continuous Evolution
Always running, detecting patterns in real-time.

### Micro Evolution
After each phase, capture:
- What worked well
- What was challenging
- Patterns emerged
- Improvements needed

### Formal Evolution
After full pipeline:
- Comprehensive analysis
- Pattern extraction
- Guideline updates
- Agent proposals

### Learning Triggers

| Trigger | Threshold | Action |
|---------|-----------|---------|
| Pattern repetition | 3+ times | Extract to template |
| Question frequency | 5+ times | Add to questionnaire |
| Task failure | 2+ times | Process review |
| Security issue | Any | Immediate rule |

## Best Practices

### Effective Questioning
- Start broad, narrow down
- Challenge assumptions
- Explore edge cases
- Verify understanding

### TDD Discipline
- Always test first (unless documented exception)
- Keep tests simple
- One assertion per test preferred
- Test behavior, not implementation

### Pattern Recognition
- Look for repetition
- Document patterns immediately
- Share with team
- Build template library

### Task Management
- Keep tasks small (≤ L)
- Embed context
- Map dependencies clearly
- Identify parallel opportunities

### Documentation
- Document decisions as made
- Keep specs updated
- Maintain pattern library
- Track technical debt

## Troubleshooting

### Common Issues

**"Questioning seems endless"**
- This is by design!
- Focus questions on understanding
- Provide concrete examples
- Trust the process

**"Tasks too large"**
- Split XL tasks immediately
- Use vertical or horizontal slicing
- Maintain logical cohesion

**"Tests failing after refactor"**
- Stop refactoring
- Fix tests first
- Refactor in smaller steps

**"Patterns not being detected"**
- Check threshold settings
- Manually extract if needed
- Review pattern library

## Command Reference

### Core Commands
- `/nexus-init` - Initialize workflow
- `/nexus-brainstorm` - Generate approaches
- `/nexus-specify` - Create specifications
- `/nexus-design` - Architecture design
- `/nexus-decompose` - Break into tasks
- `/nexus-implement` - Execute with TDD
- `/nexus-validate` - Quality verification
- `/nexus-evolve` - Reflection and learning
- `/nexus-maintain` - Ongoing support

### Utility Commands
- `/nexus-task` - Task management
- `/nexus-pattern` - Pattern operations
- `/nexus-metrics` - View metrics

## Getting Help

1. Check this guide
2. Review examples in `examples/`
3. Check evolution feedback in `.nexus/evolution/`
4. Consult pattern library
5. Ask the team
      </content_structure>
    </deliverable>

    <!-- 2. Command Reference -->
    <deliverable id="DD-002" type="documentation">
      <path>docs/command-reference.md</path>
      <description>Detailed command documentation</description>
      <content_structure>
# Nexus Command Reference

## Overview
All Nexus commands are executed through Claude using the `/nexus-*` pattern.

## Command Index

### Pipeline Commands
- [/nexus-init](#nexus-init)
- [/nexus-brainstorm](#nexus-brainstorm)
- [/nexus-specify](#nexus-specify)
- [/nexus-design](#nexus-design)
- [/nexus-decompose](#nexus-decompose)
- [/nexus-implement](#nexus-implement)
- [/nexus-validate](#nexus-validate)
- [/nexus-evolve](#nexus-evolve)
- [/nexus-maintain](#nexus-maintain)

### Utility Commands
- [/nexus-task](#nexus-task)
- [/nexus-pattern](#nexus-pattern)
- [/nexus-metrics](#nexus-metrics)

---

## /nexus-init

Initialize the Nexus workflow system for your project.

### Usage
```
/nexus-init
```

### Process
1. Checks for existing `.nexus/` directory
2. Detects project technology
3. Gets user commitment to TDD and questioning
4. Creates directory structure
5. Generates initial guidelines

### Output
- `.nexus/` directory structure
- `guidelines.md` with project rules
- `project-dna.md` with technology detection
- `decision-log.md` for tracking

### Example
```
/nexus-init
> Detecting project type... Node.js found
> Creating .nexus directory structure...
> Generating guidelines...
> Nexus initialized successfully!
```

---

## /nexus-brainstorm

Generate solution approaches through unlimited questioning.

### Usage
```
/nexus-brainstorm [topic]
```

### Parameters
- `topic` - The feature or problem to explore

### Process
1. Unlimited questioning phase
2. Pattern search in library
3. Generate minimum 3 approaches
4. Trade-off analysis
5. Recommendation with rationale

### Output
- `.nexus/brainstorms/[timestamp]-[topic].md`
- Selected approach recommendation
- Identified patterns
- Risk assessment

### Example
```
/nexus-brainstorm "user authentication"
> Q: What authentication methods do you need?
> Q: Will you support social login?
> Q: What about two-factor authentication?
> ...
> Generated 4 approaches
> Recommended: Approach B (JWT with refresh tokens)
```

---

## /nexus-specify

Create formal, testable specifications.

### Usage
```
/nexus-specify [feature]
```

### Parameters
- `feature` - The feature to specify

### Process
1. Load brainstorm if available
2. Define functional requirements
3. Create API contracts
4. Specify test requirements
5. Handle sharding if needed

### Output
- `.nexus/specs/[feature]/specification.md`
- Or sharded into epics/stories if large
- Updated decision log

### Example
```
/nexus-specify "user authentication"
> Loading brainstorm...
> Creating functional requirements...
> Defining API endpoints...
> Specification complete: 15 requirements defined
```

---

## /nexus-design

Create architectural design with security focus.

### Usage
```
/nexus-design [feature]
```

### Parameters
- `feature` - The feature to design

### Process
1. Load specification
2. Design architecture
3. Security threat modeling
4. Pattern application
5. Technology selection

### Output
- `.nexus/design/[feature]/architecture.md`
- Security analysis
- Component specifications
- Design decisions

### Example
```
/nexus-design "authentication"
> Creating component architecture...
> Analyzing security threats...
> Applying patterns: Facade, Repository
> Design complete with 5 components
```

---

## /nexus-decompose

Break specifications into sized tasks.

### Usage
```
/nexus-decompose [feature]
```

### Parameters
- `feature` - The feature to decompose

### Process
1. Analyze components
2. Create test and implementation tasks
3. Apply T-shirt sizing
4. Map dependencies
5. Identify parallel opportunities

### Output
- `.nexus/tasks/[feature]-tasks.yaml`
- Task list with sizes and dependencies
- Critical path analysis
- Parallel execution groups

### Example
```
/nexus-decompose "authentication"
> Creating 12 tasks...
> Sizing: 3 XS, 5 S, 3 M, 1 L
> Critical path: 8 hours
> Parallel opportunity: Save 3 hours
```

---

## /nexus-implement

Execute implementation with TDD enforcement.

### Usage
```
/nexus-implement [task-id]
```

### Parameters
- `task-id` - The task to implement

### Process
1. RED: Write failing test
2. Get user approval
3. GREEN: Minimal implementation
4. REFACTOR: Improve structure
5. Security review
6. Pattern extraction

### Output
- Test file(s)
- Implementation code
- Updated task state
- Extracted patterns

### Example
```
/nexus-implement T001
> Writing test...
> Test failing ✓
> Implementing...
> Test passing ✓
> Pattern extracted: Error handling
> Task complete!
```

---

## /nexus-validate

Comprehensive quality validation.

### Usage
```
/nexus-validate [feature]
```

### Parameters
- `feature` - The feature to validate

### Process
1. Run all tests
2. Check coverage
3. Security scan
4. Guideline compliance
5. Performance validation

### Output
- `.nexus/validation/[timestamp]-report.md`
- Test results
- Coverage metrics
- Security findings
- Compliance report

### Example
```
/nexus-validate "authentication"
> Running tests... 42/42 passing
> Coverage: 87% (exceeds 80% requirement)
> Security scan: No vulnerabilities
> Guidelines: 100% compliant
> Validation PASSED
```

---

## /nexus-evolve

Perform workflow reflection and evolution.

### Usage
```
/nexus-evolve
```

### Process
1. Analyze pipeline execution
2. Consolidate micro-evolutions
3. Extract patterns
4. Generate improvements
5. Update guidelines

### Output
- `.nexus/evolution/[timestamp]-reflection.md`
- Pattern library updates
- Guideline amendments
- Agent proposals

### Example
```
/nexus-evolve
> Analyzing pipeline...
> 3 patterns extracted
> 2 guideline updates proposed
> 1 new agent recommended
> Evolution complete
```

---

## /nexus-maintain

Handle maintenance tasks.

### Usage
```
/nexus-maintain [type] [description]
```

### Parameters
- `type` - bug-fix|security-patch|dependency-update|performance|tech-debt
- `description` - Issue description

### Process
1. Classify maintenance
2. Create/reproduce test
3. Implement fix
4. Run regression tests
5. Update documentation

### Output
- Fixed code
- Test coverage
- Maintenance log entry
- Pattern extraction

### Example
```
/nexus-maintain bug-fix "Login fails with special characters"
> Reproducing bug...
> Test written
> Implementing fix...
> All tests passing
> Bug fixed and documented
```

---

## /nexus-task

Task management operations.

### Usage
```
/nexus-task [action] [task-id] [options]
```

### Actions
- `list` - List tasks with filters
- `show` - Display task details
- `update` - Update task state
- `start` - Begin work on task
- `complete` - Mark task done
- `block` - Mark as blocked
- `split` - Split XL task
- `parallel` - View parallel groups
- `critical` - Show critical path
- `metrics` - Display metrics

### Example
```
/nexus-task list --state PENDING
> 5 pending tasks:
> T001: Write auth tests (S)
> T002: Implement auth service (M)
> ...

/nexus-task start T001
> Task T001 started
> State: PENDING → WRITING_TEST
```

---

## /nexus-pattern

Pattern management operations.

### Usage
```
/nexus-pattern [action] [pattern-name]
```

### Actions
- `list` - List all patterns
- `show` - Display pattern details
- `extract` - Extract new pattern
- `apply` - Apply pattern to code
- `search` - Search for patterns

### Example
```
/nexus-pattern list
> 12 patterns in library:
> - error-handling (used 7 times)
> - repository-pattern (used 5 times)
> ...
```

---

## /nexus-metrics

View workflow metrics.

### Usage
```
/nexus-metrics [type]
```

### Types
- `pipeline` - Pipeline execution metrics
- `tasks` - Task completion metrics
- `patterns` - Pattern usage metrics
- `evolution` - Learning metrics
- `velocity` - Team velocity

### Example
```
/nexus-metrics velocity
> Daily velocity: 8 tasks/day
> Weekly velocity: 35 tasks/week
> Estimation accuracy: 82%
> Trend: Improving ↑
```
      </content_structure>
    </deliverable>

    <!-- 3. Example Workflows -->
    <deliverable id="DD-003" type="documentation">
      <path>examples/feature-development.md</path>
      <description>Complete feature development example</description>
      <content_structure>
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
Performance: Registration &lt; 200ms

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
      </content_structure>
    </deliverable>

    <!-- 4. Quick Start Guide -->
    <deliverable id="DD-004" type="documentation">
      <path>docs/quickstart.md</path>
      <description>5-minute quick start guide</description>
      <content_structure>
# Nexus Quick Start Guide

## 5 Minutes to Your First Feature

### Minute 1: Initialize
```bash
/nexus-init
```
Accept TDD commitment: **Yes**
Accept unlimited questioning: **Yes**

✓ Nexus is ready!

### Minute 2: Brainstorm Your Feature
```bash
/nexus-brainstorm "todo list feature"
```

Answer key questions:
- "Basic CRUD for todo items"
- "Single user, no sharing"
- "Priority levels: high, medium, low"
- "Due dates optional"

✓ 3 approaches generated, one selected!

### Minute 3: Create Specification
```bash
/nexus-specify "todo list"
```

Nexus creates testable requirements:
- FR-001: Create todo with title
- FR-002: Mark todo complete
- FR-003: Set priority level
- FR-004: Optional due date

✓ Specification ready!

### Minute 4: Break Down Tasks
```bash
/nexus-decompose "todo list"
```

Tasks created with sizes:
- T001: [S] Write todo model tests
- T002: [M] Implement todo model
- T003: [S] Write API tests
- T004: [M] Implement API

✓ 4 tasks ready to implement!

### Minute 5: Start Implementing
```bash
/nexus-implement T001
```

Write your first test:
```javascript
test('creates todo with title', () => {
  const todo = new Todo('Buy milk');
  expect(todo.title).toBe('Buy milk');
  expect(todo.completed).toBe(false);
});
```

✓ You're now doing TDD with Nexus!

## What's Next?

1. Continue implementing tasks
2. Run `/nexus-validate` when done
3. Use `/nexus-evolve` to learn and improve
4. Check `.nexus/patterns/` for reusable code

## Key Commands to Remember

- `/nexus-brainstorm` - Start new feature
- `/nexus-implement` - Build with TDD
- `/nexus-task list` - See your tasks
- `/nexus-validate` - Check quality
- `/nexus-evolve` - Learn and improve

## Tips for Success

1. **Don't fight the questions** - They ensure understanding
2. **Write tests first** - It's easier than you think
3. **Keep tasks small** - Nothing larger than L (4 hours)
4. **Extract patterns** - Reuse what works
5. **Evolve regularly** - Continuous improvement

## Getting Help

- Full guide: `docs/user-guide.md`
- Commands: `docs/command-reference.md`
- Examples: `examples/`
- Your patterns: `.nexus/patterns/`

Welcome to better development with Nexus!
      </content_structure>
    </deliverable>

    <!-- 5. Troubleshooting Guide -->
    <deliverable id="DD-005" type="documentation">
      <path>docs/troubleshooting.md</path>
      <description>Common issues and solutions</description>
      <content_structure>
# Nexus Troubleshooting Guide

## Common Issues and Solutions

### Setup Issues

#### "Command not recognized"
**Problem**: `/nexus-init` not working

**Solution**:
1. Ensure you're using Claude Desktop
2. Commands are in `.claude/commands/` directory
3. Restart Claude if needed

**Prevention**:
- Keep commands in correct directory
- Use proper markdown format

---

#### ".nexus directory already exists"
**Problem**: Can't initialize, directory exists

**Solution**:
```bash
# Backup existing directory
mv .nexus .nexus.backup
# Reinitialize
/nexus-init
```

**Prevention**:
- Check for existing .nexus before init
- Use version control for .nexus

---

### Pipeline Issues

#### "Questioning phase seems endless"
**Problem**: Too many questions during brainstorm

**Solution**:
- This is BY DESIGN - don't fight it
- Answer comprehensively
- Provide examples
- Be specific

**Prevention**:
- Come prepared with requirements
- Document assumptions beforehand
- Have stakeholders available

---

#### "Can't find brainstorm for specification"
**Problem**: `/nexus-specify` can't find brainstorm

**Solution**:
1. Check `.nexus/brainstorms/` directory
2. Run brainstorm if missing
3. Manually specify if needed

**Prevention**:
- Follow pipeline order
- Don't skip phases
- Check outputs exist

---

### Task Management Issues

#### "Task too large (XL)"
**Problem**: Task estimated > 4 hours

**Solution**:
```bash
/nexus-task split T001
```
Split strategies:
- Vertical: By user value
- Horizontal: By layer
- Incremental: MVP first

**Prevention**:
- Break down during decompose
- Think smaller units
- Separate test from implementation

---

#### "Tasks blocking each other"
**Problem**: Circular dependencies

**Solution**:
1. Map dependency graph
2. Identify cycle
3. Break cycle by:
   - Extracting shared interface
   - Creating intermediate task
   - Reordering work

**Prevention**:
- Plan dependencies carefully
- Keep coupling low
- Use dependency injection

---

### Implementation Issues

#### "Test passes without implementation"
**Problem**: Test not failing first (RED phase)

**Solution**:
- Test is checking wrong thing
- Implementation already exists
- Test not actually running

Debug:
```javascript
// Temporarily break implementation
throw new Error('Should fail');
// Run test - should fail
// If passes, test is wrong
```

**Prevention**:
- Always see test fail first
- Test behavior, not implementation
- Use test runners properly

---

#### "Can't achieve 80% coverage"
**Problem**: Coverage below requirement

**Solution**:
1. Run coverage report
2. Identify uncovered code
3. Add tests for:
   - Error conditions
   - Edge cases
   - All branches

**Prevention**:
- Write tests first (TDD)
- Test edge cases
- Remove dead code

---

### Pattern Issues

#### "Pattern not detected"
**Problem**: Repeated code not extracted

**Solution**:
Check thresholds:
- Must repeat 3+ times
- Must be substantial
- Must be similar enough

Manual extraction:
```bash
/nexus-pattern extract "error-handling"
```

**Prevention**:
- Be consistent in coding
- Look for patterns actively
- Document when you see repetition

---

#### "Pattern library overwhelming"
**Problem**: Too many patterns to manage

**Solution**:
1. Categorize patterns
2. Archive unused ones
3. Consolidate similar patterns
4. Document pattern relationships

**Prevention**:
- Extract only valuable patterns
- Regular pattern reviews
- Maintain pattern quality

---

### Evolution Issues

#### "No improvements identified"
**Problem**: Evolution not finding learnings

**Solution**:
- Review manually for:
  - Estimation accuracy
  - Repeated questions
  - Common blockers
  - Process friction

**Prevention**:
- Document issues as they occur
- Regular micro-evolutions
- Team retrospectives

---

#### "Guidelines too restrictive"
**Problem**: Guidelines blocking productivity

**Solution**:
1. Document specific friction
2. Propose guideline change
3. Test with small scope
4. Update if successful

**Prevention**:
- Start with minimal guidelines
- Add based on need
- Review regularly
- Allow documented exceptions

---

### Performance Issues

#### "Pipeline taking too long"
**Problem**: Full pipeline excessive time

**Solution**:
- Identify bottlenecks
- Use parallel tasks [P]
- Skip phases if appropriate
- Batch similar work

**Prevention**:
- Plan parallel work
- Size tasks appropriately
- Optimize critical path

---

#### "Validation very slow"
**Problem**: Tests take too long

**Solution**:
- Run in parallel
- Use test subsets
- Mock external services
- Cache test data

**Prevention**:
- Fast unit tests
- Minimal integration tests
- Selective E2E tests

---

## Emergency Procedures

### Critical Production Bug

1. Document emergency:
```bash
echo "EMERGENCY: [description]" >> .nexus/decision-log.md
```

2. Create failing test:
```bash
/nexus-maintain bug-fix "critical issue"
```

3. Fix with TDD exception:
- Implement fix
- Verify fix works
- Add test within 24 hours

4. Full validation within 48 hours

### Security Vulnerability

1. Immediate mitigation
2. Document vulnerability
3. Create prevention rule
4. Add to security patterns
5. Full security audit

### Data Loss

1. Stop all operations
2. Assess damage
3. Restore from backups
4. Document cause
5. Add prevention measures

## Getting Further Help

### Self-Help Resources
- Check evolution logs: `.nexus/evolution/`
- Review patterns: `.nexus/patterns/`
- Read decision log: `.nexus/decision-log.md`
- Check examples: `examples/`

### Debug Mode

Enable verbose logging:
```yaml
# .nexus/guidelines.md
debug:
  verbose: true
  log_level: DEBUG
  trace_decisions: true
```

### Common Command Fixes

| Issue | Command | Fix |
|-------|---------|-----|
| Stuck task | `/nexus-task update T001 --state PAUSED` | Pause and reassess |
| Lost context | `/nexus-task show T001` | Review embedded context |
| Wrong state | `/nexus-task update T001 --state PENDING --reason "Reset"` | Reset to pending |
| Need split | `/nexus-task split T001` | Break down XL task |

## Prevention Checklist

Before starting work:
- [ ] Nexus initialized
- [ ] Guidelines reviewed
- [ ] Team onboarded
- [ ] Patterns library ready

Before each feature:
- [ ] Requirements clear
- [ ] Stakeholders available
- [ ] Time allocated for questions
- [ ] Test environment ready

During implementation:
- [ ] Following TDD cycle
- [ ] Tests fail first
- [ ] Minimal implementation
- [ ] Patterns extracted

After completion:
- [ ] Validation passing
- [ ] Documentation updated
- [ ] Evolution captured
- [ ] Patterns documented
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - User guide comprehensive and clear
    - All commands documented with examples
    - Working examples demonstrate full workflow
    - Quick start enables immediate productivity
    - Troubleshooting covers common issues
    - Documentation follows methodology principles
    - No software code in documentation
    - Focus on workflow and process
  </success_criteria>

  <dependencies>
    - All other tasks (documentation comes last)
    - Complete command specifications
    - Working examples tested
    - Common issues identified
  </dependencies>

  <notes>
    This is METHODOLOGY documentation:
    - NO TypeScript code in docs
    - NO software installation instructions
    - Only workflow and process documentation
    - Examples show Claude command usage
    - Focus on methodology adoption
  </notes>

</task>