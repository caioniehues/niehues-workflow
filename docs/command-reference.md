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