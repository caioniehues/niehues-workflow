<?xml version="1.0" encoding="UTF-8"?>
<task id="1" name="Core Commands" parallel_group="foundation">
  <metadata>
    <title>Nexus Core Command Specifications</title>
    <description>Create foundation command specifications for Claude integration</description>
    <assigned_to>command-specialist</assigned_to>
    <priority>critical</priority>
    <t_shirt_size>XL</t_shirt_size>
    <estimated_hours>4</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#command-specifications</context_source>
  </metadata>

  <requirements>
    <requirement id="CR-001" priority="critical">
      Create /nexus-init command specification
    </requirement>
    <requirement id="CR-002" priority="critical">
      Create /nexus-brainstorm command specification
    </requirement>
    <requirement id="CR-003" priority="critical">
      Create /nexus-specify command specification
    </requirement>
    <requirement id="CR-004" priority="critical">
      Create /nexus-design command specification
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. /nexus-init Command -->
    <deliverable id="CD-001" type="command">
      <path>.claude/commands/nexus-init.md</path>
      <description>Initialize Nexus workflow system</description>
      <content_structure>
---
name: nexus-init
description: Initialize Nexus v5 workflow with flexible guidelines
tools: Read, Write, Glob, Bash, TodoWrite
implementation: .claude/commands/nexus-init.md
---

# /nexus-init

Initialize Nexus Enhanced Workflow system for your project.

&lt;pre_flight&gt;
  &lt;check id="existing_nexus"&gt;
    Check for existing .nexus directory
    If exists: Confirm overwrite
  &lt;/check&gt;

  &lt;check id="project_type"&gt;
    Detect project technology:
    - package.json → Node.js
    - requirements.txt → Python
    - go.mod → Go
    - Cargo.toml → Rust
    - pom.xml → Java
  &lt;/check&gt;

  &lt;check id="testing_framework"&gt;
    Identify test framework:
    - Jest/Vitest for Node.js
    - pytest for Python
    - go test for Go
    - cargo test for Rust
  &lt;/check&gt;

  &lt;check id="git_repository"&gt;
    Verify git repository exists
    Check working directory status
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1"&gt;
    **Get User Commitment**

    Display:
    "Nexus v5 promotes Test-Driven Development (TDD)"
    "Tests before code is the strong default"
    "Documented exceptions allowed for spikes/emergencies"

    Prompt: "Accept TDD guidelines? (y/n)"

    Display:
    "Nexus uses unlimited adaptive questioning"
    "No artificial limits on clarification"

    Prompt: "Accept unlimited questioning? (y/n)"
  &lt;/step&gt;

  &lt;step number="2"&gt;
    **Create Directory Structure**

    .nexus/
    ├── guidelines.md        # Editable project guidelines
    ├── project-dna.md       # Technology and patterns
    ├── decision-log.md      # Decision tracking
    ├── brainstorms/         # Ideation outputs
    ├── specs/               # Specifications
    │   ├── monolithic/     # Full specs
    │   └── sharded/        # Broken down specs
    ├── design/              # Architecture designs
    ├── tasks/               # Task breakdowns
    ├── patterns/            # Extracted patterns
    ├── agents/              # Custom agents
    ├── evolution/           # Learning outputs
    │   ├── continuous/     # Real-time patterns
    │   ├── micro/          # Phase learnings
    │   └── formal/         # Pipeline reflections
    └── metrics/             # Performance tracking
  &lt;/step&gt;

  &lt;step number="3"&gt;
    **Generate Guidelines File**

    Create .nexus/guidelines.md with:
    - TDD practice configuration
    - Exception documentation rules
    - Question trigger patterns
    - Code style preferences
    - Security requirements
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Generate Project DNA**

    Create .nexus/project-dna.md with:
    - Detected technology stack
    - Testing framework
    - Existing patterns found
    - Code conventions detected
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Initialize Tracking Systems**

    Create:
    - decision-log.md with template
    - evolution/triggers.yaml
    - metrics/baseline.json
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Display Success**

    Show:
    - Created structure
    - Next steps (/nexus-brainstorm)
    - Documentation location
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;gates&gt;
  &lt;gate id="commitment"&gt;
    User must accept TDD and questioning
  &lt;/gate&gt;
  &lt;gate id="directories"&gt;
    All directories created successfully
  &lt;/gate&gt;
  &lt;gate id="files"&gt;
    Guidelines and DNA files generated
  &lt;/gate&gt;
&lt;/gates&gt;
      </content_structure>
    </deliverable>

    <!-- 2. /nexus-brainstorm Command -->
    <deliverable id="CD-002" type="command">
      <path>.claude/commands/nexus-brainstorm.md</path>
      <description>Generate solution approaches through unlimited questioning</description>
      <content_structure>
---
name: nexus-brainstorm
description: Generate multiple solution approaches through unlimited questioning
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-brainstorm.md
---

# /nexus-brainstorm [topic]

Explore solution approaches through comprehensive questioning and pattern analysis.

&lt;pre_flight&gt;
  &lt;check id="nexus_initialized"&gt;
    Verify .nexus directory exists
    If not: Suggest running /nexus-init first
  &lt;/check&gt;

  &lt;check id="topic_provided"&gt;
    Ensure topic/feature description provided
    If vague: Begin clarification questions
  &lt;/check&gt;

  &lt;check id="pattern_library"&gt;
    Check .nexus/patterns/ for existing patterns
    Load relevant patterns for context
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1" subagent="questioning-agent"&gt;
    **Unlimited Questioning Phase**

    Continue asking until complete understanding:
    - What problem are we solving?
    - Who are the users/stakeholders?
    - What are the success criteria?
    - What constraints exist?
    - What are the edge cases?
    - What security concerns exist?
    - What performance requirements?
    - What integration points?

    NO LIMIT on questions - continue until clarity
  &lt;/step&gt;

  &lt;step number="2" subagent="pattern-detector"&gt;
    **Pattern Search**

    Search .nexus/patterns/ for:
    - Similar problems solved before
    - Reusable architectural patterns
    - Common implementation patterns
    - Security patterns
    - Testing patterns
  &lt;/step&gt;

  &lt;step number="3" subagent="code-archaeologist"&gt;
    **Existing Code Analysis**

    Analyze current codebase for:
    - Related functionality
    - Similar patterns
    - Potential conflicts
    - Integration points
    - Reusable components
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Generate Approaches (minimum 3)**

    Approach A: Conventional
    - Standard solution
    - Well-tested patterns
    - Lower risk

    Approach B: Optimal
    - Best technical solution
    - May require more effort
    - Higher quality

    Approach C: Pragmatic
    - Balance of speed and quality
    - Practical constraints considered
    - Reasonable compromises

    [Optional] Approach D: Innovative
    - Creative solution
    - Potential for pattern extraction
    - Higher risk/reward
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Trade-off Analysis**

    For each approach:
    - Implementation effort
    - Maintenance burden
    - Performance impact
    - Security implications
    - Testing complexity
    - Learning curve
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Document Brainstorm**

    Save to: .nexus/brainstorms/[timestamp]-[topic].md

    Include:
    - Questions asked and answers
    - Patterns identified
    - All approaches generated
    - Trade-off analysis
    - Recommendation with rationale
    - Risk assessment
  &lt;/step&gt;

  &lt;step number="7"&gt;
    **Micro-Evolution**

    Track:
    - New question patterns
    - Constraint patterns
    - Decision patterns

    Update if threshold met:
    - Questions asked 5+ times
    - Patterns seen 3+ times
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;outputs&gt;
  &lt;output type="file"&gt;
    Path: .nexus/brainstorms/[timestamp]-[topic].md
    Content: Complete brainstorm documentation
  &lt;/output&gt;
  &lt;output type="decision"&gt;
    Selected approach with justification
  &lt;/output&gt;
  &lt;output type="next_step"&gt;
    Suggestion: /nexus-specify [selected-approach]
  &lt;/output&gt;
&lt;/outputs&gt;
      </content_structure>
    </deliverable>

    <!-- 3. /nexus-specify Command -->
    <deliverable id="CD-003" type="command">
      <path>.claude/commands/nexus-specify.md</path>
      <description>Create formal, testable specifications</description>
      <content_structure>
---
name: nexus-specify
description: Create formal, testable specifications with acceptance criteria
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-specify.md
---

# /nexus-specify [feature]

Transform brainstormed approaches into formal, testable specifications.

&lt;pre_flight&gt;
  &lt;check id="brainstorm_exists"&gt;
    Check for recent brainstorm on topic
    Load brainstorm context if available
  &lt;/check&gt;

  &lt;check id="selected_approach"&gt;
    Identify which approach to specify
    If unclear: Ask for clarification
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1" subagent="specification-agent"&gt;
    **Create Functional Requirements**

    For each requirement:
    - Unique identifier (FR-001, FR-002...)
    - Clear description
    - Testable acceptance criteria
    - Edge cases
    - Error conditions
    - Performance requirements
  &lt;/step&gt;

  &lt;step number="2" subagent="api-designer"&gt;
    **Design API Contracts**

    Define:
    - Endpoint specifications
    - Request/response formats
    - Data models
    - Validation rules
    - Error responses
    - Rate limiting
  &lt;/step&gt;

  &lt;step number="3" subagent="test-strategist"&gt;
    **Define Test Strategy**

    Specify:
    - Unit test requirements
    - Integration test scenarios
    - E2E test cases
    - Performance benchmarks
    - Security test cases
    - Mock/stub strategy
  &lt;/step&gt;

  &lt;step number="4" subagent="questioning-agent"&gt;
    **Clarification Questions**

    Resolve any ambiguities:
    - Unclear requirements
    - Missing edge cases
    - Undefined behaviors
    - Integration uncertainties

    Continue until specification complete
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Generate Specification Document**

    Structure:
    # Feature: [Name]
    Version: 1.0
    Date: [timestamp]
    Status: Draft

    ## Overview
    [Feature description]

    ## Functional Requirements
    [All FRs with acceptance criteria]

    ## Non-Functional Requirements
    - Performance
    - Security
    - Scalability
    - Maintainability

    ## API Specifications
    [Complete API documentation]

    ## Data Models
    [All data structures]

    ## Test Requirements
    [Test strategy and cases]

    ## Dependencies
    [External dependencies]

    ## Risks
    [Identified risks and mitigations]
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Sharding Decision**

    If specification > 500 lines:
    - Create epic-level shard
    - Break into story shards
    - Maintain linking structure

    Save to appropriate location:
    - Monolithic: .nexus/specs/monolithic/
    - Sharded: .nexus/specs/sharded/
  &lt;/step&gt;

  &lt;step number="7"&gt;
    **Update Decision Log**

    Record in .nexus/decision-log.md:
    - Specification decisions
    - Trade-offs made
    - Assumptions documented
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;gates&gt;
  &lt;gate id="testability"&gt;
    All requirements have test criteria
  &lt;/gate&gt;
  &lt;gate id="completeness"&gt;
    No undefined behaviors
  &lt;/gate&gt;
  &lt;gate id="approval"&gt;
    User reviews and approves specification
  &lt;/gate&gt;
&lt;/gates&gt;
      </content_structure>
    </deliverable>

    <!-- 4. /nexus-design Command -->
    <deliverable id="CD-004" type="command">
      <path>.claude/commands/nexus-design.md</path>
      <description>Create architectural design and system structure</description>
      <content_structure>
---
name: nexus-design
description: Create comprehensive architectural design with security analysis
tools: Read, Write, Task, Glob
implementation: .claude/commands/nexus-design.md
---

# /nexus-design [feature]

Design system architecture with security-first approach.

&lt;pre_flight&gt;
  &lt;check id="specification_exists"&gt;
    Load specification from .nexus/specs/
    Extract requirements for design
  &lt;/check&gt;

  &lt;check id="existing_architecture"&gt;
    Review existing design docs
    Identify integration points
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1" subagent="architecture-agent"&gt;
    **High-Level Architecture**

    Design:
    - Component structure
    - Layer architecture
    - Service boundaries
    - Data flow
    - Integration patterns
    - Technology choices
  &lt;/step&gt;

  &lt;step number="2" subagent="security-guardian"&gt;
    **Security Threat Model**

    Analyze:
    - Attack surface
    - Threat vectors
    - Security boundaries
    - Authentication flow
    - Authorization model
    - Data protection
    - Audit requirements
  &lt;/step&gt;

  &lt;step number="3" subagent="pattern-detector"&gt;
    **Pattern Application**

    Identify applicable patterns:
    - Architectural patterns
    - Design patterns
    - Security patterns
    - Integration patterns

    From: .nexus/patterns/
  &lt;/step&gt;

  &lt;step number="4" subagent="dependency-analyzer"&gt;
    **Dependency Analysis**

    Map:
    - External dependencies
    - Internal dependencies
    - Version requirements
    - Compatibility matrix
    - Update strategy
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Performance Design**

    Consider:
    - Scalability approach
    - Caching strategy
    - Database design
    - Async operations
    - Resource limits
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Create Design Document**

    Save to: .nexus/design/[feature]/architecture.md

    Include:
    - Architecture diagrams
    - Component specifications
    - Security analysis
    - Technology rationale
    - Pattern usage
    - Integration design
    - Performance strategy
  &lt;/step&gt;

  &lt;step number="7"&gt;
    **Update Decision Log**

    Document:
    - Technology choices
    - Pattern selections
    - Security decisions
    - Trade-offs made
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;outputs&gt;
  &lt;output type="file"&gt;
    Path: .nexus/design/[feature]/architecture.md
  &lt;/output&gt;
  &lt;output type="diagrams"&gt;
    Component diagrams
    Data flow diagrams
    Security boundaries
  &lt;/output&gt;
  &lt;output type="next_step"&gt;
    Suggestion: /nexus-decompose
  &lt;/output&gt;
&lt;/outputs&gt;
      </content_structure>
    </deliverable>

    <!-- 5. Command Testing Guide -->
    <deliverable id="CD-005" type="documentation">
      <path>docs/command-testing.md</path>
      <description>Guide for testing command execution</description>
      <content_structure>
# Command Testing Guide

## Testing /nexus-init

### Test Scenarios

1. **Fresh Installation**
   - No existing .nexus directory
   - User accepts all prompts
   - Verify all directories created
   - Check files generated correctly

2. **Existing Installation**
   - .nexus directory exists
   - User chooses to overwrite
   - Verify backup created
   - Check new structure complete

3. **User Rejection**
   - User rejects TDD commitment
   - Command should abort cleanly
   - No directories created

### Verification Checklist
- [ ] All directories created
- [ ] guidelines.md generated
- [ ] project-dna.md accurate
- [ ] decision-log.md initialized
- [ ] Git repository detected

## Testing /nexus-brainstorm

### Test Scenarios

1. **Complete Brainstorm**
   - Provide vague topic
   - Answer all questions
   - Verify 3+ approaches generated
   - Check file saved correctly

2. **Pattern Detection**
   - Create patterns first
   - Run brainstorm
   - Verify patterns found and applied

3. **Incomplete Information**
   - Provide minimal answers
   - Verify continues questioning
   - No artificial stopping

### Verification Checklist
- [ ] Questions unlimited
- [ ] Patterns searched
- [ ] Multiple approaches generated
- [ ] Trade-offs documented
- [ ] File saved with timestamp

## Testing /nexus-specify

### Test Scenarios

1. **From Brainstorm**
   - Load previous brainstorm
   - Create specification
   - Verify requirements testable
   - Check sharding if needed

2. **Direct Specification**
   - No prior brainstorm
   - Start from scratch
   - Complete questioning
   - Generate full spec

### Verification Checklist
- [ ] All requirements have IDs
- [ ] Acceptance criteria defined
- [ ] API contracts complete
- [ ] Test strategy included
- [ ] Decision log updated

## Testing /nexus-design

### Test Scenarios

1. **From Specification**
   - Load specification
   - Create architecture
   - Security analysis complete
   - Patterns applied

2. **Greenfield Design**
   - No prior specification
   - Design from requirements
   - Technology selection justified

### Verification Checklist
- [ ] Architecture documented
- [ ] Security threats analyzed
- [ ] Patterns identified
- [ ] Dependencies mapped
- [ ] Performance considered
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - All 4 core commands specified in markdown
    - Commands follow Claude integration format
    - Pre-flight checks comprehensive
    - Process flows detailed
    - Gates enforce quality
    - No TypeScript or software code
    - Focus on methodology and workflow
  </success_criteria>

  <dependencies>
    - Nexus v5 specification document
    - Claude command format understanding
    - Agent specifications (Task 2)
  </dependencies>

  <notes>
    Remember: This is METHODOLOGY documentation
    - Commands are markdown specifications for Claude
    - No compiled code or software implementation
    - Focus on workflow guidance and automation
    - All execution through Claude's native capabilities
  </notes>

</task>