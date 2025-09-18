# Nexus Enhanced Workflow Specification v5.0

**Date:** 2025-09-18 16:09:12 WEST
**Status:** Production-Ready Methodology Specification
**Philosophy:** Quality through unlimited questioning, flexible TDD guidance, and continuous evolution

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Principles](#core-principles)
3. [Project Guidelines Framework](#project-guidelines-framework)
4. [Pipeline Architecture](#pipeline-architecture)
5. [Command Specifications](#command-specifications)
6. [Agent System](#agent-system)
7. [Task Management](#task-management)
8. [Evolution System](#evolution-system)
9. [Agent Coordination](#agent-coordination)
10. [Methodology Implementation](#methodology-implementation)
11. [Success Metrics](#success-metrics)

---

## Executive Summary

Nexus v5 is a self-improving development workflow methodology that learns from your patterns and evolves to match your needs. It's implemented through Claude commands and specialized agents to ensure quality while maintaining pragmatic development flow.

### Core Innovations

1. **Unlimited Adaptive Questioning** - No artificial limits on understanding
2. **Flexible TDD Guidelines** - Strong default with documented exceptions
3. **Three-Layer Evolution** - Continuous, micro, and formal learning
4. **Security-First Development** - SecurityGuardian agent throughout pipeline
5. **Claude Agent Orchestration** - Native Claude agent coordination
6. **Backward Phase Navigation** - Realistic iterative development
7. **T-Shirt Task Sizing** - Clear, intuitive task estimation
8. **Comprehensive State Machine** - 12 states reflecting real development

### Key Differentiators

- **No Fake Metrics** - Use High/Medium/Low confidence, not imaginary percentages
- **Context Preservation** - Every task embeds its specification context
- **Pattern Learning** - Successful patterns become reusable templates
- **Agent Specialization** - Claude agents with specific expertise
- **Continuous Improvement** - Learning happens at every level continuously

---

## Core Principles

<principles>
  <principle id="1">
    ### Question Everything, Assume Nothing
    - Continue questioning until complete understanding achieved
    - No artificial limits on clarification rounds
    - Every ambiguity must be resolved before proceeding
    - Stop immediately on uncertainty
  </principle>

  <principle id="2">
    ### Test-Driven Development as Strong Default
    - TDD is the standard approach for all implementation
    - Tests before code in normal workflow
    - Documented exceptions allowed with justification:
      - Time-boxed exploratory spikes (max 2 hours)
      - Proof of concepts (clearly marked, not for production)
      - Emergency hotfixes (tests added within 24 hours)
  </principle>

  <principle id="3">
    ### Sequential Default, Parallel When Beneficial
    - Execute one step at a time unless marked [P]
    - Parallel execution only for truly independent tasks
    - Clear dependency chains must be maintained
    - No parallel execution without clear benefit
  </principle>

  <principle id="4">
    ### Continuous Learning and Evolution
    - Extract patterns from every success
    - Learn from failures immediately
    - Micro-evolve after each phase
    - Formal reflection at pipeline completion
    - Create specialized agents as patterns emerge
  </principle>
</principles>

---

## Project Guidelines Framework

```markdown
# .nexus/guidelines.md
Generated: 2025-09-18 16:09:12 WEST
Status: EDITABLE with version control
Purpose: Development standards and practices

<guidelines version="5.0">
  <core_practices>

    <practice id="TDD" priority="high" enforcement="strong">
      ## Test-Driven Development Practice

      Standard cycle: RED → GREEN → REFACTOR

      <process>
        1. Write failing test that specifies behavior
        2. Get user approval on test specification
        3. Implement minimal code to pass test
        4. Verify test passes
        5. Refactor while keeping tests green
      </process>

      <exceptions>
        <exception type="spike">
          Condition: Exploratory code needed
          Max Duration: 2 hours
          Requirement: Must be discarded or rewritten with tests
        </exception>

        <exception type="emergency">
          Condition: Critical production fix needed
          Requirement: Tests must be added within 24 hours
          Audit: Logged in decision log
        </exception>

        <exception type="poc">
          Condition: Proof of concept
          Requirement: Clearly marked as non-production
          Disposal: Delete after decision made
        </exception>
      </exceptions>
    </practice>

    <practice id="QUESTIONING" priority="high" enforcement="strict">
      ## Unlimited Adaptive Questioning

      Continue until understanding is complete.
      No arbitrary limits on clarification.

      <triggers>
        <trigger pattern="vague_terms">
          Words: ["some", "various", "etc", "somehow", "handle"]
          Action: REQUEST_SPECIFIC_MEANING
        </trigger>

        <trigger pattern="missing_criteria">
          Missing: [success_condition, failure_mode, edge_case]
          Action: DEFINE_ACCEPTANCE_CRITERIA
        </trigger>
      </triggers>
    </practice>

    <practice id="CONTEXT" priority="high" enforcement="required">
      ## Context Preservation

      Every artifact includes complete context.

      <requirements>
        - Tasks include specification excerpts (200-2000 lines adaptive)
        - Decisions include full rationale
        - Patterns include usage examples
        - Agent trigger conditions documented
      </requirements>
    </practice>

  </core_practices>

  <flexible_guidelines>
    - Functions under 50 lines (strong preference)
    - Files under 500 lines (strong preference)
    - Document WHY, not WHAT
    - Early returns over nested conditionals
    - Composition over inheritance
  </flexible_guidelines>
</guidelines>
```

---

## Pipeline Architecture

<pipeline version="5.0">

  <phases>
    ```
    ┌─────────────────────────────────────────────────────────┐
    │  BRAINSTORM ←→ SPECIFY ←→ DESIGN ←→ DECOMPOSE           │
    │       ↓           ↓         ↓          ↓                │
    │  [Explore]   [Define]  [Architect] [Break Down]         │
    │                                        ↓                │
    │  IMPLEMENT ←→ VALIDATE ←→ EVOLVE → MAINTAIN            │
    │      ↓           ↓          ↓         ↓                │
    │   [Build]    [Verify]   [Learn]   [Ongoing]            │
    └─────────────────────────────────────────────────────────┘

    Note: ←→ indicates bidirectional phase transitions allowed
    ```
  </phases>

  <phase_specifications>

    <phase name="BRAINSTORM">
      <purpose>Generate multiple solution approaches through unlimited questioning</purpose>

      <agents>
        1. questioning-agent [unlimited iterations]
        2. pattern-detector [searches existing patterns]
        3. code-archaeologist [analyzes existing code]
      </agents>

      <process>
        1. Unlimited questioning until clarity
        2. Pattern detection from library
        3. Generate minimum 3 approaches
        4. Evaluate trade-offs
        5. Document decisions
      </process>

      <outputs>
        - .nexus/brainstorms/[timestamp]-[topic].md
        - Selected approaches (1-3)
        - Identified constraints
        - Risk assessment matrix
      </outputs>

      <micro_evolution>
        - Track question patterns
        - Identify recurring constraints
        - Extract domain patterns
      </micro_evolution>
    </phase>

    <phase name="SPECIFY">
      <purpose>Create formal, testable requirements</purpose>

      <agents>
        1. specification-agent [creates formal specs]
        2. api-designer [API specifications]
        3. test-strategist [test approach]
        4. questioning-agent [clarifications]
      </agents>

      <specification_template>
        # Feature Specification: {name}
        Generated: {timestamp}

        ## Functional Requirements

        <requirement id="FR-001">
          Description: {what must be done}

          <acceptance_criteria>
            - {testable criterion 1}
            - {testable criterion 2}
          </acceptance_criteria>

          <edge_cases>
            - {edge case 1}
            - {edge case 2}
          </edge_cases>
        </requirement>
      </specification_template>

      <outputs>
        - .nexus/specs/[feature]/specification.md
        - API contracts
        - Data models
        - Test strategies
      </outputs>

      <micro_evolution>
        - Refine specification templates
        - Capture requirement patterns
      </micro_evolution>
    </phase>

    <phase name="DESIGN">
      <purpose>Create architectural design and system structure</purpose>

      <agents>
        1. architecture-agent [system design]
        2. security-guardian [threat modeling]
        3. pattern-detector [pattern suggestions]
        4. dependency-analyzer [dependency mapping]
      </agents>

      <design_artifacts>
        - Component architecture
        - Data flow diagrams
        - Security threat model
        - Technology decisions
        - Integration patterns
      </design_artifacts>

      <outputs>
        - .nexus/design/[feature]/architecture.md
        - Component diagrams
        - Security analysis
        - Technology rationale
      </outputs>

      <micro_evolution>
        - Extract architectural patterns
        - Learn technology preferences
        - Identify security patterns
      </micro_evolution>
    </phase>

    <phase name="DECOMPOSE">
      <purpose>Break work into atomic, testable tasks</purpose>

      <agents>
        1. dependency-analyzer [maps dependencies]
        2. test-strategist [test planning]
        3. task-estimator [effort estimation]
        4. parallelization-optimizer [finds parallel work]
      </agents>

      <task_generation_rules>
        - Every implementation needs test task first
        - Use T-shirt sizing (XS, S, M, L, XL=split)
        - Mark independent tasks with [P]
        - Include specification context
      </task_generation_rules>

      <outputs>
        - .nexus/tasks/[feature]-tasks.md
        - Dependency graph
        - Critical path analysis
        - Parallel execution plan
      </outputs>

      <micro_evolution>
        - Improve estimation accuracy
        - Optimize parallelization
        - Learn task patterns
      </micro_evolution>
    </phase>

    <phase name="IMPLEMENT">
      <purpose>Execute tasks following TDD cycle</purpose>

      <tdd_enforcement>
        <red>
          Agent: test-writer
          Action: Write failing test
          Gate: User approval required
        </red>

        <green>
          Agent: implementation-writer
          Action: Minimal passing code
          Constraint: No extra functionality
        </green>

        <refactor>
          Agent: refactoring-specialist
          Action: Improve structure
          Constraint: Tests stay green
        </refactor>
      </tdd_enforcement>

      <parallel_agents>
        - security-guardian [continuous review]
        - pattern-detector [pattern extraction]
      </parallel_agents>

      <outputs>
        - Implemented code
        - Passing tests
        - Security review
        - Extracted patterns
      </outputs>

      <micro_evolution>
        - Learn coding patterns
        - Identify anti-patterns
        - Track implementation time
      </micro_evolution>
    </phase>

    <phase name="VALIDATE">
      <purpose>Verify quality and compliance</purpose>

      <agents>
        1. quality-guardian [quality checks]
        2. security-guardian [security audit]
        3. test-validator [test coverage]
        4. documentation-agent [docs check]
      </agents>

      <validation_checklist>
        - All tests passing
        - Coverage ≥ 80%
        - No guideline violations
        - Security scan clean
        - Documentation current
        - Patterns extracted
      </validation_checklist>

      <outputs>
        - Validation report
        - Quality metrics
        - Security audit
        - Coverage report
      </outputs>

      <micro_evolution>
        - Adjust quality thresholds
        - Refine validation criteria
      </micro_evolution>
    </phase>

    <phase name="EVOLVE">
      <purpose>Deep reflection and system improvement</purpose>

      <agent>workflow-reflector</agent>

      <reflection_process>
        1. Analyze complete pipeline execution
        2. Consolidate micro-evolutions
        3. Identify systemic improvements
        4. Propose new agents
        5. Update guidelines
        6. Extract reusable patterns
      </reflection_process>

      <outputs>
        - .nexus/evolution/[timestamp]-reflection.md
        - Guideline updates
        - New agent proposals
        - Pattern library updates
        - Workflow optimizations
      </outputs>
    </phase>

    <phase name="MAINTAIN">
      <purpose>Ongoing maintenance and improvement</purpose>

      <agents>
        1. maintenance-agent [bug fixes]
        2. security-guardian [security patches]
        3. dependency-updater [dependency management]
        4. performance-monitor [performance tracking]
      </agents>

      <maintenance_activities>
        - Bug fixes with tests
        - Security updates
        - Dependency updates
        - Performance optimization
        - Documentation updates
        - Technical debt reduction
      </maintenance_activities>

      <continuous_evolution>
        - Learn from production issues
        - Track maintenance patterns
        - Optimize update processes
      </continuous_evolution>
    </phase>

  </phase_specifications>
</pipeline>

---

## Command Specifications

### Core Command Structure

All commands follow this exact format for Claude integration:

```markdown
---
name: nexus-[command]
description: [Brief description]
tools: [Read, Write, Glob, Bash, etc.]
implementation: .claude/commands/nexus-[command].md
---

# /nexus-[command]

<pre_flight>
  <!-- Checks before execution -->
</pre_flight>

<process_flow>
  <step number="N" subagent="[agent-name]">
    <!-- Step details -->
  </step>
</process_flow>

<gates>
  <gate id="[gate-id]">
    <!-- Validation requirements -->
  </gate>
</gates>
```

### Foundation Commands

#### /nexus-init
```markdown
---
name: nexus-init
description: Initialize Nexus workflow system
tools: Read, Write, Glob, Bash
implementation: .claude/commands/nexus-init.md
---

# /nexus-init

Initialize Nexus v5 workflow with flexible guidelines.

<pre_flight>
  - Check for existing .nexus directory
  - Detect project type and technology
  - Identify testing framework
  - Verify git repository
</pre_flight>

<process_flow>
  <step number="1" subagent="project-analyzer">
    Analyze project:
    - Technology stack
    - Testing framework
    - Project type
    - Existing patterns
  </step>

  <step number="2">
    Get user commitment:

    DISPLAY: "Nexus promotes Test-Driven Development"
    DISPLAY: "Tests before code is the default approach"
    PROMPT: "Accept TDD guidelines? (y/n):"

    DISPLAY: "Nexus uses unlimited adaptive questioning"
    PROMPT: "Accept unlimited questioning? (y/n):"
  </step>

  <step number="3">
    Create structure:
    .nexus/
    ├── guidelines.md
    ├── project-dna.md
    ├── decision-log.md
    ├── brainstorms/
    ├── specs/
    ├── design/
    ├── tasks/
    ├── patterns/
    ├── agents/
    └── evolution/
  </step>

  <step number="4">
    Generate foundation files
  </step>

  <step number="5">
    Initialize tracking systems
  </step>
</process_flow>

<gates>
  <gate id="acceptance">
    User must accept guidelines
  </gate>
  <gate id="creation">
    All directories created successfully
  </gate>
</gates>
```

#### /nexus-brainstorm
```markdown
---
name: nexus-brainstorm
description: Generate solution approaches
tools: Read, Write, TodoWrite
implementation: .claude/commands/nexus-brainstorm.md
---

# /nexus-brainstorm [topic]

<process_flow>
  <step number="1" subagent="questioning-agent">
    Unlimited questioning:
    - What problem are we solving?
    - Who benefits?
    - What constraints exist?
    - Continue until clear
  </step>

  <step number="2" subagent="pattern-detector">
    Search for patterns:
    - Check .nexus/patterns/
    - Identify reusable solutions
  </step>

  <step number="3">
    Generate approaches (min 3):
    - Conventional
    - Optimal
    - Pragmatic
    - [Optional] Innovative
  </step>

  <step number="4">
    Document and evolve:
    - Save to .nexus/brainstorms/
    - Trigger micro-evolution
  </step>
</process_flow>
```

#### /nexus-design
```markdown
---
name: nexus-design
description: Create architectural design
tools: Read, Write, Glob
implementation: .claude/commands/nexus-design.md
---

# /nexus-design [feature]

<process_flow>
  <step number="1" subagent="architecture-agent">
    Create high-level design:
    - Component architecture
    - Data flow
    - Technology choices
  </step>

  <step number="2" subagent="security-guardian">
    Threat modeling:
    - Attack vectors
    - Security boundaries
    - Authentication design
  </step>

  <step number="3" subagent="pattern-detector">
    Suggest patterns:
    - Architectural patterns
    - Design patterns
    - Security patterns
  </step>

  <step number="4">
    Document:
    - Save to .nexus/design/
    - Include diagrams
    - Record decisions
  </step>
</process_flow>
```

---

## Agent System

### Claude Specialized Agents

Nexus uses Claude's native specialized agents, invoked through the Task tool with specific subagent_types. Each agent has deep expertise in its domain.

#### Core Agent Specifications

##### Questioning Agent
```markdown
---
name: questioning-agent
description: Unlimited questioning for complete understanding
tools: TodoWrite
triggers: All phases, especially BRAINSTORM and SPECIFY
---

# Questioning Agent

## Capability
Ask unlimited questions until understanding is complete.
No artificial limits on clarification.

## Strategy
<triage>
  Quick context questions (3-5)
</triage>

<exploration unlimited="true">
  Deep understanding:
  - Requirements
  - Edge cases
  - Success criteria
  - Failure modes
</exploration>

<validation unlimited="true">
  Testability questions:
  - How to test?
  - Success indicators?
  - Error handling?
</validation>

## Invocation
Task tool with subagent_type="questioning-agent"
```

##### SecurityGuardian Agent
```markdown
---
name: security-guardian
description: Proactive security vulnerability prevention
tools: Read, Grep, Bash
triggers: DESIGN, IMPLEMENT, VALIDATE, MAINTAIN
---

# SecurityGuardian Agent

## Capability
Prevent security vulnerabilities at every stage.

## Security Checks
<design>
  - Threat modeling
  - Attack surface analysis
  - Security boundaries
  - Authentication design
</design>

<implementation>
  - Input validation
  - SQL injection prevention
  - XSS protection
  - Secret management
  - Dependency vulnerabilities
</implementation>

<validation>
  - Security scan results
  - Penetration test findings
  - Compliance verification
  - Best practices audit
</validation>

## Invocation
Task tool with subagent_type="security-guardian"
```

##### Pattern Detector Agent
```markdown
---
name: pattern-detector
description: Identify and extract reusable patterns
tools: Grep, Read, Glob
triggers: After implementations, during evolution
---

# Pattern Detector Agent

## Detection Process
<step number="1">
  Search for repetition:
  - Function patterns (3+ similar)
  - Class patterns
  - Error handling patterns
  - Test patterns
</step>

<step number="2">
  Analyze frequency:
  IF count >= 3 THEN flag_for_extraction
</step>

<step number="3">
  Generate template:
  - Pattern name
  - Category
  - Template code
  - Usage examples
</step>

<step number="4">
  Save to .nexus/patterns/
</step>

## Invocation
Task tool with subagent_type="pattern-detector"
```

##### Architecture Agent
```markdown
---
name: architecture-agent
description: System design and architectural decisions
tools: Read, Write
triggers: DESIGN phase
---

# Architecture Agent

## Capability
Create comprehensive architectural designs balancing quality attributes.

## Focus Areas
- Component architecture
- Data flow design
- Technology selection
- Integration patterns
- Scalability planning
- Performance optimization

## Invocation
Task tool with subagent_type="architecture-agent"
```

##### Workflow Reflector Agent
```markdown
---
name: workflow-reflector
description: Analyze workflow execution and suggest improvements
tools: Read, Write, Glob
triggers: EVOLVE phase
---

# Workflow Reflector Agent

## Reflection Process
1. Analyze execution metrics
2. Identify bottlenecks
3. Extract successful patterns
4. Propose new agents
5. Suggest optimizations
6. Update guidelines

## Invocation
Task tool with subagent_type="workflow-reflector"
```

---

## Task Management

### Task Sizing System

```markdown
<task_sizes>
  XS: < 30min     # Quick fix, typo, small config
  S:  30-60min    # Small feature, simple test
  M:  1-2hr       # Standard feature implementation
  L:  2-4hr       # Complex feature, multiple files
  XL: Split it!   # Too large - must decompose
</task_sizes>
```

### Task State Machine

```markdown
<task_states>
  PENDING         # Created, not started
  BLOCKED         # Waiting on dependency
  WRITING_TEST    # Creating test (RED)
  TEST_FAILING    # Test fails correctly
  IMPLEMENTING    # Writing code (GREEN)
  TEST_PASSING    # Code passes test
  REVIEWING       # Under review
  NEEDS_REWORK    # Changes requested
  REFACTORING     # Improving code
  PAUSED          # Temporarily stopped
  CANCELLED       # Will not complete
  FAILED          # Could not complete
  DONE            # Complete
</task_states>

State Transitions:
PENDING → BLOCKED or WRITING_TEST
WRITING_TEST → TEST_FAILING
TEST_FAILING → IMPLEMENTING
IMPLEMENTING → TEST_PASSING
TEST_PASSING → REVIEWING or REFACTORING
REVIEWING → NEEDS_REWORK or DONE
NEEDS_REWORK → IMPLEMENTING
Any state → PAUSED → Previous state
Any state → CANCELLED or FAILED
```

### Task File Format

```yaml
task:
  id: T001
  title: "Implement user authentication"
  size: M
  phase: IMPLEMENT
  state: PENDING

  specification_context:
    # Embedded spec (200-2000 lines adaptive)
    requirement: |
      FR-001: User authentication via email/password
      - Valid credentials return JWT
      - Invalid credentials return 401
      - Token expires after 24 hours

  acceptance_criteria:
    - Test successful login
    - Test failed login
    - Test token generation
    - Test token expiry

  dependencies:
    - T000 # Database schema

  parallel: false
  estimate: 1.5hr

  test_strategy:
    - Mock database
    - Test edge cases
    - Security validation
```

---

## Evolution System

### Three-Layer Evolution Architecture

```markdown
<evolution_layers>

  <continuous_evolution>
    # Pattern detection during workflow execution

    Activities:
    - Pattern identification
    - Question frequency tracking
    - Performance measurement
    - Security pattern detection

    Triggers:
    - Pattern repeated 3+ times
    - Question asked 5+ times
    - Performance degradation
    - Security issue found
  </continuous_evolution>

  <micro_evolution>
    # Learning after each phase

    Activities:
    - Quick learnings capture
    - Template refinement
    - Immediate optimizations
    - Context adjustments

    Output:
    - Phase improvements
    - Updated templates
    - Refined processes
  </micro_evolution>

  <formal_evolution>
    # Deep reflection after pipeline

    Activities:
    - Complete analysis
    - Consolidate learnings
    - Structural improvements
    - New agent proposals
    - Guideline updates

    Output:
    - .nexus/evolution/[timestamp]-reflection.md
    - Updated guidelines
    - New agent specifications
    - Optimized workflow
  </formal_evolution>

</evolution_layers>
```

### Evolution Triggers

```yaml
triggers:
  - type: pattern_repetition
    condition: "Code structure repeated >= 3 times"
    action: "Extract pattern and create template"

  - type: question_frequency
    condition: "Same question asked >= 5 times"
    action: "Add to question template"

  - type: task_failure
    condition: "Similar tasks fail >= 2 times"
    action: "Analyze and update process"

  - type: security_vulnerability
    condition: "Security issue detected"
    action: "Immediate prevention rule"

  - type: performance_issue
    condition: "Task exceeds estimate by 2x"
    action: "Review estimation process"
```

---

## Agent Coordination

### How Agents Work Together

In Nexus, agents coordinate through Claude's native orchestration capabilities:

#### Context Preservation
- Each agent's outputs are preserved in the workflow context
- Subsequent agents can access prior agent decisions
- Decision rationale is documented in `.nexus/decision-log.md`

#### Sequential Execution
Commands specify which agents to invoke in order:
```markdown
<step number="1" subagent="questioning-agent">
  Establish understanding
</step>
<step number="2" subagent="specification-agent">
  Create formal specification using understanding
</step>
```

#### Parallel Consideration
Some agents work conceptually in parallel:
- `security-guardian` reviews throughout implementation
- `pattern-detector` continuously identifies patterns
- Marked with [P] in task definitions

#### Conflict Resolution
When agents provide conflicting recommendations:
1. **Guidelines compliance** - Project guidelines take precedence
2. **Security concerns** - Security issues override other concerns
3. **Confidence-based** - Higher confidence recommendations preferred
4. **Pattern matching** - Established patterns guide decisions
5. **User escalation** - Ambiguous cases escalated to user

#### Agent Evolution
- Successful agent patterns become templates
- New specialized agents created as needs emerge
- Agent effectiveness tracked in evolution metrics

---

## Methodology Implementation

### What This Is
Nexus is a **workflow methodology** implemented through:
- Claude commands (in `.claude/commands/`)
- Specialized Claude agents
- File-based tracking (in `.nexus/`)
- Pattern templates (in `templates/`)

### What This Is NOT
- Not standalone software
- Not a running service
- Not a compiled application
- Not an API or framework

### How to Use Nexus

#### With Claude
1. Open your project in Claude
2. Run `/nexus-init` to set up the workflow
3. Use commands to progress through pipeline phases
4. Let agents handle specialized tasks
5. Review outputs in `.nexus/` directories

#### Directory Structure
```
your-project/
├── .nexus/                # Workflow tracking (created by /nexus-init)
│   ├── guidelines.md      # Your project's guidelines
│   ├── project-dna.md     # Technology and patterns
│   ├── decision-log.md    # All decisions
│   ├── brainstorms/       # Ideation outputs
│   ├── specs/             # Specifications
│   ├── design/            # Architecture
│   ├── tasks/             # Task breakdowns
│   ├── patterns/          # Extracted patterns
│   ├── agents/            # Custom agent specs
│   └── evolution/         # Reflections
│
├── .claude/               # Claude integration
│   ├── commands/          # Nexus commands
│   └── agents/            # Agent specifications
│
└── [your project files]
```

#### Command Usage
Commands are markdown files that Claude executes:
- Define workflow steps
- Specify agent invocations
- Create outputs in `.nexus/`
- Enforce guidelines

#### Agent Usage
Agents are invoked through Claude's Task tool:
- Each agent has specific expertise
- Agents work within their boundaries
- Context flows between agents
- Results documented in workflow

---

## Success Metrics

### Quantitative Targets

```yaml
week_1:
  setup_time: "< 5 minutes"
  questions_per_feature: "20-50 (tracked)"
  guideline_compliance: "> 95%"

month_1:
  features_completed: "> 10"
  security_vulnerabilities: "0"
  patterns_extracted: "> 10"
  parallel_execution: "> 40%"
  time_saved: "> 30%"

month_3:
  custom_agents: "> 8"
  workflow_optimizations: "> 15"
  pattern_library: "> 30 patterns"
  time_saved: "> 50%"
  maintenance_reduction: "> 40%"
```

### Qualitative Indicators

```yaml
code_quality:
  - Consistent patterns across codebase
  - Comprehensive test coverage
  - Security-first implementation
  - Clear, current documentation
  - Reduced bug rate

developer_experience:
  - Less ambiguity in requirements
  - Faster implementation cycles
  - Better understanding of system
  - Increased development confidence
  - Smoother maintenance

workflow_evolution:
  - Continuous pattern emergence
  - Automatic agent suggestions
  - Seamless optimizations
  - Multi-level learning
```

---

## Appendices

### A. Decision Log Template

```markdown
# Decision: [Topic]
Date: 2025-09-18 16:09:12 WEST
Phase: [BRAINSTORM|SPECIFY|DESIGN|DECOMPOSE|IMPLEMENT|VALIDATE|MAINTAIN]
Task: [Task ID]

## Context
[Situation requiring decision]

## Options Considered
1. **Option A**
   - Pros: [benefits]
   - Cons: [drawbacks]

2. **Option B**
   - Pros: [benefits]
   - Cons: [drawbacks]

## Decision
Selected: **Option A**

## Rationale
[Why this option was chosen]

## Confidence
[High|Medium|Low]

## Security Review
[Security implications considered]

## Patterns Identified
[Reusable patterns from this decision]

## Evolution Feedback
[Learnings for system improvement]
```

### B. Pattern Template

```markdown
# Pattern: [Pattern Name]
Category: [auth|api|data|ui|test|security]
Created: 2025-09-18 16:09:12 WEST
Usage Count: 0

## Purpose
[What problem this solves]

## Template
```[language]
// Reusable code structure
```

## Usage
1. [Step to apply pattern]
2. [Next step]

## Examples
- Used in: [file:line]
- Used in: [file:line]

## Variations
- **Variation A**: [when to use]
- **Variation B**: [when to use]

## Security Considerations
[Any security implications]

## Evolution History
- v1.0: Initial pattern
- v1.1: [improvements]
```

### C. Agent Specification Template

```markdown
---
name: [agent-name]
description: [One-line purpose]
tools: [Read, Write, Grep, Bash, TodoWrite]
triggers: [Phase and condition triggers]
---

# [Agent Name]

## Capability
[What this agent specializes in]

## Process
<step number="1">
  [Action]
</step>

<step number="2">
  [Action]
</step>

## Inputs
- Required: [what's needed]
- Optional: [what's helpful]

## Outputs
- Primary: [main deliverable]
- Secondary: [additional outputs]

## Context Usage
- Reads from: [prior agent outputs]
- Writes to: [workflow context]

## Evolution
- Patterns detected: [what to look for]
- Improvements suggested: [what to optimize]

## Invocation
Task tool with subagent_type="[agent-name]"
```

---

## Conclusion

Nexus Enhanced Workflow v5 is a comprehensive development methodology that leverages Claude's capabilities to ensure quality while maintaining flexibility. Through specialized agents, unlimited questioning, and continuous evolution, it creates a self-improving workflow that adapts to your project's needs.

Key aspects:
- **Methodology, not software** - Implemented through Claude commands
- **Real specialized agents** - Claude's native agent capabilities
- **Continuous learning** - Three-layer evolution system
- **Flexible TDD** - Strong default with documented exceptions
- **Security-first** - SecurityGuardian throughout pipeline

The workflow guides development through proven patterns while continuously learning and improving from your specific project's needs.