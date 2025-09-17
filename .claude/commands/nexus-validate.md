---
command: nexus-validate
description: Quality assurance and compliance validation for tasks, epics, or projects
tools:
  - Read
  - Bash
  - TodoWrite
arguments:
  - name: --scope
    description: Validation scope (task, epic, project)
    required: true
  - name: --task
    description: Specific task ID to validate
    required: false
  - name: --fix
    description: Attempt to fix issues automatically
    required: false
---

# Nexus Validate Command

Run quality checks and constitutional compliance validation.

## Usage
```
/nexus-validate --scope=[task|epic|project] [--task=<task-id>] [--fix]
```

## What It Does

Basic validation checks:
- **Constitutional Compliance**: TDD requirements met
- **Test Coverage**: Minimum 80% coverage where applicable
- **Implementation Status**: Tasks marked complete have working code
- **Documentation**: Required files exist and are current

## Validation Scopes

### Task Validation
```
/nexus-validate --scope=task --task=AUTH-001
```
Checks:
- Task file exists and has embedded context
- Acceptance criteria are defined
- If marked complete: tests exist and pass
- Implementation matches acceptance criteria

### Epic Validation
```
/nexus-validate --scope=epic
```
Checks:
- All tasks in epic have proper context
- Dependencies are satisfied
- No circular dependencies
- Progress tracking is current

### Project Validation
```
/nexus-validate --scope=project
```
Checks:
- Constitutional framework in place
- All phases have proper artifacts
- No TDD violations in codebase
- Documentation is complete

## Auto-Fix Mode
```
/nexus-validate --scope=task --task=AUTH-001 --fix
```
Attempts to automatically fix common issues:
- Generate missing test files
- Update task status
- Fix formatting issues
- Create missing documentation

## Output

Generates a validation report showing:
- ✅ Passed checks
- ❌ Failed checks
- ⚠️ Warnings
- 🔧 Auto-fixable issues

## Integration

Use validation:
- Before marking tasks complete
- At end of each phase
- Before project deployment
- During code reviews