---
command: nexus-specify
description: Create detailed Software Requirements Specification through adaptive questioning
tools:
  - Read
  - Write
  - TodoWrite
arguments:
  - name: topic
    description: The topic or feature to specify
    required: true
  - name: --brainstorm
    description: Path to brainstorm session file to use as input
    required: false
  - name: --confidence
    description: Target confidence level (default 85%)
    required: false
  - name: --max-questions
    description: Maximum questions to ask (default 200)
    required: false
  - name: --output
    description: Output directory (default .nexus/specs/monolithic/)
    required: false
---

# Nexus Specify Command

Create comprehensive Software Requirements Specifications through adaptive questioning that continues until reaching the target confidence level.

## Usage
```
/nexus-specify <topic> [--brainstorm=<file>] [--confidence=85] [--max-questions=200]
```

## What It Does

The specify command transforms ideas into formal specifications by:
- Asking adaptive questions based on gaps in understanding
- Continuing until reaching target confidence (default 85%)
- Extracting functional and non-functional requirements
- Generating user stories and use cases
- Defining technical architecture
- Creating test scenarios and acceptance criteria
- Identifying edge cases and risks

## Process

### 1. Context Gathering
- Problem statement
- Solution overview
- Executive summary
- Primary users and stakeholders
- Success metrics

### 2. Adaptive Questioning
The engine asks questions across five categories:
- **Functional**: What the system must do
- **Non-functional**: Performance, security, scalability
- **Technical**: Architecture, technology stack
- **Business**: Timeline, budget, constraints
- **Edge Cases**: Error scenarios, exceptions

Questions continue until:
- Target confidence is reached (default 85%)
- Maximum questions limit is reached
- All critical areas are covered

### 3. Requirements Extraction
- Functional requirements with acceptance criteria
- Non-functional requirements with metrics
- User stories in standard format
- Use cases with flows and exceptions

### 4. Technical Specification
- System architecture overview
- Component definitions
- Data model and entities
- API specifications
- Integration points

### 5. Validation & Testing
- Test scenarios for each requirement
- Acceptance criteria validation
- Edge case identification
- Risk assessment and mitigation

### 6. Documentation Generation
Produces a complete SRS document including:
- Executive summary
- Requirements (functional/non-functional)
- User stories and use cases
- Technical architecture
- Data model
- API specifications
- Testing strategy
- Deployment approach
- Success metrics
- Risk register

## Examples

### Basic Specification
```
/nexus-specify "user authentication system"
```
Creates a specification through interactive questioning.

### From Brainstorm Session
```
/nexus-specify "payment processing" --brainstorm=".nexus/brainstorms/2024-01-15-payment-processing.md"
```
Uses a previous brainstorm session as input context.

### High Confidence Specification
```
/nexus-specify "critical security module" --confidence=95
```
Continues questioning until 95% confidence is reached.

### Limited Questioning
```
/nexus-specify "simple CRUD API" --max-questions=50
```
Limits questioning to 50 questions maximum.

## Output

The command generates a markdown SRS document containing:

```markdown
# Software Requirements Specification
## [Topic]
Version: 1.0.0
Confidence: 85%
Questions Asked: 47

## Executive Summary
[High-level overview]

## Problem Statement
[Problem being solved]

## Functional Requirements
### FR-1: [Requirement]
Priority: Must-have
Acceptance Criteria:
- Given...
- When...
- Then...

## Non-Functional Requirements
### NFR-1: [Requirement]
Priority: Should-have
Metric: [Measurable target]

## User Stories
### US-1: As a [user], I want [feature], so that [benefit]

## Technical Architecture
[Architecture overview and decisions]

## Data Model
[Entities and relationships]

## API Specification
[Endpoints and contracts]

## Testing Strategy
[Test levels and coverage targets]

## Risk Register
[Identified risks and mitigations]
```

## Best Practices

1. **Prepare Context**: Have problem statement and high-level solution ready
2. **Answer Thoroughly**: More detailed answers lead to better specifications
3. **Be Specific**: Concrete examples help the engine understand requirements
4. **Consider Edge Cases**: Think about what could go wrong
5. **Review Output**: The specification is a starting point for refinement

## Integration

After specification:
1. Use `/nexus-shard` to break down large specifications
2. Use `/nexus-decompose` to create implementation tasks
3. Use `/nexus-implement` for TDD development
4. Track progress with `/nexus-metrics`

## Confidence Levels

- **< 50%**: Very incomplete, many unknowns
- **50-70%**: Basic understanding, gaps remain
- **70-85%**: Good specification, ready for review
- **85-95%**: Comprehensive, ready for implementation
- **> 95%**: Highly detailed, all edge cases covered

## Metrics Tracked

- Total questions asked
- Final confidence achieved
- Time to specification
- Requirements extracted
- Edge cases identified

## Related Commands
- `/nexus-brainstorm`: Generate ideas before specification
- `/nexus-shard`: Break down large specifications
- `/nexus-validate`: Validate specification completeness