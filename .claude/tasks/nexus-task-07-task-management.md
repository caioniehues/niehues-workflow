<?xml version="1.0" encoding="UTF-8"?>
<task id="7" name="Task Management System" parallel_group="infrastructure">
  <metadata>
    <title>Task Management System Implementation</title>
    <description>Create comprehensive task tracking with 12-state machine and T-shirt sizing</description>
    <assigned_to>workflow-specialist</assigned_to>
    <priority>high</priority>
    <t_shirt_size>M</t_shirt_size>
    <estimated_hours>2.5</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#task-management</context_source>
  </metadata>

  <requirements>
    <requirement id="TM-001" priority="critical">
      Define 12-state task machine with transitions
    </requirement>
    <requirement id="TM-002" priority="critical">
      Implement T-shirt sizing system (XS-XL)
    </requirement>
    <requirement id="TM-003" priority="high">
      Create task file format specification
    </requirement>
    <requirement id="TM-004" priority="high">
      Design parallel execution marking system
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. Task State Machine Documentation -->
    <deliverable id="TMD-001" type="documentation">
      <path>.nexus/task-states.md</path>
      <description>Complete task state machine specification</description>
      <content_structure>
# Nexus Task State Machine

## State Definitions

### PENDING
- Initial state for all tasks
- Task created but not started
- Dependencies may not be met
- Can transition to: BLOCKED, WRITING_TEST, CANCELLED

### BLOCKED
- Task cannot proceed due to external dependency
- Waiting for another task, resource, or decision
- Must document blocking reason
- Can transition to: PENDING, CANCELLED

### WRITING_TEST
- Actively writing test cases (TDD first phase)
- Test must fail initially
- Requires user approval before proceeding
- Can transition to: TEST_FAILING, PAUSED, CANCELLED

### TEST_FAILING
- Test written and confirmed failing (RED phase)
- Ready for implementation
- Validates test effectiveness
- Can transition to: IMPLEMENTING, NEEDS_REWORK, CANCELLED

### IMPLEMENTING
- Writing production code to pass test
- Minimal code to make test green
- Following TDD principles
- Can transition to: TEST_PASSING, PAUSED, FAILED

### TEST_PASSING
- Implementation complete, tests green
- Ready for review and refactoring
- All tests must pass
- Can transition to: REVIEWING, REFACTORING, NEEDS_REWORK

### REVIEWING
- Code review in progress
- Security and pattern checks
- Guideline compliance verification
- Can transition to: NEEDS_REWORK, REFACTORING, DONE

### NEEDS_REWORK
- Issues identified requiring changes
- Must document required changes
- Returns to appropriate phase
- Can transition to: WRITING_TEST, IMPLEMENTING, CANCELLED

### REFACTORING
- Improving code structure
- Tests must remain green
- No behavior changes
- Can transition to: TEST_PASSING, REVIEWING, DONE

### PAUSED
- Temporarily suspended
- Must document pause reason
- Preserves all context
- Can transition to: Previous active state, CANCELLED

### CANCELLED
- Task abandoned
- Must document cancellation reason
- Terminal state
- No transitions from this state

### FAILED
- Task cannot be completed
- Must document failure reason
- Terminal state
- No transitions from this state

### DONE
- Task successfully completed
- All acceptance criteria met
- Terminal state
- No transitions from this state

## Valid State Transitions

```yaml
transitions:
  PENDING:
    - BLOCKED: "Dependencies not met"
    - WRITING_TEST: "Starting TDD cycle"
    - CANCELLED: "Task no longer needed"

  BLOCKED:
    - PENDING: "Blocker resolved"
    - CANCELLED: "Task abandoned"

  WRITING_TEST:
    - TEST_FAILING: "Test written and failing"
    - PAUSED: "Temporarily suspended"
    - CANCELLED: "Task abandoned"

  TEST_FAILING:
    - IMPLEMENTING: "Beginning implementation"
    - NEEDS_REWORK: "Test needs revision"
    - CANCELLED: "Task abandoned"

  IMPLEMENTING:
    - TEST_PASSING: "Tests now passing"
    - PAUSED: "Temporarily suspended"
    - FAILED: "Cannot complete"

  TEST_PASSING:
    - REVIEWING: "Ready for review"
    - REFACTORING: "Improving code"
    - NEEDS_REWORK: "Issues found"

  REVIEWING:
    - NEEDS_REWORK: "Changes required"
    - REFACTORING: "Improvements needed"
    - DONE: "Approved and complete"

  NEEDS_REWORK:
    - WRITING_TEST: "Test changes needed"
    - IMPLEMENTING: "Implementation changes"
    - CANCELLED: "Task abandoned"

  REFACTORING:
    - TEST_PASSING: "Refactoring complete"
    - REVIEWING: "Ready for review"
    - DONE: "Complete"

  PAUSED:
    - "[Previous State]": "Resuming work"
    - CANCELLED: "Task abandoned"
```

## State Tracking

All state changes logged in:
.nexus/tasks/state-log.yaml

Format:
```yaml
state_changes:
  - task_id: T001
    timestamp: ISO-8601
    from_state: PENDING
    to_state: WRITING_TEST
    reason: "Starting TDD cycle"
    actor: "developer"
```
      </content_structure>
    </deliverable>

    <!-- 2. T-Shirt Sizing Guide -->
    <deliverable id="TMD-002" type="documentation">
      <path>.nexus/sizing-guide.md</path>
      <description>T-shirt sizing system specification</description>
      <content_structure>
# T-Shirt Sizing Guide

## Size Definitions

### XS (Extra Small)
- **Duration**: &lt; 30 minutes
- **Complexity**: Trivial
- **Examples**:
  - Fix typo in documentation
  - Update configuration value
  - Add simple validation
  - Write single unit test

### S (Small)
- **Duration**: 30-60 minutes
- **Complexity**: Simple
- **Examples**:
  - Add new API endpoint
  - Implement simple feature
  - Write test suite for component
  - Fix straightforward bug

### M (Medium)
- **Duration**: 1-2 hours
- **Complexity**: Moderate
- **Examples**:
  - Implement service layer
  - Create complex component
  - Refactor module
  - Integration testing

### L (Large)
- **Duration**: 2-4 hours
- **Complexity**: Significant
- **Examples**:
  - Design and implement subsystem
  - Major refactoring
  - Complex algorithm implementation
  - Performance optimization

### XL (Extra Large)
- **Duration**: > 4 hours
- **Action**: MUST SPLIT
- **Why Split**:
  - Maintains focus
  - Enables better tracking
  - Allows parallelization
  - Reduces risk

## Splitting XL Tasks

### Splitting Strategies

1. **Vertical Slicing**
   - Split by user value
   - Each slice delivers functionality
   - Example: User auth → Registration, Login, Password reset

2. **Horizontal Slicing**
   - Split by technical layer
   - Example: API → Controller, Service, Database

3. **Incremental Building**
   - Start with MVP
   - Add features progressively
   - Example: Basic CRUD → Validation → Optimization

### Splitting Rules
- Each subtask must be independently valuable
- Maintain logical cohesion
- Preserve testability
- Enable parallel execution where possible

## Estimation Guidelines

### Factors to Consider
1. **Technical Complexity**
   - Algorithm complexity
   - Integration points
   - Dependencies

2. **Domain Knowledge**
   - Familiarity with area
   - Need for research
   - Documentation needs

3. **Testing Requirements**
   - Test complexity
   - Coverage needs
   - Edge cases

4. **Risk Factors**
   - Uncertainty
   - External dependencies
   - Performance requirements

### Adjustment Factors
- **First time**: +1 size
- **High risk**: +1 size
- **Well-understood**: -1 size
- **Good patterns exist**: -1 size

## Size Distribution Goals

Ideal task distribution:
- XS: 20%
- S: 30%
- M: 35%
- L: 15%
- XL: 0% (always split)

## Tracking and Adjustment

Track actual vs estimated:
```yaml
sizing_accuracy:
  task_id: T001
  estimated_size: M
  estimated_minutes: 90
  actual_minutes: 105
  variance: +16.7%
  notes: "Integration took longer than expected"
```

Use variance data to improve future estimates.
      </content_structure>
    </deliverable>

    <!-- 3. Task File Format Specification -->
    <deliverable id="TMD-003" type="documentation">
      <path>.nexus/task-format.md</path>
      <description>Standard task file format specification</description>
      <content_structure>
# Task File Format Specification

## File Structure

Tasks are stored in YAML format in `.nexus/tasks/`

## Task File Schema

```yaml
# Task File: feature-name-tasks.yaml
metadata:
  feature: "Feature name"
  created: "ISO-8601 timestamp"
  updated: "ISO-8601 timestamp"
  total_tasks: number
  estimated_hours: number
  actual_hours: number (updated as completed)

tasks:
  - id: "T001"  # Unique identifier
    title: "Task title"
    description: "Detailed task description"

    # Sizing and estimation
    size: "S"  # XS|S|M|L|XL
    estimated_minutes: 45
    actual_minutes: null  # Updated on completion

    # State tracking
    state: "PENDING"
    state_history:
      - state: "PENDING"
        timestamp: "ISO-8601"
        reason: "Task created"

    # Task classification
    type: "implementation"  # test|implementation|documentation|refactor|bugfix
    priority: "high"  # critical|high|medium|low

    # Dependencies and parallelization
    dependencies: ["T000"]  # Task IDs that must complete first
    blocks: ["T002"]  # Tasks that depend on this
    parallel: true  # Can run in parallel with siblings
    parallel_group: "auth"  # Named group for parallel execution

    # Context and requirements
    context:
      specification: "link/to/spec#section"
      design: "link/to/design#component"
      patterns: ["pattern1", "pattern2"]

    test_requirements:
      - "Unit test for validation"
      - "Integration test for API"

    acceptance_criteria:
      - "Returns 200 on success"
      - "Validates input correctly"
      - "Handles errors gracefully"

    # TDD tracking
    tdd:
      test_first: true
      test_file: "path/to/test.js"
      test_written: "ISO-8601"
      test_approved: "ISO-8601"
      implementation_started: "ISO-8601"
      tests_passing: "ISO-8601"

    # Resources and assignment
    assigned_to: "developer"
    resources_needed:
      - "Database access"
      - "API credentials"

    # Completion tracking
    completed:
      timestamp: "ISO-8601"
      completed_by: "developer"
      review_by: "reviewer"

    # Notes and issues
    notes:
      - timestamp: "ISO-8601"
        author: "developer"
        note: "Consider caching strategy"

    issues:
      - timestamp: "ISO-8601"
        issue: "Performance concern"
        resolution: "Added caching"

# Parallel execution groups
parallel_groups:
  auth:
    tasks: ["T001", "T003", "T005"]
    can_parallelize: true
    shared_resources: []

  database:
    tasks: ["T002", "T004"]
    can_parallelize: false  # Sequential required
    shared_resources: ["database"]

# Critical path
critical_path:
  tasks: ["T001", "T002", "T006", "T010"]
  estimated_duration: 480  # minutes

# Metrics
metrics:
  total_estimated: 720  # minutes
  total_actual: 0  # updated as tasks complete
  completed_count: 0
  in_progress_count: 0
  blocked_count: 0

  by_size:
    XS: { count: 5, estimated: 125, actual: 0 }
    S: { count: 8, estimated: 360, actual: 0 }
    M: { count: 4, estimated: 360, actual: 0 }
    L: { count: 2, estimated: 420, actual: 0 }
    XL: { count: 0, estimated: 0, actual: 0 }

  velocity:
    estimated_per_day: 240  # minutes
    actual_per_day: 0  # calculated from actuals
```

## File Naming Convention

```
.nexus/tasks/
├── [feature]-tasks.yaml          # Main task file
├── [feature]-tasks-archive.yaml  # Completed tasks
├── state-log.yaml                # State change history
└── metrics.yaml                  # Aggregate metrics
```

## Parallel Execution Marking

Tasks marked for parallel execution:
1. Set `parallel: true` on task
2. Assign to `parallel_group` if coordinated
3. Prefix title with [P] in displays
4. Ensure no resource conflicts

Example parallel marking:
```yaml
- id: "T003"
  title: "[P] Write user service tests"
  parallel: true
  parallel_group: "services"
  dependencies: []  # No dependencies = can start immediately
```

## Task ID Convention

Format: T[number] or [prefix]-T[number]

Examples:
- T001 - Simple incrementing
- AUTH-T001 - Feature prefixed
- BUG-T001 - Type prefixed
- 2024Q1-T001 - Time prefixed

## Update Protocols

### State Changes
- Log all transitions
- Include timestamp and reason
- Preserve history

### Time Tracking
- Update actual_minutes on completion
- Track variance from estimate
- Use for future improvements

### Completion
- Mark state as DONE
- Update completion metadata
- Archive if needed
      </content_structure>
    </deliverable>

    <!-- 4. Task Command -->
    <deliverable id="TMD-004" type="command">
      <path>.claude/commands/nexus-task.md</path>
      <description>Task management command</description>
      <content_structure>
---
name: nexus-task
description: Manage task states, view progress, and track work
tools: Read, Write, TodoWrite
implementation: .claude/commands/nexus-task.md
---

# /nexus-task [action] [task-id] [options]

Comprehensive task management and tracking.

&lt;actions&gt;
  &lt;action name="list"&gt;
    List tasks with filtering:
    - By state: --state PENDING
    - By size: --size M
    - By parallel: --parallel
    - By feature: --feature auth
  &lt;/action&gt;

  &lt;action name="show"&gt;
    Display detailed task information:
    - Full context
    - State history
    - Dependencies graph
    - Time tracking
  &lt;/action&gt;

  &lt;action name="update"&gt;
    Update task state:
    - Validate transition
    - Log change reason
    - Update timestamps
    - Notify dependencies
  &lt;/action&gt;

  &lt;action name="start"&gt;
    Begin work on task:
    - Check dependencies met
    - Set state to appropriate phase
    - Start time tracking
    - Update todo list
  &lt;/action&gt;

  &lt;action name="complete"&gt;
    Mark task as done:
    - Verify acceptance criteria
    - Update actual time
    - Calculate variance
    - Unblock dependencies
  &lt;/action&gt;

  &lt;action name="block"&gt;
    Mark task as blocked:
    - Document blocking reason
    - Identify blocking task/resource
    - Set state to BLOCKED
    - Track block duration
  &lt;/action&gt;

  &lt;action name="split"&gt;
    Split XL task:
    - Create subtasks
    - Maintain relationships
    - Distribute estimates
    - Update original task
  &lt;/action&gt;

  &lt;action name="parallel"&gt;
    View parallel groups:
    - Show executable groups
    - Check resource conflicts
    - Display shared dependencies
    - Recommend execution order
  &lt;/action&gt;

  &lt;action name="critical"&gt;
    Show critical path:
    - Display task sequence
    - Calculate duration
    - Identify bottlenecks
    - Suggest optimizations
  &lt;/action&gt;

  &lt;action name="metrics"&gt;
    Display task metrics:
    - Completion rate
    - Velocity trends
    - Size accuracy
    - State distribution
  &lt;/action&gt;
&lt;/actions&gt;

&lt;state_management&gt;
  Valid transitions enforced:
  - Check current state
  - Validate target state
  - Require transition reason
  - Log all changes

  Automatic updates:
  - Unblock dependencies when complete
  - Update metrics on changes
  - Recalculate critical path
  - Adjust estimates based on actuals
&lt;/state_management&gt;

&lt;parallel_execution&gt;
  Identify parallel opportunities:
  - Tasks with no dependencies
  - Tasks with met dependencies
  - Non-conflicting resource needs
  - Same parallel_group tasks

  Display as:
  ```
  Parallel Group: auth
  [P] T001: Write auth tests (45m)
  [P] T003: Write user tests (30m)
  [P] T005: Write role tests (30m)
  Total if parallel: 45m
  Total if serial: 105m
  Time saved: 60m (57%)
  ```
&lt;/parallel_execution&gt;

&lt;integration&gt;
  With TodoWrite:
  - Sync task states
  - Update todo list
  - Track active work

  With Evolution:
  - Track task patterns
  - Identify estimation accuracy
  - Extract workflow improvements
&lt;/integration&gt;
      </content_structure>
    </deliverable>

    <!-- 5. Task Dashboard Template -->
    <deliverable id="TMD-005" type="template">
      <path>templates/task-dashboard.md</path>
      <description>Task status dashboard template</description>
      <content_structure>
# Task Dashboard: {{feature_name}}
Generated: {{timestamp}}
Sprint: {{sprint_number}}

## Summary
Total Tasks: {{total_tasks}}
Completed: {{completed_tasks}} ({{completion_percentage}}%)
In Progress: {{in_progress_tasks}}
Blocked: {{blocked_tasks}}
Remaining: {{remaining_tasks}}

## Progress Bar
```
[{{progress_bar}}] {{completion_percentage}}%
```

## State Distribution
```
PENDING:       {{pending_count}}     ████████
WRITING_TEST:  {{writing_test_count}} ██
IMPLEMENTING:  {{implementing_count}} ███
REVIEWING:     {{reviewing_count}}    ██
DONE:          {{done_count}}        ██████████████
BLOCKED:       {{blocked_count}}      ███
```

## Size Distribution
| Size | Count | Estimated | Actual | Variance |
|------|-------|-----------|--------|----------|
| XS   | {{xs_count}} | {{xs_estimated}} | {{xs_actual}} | {{xs_variance}} |
| S    | {{s_count}} | {{s_estimated}} | {{s_actual}} | {{s_variance}} |
| M    | {{m_count}} | {{m_estimated}} | {{m_actual}} | {{m_variance}} |
| L    | {{l_count}} | {{l_estimated}} | {{l_actual}} | {{l_variance}} |

## Critical Path
{{#each critical_path}}
{{@index}}. {{task_id}}: {{task_title}} ({{size}}, {{state}})
{{/each}}

Critical Path Duration: {{critical_duration}} hours
Estimated Completion: {{estimated_completion_date}}

## Parallel Execution Opportunities
{{#each parallel_groups}}
### Group: {{group_name}}
Tasks: {{task_count}}
Potential Time Saving: {{time_saved}} minutes ({{percentage_saved}}%)

Tasks in group:
{{#each tasks}}
- {{task_id}}: {{task_title}} ({{size}})
{{/each}}
{{/each}}

## Blocked Tasks
{{#each blocked_tasks}}
### {{task_id}}: {{task_title}}
- Blocked Since: {{blocked_since}}
- Blocked By: {{blocking_reason}}
- Resolution: {{proposed_resolution}}
{{/each}}

## In Progress Tasks
{{#each in_progress_tasks}}
### {{task_id}}: {{task_title}}
- State: {{current_state}}
- Assigned: {{assigned_to}}
- Started: {{started_at}}
- Expected: {{expected_completion}}
{{/each}}

## Velocity Metrics
- Average Completion Time: {{avg_completion}} minutes
- Daily Velocity: {{daily_velocity}} tasks/day
- Weekly Velocity: {{weekly_velocity}} tasks/week
- Estimation Accuracy: {{estimation_accuracy}}%

## Risk Items
{{#each risk_items}}
- {{risk_description}}
  Impact: {{impact}}, Mitigation: {{mitigation}}
{{/each}}

## Recent Completions
{{#each recent_completions}}
- {{task_id}}: {{task_title}}
  Completed: {{completed_at}}, Time: {{actual_time}}m (est: {{estimated_time}}m)
{{/each}}

## Upcoming Tasks (Ready to Start)
{{#each ready_tasks}}
- {{task_id}}: {{task_title}} ({{size}}, {{estimated_time}}m)
{{/each}}
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - 12-state machine fully documented
    - All state transitions defined
    - T-shirt sizing system clear
    - XL splitting strategy documented
    - Task file format specified
    - Parallel marking system defined
    - Task command comprehensive
    - Dashboard template complete
  </success_criteria>

  <dependencies>
    - Core commands (Task 1)
    - Decompose phase (Task 5)
  </dependencies>

  <notes>
    This is METHODOLOGY documentation:
    - NO TypeScript code
    - NO compiled software
    - Only specifications and templates
    - Focus on task workflow and tracking
    - All execution through file-based system
  </notes>

</task>