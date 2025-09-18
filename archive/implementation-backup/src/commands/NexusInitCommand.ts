/**
 * Nexus Init Command
 *
 * Initializes the Nexus workflow system with constitutional TDD enforcement
 * and creates the required directory structure and database.
 */

import { CommandHandler, CommandConfig, CommandResult } from './CommandHandler.js';
import type { WorkflowPhase } from '../core/context/IContextManager.js';
import chalk from 'chalk';
import { existsSync, rmSync } from 'fs';
import inquirer from 'inquirer';

/**
 * Configuration for the nexus-init command
 */
export interface InitCommandConfig extends CommandConfig {
  force?: boolean;
  skipTddCommitment?: boolean;
  projectName?: string;
}

/**
 * Implementation of the nexus-init command
 */
export class NexusInitCommand extends CommandHandler {
  private force: boolean;
  private skipTddCommitment: boolean;
  private projectName: string;

  constructor(config: InitCommandConfig = {}) {
    super(config);
    this.force = config.force || false;
    this.skipTddCommitment = config.skipTddCommitment || false;
    this.projectName = config.projectName || 'nexus-project';
  }

  /**
   * Get the workflow phase for this command
   */
  protected getPhase(): WorkflowPhase {
    return 'init';
  }

  /**
   * Validate preconditions for initialization
   */
  protected async validatePreconditions(): Promise<void> {
    // Check if .nexus directory already exists
    if (existsSync(this.nexusDir) && !this.force) {
      this.log('warn', 'Nexus workflow already initialized in this project.');

      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'A .nexus directory already exists. Do you want to reinitialize? (This will delete existing data)',
          default: false,
        },
      ]);

      if (!proceed) {
        throw new Error('Initialization cancelled by user');
      }

      // User confirmed, remove existing directory
      this.log('info', 'Removing existing .nexus directory...');
      rmSync(this.nexusDir, { recursive: true, force: true });
    }
  }

  /**
   * Execute the initialization command
   */
  protected async executeCommand(): Promise<CommandResult> {
    try {
      // Step 1: Create directory structure
      this.showProgress('Creating directory structure...');
      this.ensureDirectoryStructure();

      // Step 2: Initialize database (happens automatically in base class)
      this.showProgress('Initializing database...');
      // Database is already initialized by the base class

      // Step 3: Get TDD commitment
      if (!this.skipTddCommitment) {
        const committed = await this.getTddCommitment();

        if (!committed) {
          // User did not commit to TDD
          this.log('error', chalk.red.bold('⚖️  TDD Commitment Required'));
          this.log('error', 'The Nexus workflow requires a commitment to Test-Driven Development.');
          this.log('info', 'TDD ensures quality by writing tests before implementation.');
          this.log('info', 'This is a core constitutional principle of the Nexus workflow.');

          // Clean up created directories since initialization failed
          rmSync(this.nexusDir, { recursive: true, force: true });

          return {
            success: false,
            message: 'Initialization aborted: TDD commitment is required',
          };
        }
      }

      // Step 4: Generate constitution
      this.showProgress('Generating constitution...');
      await this.generateConstitution();

      // Step 5: Save initialization context
      this.showProgress('Saving initialization context...');
      await this.saveInitializationContext();

      // Step 6: Create initial patterns
      this.showProgress('Setting up pattern templates...');
      await this.createInitialPatterns();

      return {
        success: true,
        message: `✨ Nexus workflow initialized successfully for project "${this.projectName}"`,
        data: {
          projectName: this.projectName,
          sessionId: this.sessionId,
          directories: {
            root: this.nexusDir,
            current: this.currentDir,
            archive: this.archiveDir,
            cache: this.cacheDir,
          },
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error during initialization';
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(message),
      };
    }
  }

  /**
   * Get TDD commitment from the user
   */
  private async getTddCommitment(): Promise<boolean> {
    console.log('\n' + chalk.yellow('═'.repeat(60)));
    console.log(chalk.yellow.bold('  NEXUS CONSTITUTIONAL COMMITMENT'));
    console.log(chalk.yellow('═'.repeat(60)) + '\n');

    console.log(chalk.white('The Nexus workflow is built on the foundation of'));
    console.log(chalk.cyan.bold('Test-Driven Development (TDD)') + chalk.white(' as an immutable law.\n'));

    console.log(chalk.white('By proceeding, you commit to:'));
    console.log(chalk.gray('  1. ') + chalk.white('Write tests BEFORE implementation'));
    console.log(chalk.gray('  2. ') + chalk.white('Follow the Red-Green-Refactor cycle'));
    console.log(chalk.gray('  3. ') + chalk.white('Never bypass test requirements'));
    console.log(chalk.gray('  4. ') + chalk.white('Treat test failures as blocking issues\n'));

    console.log(chalk.yellow('This commitment cannot be changed after initialization.\n'));

    const { commitment } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'commitment',
        message: 'Do you commit to Test-Driven Development as an immutable constitutional law?',
        default: false,
      },
    ]);

    if (commitment) {
      // Ask for explicit confirmation
      const { explicitConfirm } = await inquirer.prompt([
        {
          type: 'input',
          name: 'explicitConfirm',
          message: 'Type "I COMMIT TO TDD" to confirm your commitment:',
          validate: (input: string) => {
            if (input.toUpperCase() === 'I COMMIT TO TDD') {
              return true;
            }
            return 'Please type exactly "I COMMIT TO TDD" to proceed';
          },
        },
      ]);

      return explicitConfirm.toUpperCase() === 'I COMMIT TO TDD';
    }

    return false;
  }

  /**
   * Generate the constitution.md file
   */
  private async generateConstitution(): Promise<void> {
    const constitutionContent = `# NEXUS WORKFLOW CONSTITUTION
Generated: ${new Date().toISOString()}
Project: ${this.projectName}

## IMMUTABLE LAWS

### Article I: Test-Driven Development
Test-Driven Development (TDD) is the supreme law of the Nexus workflow.
This law is immutable and cannot be modified, suspended, or circumvented.

#### Section 1: The Sacred Cycle
1. **RED**: Write a failing test that defines desired functionality
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Improve code structure while maintaining passing tests

#### Section 2: Enforcement
- No implementation shall proceed without tests written first
- Test failures constitute absolute blockers
- Bypassing tests is a constitutional violation
- All code must maintain minimum 80% test coverage

### Article II: Quality Through Questioning
The workflow shall employ unlimited adaptive questioning until 85% confidence is achieved.

#### Section 1: Questioning Principles
- Assume nothing, question everything
- Ambiguity requires clarification
- Uncertainty demands exploration
- Confidence below threshold continues questioning

#### Section 2: Multi-Perspective Analysis
Five specialist agents provide parallel analysis:
- **Pattern Scout**: Historical pattern identification
- **Doc Hunter**: Documentation and example retrieval
- **Risk Analyst**: Edge case and issue identification
- **Solution Architect**: Architectural design
- **Quality Guardian**: Test strategy definition

### Article III: Phased Pipeline
The workflow follows an immutable four-phase pipeline:

#### Section 1: Pipeline Phases
1. **BRAINSTORM**: Exhaustive exploration and questioning
2. **SPECIFY**: Detailed specification with Given-When-Then scenarios
3. **DECOMPOSE**: Atomic task breakdown (15-30 minutes each)
4. **IMPLEMENT**: TDD-enforced implementation

#### Section 2: Phase Dependencies
- Each phase requires successful completion of the previous phase
- Context from previous phases must be preserved and accessible
- Phase transitions are irreversible within a session

### Article IV: Pattern Learning
The system shall learn from successful implementations.

#### Section 1: Pattern Extraction
- Successful implementations generate reusable patterns
- Patterns include both code and test structures
- Pattern success rates are tracked and updated

#### Section 2: Pattern Application
- Similar problems trigger pattern suggestions
- Failed patterns are marked for review
- Pattern evolution is continuous

## AMENDMENTS
This constitution may only be amended through complete re-initialization.
No runtime modifications are permitted.

## RATIFICATION
This constitution was ratified by explicit user commitment to TDD.
Session ID: ${this.sessionId}

---
*"Quality is not an act, it is a habit." - Aristotle*
`;

    this.writeToCurrentDir('../constitution.md', constitutionContent);
    this.log('success', 'Constitution generated and saved');
  }

  /**
   * Save initialization context
   */
  private async saveInitializationContext(): Promise<void> {
    if (!this.contextManager) {
      throw new Error('Context manager not initialized');
    }

    const initContext = {
      projectName: this.projectName,
      initializationTime: new Date().toISOString(),
      sessionId: this.sessionId,
      constitutionPath: '.nexus/constitution.md',
      tddCommitted: true,
      version: '0.1.0',
    };

    await this.contextManager.savePhaseContext('init', initContext);
    await this.contextManager.set('project:name', this.projectName, { ttlHours: 24 * 365 });
    await this.contextManager.set('project:initialized', true, { ttlHours: 24 * 365 });

    // Save constitution rules in database
    if (this.db) {
      this.db.saveConstitution(this.projectName, {
        tdd: 'immutable',
        questioning: 'unlimited until 85% confidence',
        phases: ['brainstorm', 'specify', 'decompose', 'implement'],
        agents: ['Pattern Scout', 'Doc Hunter', 'Risk Analyst', 'Solution Architect', 'Quality Guardian'],
      });
    }

    this.log('info', 'Initialization context saved');
  }

  /**
   * Create initial pattern templates
   */
  private async createInitialPatterns(): Promise<void> {
    if (!this.db) {
      return;
    }

    // Save some starter patterns
    const starterPatterns = [
      {
        name: 'test-structure',
        category: 'testing',
        pattern: {
          template: 'describe-it-expect',
          structure: {
            describe: 'Component or function name',
            it: 'Should behavior description',
            expect: 'Assertion of expected outcome',
          },
        },
      },
      {
        name: 'error-handling',
        category: 'implementation',
        pattern: {
          template: 'try-catch-finally',
          structure: {
            try: 'Main logic',
            catch: 'Error handling with logging',
            finally: 'Cleanup operations',
          },
        },
      },
      {
        name: 'async-await',
        category: 'implementation',
        pattern: {
          template: 'async-function',
          structure: {
            async: 'Mark function as asynchronous',
            await: 'Wait for promise resolution',
            errorHandling: 'Wrap in try-catch',
          },
        },
      },
    ];

    for (const pattern of starterPatterns) {
      this.db.savePattern(pattern.name, pattern.category, pattern.pattern);
    }

    this.log('info', 'Initial patterns created');
  }

  /**
   * Display welcome message after successful initialization
   */
  public displayWelcome(): void {
    console.log('\n' + chalk.green('═'.repeat(60)));
    console.log(chalk.green.bold('  WELCOME TO NEXUS WORKFLOW'));
    console.log(chalk.green('═'.repeat(60)) + '\n');

    console.log(chalk.white('Your project has been initialized with:'));
    console.log(chalk.gray('  ✓ ') + chalk.white('Constitutional TDD enforcement'));
    console.log(chalk.gray('  ✓ ') + chalk.white('SQLite-based context storage'));
    console.log(chalk.gray('  ✓ ') + chalk.white('Pattern learning system'));
    console.log(chalk.gray('  ✓ ') + chalk.white('Multi-agent analysis framework\n'));

    console.log(chalk.cyan('Next Steps:'));
    console.log(chalk.gray('  1. ') + chalk.white('Run ') + chalk.cyan('nexus brainstorm <topic>') + chalk.white(' to start exploring'));
    console.log(chalk.gray('  2. ') + chalk.white('Run ') + chalk.cyan('nexus specify') + chalk.white(' to create specifications'));
    console.log(chalk.gray('  3. ') + chalk.white('Run ') + chalk.cyan('nexus decompose') + chalk.white(' to break down tasks'));
    console.log(chalk.gray('  4. ') + chalk.white('Run ') + chalk.cyan('nexus implement') + chalk.white(' to build with TDD\n'));

    console.log(chalk.yellow('Remember: Tests come first, always.\n'));
  }
}

/**
 * Factory function to create and run the init command
 */
export async function runNexusInit(config?: InitCommandConfig): Promise<CommandResult> {
  const command = new NexusInitCommand(config);
  const result = await command.run();

  if (result.success) {
    command.displayWelcome();
  }

  return result;
}