# Nexus Enhanced Workflow - Formal Implementation Specification
**Version:** 3.0.0
**Date:** 2025-09-16 20:24:20 WEST
**Status:** Final Specification for Implementation
**Decisions Consolidated:** 10 Interactive Sessions

---

## Executive Summary

This document formalizes the enhanced Nexus workflow system that integrates BMAD-METHOD innovations with Nexus's core strengths. The enhanced system maintains Nexus's unlimited adaptive questioning and TDD-first philosophy while adding critical capabilities for context preservation, document sharding, and agent specialization.

### Key Enhancements
1. **Constitutional Context Preservation** - Context embedded in every task
2. **Explicit Sharding Phase** - Structured document decomposition
3. **Hard Agent Boundaries** - Strict role separation
4. **Smart Adaptive Context** - Intelligent context scoping
5. **Workflow Performance Tracking** - Comprehensive metrics

---

## Part 1: Constitutional Framework (Enhanced)

### Immutable Principles (Cannot Be Changed)

```yaml
constitution:
  version: 2.0.0
  ratified: 2025-09-16 20:24:20 WEST

  immutable_principles:
    I:
      title: "Test-Driven Development"
      rules:
        - Tests MUST be written before implementation
        - Red-Green-Refactor cycle is mandatory
        - No production code without failing test first
        - Test coverage minimum: 80%
        - Every bug fix starts with a failing test

    II:
      title: "Question Everything, Assume Nothing"
      rules:
        - Every ambiguity requires clarification
        - No implicit decisions allowed
        - Confidence threshold must exceed 85%
        - Stop immediately on uncertainty
        - Document all assumptions explicitly

    III:
      title: "Quality Through Convergence"
      rules:
        - Multiple approaches analyzed when confidence < 70%
        - Best solution selected through comparison
        - Trade-offs explicitly documented
        - Decision rationale preserved

    IV:  # NEW
      title: "Context Is Sacred"
      rules:
        - Every task must have embedded context
        - Context must be versioned and traceable
        - No implementation without complete context
        - Context inheritance from previous tasks
        - Source references mandatory

    V:  # NEW
      title: "Interactive Validation Is Mandatory"
      rules:
        - Every major decision requires human confirmation
        - Present options one at a time for clarity
        - No batch processing of critical choices
        - Stop and ask when confidence < 85%
        - Celebrate collaboration over automation
```

---

## Part 2: Enhanced Pipeline Architecture

### Pipeline Flow

```yaml
pipeline:
  version: 3.0.0
  phases:
    - BRAINSTORM
    - SPECIFY
    - SHARD      # NEW PHASE
    - DECOMPOSE
    - IMPLEMENT
```

### Detailed Phase Specifications

#### Phase 1: BRAINSTORM
```yaml
brainstorm_phase:
  command: /nexus-brainstorm

  process:
    1. capture_initial_idea:
        - Document problem statement
        - Identify constraints
        - Define success criteria

    2. generate_approaches:
        minimum: 20
        categories:
          - conventional
          - innovative
          - experimental
          - hybrid

    3. evaluate_approaches:
        criteria:
          - feasibility
          - complexity
          - risk
          - innovation

    4. select_top_approaches:
        count: 3-5
        output: selected_approaches.md

  artifacts:
    location: .nexus/brainstorms/
    format: markdown
    naming: "[timestamp]-[topic].md"
```

#### Phase 2: SPECIFY
```yaml
specify_phase:
  command: /nexus-specify

  questioning_strategy: "Adaptive-First, Template Validation"  # Decision B

  process:
    1. adaptive_exploration:
        - Open-ended questions
        - Unlimited until confidence > 85%
        - Software engineering best practices
        - Edge case identification

    2. template_validation:
        template: srs-template-enhanced.md
        sections:
          - product_scope
          - user_characteristics
          - functional_requirements
          - quality_attributes
          - constraints
          - test_strategies

    3. completeness_check:
        - All sections filled
        - Testability validated
        - Constitutional compliance

  artifacts:
    location: .nexus/specs/
    format: markdown
    naming: "[project]-specification.md"
```

#### Phase 3: SHARD (NEW)
```yaml
shard_phase:
  command: /nexus-shard

  process:
    1. analyze_specification:
        - Identify natural boundaries
        - Detect epic structures
        - Map dependencies

    2. create_shards:
        structure:
          specs/
          ├── monolithic/
          │   └── full-specification.md
          └── sharded/
              ├── index.md
              ├── epics/
              │   ├── epic-1-[name].md
              │   ├── epic-2-[name].md
              │   └── epic-3-[name].md
              └── stories/
                  ├── 1.1-[story].md
                  ├── 1.2-[story].md
                  └── 1.3-[story].md

    3. embed_context_boundaries:
        - Define context scope per shard
        - Create cross-references
        - Build navigation index

  artifacts:
    location: .nexus/specs/sharded/
    format: markdown_with_frontmatter  # Decision B
```

#### Phase 4: DECOMPOSE
```yaml
decompose_phase:
  command: /nexus-decompose

  process:
    1. parse_sharded_specs:
        - Read epic shards
        - Extract requirements
        - Identify dependencies

    2. create_task_files:
        format: markdown_with_frontmatter
        context_strategy: smart_adaptive  # Decision C

        structure:
          ---
          id: TASK-001
          epic: AUTH
          story: user-login
          confidence: 92%
          context_size: adaptive
          ---

          # Task: [Title]

          ## Embedded Context

          ### Core Context (Always)
          - Direct requirements
          - Acceptance criteria
          - Dependencies

          ### Extended Context (If confidence < 85%)
          - Related patterns
          - Historical decisions
          - Edge cases

          ### Reference Context (Links)
          - Full spec: ../specs/sharded/epic-1.md
          - Architecture: ../arch/auth.md

    3. generate_dependencies:
        - Task dependency graph
        - Critical path analysis
        - Parallel opportunities

  artifacts:
    location: .nexus/tasks/
    format: markdown_with_frontmatter
    naming: "[epic]-[story]-[task].md"
```

#### Phase 5: IMPLEMENT
```yaml
implement_phase:
  command: /nexus-implement

  process:
    1. load_task_context:
        - Read embedded context
        - No external lookups needed
        - Confidence verification

    2. tdd_cycle:
        enforce_constitution: true
        steps:
          - write_failing_test
          - get_user_approval
          - implement_minimal_code
          - verify_green
          - refactor_if_needed
          - verify_still_green

    3. update_task_status:
        - Mark completion
        - Document decisions
        - Extract patterns

  artifacts:
    - Implementation code
    - Test files
    - Updated task status
    - Decision log entries
```

---

## Part 3: Agent Architecture

### Agent Specifications

```yaml
agents:
  boundaries: hard  # Decision A

  specification_master:
    id: spec_master
    can:
      - Write specifications
      - Refine requirements
      - Create test strategies
      - Validate completeness
    cannot:
      - Write implementation code
      - Modify tests
      - Change architecture
    blocks_on:
      - Request to write code: "ERROR: Specification Master cannot write code"
      - Request to modify tests: "ERROR: Cannot modify test implementation"

  test_architect:
    id: test_arch
    can:
      - Design test strategies
      - Write test specifications
      - Validate TDD compliance
      - Create test templates
    cannot:
      - Write implementation code
      - Modify requirements
      - Skip test creation
    blocks_on:
      - Request to implement: "ERROR: Test Architect cannot write implementation"
      - Request to skip tests: "ERROR: TDD is constitutional - cannot skip"

  implementation_engineer:
    id: impl_eng
    can:
      - Write implementation code
      - Refactor existing code
      - Update task status
      - Extract patterns
    cannot:
      - Modify specifications
      - Change requirements
      - Alter test expectations
    blocks_on:
      - Unclear spec: "ERROR: Specification unclear - need clarification"
      - Missing tests: "ERROR: No tests found - TDD violation"

  shard_specialist:  # NEW
    id: shard_spec
    can:
      - Parse specifications
      - Create document shards
      - Build navigation indices
      - Define context boundaries
    cannot:
      - Modify content
      - Change requirements
      - Write code
    blocks_on:
      - Unstructured spec: "ERROR: Specification lacks structure for sharding"
```

---

## Part 4: Context Management System

### Smart Context Implementation

```typescript
interface SmartContext {
  strategy: "adaptive";

  core_context: {
    // Always included (200-500 lines)
    direct_requirements: Requirement[];
    acceptance_criteria: Criterion[];
    immediate_dependencies: Dependency[];
    task_metadata: TaskMeta;
  };

  extended_context?: {
    // Added when confidence < 85% (500-1000 lines)
    related_patterns: Pattern[];
    historical_decisions: Decision[];
    edge_cases: EdgeCase[];
    similar_implementations: Example[];
  };

  reference_context: {
    // Links only (10-20 lines)
    full_specification: string;  // Path
    architecture_docs: string[];  // Paths
    previous_tasks: string[];     // Task IDs
  };
}

class ContextEmbedder {
  async embedContext(
    task: Task,
    shard: Shard,
    confidence: number
  ): Promise<TaskWithContext> {

    const context: SmartContext = {
      strategy: "adaptive",
      core_context: await this.extractCoreContext(task, shard),
      reference_context: this.buildReferences(task, shard)
    };

    // Adaptive extension based on confidence
    if (confidence < 85) {
      context.extended_context = await this.extractExtendedContext(
        task,
        shard,
        this.findSimilarTasks(task)
      );
    }

    // Size management
    const contextSize = this.calculateSize(context);
    if (contextSize > 2000) {
      context = await this.intelligentTrim(context, 2000);
    }

    return {
      ...task,
      embedded_context: context,
      context_size: contextSize,
      confidence: confidence
    };
  }
}
```

### Context Inheritance

```typescript
class ContextInheritance {
  async inheritFromPrevious(
    currentTask: Task,
    previousTask: TaskWithContext
  ): Promise<InheritedContext> {

    return {
      // Relevant decisions from previous task
      decisions: previousTask.decisions.filter(d =>
        this.isRelevant(d, currentTask)
      ),

      // Patterns that worked
      successful_patterns: previousTask.patterns.filter(p =>
        p.success_rate > 0.8
      ),

      // Lessons learned
      insights: previousTask.completion_notes.filter(n =>
        n.type === 'insight' || n.type === 'warning'
      ),

      // Technical context that carries forward
      technical_context: this.extractRelevantTechnical(
        previousTask.technical_decisions,
        currentTask.requirements
      )
    };
  }
}
```

---

## Part 5: File Structure & Storage

### Complete File System Layout

```bash
.nexus/
├── constitution.md              # Immutable principles + amendable rules
├── project-dna.md              # One-time setup, persistent context
├── decision-log.md             # All decisions with rationale
├── metrics.yaml                # Workflow performance tracking
│
├── brainstorms/                # Creative ideation outputs
│   ├── 2025-01-16-auth.md
│   └── 2025-01-17-payments.md
│
├── specs/                      # Specifications
│   ├── monolithic/
│   │   └── full-specification.md
│   └── sharded/               # NEW
│       ├── index.md           # Navigation
│       ├── epics/
│       │   ├── epic-1-auth.md
│       │   └── epic-2-payments.md
│       └── stories/
│           ├── 1.1-user-login.md
│           └── 1.2-password-reset.md
│
├── tasks/                      # Task files with embedded context
│   ├── AUTH-001-login.md
│   ├── AUTH-002-logout.md
│   └── status.yaml            # Task tracking
│
├── patterns/                   # Extracted patterns
│   ├── auth-jwt-pattern.md
│   └── validation-pattern.md
│
└── templates/                  # Intelligent templates
    ├── srs-enhanced.md
    ├── task-context.md
    └── test-strategy.md
```

### Task File Format (Markdown with Frontmatter)

```markdown
---
# Frontmatter (Structured Data)
id: AUTH-001
epic: authentication
story: user-login
title: "Implement JWT login endpoint"
status: in_progress
confidence: 92
context_strategy: smart
context_size: 1247
created: 2025-01-16 20:24:20 WEST
modified: 2025-01-16 20:30:00 WEST
---

# Task: Implement JWT login endpoint

## Embedded Context

### Core Context
**Requirement FR-1.2**: User login with email/password
*Source: specs/sharded/epic-1-auth.md#L42*

**Acceptance Criteria**:
1. Valid credentials return JWT token
2. Invalid credentials return 401 error
3. Token expires in 30 minutes
4. Refresh token provided

**Dependencies**:
- Database connection established (TASK-000)
- User model created (AUTH-000)

### Extended Context
*Added due to confidence: 92%*

**Similar Implementation Pattern**:
```javascript
// From previous project
const login = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user || !await user.checkPassword(password)) {
    throw new UnauthorizedError();
  }
  return generateTokenPair(user);
};
```

### Reference Context
- Full Spec: [../specs/sharded/epic-1-auth.md](../specs/sharded/epic-1-auth.md)
- Architecture: [../arch/auth-architecture.md](../arch/auth-architecture.md)
- Previous Task: [AUTH-000](./AUTH-000-user-model.md)

## TDD Requirements

### Test First (Constitutional)
```javascript
// tests/auth/login.test.js
describe('POST /auth/login', () => {
  it('should return JWT for valid credentials', async () => {
    // Test implementation here
  });

  it('should return 401 for invalid credentials', async () => {
    // Test implementation here
  });
});
```

## Implementation Notes
[To be filled during implementation]

## Decision Log
[To be filled with implementation decisions]
```

---

## Part 6: Command Specifications

### Command Implementation Details

#### /nexus-shard
```typescript
interface ShardCommand {
  name: '/nexus-shard';

  params: {
    spec: string;      // Path to specification
    strategy?: 'auto' | 'manual' | 'guided';
    maxSize?: number;  // Max lines per shard
  };

  process: async (params) => {
    // 1. Parse specification structure
    const spec = await parseSpecification(params.spec);

    // 2. Identify sharding boundaries
    const boundaries = params.strategy === 'manual'
      ? await askUserForBoundaries(spec)
      : await detectBoundaries(spec);

    // 3. Create shards
    const shards = await createShards(spec, boundaries);

    // 4. Embed context markers
    for (const shard of shards) {
      shard.contextBoundary = defineContextScope(shard);
      shard.crossReferences = findReferences(shard, shards);
    }

    // 5. Generate navigation index
    const index = buildNavigationIndex(shards);

    // 6. Write files
    await writeShards(shards, index);

    return {
      shardsCreated: shards.length,
      indexPath: '.nexus/specs/sharded/index.md'
    };
  };
}
```

#### /nexus-embed-context
```typescript
interface EmbedContextCommand {
  name: '/nexus-embed-context';

  params: {
    task: string;      // Task ID
    shard: string;     // Shard path
    previous?: string; // Previous task ID
  };

  process: async (params) => {
    // 1. Load task and shard
    const task = await loadTask(params.task);
    const shard = await loadShard(params.shard);

    // 2. Calculate confidence
    const confidence = await calculateConfidence(task, shard);

    // 3. Embed smart context
    const embedder = new ContextEmbedder();
    const taskWithContext = await embedder.embedContext(
      task,
      shard,
      confidence
    );

    // 4. Inherit from previous if available
    if (params.previous) {
      const previousTask = await loadTask(params.previous);
      const inherited = await inheritContext(taskWithContext, previousTask);
      taskWithContext.inherited_context = inherited;
    }

    // 5. Write enhanced task file
    await writeTaskFile(taskWithContext);

    return {
      taskId: params.task,
      contextSize: taskWithContext.context_size,
      confidence: confidence
    };
  };
}
```

---

## Part 7: Workflow Performance Metrics

### Metrics Collection System

```yaml
metrics:
  collection_points:
    - Phase transitions
    - Question/answer cycles
    - Context embeddings
    - Task completions
    - Validation gates

  workflow_usage:
    phases_completed:
      brainstorm: { count: 0, avg_time: null }
      specify: { count: 0, avg_time: null }
      shard: { count: 0, avg_time: null }
      decompose: { count: 0, avg_time: null }
      implement: { count: 0, avg_time: null }

    interactive_validations:
      total_presented: 0
      total_responded: 0
      response_time_avg: null
      decisions_reversed: 0

    context_performance:
      embeddings_created: 0
      avg_context_size: null
      context_reuse_rate: 0
      lookup_eliminations: 0

  workflow_performance:
    time_metrics:
      idea_to_spec: []
      spec_to_tasks: []
      task_to_complete: []
      total_pipeline: []

    quality_metrics:
      first_pass_success: 0
      rework_cycles: []
      confidence_at_implementation: []
      tdd_compliance: 100  # Constitutional

    efficiency_gains:
      baseline_time: null  # Set on first run
      current_improvement: 0
      context_lookup_reduction: 0
      question_reduction_trend: []
```

### Metrics Dashboard

```typescript
class WorkflowMetrics {
  private metrics: MetricsData;

  async trackPhaseTransition(
    from: Phase,
    to: Phase,
    duration: number
  ): void {
    this.metrics.workflow_usage.phases_completed[from].count++;
    this.metrics.workflow_usage.phases_completed[from].avg_time =
      this.updateAverage(
        this.metrics.workflow_usage.phases_completed[from].avg_time,
        duration,
        this.metrics.workflow_usage.phases_completed[from].count
      );

    await this.persist();
  }

  async generateReport(): MetricsReport {
    return {
      usage_summary: this.summarizeUsage(),
      performance_trends: this.analyzePerformance(),
      efficiency_gains: this.calculateGains(),
      recommendations: this.generateRecommendations()
    };
  }
}
```

---

## Part 8: Implementation Roadmap

### Week 1: Foundation (Days 1-3)
```yaml
Day 1-2: Document Sharding
  Tasks:
    □ Implement /nexus-shard command
    □ Create sharding algorithm
    □ Build navigation index generator
    □ Test with sample specification

  Deliverables:
    - Working shard command
    - Sharded specification example
    - Navigation index

Day 3: Basic Context Embedding
  Tasks:
    □ Create context embedder class
    □ Implement smart context strategy
    □ Add context size management
    □ Create task file template

  Deliverables:
    - Context embedding function
    - Task file with embedded context
```

### Week 1-2: Core Systems (Days 4-7)
```yaml
Day 4-5: Complete Context System
  Tasks:
    □ Implement context inheritance
    □ Add confidence calculation
    □ Create reference system
    □ Test context flow

Day 6-7: Agent Specialization
  Tasks:
    □ Define agent boundaries
    □ Implement permission system
    □ Create blocking mechanisms
    □ Test agent interactions
```

### Week 2: Integration (Days 8-10)
```yaml
Day 8-9: Pipeline Integration
  Tasks:
    □ Connect all phases
    □ Implement phase transitions
    □ Add validation gates
    □ Create orchestrator

Day 10: Metrics & Testing
  Tasks:
    □ Implement metrics collection
    □ Create dashboard
    □ Run full pipeline test
    □ Document learnings
```

### Week 2-3: Real Project PoC (Days 11-14)
```yaml
Days 11-14: Production Test
  - Apply to real feature
  - Track all metrics
  - Document friction points
  - Iterate on issues found
  - Measure performance gains
```

---

## Part 9: Success Criteria

### Technical Success Metrics
```yaml
Week 1 Validation:
  □ Sharding reduces spec size by 70% per chunk
  □ Context embedding contains all needed info
  □ No external lookups during implementation
  □ Agent boundaries properly enforced
  □ Full pipeline execution without errors

Month 1 Production:
  □ 10+ real features implemented
  □ 90% first-pass success rate
  □ 30% reduction in implementation time
  □ Zero context-related errors
  □ Pattern library started (5+ patterns)
```

### Workflow Performance Metrics
```yaml
Adoption Metrics:
  □ All phases used regularly
  □ Interactive validations 100% engaged
  □ Questions stabilizing (learning curve flattening)
  □ Confidence consistently > 85%

Performance Metrics:
  □ Specification time: 40% reduction
  □ Implementation time: 30% reduction
  □ Context lookups: 60% reduction
  □ Workflow abandonment: < 5%
  □ Decision reversal: < 10%
```

---

## Part 10: Risk Mitigation

### Identified Risks & Mitigations

```yaml
risks:
  context_overload:
    probability: medium
    impact: high
    mitigation:
      - Smart context with adaptive sizing
      - Trimming algorithm for > 2000 lines
      - Reference links for deep dives
      - Monitoring context size metrics

  agent_rigidity:
    probability: low
    impact: medium
    mitigation:
      - Clear error messages
      - Interactive validation for edge cases
      - Human override capability
      - Regular boundary review

  workflow_complexity:
    probability: medium
    impact: medium
    mitigation:
      - Progressive disclosure
      - Start with single feature
      - Clear documentation
      - Interactive guidance throughout

  performance_degradation:
    probability: low
    impact: high
    mitigation:
      - Continuous metrics monitoring
      - Caching frequently accessed context
      - Lazy loading of references
      - Regular performance reviews
```

---

## Appendices

### A. Sample Sharded Specification

```markdown
# Epic 1: User Authentication
*Sharded from: full-specification.md*
*Context Boundary: Authentication System*

## Functional Requirements
- FR-1.1: User registration with email
- FR-1.2: User login with JWT
- FR-1.3: Password reset flow
- FR-1.4: Session management

## Stories
1. [User Registration](../stories/1.1-registration.md)
2. [User Login](../stories/1.2-login.md)
3. [Password Reset](../stories/1.3-reset.md)

## Context Scope
- Database: users table only
- API: /auth/* endpoints
- Frontend: auth components
- Tests: auth test suite
```

### B. Constitutional Amendment Process

```yaml
amendment_process:
  proposal:
    - Document proposed change
    - Provide justification
    - Impact analysis required

  validation:
    - Test in isolated branch
    - Measure impact on metrics
    - Document results

  ratification:
    - Review period: 1 week
    - Self-approval for solo dev
    - Update version and date
    - Document in decision log
```

---

## Conclusion

This specification formalizes the enhanced Nexus workflow with integrated BMAD-METHOD innovations. The system maintains Nexus's core strengths while addressing critical gaps in context management, document organization, and agent coordination. Implementation will proceed in phases, with continuous validation against workflow performance metrics.

The enhanced workflow represents a new paradigm: **Context-Aware, Interactively-Validated, Quality-First Development**.

---

*Specification Version: 1.0.0*
*Last Updated: 2025-09-16 20:24:20 WEST*
*Status: Ready for Implementation*