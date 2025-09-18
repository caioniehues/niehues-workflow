# Nexus Quick Start Guide

## 5 Minutes to Your First Feature

### Minute 1: Initialize
```bash
/nexus-init
```
Accept TDD commitment: **Yes**
Accept unlimited questioning: **Yes**

✓ Nexus is ready!

### Minute 2: Brainstorm Your Feature
```bash
/nexus-brainstorm "todo list feature"
```

Answer key questions:
- "Basic CRUD for todo items"
- "Single user, no sharing"
- "Priority levels: high, medium, low"
- "Due dates optional"

✓ 3 approaches generated, one selected!

### Minute 3: Create Specification
```bash
/nexus-specify "todo list"
```

Nexus creates testable requirements:
- FR-001: Create todo with title
- FR-002: Mark todo complete
- FR-003: Set priority level
- FR-004: Optional due date

✓ Specification ready!

### Minute 4: Break Down Tasks
```bash
/nexus-decompose "todo list"
```

Tasks created with sizes:
- T001: [S] Write todo model tests
- T002: [M] Implement todo model
- T003: [S] Write API tests
- T004: [M] Implement API

✓ 4 tasks ready to implement!

### Minute 5: Start Implementing
```bash
/nexus-implement T001
```

Write your first test:
```javascript
test('creates todo with title', () => {
  const todo = new Todo('Buy milk');
  expect(todo.title).toBe('Buy milk');
  expect(todo.completed).toBe(false);
});
```

✓ You're now doing TDD with Nexus!

## What's Next?

1. Continue implementing tasks
2. Run `/nexus-validate` when done
3. Use `/nexus-evolve` to learn and improve
4. Check `.nexus/patterns/` for reusable code

## Key Commands to Remember

- `/nexus-brainstorm` - Start new feature
- `/nexus-implement` - Build with TDD
- `/nexus-task list` - See your tasks
- `/nexus-validate` - Check quality
- `/nexus-evolve` - Learn and improve

## Tips for Success

1. **Don't fight the questions** - They ensure understanding
2. **Write tests first** - It's easier than you think
3. **Keep tasks small** - Nothing larger than L (4 hours)
4. **Extract patterns** - Reuse what works
5. **Evolve regularly** - Continuous improvement

## Getting Help

- Full guide: `docs/user-guide.md`
- Commands: `docs/command-reference.md`
- Examples: `examples/`
- Your patterns: `.nexus/patterns/`

Welcome to better development with Nexus!