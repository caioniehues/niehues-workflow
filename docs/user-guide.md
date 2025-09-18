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
BRAINSTORM ←→ SPECIFY ←→ DESIGN ←→ DECOMPOSE ←→ IMPLEMENT ←→ VALIDATE
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
| XS | < 30min | Trivial changes |
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