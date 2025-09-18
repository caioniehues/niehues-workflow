# Nexus Workflow API Reference

This document provides comprehensive API documentation for the Nexus Workflow system, including command interfaces, core services, and extension points.

## Table of Contents

- [Command Line Interface](#command-line-interface)
- [Core Commands](#core-commands)
- [Command Handler API](#command-handler-api)
- [Context Manager API](#context-manager-api)
- [Database Manager API](#database-manager-api)
- [Agent Interface](#agent-interface)
- [Error Handling](#error-handling)
- [Configuration API](#configuration-api)
- [Extension Points](#extension-points)

## Command Line Interface

### Base Command Structure

```bash
nexus <command> [options]
```

All commands follow consistent patterns for options, error handling, and output formatting.

### Global Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-h, --help` | boolean | Display help information | false |
| `-V, --version` | boolean | Display version information | false |
| `-v, --verbose` | boolean | Enable verbose output | false |

## Core Commands

### `nexus init`

Initialize a new Nexus workflow project with constitutional TDD enforcement.

**Syntax:**
```bash
nexus init [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-n, --name <name>` | string | Project name | auto-detected |
| `-d, --dir <directory>` | string | Project directory | `.` |
| `-f, --force` | boolean | Force reinitialization | false |
| `--skip-tdd` | boolean | Skip TDD commitment (not recommended) | false |

**Example:**
```bash
# Basic initialization
nexus init

# Initialize with custom name and directory
nexus init --name "my-project" --dir "./projects/my-project"

# Force reinitialization (overwrites existing .nexus)
nexus init --force
```

**Return Values:**
- Exit code 0: Successful initialization
- Exit code 1: Initialization failed
- Exit code 2: User declined TDD commitment

**Created Structure:**
```
.nexus/
├── config.yaml          # Project configuration
├── constitution.md       # Constitutional principles (immutable)
├── database.sqlite       # Workflow state database
├── current/             # Current phase outputs
├── archive/             # Archived phase outputs
└── cache/               # Temporary cache files
```

### `nexus brainstorm`

Start an adaptive brainstorming session with intelligent questioning.

**Syntax:**
```bash
nexus brainstorm [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-c, --context <file>` | string | Context file path | none |
| `-o, --output <file>` | string | Output file path | `brainstorm.md` |

**Example:**
```bash
# Basic brainstorming
nexus brainstorm

# With context file
nexus brainstorm --context requirements.txt --output initial-ideas.md
```

**Output Format:**
```markdown
# Brainstorm Session Results

## Topic
[Identified topic]

## Approaches Considered
1. [Approach 1]
2. [Approach 2]
3. [Approach 3]

## Selected Approach
[Chosen approach with rationale]

## Questions and Answers
[Adaptive questioning results]

## Confidence Level
[0-100%]
```

### `nexus specify`

Generate detailed technical specifications from brainstorm output.

**Syntax:**
```bash
nexus specify [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-i, --input <file>` | string | Brainstorm input file | `brainstorm.md` |
| `-o, --output <file>` | string | Specification output file | `specification.md` |

**Example:**
```bash
# Basic specification
nexus specify

# Custom input and output
nexus specify --input brainstorm.md --output detailed-spec.md
```

### `nexus decompose`

Decompose specifications into atomic, implementable tasks.

**Syntax:**
```bash
nexus decompose [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-i, --input <file>` | string | Specification input file | `specification.md` |
| `-o, --output <directory>` | string | Output directory for task files | `.` |

**Example:**
```bash
# Basic decomposition
nexus decompose

# Custom input and output
nexus decompose --input spec.md --output ./tasks
```

### `nexus implement`

Implement tasks with constitutional TDD enforcement.

**Syntax:**
```bash
nexus implement [options]
```

**Options:**

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `-t, --task <file>` | string | Task file to implement | none |
| `--no-tdd` | boolean | Disable TDD enforcement (not recommended) | false |

**Example:**
```bash
# Implement specific task
nexus implement --task ./tasks/authentication-task.md

# Implement with TDD disabled (constitutional violation warning)
nexus implement --task ./tasks/task.md --no-tdd
```

## Command Handler API

### CommandHandler Base Class

All commands extend the `CommandHandler` base class which provides common functionality.

```typescript
abstract class CommandHandler {
  constructor(config: CommandConfig);

  // Lifecycle methods
  async run(): Promise<CommandResult>;
  protected abstract getPhase(): WorkflowPhase;
  protected abstract validatePreconditions(): Promise<void>;
  protected abstract executeCommand(): Promise<CommandResult>;

  // Context management
  protected async loadPreviousPhaseContext(phase: WorkflowPhase): Promise<any>;
  protected async savePhaseContext(data: any): Promise<void>;

  // Utility methods
  protected log(level: 'info' | 'warn' | 'error' | 'success', ...args: any[]): void;
  protected showProgress(message: string): void;
  protected async confirm(message: string): Promise<boolean>;

  // File operations
  protected writeToCurrentDir(filename: string, content: string): void;
  protected readFromCurrentDir(filename: string): string | null;
  protected fileExistsInCurrentDir(filename: string): boolean;
}
```

### CommandConfig Interface

```typescript
interface CommandConfig {
  projectPath?: string;      // Project directory path
  sessionId?: string;        // Workflow session ID
  verbose?: boolean;         // Enable verbose logging
  skipValidation?: boolean;  // Skip precondition validation
}
```

### CommandResult Interface

```typescript
interface CommandResult {
  success: boolean;    // Whether command succeeded
  message?: string;    // Human-readable result message
  data?: any;         // Command-specific result data
  error?: Error;      // Error object if command failed
}
```

## Context Manager API

### IContextManager Interface

The context manager provides methods for storing, retrieving, and managing workflow context.

```typescript
interface IContextManager {
  // Initialization
  initialize(sessionId: string, projectPath?: string): Promise<void>;
  close(): Promise<void>;

  // Basic key-value operations
  get<T = any>(key: string): Promise<T | undefined>;
  set(key: string, value: any, options?: ContextOptions): Promise<void>;
  has(key: string): Promise<boolean>;
  invalidate(key: string): Promise<void>;
  clear(): Promise<void>;

  // Phase-specific operations
  loadPhaseContext(phase: WorkflowPhase): Promise<PhaseContext | undefined>;
  savePhaseContext(phase: WorkflowPhase, context: any, options?: ContextOptions): Promise<void>;
  invalidatePhase(phase: WorkflowPhase): Promise<void>;

  // Agent context sharing
  shareAgentContext(agentName: string, data: any, confidence: number): Promise<void>;
  getAgentContexts(phase?: WorkflowPhase): Promise<AgentContextRow[]>;

  // Session management
  getSessionId(): string;
  getCurrentPhase(): WorkflowPhase;
  setCurrentPhase(phase: WorkflowPhase): Promise<void>;

  // Utility operations
  getKeys(pattern?: string): Promise<string[]>;
  cleanExpired(): Promise<number>;
}
```

### ContextOptions Interface

```typescript
interface ContextOptions {
  ttlHours?: number;     // TTL in hours for cached data (default: 1)
  overwrite?: boolean;   // Whether to overwrite existing context
  sessionId?: string;    // Session ID for context isolation
}
```

### Workflow Phases

```typescript
type WorkflowPhase = 'init' | 'brainstorm' | 'specify' | 'decompose' | 'implement';
```

### Phase Context Types

```typescript
// Brainstorm phase context
interface BrainstormContext {
  topic: string;
  approaches: string[];
  selectedApproach?: string;
  confidence: number;
  questionsAsked: Question[];
  agentFindings: AgentResult[];
}

// Specification phase context
interface SpecificationContext {
  brainstorm: BrainstormContext;
  specification: string;
  testScenarios: TestScenario[];
  architecture: string;
  dataFlow: string;
  synthesizedRecommendations: SynthesisResult;
}

// Decomposition phase context
interface DecomposeContext {
  specification: SpecificationContext;
  tasks: TaskDefinition[];
  dependencies: TaskDependency[];
}

// Implementation phase context
interface ImplementContext {
  decompose: DecomposeContext;
  currentTask: TaskDefinition;
  testsWritten: boolean;
  implementationComplete: boolean;
  patterns: Pattern[];
}
```

## Database Manager API

### DatabaseManager Class

Manages SQLite database operations for workflow state persistence.

```typescript
class DatabaseManager {
  constructor(projectPath: string);

  // Session management
  createSession(sessionId: string, metadata?: SessionMetadata): Session;
  getSession(sessionId: string): Session | null;
  updateSession(sessionId: string, updates: Partial<Session>): void;
  deleteSession(sessionId: string): void;
  listSessions(): Session[];

  // Context operations
  setContext(sessionId: string, key: string, value: any, ttlHours?: number): void;
  getContext(sessionId: string, key: string): any;
  deleteContext(sessionId: string, key: string): void;
  cleanExpiredContext(): number;

  // Database lifecycle
  close(): void;
}
```

### Database Schema

#### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  phase TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);
```

#### Context Table
```sql
CREATE TABLE context (
  session_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (session_id, key),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

#### Agent Context Table
```sql
CREATE TABLE agent_context (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  data TEXT NOT NULL,
  confidence REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

## Agent Interface

### IWorkflowAgent Interface

Base interface for all workflow agents.

```typescript
interface IWorkflowAgent {
  phase: WorkflowPhase;
  capabilities: AgentCapability[];
  dependencies: AgentDependency[];

  execute(context: PhaseContext): Promise<PhaseResult>;
  validate(input: PhaseInput): Promise<ValidationResult>;
  handoff(nextAgent: IWorkflowAgent): Promise<HandoffResult>;
}
```

### WorkflowAgent Base Class

```typescript
abstract class WorkflowAgent implements IWorkflowAgent {
  protected readonly constitutionalRules: ConstitutionalRule[];
  protected readonly qualityGates: QualityGate[];

  // Template method pattern for phase execution
  public async execute(context: PhaseContext): Promise<PhaseResult>;
  protected abstract executePhase(context: PhaseContext): Promise<PhaseResult>;

  // Constitutional enforcement
  protected async validateConstitution(context: PhaseContext): Promise<void>;
  protected async enforceQualityGates(context: PhaseContext): Promise<void>;
  protected async preserveContext(result: PhaseResult): Promise<void>;
}
```

### Agent Capabilities

```typescript
enum AgentCapability {
  ADAPTIVE_QUESTIONING = 'adaptive_questioning',
  REQUIREMENT_ELICITATION = 'requirement_elicitation',
  AMBIGUITY_DETECTION = 'ambiguity_detection',
  TDD_ENFORCEMENT = 'tdd_enforcement',
  CODE_GENERATION = 'code_generation',
  TEST_CREATION = 'test_creation',
  STATIC_ANALYSIS = 'static_analysis',
  SECURITY_SCANNING = 'security_scanning',
  PERFORMANCE_ANALYSIS = 'performance_analysis'
}
```

## Error Handling

### Error Types

```typescript
// Base error for all Nexus workflow violations
class NexusError extends Error {
  constructor(message: string, public code: string);
}

// Constitutional violations
class ConstitutionalViolationError extends NexusError {
  constructor(message: string);
}

// Missing context errors
class MissingContextError extends NexusError {
  constructor(currentPhase: WorkflowPhase, requiredPhase: WorkflowPhase);
}
```

### Error Codes

| Code | Description | Recovery Action |
|------|-------------|-----------------|
| `CONSTITUTIONAL_VIOLATION` | Constitutional rule violated | Follow constitutional process |
| `MISSING_CONTEXT` | Required context missing | Run prerequisite phase |
| `VALIDATION_FAILED` | Input validation failed | Fix input and retry |
| `PHASE_TRANSITION_BLOCKED` | Cannot proceed to next phase | Complete current phase requirements |
| `TDD_ENFORCEMENT_FAILED` | TDD requirements not met | Write tests first |
| `DATABASE_ERROR` | Database operation failed | Check database integrity |
| `CONTEXT_EXPIRED` | Context has expired | Regenerate context |

### Error Handling Pattern

```typescript
try {
  const result = await command.run();
  if (!result.success) {
    handleCommandFailure(result);
  }
} catch (error) {
  if (error instanceof ConstitutionalViolationError) {
    handleConstitutionalViolation(error);
  } else if (error instanceof MissingContextError) {
    handleMissingContext(error);
  } else {
    handleUnexpectedError(error);
  }
}
```

## Configuration API

### Configuration Structure

```yaml
# .nexus/config.yaml
constitution:
  tdd_enforcement: true           # Cannot be modified
  quality_gates: true            # Cannot be modified
  context_preservation: true     # Cannot be modified

workflow:
  default_phase: "brainstorm"    # Starting phase
  auto_save: true               # Auto-save progress
  confirmation_required: true   # Require user confirmation for destructive operations

agents:
  timeout: 300                  # Agent timeout in seconds
  parallel_limit: 3            # Maximum parallel agents
  retry_count: 3               # Retry attempts for failed operations

quality:
  min_coverage: 80             # Minimum test coverage percentage
  complexity_threshold: 10     # Maximum cyclomatic complexity
  lint_enforcement: true       # Enforce linting rules

database:
  context_ttl_hours: 24        # Default context TTL
  cleanup_interval_hours: 6    # How often to clean expired context
  backup_enabled: true         # Enable automatic backups
```

### Configuration Loading

```typescript
interface ConfigManager {
  load(projectPath: string): Promise<NexusConfig>;
  save(config: NexusConfig, projectPath: string): Promise<void>;
  validate(config: NexusConfig): ValidationResult;
  merge(base: NexusConfig, override: Partial<NexusConfig>): NexusConfig;
}
```

## Extension Points

### Custom Command Development

```typescript
// Example custom command
class CustomAnalysisCommand extends CommandHandler {
  protected getPhase(): WorkflowPhase {
    return 'custom_analysis' as WorkflowPhase;
  }

  protected async validatePreconditions(): Promise<void> {
    // Validate that required context exists
    const specContext = await this.loadPreviousPhaseContext('specify');
    if (!specContext) {
      throw new MissingContextError('custom_analysis', 'specify');
    }
  }

  protected async executeCommand(): Promise<CommandResult> {
    // Custom analysis logic
    const analysis = await this.performAnalysis();
    await this.savePhaseContext(analysis);

    return {
      success: true,
      message: 'Custom analysis completed',
      data: analysis
    };
  }
}
```

### Plugin Architecture

```typescript
interface NexusPlugin {
  name: string;
  version: string;

  initialize(nexus: NexusCore): Promise<void>;
  shutdown(): Promise<void>;
}

interface CommandPlugin extends NexusPlugin {
  getCommands(): Command[];
}

interface AgentPlugin extends NexusPlugin {
  createAgent(phase: WorkflowPhase): Promise<IWorkflowAgent>;
}

interface QualityGatePlugin extends NexusPlugin {
  createQualityGates(): Promise<QualityGate[]>;
}
```

### Event System

```typescript
interface EventEmitter {
  on(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
  off(event: string, listener: Function): void;
}

// Built-in events
enum NexusEvent {
  PHASE_STARTED = 'phase:started',
  PHASE_COMPLETED = 'phase:completed',
  CONTEXT_CHANGED = 'context:changed',
  CONSTITUTIONAL_VIOLATION = 'constitution:violation',
  QUALITY_GATE_FAILED = 'quality:gate:failed',
  AGENT_RESULT = 'agent:result'
}
```

### Custom Quality Gates

```typescript
interface QualityGate {
  name: string;
  phase: WorkflowPhase;
  criteria: QualityCriteria[];
  threshold: number;

  evaluate(context: PhaseContext): Promise<QualityResult>;
}

// Example custom quality gate
class SecurityQualityGate implements QualityGate {
  name = 'Security Compliance';
  phase = WorkflowPhase.IMPLEMENT;
  threshold = 0.95;

  criteria = [
    new NoHardcodedSecretsCriteria(),
    new InputValidationCriteria(),
    new AuthenticationCriteria()
  ];

  async evaluate(context: PhaseContext): Promise<QualityResult> {
    // Security evaluation logic
  }
}
```

---

This API reference provides complete documentation for interacting with the Nexus Workflow system programmatically. For usage examples and tutorials, see the [User Guide](user-guide.md).