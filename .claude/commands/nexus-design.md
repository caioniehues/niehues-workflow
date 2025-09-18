---
name: nexus-design
description: Create comprehensive architectural design with security-first approach
tools: Read, Write, Task, Glob, TodoWrite
implementation: .claude/commands/nexus-design.md
---

# /nexus-design [feature]

Transform specifications into secure architectural designs.

<pre_flight>
  <check id="specification_exists">
    Load specification from .nexus/specs/
    Extract functional requirements
    Identify non-functional requirements
  </check>

  <check id="existing_architecture">
    Review existing design patterns
    Identify integration points
    Check technology constraints
  </check>

  <check id="security_requirements">
    Load security guidelines
    Identify compliance needs
    Check threat models
  </check>
</pre_flight>

<process_flow>
  <step number="1" subagent="architecture-agent">
    **System Architecture Design**

    Define:
    - Component structure
    - Layer boundaries
    - Service interfaces
    - Data flow patterns
    - Integration architecture
    - Technology stack
  </step>

  <step number="2" subagent="security-guardian">
    **Security Threat Modeling**

    Analyze:
    - Attack surfaces
    - Threat vectors
    - Trust boundaries
    - Authentication flows
    - Authorization models
    - Data protection strategies
    - Audit requirements
  </step>

  <step number="3" subagent="pattern-detector">
    **Pattern Application**

    Apply from .nexus/patterns/:
    - Architectural patterns
    - Design patterns
    - Security patterns
    - Integration patterns
    - Performance patterns
  </step>

  <step number="4">
    **Component Specification**

    For each component:
    - Responsibility definition
    - Interface design
    - Dependencies
    - Configuration needs
    - Deployment requirements
  </step>

  <step number="5">
    **Performance Design**

    Consider:
    - Scalability strategy
    - Caching approach
    - Database design
    - Async processing
    - Resource optimization
  </step>

  <step number="6">
    **Document Architecture**

    Save to: .nexus/design/[feature]/
    - architecture.md
    - security-analysis.md
    - component-specs.md
    - integration-design.md
  </step>

  <step number="7">
    **Update Decision Log**

    Record:
    - Technology choices
    - Pattern selections
    - Security decisions
    - Trade-offs made
  </step>
</process_flow>

<outputs>
  - Architecture diagrams
  - Component specifications
  - Security threat model
  - Integration design
  - Performance strategy
  - Technology rationale
</outputs>