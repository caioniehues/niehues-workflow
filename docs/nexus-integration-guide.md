# Nexus v5 Integration Guide

## Prerequisites
- Claude Desktop or API access
- Git repository
- Understanding of TDD principles
- Commitment to unlimited questioning

## Integration Steps

### Step 1: Initial Setup
1. Open project in Claude
2. Run `/nexus-init` command
3. Review generated guidelines in `.nexus/guidelines.md`
4. Customize guidelines for your project

### Step 2: Team Onboarding
1. Review Nexus principles with team
2. Explain unlimited questioning approach
3. Demonstrate TDD workflow
4. Practice with example feature

### Step 3: Pipeline Configuration
1. Map existing workflow to Nexus phases
2. Identify phase transition points
3. Set up backward navigation rules
4. Configure parallel execution opportunities

### Step 4: Agent Configuration
1. Review available agents
2. Customize triggers for your context
3. Create project-specific agents if needed
4. Test agent invocations

### Step 5: Pattern Library Setup
1. Import existing patterns
2. Configure pattern detection thresholds
3. Set up pattern categories
4. Initialize pattern templates

### Step 6: Evolution Configuration
1. Set evolution trigger thresholds
2. Configure metric collection
3. Schedule reflection sessions
4. Initialize learning logs

## Workflow Integration

### With Existing Git Workflow
```bash
# Before starting feature
/nexus-brainstorm "feature description"
/nexus-specify

# During development
/nexus-decompose
/nexus-implement

# Before PR
/nexus-validate
```

### With CI/CD Pipeline
- Pre-commit: Run guideline checks
- PR creation: Include specification links
- Post-merge: Trigger micro-evolution
- Release: Formal evolution reflection

### With Project Management
- Epic planning → BRAINSTORM phase
- Story creation → SPECIFY phase
- Sprint planning → DECOMPOSE phase
- Daily standups → Task state updates
- Retrospectives → EVOLVE phase

## Common Integration Patterns

### Greenfield Project
1. Start with /nexus-init
2. Full pipeline from BRAINSTORM
3. Let patterns emerge naturally
4. Evolution from day one

### Legacy Project
1. Gradual phase adoption
2. Start with SPECIFY for new features
3. Retrofit patterns from existing code
4. Incremental guideline adoption

### Emergency Hotfix
1. Document TDD exception
2. Fast-track through pipeline
3. Add tests within 24 hours
4. Capture learnings immediately

## Success Metrics
- Questions per feature: Track increase
- Pattern extraction rate: 3+ per week
- Guideline compliance: >95%
- Evolution insights: Weekly improvements