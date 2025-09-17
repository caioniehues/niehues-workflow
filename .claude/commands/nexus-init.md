---
command: nexus-init
description: Initialize Nexus Enhanced Workflow for your project
tools:
  - Read
  - Write
  - Bash
  - TodoWrite
arguments:
  - name: --force
    description: Overwrite existing .nexus directory
    required: false
  - name: --template
    description: Use specific project template (default, web, api, library)
    required: false
  - name: --skip-discovery
    description: Skip interactive project discovery
    required: false
---

# Nexus Enhanced Workflow Initialization

This command sets up the complete Nexus workflow infrastructure for your project, including:
- Constitutional framework with immutable principles
- Project DNA discovery and documentation
- Quality standards configuration
- Foundation file generation
- Directory structure creation
- Initial metrics baseline

## Usage
```
/nexus-init [--force] [--template=<type>] [--skip-discovery]
```

## Options

### --force
Overwrite an existing .nexus directory if it already exists. Use with caution as this will remove all existing workflow data.

### --template=<type>
Apply a pre-configured template for specific project types:
- `default`: Standard configuration for general projects
- `web`: Optimized for web applications (React, Vue, Angular)
- `api`: Optimized for API/backend services
- `library`: Optimized for library/package development

### --skip-discovery
Skip the interactive configuration process and use defaults. Useful for CI/CD or automated setups.

## What It Does

### Phase 1: Pre-flight Checks
- Verifies no existing .nexus directory (unless --force)
- Checks for Git repository (initializes if missing)
- Detects project type and existing tools
- Identifies CI/CD platform if present

### Phase 2: Project Discovery
- Analyzes codebase to detect:
  - Primary programming language
  - Framework and libraries in use
  - Testing frameworks
  - Database systems
  - Package managers
  - Project structure

### Phase 3: Interactive Configuration
- Project mission and vision
- Quality standards and thresholds
- Branching strategy
- Project values and principles
- Architecture decisions

### Phase 4: Directory Structure
Creates the complete Nexus workflow directory structure:
```
.nexus/
├── constitution.md       # Immutable principles
├── project-dna.md        # Project identity
├── quality-rules.md      # Quality standards
├── decision-log.md       # Technical decisions
├── brainstorms/          # Creative explorations
├── specs/                # Specifications
│   ├── monolithic/       # Full specs
│   └── sharded/          # Broken down specs
├── tasks/                # Task files
├── patterns/             # Extracted patterns
├── templates/            # Custom templates
└── metrics/              # Performance metrics
```

### Phase 5: Foundation Files
Generates customized foundation documents based on your project:
- **constitution.md**: Immutable development principles
- **project-dna.md**: Project identity and goals
- **quality-rules.md**: Coding standards and metrics
- **decision-log.md**: Technical decision record

### Phase 6: Enforcement Setup
- Git hooks for TDD compliance
- VS Code workspace settings
- CI/CD pipeline configuration
- Constitutional enforcer initialization

### Phase 7: Metrics Initialization
- Establishes baseline metrics
- Sets quality targets
- Enables performance tracking

### Phase 8: Initial Tasks
Creates starter tasks to help your team:
- Complete project DNA documentation
- Configure CI/CD pipeline
- Create first specification
- Team onboarding

## Examples

### Basic Initialization
```
/nexus-init
```
Runs full interactive setup with project discovery.

### Force Overwrite
```
/nexus-init --force
```
Overwrites existing .nexus directory and reinitializes.

### Use Web Template
```
/nexus-init --template=web
```
Applies web application optimized settings.

### Automated Setup
```
/nexus-init --skip-discovery --template=api
```
Non-interactive setup using API template defaults.

## After Initialization

Once initialized, you can use these commands:
- `/nexus-brainstorm`: Generate 20+ creative approaches
- `/nexus-specify`: Create detailed specifications
- `/nexus-shard`: Break down large specifications
- `/nexus-decompose`: Create task files with context
- `/nexus-implement`: TDD-enforced implementation

## Troubleshooting

### "nexus directory already exists" Error
Use `--force` flag to overwrite, or manually remove the .nexus directory.

### "Not a git repository" Warning
The command will automatically initialize git if not present.

### Configuration Not Saved
Check file permissions in your project directory.

## Related Commands
- `/nexus-help`: Get help with Nexus workflow
- `/nexus-status`: Check workflow status
- `/nexus-metrics`: View performance metrics