# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Nexus v5 is a **workflow methodology**, not software. It's implemented through Claude commands and agents that guide development through unlimited questioning and flexible TDD practices.

## Key Understanding

**THIS IS NOT SOFTWARE** - Nexus is a methodology implemented through:
- Claude command specifications (`.claude/commands/*.md`)
- Agent specifications (`.claude/agents/*.md`)
- File-based workflow tracking (`.nexus/`)
- Templates and documentation

## Available Commands


### Commands to Implement (from task specifications)
```
/nexus-init          # Initialize workflow system
/nexus-brainstorm    # Generate solution approaches through questioning
/nexus-specify       # Create formal, testable specifications
/nexus-design        # Architectural design with security focus
/nexus-decompose     # Break into T-shirt sized tasks
/nexus-implement     # Execute with TDD (RED-GREEN-REFACTOR)
/nexus-validate      # Comprehensive quality verification
/nexus-evolve        # Workflow reflection and learning
/nexus-maintain      # Handle maintenance tasks
/nexus-task          # Task management operations
/nexus-pattern       # Pattern extraction and management
```

## High-Level Architecture

### Pipeline Flow
```
BRAINSTORM ←→ SPECIFY ←→ DESIGN ←→ DECOMPOSE ←→ IMPLEMENT ←→ VALIDATE ←→ EVOLVE
                                                                ↓
                                                            MAINTAIN
```
**Key Feature**: Backward navigation allowed - can jump back to any phase when issues discovered.

### Directory Structure
```
niehues-workflow/
├── .nexus/                 # Workflow data (created by /nexus-init)
│   ├── guidelines.md       # Editable project guidelines
│   ├── brainstorms/        # Unlimited questioning outputs
│   ├── specs/              # Formal specifications
│   ├── design/             # Architecture designs
│   ├── tasks/              # Task breakdowns with states
│   ├── patterns/           # Extracted patterns (3+ repetitions)
│   └── evolution/          # Learning at 3 layers
│
├── .claude/                # Claude integration
│   ├── commands/           # Command implementations (TO BUILD)
│   ├── agents/             # Agent specifications (TO BUILD)
│   └── tasks/              # XML task specifications (COMPLETE)
│
└── docs/specs/             # Methodology specification (COMPLETE)
```

### Agent System

Agents are invoked via Claude's Task tool with `subagent_type`:
- **questioning-agent**: Unlimited adaptive questioning
- **pattern-detector**: Extracts patterns after 3+ repetitions
- **security-guardian**: Security review throughout
- **architecture-agent**: System design decisions
- **workflow-reflector**: Evolution and learning

### Task Management

**12-State Machine**:
PENDING → BLOCKED → WRITING_TEST → TEST_FAILING → IMPLEMENTING → TEST_PASSING → REVIEWING → NEEDS_REWORK → REFACTORING → PAUSED → CANCELLED → FAILED → DONE

**T-Shirt Sizing**:
- XS: <30min
- S: 30-60min
- M: 1-2hr
- L: 2-4hr
- XL: MUST SPLIT!

**Parallel Marking**: Tasks marked [P] can execute simultaneously

## Critical Implementation Details

### From Task Specifications

1. **Task Files Location**: `.claude/tasks/nexus-task-*.md`
   - All in XML format with deliverables
   - Contains command/agent/template specifications
   - NO TypeScript code (methodology only)

2. **Command Format**:
   ```markdown
   ---
   name: nexus-[command]
   description: [purpose]
   tools: Read, Write, Task, TodoWrite
   implementation: .claude/commands/nexus-[command].md
   ---
   ```

3. **Evolution Triggers**:
   - Pattern repeated 3+ times → Extract to template
   - Question asked 5+ times → Add to questionnaire
   - Task fails 2+ times → Process review
   - Security issue → Immediate prevention rule

4. **TDD Exceptions Allowed**:
   ```yaml
   exploratory_spike: Max 2 hours
   emergency_hotfix: Tests within 24 hours
   proof_of_concept: Clearly marked as POC
   ```

## Development Workflow

### To implement a Nexus command:
1. Read task specification from `.claude/tasks/`
2. Extract command deliverable from XML
3. Create command file in `.claude/commands/`
4. Follow the specification's process flow
5. Use TodoWrite for task tracking

### To use Nexus on a project:
1. Run `/nexus-init` to create `.nexus/` structure
2. Start with `/nexus-brainstorm "feature"`
3. Follow pipeline phases sequentially
4. Allow backward navigation when needed
5. Let evolution capture learnings

## Important Context

### What Nexus IS:
- A methodology for ensuring quality through questioning
- A workflow that learns and evolves
- File-based tracking and documentation
- Claude command orchestration

### What Nexus IS NOT:
- Compiled software
- Running services
- TypeScript/JavaScript code
- AI training system

### Key Principles:
1. **Unlimited Questioning** - No artificial limits
2. **Flexible TDD** - Strong default, documented exceptions
3. **Continuous Evolution** - Three layers of learning
4. **Pattern Extraction** - Reusable templates from repetition

## Task File Validation

When working with task files:
- Must be valid XML structure
- Escape `<` as `&lt;` in content
- Contains only methodology documentation
- No TypeScript/JavaScript code
- Focus on command/agent specifications

## Current Status (2025-09-18)

- ✅ Specification complete (`docs/specs/nexus-enhanced-specification-v5.md`)
- ✅ Task specifications complete (10 task files)
- ✅ Tasks cleaned of TypeScript contamination
- 🚧 Command implementations needed
- 🚧 Agent specifications needed
- 🚧 Templates needed
- 🚧 Examples needed