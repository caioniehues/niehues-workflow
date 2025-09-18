---
name: nexus-init
description: Initialize Nexus v5 workflow with flexible guidelines
tools: Read, Write, Glob, Bash, TodoWrite
implementation: .claude/commands/nexus-init.md
---

# /nexus-init

Initialize Nexus Enhanced Workflow system for your project.

<pre_flight>
  <check id="existing_nexus">
    Check for existing .nexus directory
    If exists: Confirm overwrite
  </check>

  <check id="project_type">
    Detect project technology:
    - package.json → Node.js
    - requirements.txt → Python
    - go.mod → Go
    - Cargo.toml → Rust
    - pom.xml → Java
  </check>

  <check id="testing_framework">
    Identify test framework:
    - Jest/Vitest for Node.js
    - pytest for Python
    - go test for Go
    - cargo test for Rust
  </check>

  <check id="git_repository">
    Verify git repository exists
    Check working directory status
  </check>
</pre_flight>

<process_flow>
  <step number="1">
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
  </step>

  <step number="2">
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
  </step>

  <step number="3">
    **Generate Guidelines File**

    Create .nexus/guidelines.md with:
    - TDD practice configuration
    - Exception documentation rules
    - Question trigger patterns
    - Code style preferences
    - Security requirements
  </step>

  <step number="4">
    **Generate Project DNA**

    Create .nexus/project-dna.md with:
    - Detected technology stack
    - Testing framework
    - Existing patterns found
    - Code conventions detected
  </step>

  <step number="5">
    **Initialize Tracking Systems**

    Create:
    - decision-log.md with template
    - evolution/triggers.yaml
    - metrics/baseline.json
  </step>

  <step number="6">
    **Display Success**

    Show:
    - Created structure
    - Next steps (/nexus-brainstorm)
    - Documentation location
  </step>
</process_flow>

<gates>
  <gate id="commitment">
    User must accept TDD and questioning
  </gate>
  <gate id="directories">
    All directories created successfully
  </gate>
  <gate id="files">
    Guidelines and DNA files generated
  </gate>
</gates>