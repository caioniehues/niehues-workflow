<?xml version="1.0" encoding="UTF-8"?>
<task id="4" name="Early Pipeline Phases" parallel_group="pipeline">
  <metadata>
    <title>Early Pipeline Phases - BRAINSTORM and SPECIFY</title>
    <description>Create command specifications and templates for early pipeline phases</description>
    <assigned_to>pipeline-specialist</assigned_to>
    <priority>critical</priority>
    <t_shirt_size>L</t_shirt_size>
    <estimated_hours>3.5</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#pipeline-phases</context_source>
  </metadata>

  <requirements>
    <requirement id="EP-001" priority="critical">
      Implement /nexus-brainstorm command with unlimited questioning
    </requirement>
    <requirement id="EP-002" priority="critical">
      Implement /nexus-specify command with testable requirements
    </requirement>
    <requirement id="EP-003" priority="high">
      Create questioning agent specification
    </requirement>
    <requirement id="EP-004" priority="high">
      Design brainstorm and specification templates
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. Extended Brainstorm Command -->
    <deliverable id="EPD-001" type="command">
      <path>.claude/commands/nexus-brainstorm-extended.md</path>
      <description>Extended brainstorm command with approach evaluation</description>
      <content_structure>
---
name: nexus-brainstorm-extended
description: Generate and evaluate solution approaches through comprehensive analysis
tools: Read, Write, Task, Glob, TodoWrite
implementation: .claude/commands/nexus-brainstorm-extended.md
---

# /nexus-brainstorm-extended [topic]

Deep exploration of solution spaces with pattern analysis and trade-off evaluation.

&lt;unlimited_questioning&gt;
  Continue asking until complete understanding achieved:
  - Core problem definition
  - Success criteria
  - Constraints and limitations
  - Edge cases and exceptions
  - Integration requirements
  - Performance expectations
  - Security considerations
  - User experience goals

  NO ARTIFICIAL LIMITS - continue until clarity
&lt;/unlimited_questioning&gt;

&lt;approach_generation&gt;
  Minimum 3 approaches required:

  Approach A: Conservative
  - Proven patterns
  - Lower risk
  - Standard implementation

  Approach B: Optimal
  - Best technical solution
  - Higher effort
  - Superior quality

  Approach C: Pragmatic
  - Balanced trade-offs
  - Reasonable timeline
  - Practical constraints

  [Optional] Approach D: Innovative
  - Novel solution
  - Pattern extraction opportunity
  - Higher risk/reward
&lt;/approach_generation&gt;

&lt;evaluation_matrix&gt;
  For each approach evaluate:
  - Implementation complexity
  - Maintenance burden
  - Performance characteristics
  - Security implications
  - Testing requirements
  - Team expertise needed
  - Timeline impact
  - Cost considerations
&lt;/evaluation_matrix&gt;

&lt;pattern_analysis&gt;
  Search .nexus/patterns/ for:
  - Similar problems solved
  - Reusable architectures
  - Common pitfalls
  - Success patterns
&lt;/pattern_analysis&gt;

&lt;micro_evolution&gt;
  Track for future improvement:
  - Question patterns (5+ occurrences)
  - Constraint patterns
  - Decision patterns
  - Approach patterns
&lt;/micro_evolution&gt;
      </content_structure>
    </deliverable>

    <!-- 2. Specification Command Extensions -->
    <deliverable id="EPD-002" type="command">
      <path>.claude/commands/nexus-specify-extended.md</path>
      <description>Extended specification command with sharding support</description>
      <content_structure>
---
name: nexus-specify-extended
description: Create comprehensive, testable specifications with automatic sharding
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-specify-extended.md
---

# /nexus-specify-extended [feature]

Transform approaches into formal specifications with test criteria.

&lt;requirement_definition&gt;
  For each requirement:
  - Unique ID (FR-XXX, NFR-XXX)
  - Clear description
  - Testable acceptance criteria
  - Edge cases documented
  - Error conditions specified
  - Performance thresholds
&lt;/requirement_definition&gt;

&lt;sharding_strategy&gt;
  If specification > 500 lines:

  Epic Level (.nexus/specs/sharded/epics/):
  - High-level overview
  - Story links
  - Cross-cutting concerns

  Story Level (.nexus/specs/sharded/stories/):
  - Detailed requirements
  - Test specifications
  - Implementation notes

  Maintain bidirectional links
&lt;/sharding_strategy&gt;

&lt;test_specification&gt;
  Define comprehensive test strategy:
  - Unit test requirements
  - Integration scenarios
  - E2E test cases
  - Performance benchmarks
  - Security test cases
  - Mock/stub definitions
&lt;/test_specification&gt;

&lt;api_contracts&gt;
  For each endpoint:
  - Request format
  - Response format
  - Validation rules
  - Error responses
  - Rate limits
  - Authentication
&lt;/api_contracts&gt;
      </content_structure>
    </deliverable>

    <!-- 3. Questioning Agent Specification -->
    <deliverable id="EPD-003" type="agent">
      <path>.claude/agents/questioning-agent.md</path>
      <description>Unlimited adaptive questioning agent</description>
      <content_structure>
---
name: questioning-agent
description: Unlimited adaptive questioning for complete understanding
tools: Read, Write, TodoWrite
triggers: Vague requirements, unclear specifications, ambiguous inputs
---

# Questioning Agent

## Purpose
Achieve complete understanding through unlimited questioning without artificial constraints.

## Questioning Strategy

### Initial Assessment
1. Identify knowledge gaps
2. Recognize ambiguities
3. Detect missing context
4. Find undefined terms

### Question Categories

#### Problem Definition
- What specific problem are we solving?
- Who experiences this problem?
- When does this problem occur?
- What is the impact of not solving it?

#### Success Criteria
- How will we measure success?
- What are the key metrics?
- What is the minimum acceptable outcome?
- What would exceed expectations?

#### Constraints
- What technical limitations exist?
- What are the time constraints?
- What budget considerations apply?
- What resources are available?

#### Edge Cases
- What unusual scenarios might occur?
- How should errors be handled?
- What are the failure modes?
- What recovery strategies exist?

### Adaptive Questioning
- Build on previous answers
- Explore implications
- Challenge assumptions
- Verify understanding

## No Stopping Conditions
Continue questioning until:
- Complete clarity achieved
- All ambiguities resolved
- Edge cases identified
- Success criteria clear
- Constraints understood

## Output Format
Document all Q&amp;A in:
.nexus/brainstorms/[timestamp]-qa.md

## Evolution Tracking
- Questions asked 5+ times → Template
- Common patterns → Quick paths
- Frequent ambiguities → Preemptive questions
      </content_structure>
    </deliverable>

    <!-- 4. Brainstorm Template -->
    <deliverable id="EPD-004" type="template">
      <path>templates/brainstorm.md</path>
      <description>Standard brainstorm documentation template</description>
      <content_structure>
# Brainstorm: {{feature_name}}
Date: {{timestamp}}
Status: {{status}}

## Problem Statement
{{problem_description}}

## Questions and Answers

### Problem Clarification
{{#each problem_questions}}
**Q**: {{question}}
**A**: {{answer}}
{{/each}}

### Requirements Discovery
{{#each requirement_questions}}
**Q**: {{question}}
**A**: {{answer}}
{{/each}}

### Constraint Identification
{{#each constraint_questions}}
**Q**: {{question}}
**A**: {{answer}}
{{/each}}

## Approach Analysis

### Approach A: {{approach_a_name}}
**Description**: {{approach_a_description}}
**Pros**: {{approach_a_pros}}
**Cons**: {{approach_a_cons}}
**Effort**: {{approach_a_effort}}
**Risk**: {{approach_a_risk}}

### Approach B: {{approach_b_name}}
**Description**: {{approach_b_description}}
**Pros**: {{approach_b_pros}}
**Cons**: {{approach_b_cons}}
**Effort**: {{approach_b_effort}}
**Risk**: {{approach_b_risk}}

### Approach C: {{approach_c_name}}
**Description**: {{approach_c_description}}
**Pros**: {{approach_c_pros}}
**Cons**: {{approach_c_cons}}
**Effort**: {{approach_c_effort}}
**Risk**: {{approach_c_risk}}

## Trade-off Matrix

| Criterion | Approach A | Approach B | Approach C |
|-----------|------------|------------|------------|
| Implementation Complexity | {{a_complexity}} | {{b_complexity}} | {{c_complexity}} |
| Maintenance Burden | {{a_maintenance}} | {{b_maintenance}} | {{c_maintenance}} |
| Performance | {{a_performance}} | {{b_performance}} | {{c_performance}} |
| Security | {{a_security}} | {{b_security}} | {{c_security}} |
| Testing Effort | {{a_testing}} | {{b_testing}} | {{c_testing}} |

## Recommendation
Selected Approach: {{selected_approach}}
Rationale: {{selection_rationale}}

## Risks and Mitigations
{{#each risks}}
- Risk: {{description}}
  Mitigation: {{mitigation}}
{{/each}}

## Patterns Identified
{{#each patterns}}
- {{pattern_name}}: {{pattern_description}}
{{/each}}

## Next Steps
1. Create specification using /nexus-specify
2. Review with stakeholders
3. Proceed to design phase
      </content_structure>
    </deliverable>

    <!-- 5. Specification Template -->
    <deliverable id="EPD-005" type="template">
      <path>templates/specification.md</path>
      <description>Formal specification document template</description>
      <content_structure>
# Specification: {{feature_name}}
Version: {{version}}
Date: {{timestamp}}
Status: {{status}}
Author: {{author}}

## Executive Summary
{{summary}}

## Functional Requirements

{{#each functional_requirements}}
### {{id}}: {{title}}
**Description**: {{description}}
**Priority**: {{priority}}

**Acceptance Criteria**:
{{#each acceptance_criteria}}
- {{criterion}}
{{/each}}

**Edge Cases**:
{{#each edge_cases}}
- {{edge_case}}
{{/each}}

**Test Requirements**:
{{#each test_requirements}}
- {{test_requirement}}
{{/each}}
{{/each}}

## Non-Functional Requirements

### Performance
{{#each performance_requirements}}
- {{requirement}}
{{/each}}

### Security
{{#each security_requirements}}
- {{requirement}}
{{/each}}

### Scalability
{{#each scalability_requirements}}
- {{requirement}}
{{/each}}

## API Specifications

{{#each api_endpoints}}
### {{method}} {{path}}
**Description**: {{description}}

**Request**:
```{{format}}
{{request_body}}
```

**Response**:
```{{format}}
{{response_body}}
```

**Validation Rules**:
{{#each validation_rules}}
- {{rule}}
{{/each}}

**Error Responses**:
{{#each error_responses}}
- {{code}}: {{message}}
{{/each}}
{{/each}}

## Data Models

{{#each data_models}}
### {{model_name}}
```yaml
{{model_definition}}
```
{{/each}}

## Test Strategy

### Unit Tests
{{unit_test_strategy}}

### Integration Tests
{{integration_test_strategy}}

### E2E Tests
{{e2e_test_strategy}}

## Dependencies
{{#each dependencies}}
- {{dependency}}: {{purpose}}
{{/each}}

## Risks
{{#each risks}}
- **Risk**: {{description}}
  **Impact**: {{impact}}
  **Mitigation**: {{mitigation}}
{{/each}}

## Approval
- [ ] Product Owner
- [ ] Technical Lead
- [ ] Security Review
- [ ] QA Review
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - Brainstorm command supports unlimited questioning
    - Specification command creates testable requirements
    - All outputs properly documented
    - Templates comprehensive and reusable
    - Questioning agent specification complete
    - Sharding strategy implemented for large specs
    - Pattern detection integrated
    - Micro-evolution tracking active
  </success_criteria>

  <dependencies>
    - Core commands (Task 1)
    - Agent system (Task 2)
    - Template system (Task 3)
  </dependencies>

  <notes>
    This is METHODOLOGY documentation:
    - NO TypeScript code
    - NO compiled software
    - Only markdown specifications and templates
    - Focus on workflow and process
    - All execution through Claude commands
  </notes>

</task>