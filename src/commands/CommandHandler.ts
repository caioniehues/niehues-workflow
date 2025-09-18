/**
 * Base class for all Nexus command handlers
 *
 * Provides common functionality for session management, context handling,
 * error reporting, and workflow phase transitions.
 */

import { DatabaseManager } from '../core/database/DatabaseManager.js';
import { SqliteContextManager } from '../core/context/SqliteContextManager.js';
import type { IContextManager, WorkflowPhase } from '../core/context/IContextManager.js';
import chalk from 'chalk';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Configuration for command execution
 */
export interface CommandConfig {
  projectPath?: string;
  sessionId?: string;
  verbose?: boolean;
  skipValidation?: boolean;
}

/**
 * Result of command execution
 */
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}

/**
 * Base error for Nexus workflow violations
 */
export class NexusError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'NexusError';
  }
}

/**
 * Error thrown when constitutional rules are violated
 */
export class ConstitutionalViolationError extends NexusError {
  constructor(message: string) {
    super(message, 'CONSTITUTIONAL_VIOLATION');
    this.name = 'ConstitutionalViolationError';
  }
}

/**
 * Error thrown when required context is missing
 */
export class MissingContextError extends NexusError {
  constructor(currentPhase: WorkflowPhase, requiredPhase: WorkflowPhase) {
    super(
      `Cannot execute ${currentPhase} phase: Missing required context from ${requiredPhase}. Please run nexus-${requiredPhase} first.`,
      'MISSING_CONTEXT'
    );
    this.name = 'MissingContextError';
  }
}

/**
 * Base class for all command handlers
 */
export abstract class CommandHandler {
  protected db: DatabaseManager | null = null;
  protected contextManager: IContextManager | null = null;
  protected sessionId: string | null = null;
  protected projectPath: string;
  protected verbose: boolean;
  protected readonly nexusDir: string;
  protected readonly currentDir: string;
  protected readonly archiveDir: string;
  protected readonly cacheDir: string;

  constructor(config: CommandConfig = {}) {
    this.projectPath = config.projectPath || process.cwd();
    this.verbose = config.verbose || false;
    this.sessionId = config.sessionId || null;

    // Setup Nexus directory structure
    this.nexusDir = join(this.projectPath, '.nexus');
    this.currentDir = join(this.nexusDir, 'current');
    this.archiveDir = join(this.nexusDir, 'archive');
    this.cacheDir = join(this.nexusDir, 'cache');
  }

  /**
   * Get the workflow phase for this command
   */
  protected abstract getPhase(): WorkflowPhase;

  /**
   * Validate preconditions for command execution
   */
  protected abstract validatePreconditions(): Promise<void>;

  /**
   * Execute the main command logic
   */
  protected abstract executeCommand(): Promise<CommandResult>;

  /**
   * Initialize the command handler
   */
  protected async initialize(): Promise<void> {
    try {
      // Initialize database
      this.db = new DatabaseManager(this.projectPath);

      // Initialize or retrieve session
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
      }

      // Initialize context manager
      this.contextManager = new SqliteContextManager();
      await this.contextManager.initialize(this.sessionId, this.projectPath);

      // Set current phase
      await this.contextManager.setCurrentPhase(this.getPhase());

      this.log('info', `Initialized session: ${this.sessionId}`);
    } catch (error) {
      this.log('error', `Failed to initialize: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Run the command with full lifecycle management
   */
  async run(): Promise<CommandResult> {
    let result: CommandResult = { success: false };

    try {
      // Show progress indicator
      this.showProgress('Initializing...');

      // Initialize
      await this.initialize();

      // Validate preconditions
      this.showProgress('Validating preconditions...');
      await this.validatePreconditions();

      // Execute main command logic
      this.showProgress(`Executing ${this.getPhase()} phase...`);
      result = await this.executeCommand();

      // Save progress
      if (result.success) {
        await this.saveProgress();
        this.log('success', result.message || 'Command completed successfully');
      } else {
        this.log('error', result.message || 'Command failed');
      }

    } catch (error) {
      // Handle errors gracefully
      result = this.handleError(error);
    } finally {
      // Cleanup
      await this.cleanup();
    }

    return result;
  }

  /**
   * Ensure Nexus directory structure exists
   */
  protected ensureDirectoryStructure(): void {
    const dirs = [this.nexusDir, this.currentDir, this.archiveDir, this.cacheDir];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.log('info', `Created directory: ${dir}`);
      }
    }
  }

  /**
   * Check if constitution exists and is valid
   */
  protected async checkConstitution(): Promise<boolean> {
    const constitutionPath = join(this.nexusDir, 'constitution.md');

    if (!existsSync(constitutionPath)) {
      return false;
    }

    try {
      const constitution = readFileSync(constitutionPath, 'utf-8');
      // Validate constitution contains required TDD laws
      return constitution.includes('Test-Driven Development') &&
             constitution.includes('immutable');
    } catch (error) {
      this.log('warn', 'Failed to read constitution');
      return false;
    }
  }

  /**
   * Load context from previous phase
   */
  protected async loadPreviousPhaseContext(phase: WorkflowPhase): Promise<any> {
    if (!this.contextManager) {
      throw new Error('Context manager not initialized');
    }

    const context = await this.contextManager.loadPhaseContext(phase);

    if (!context) {
      throw new MissingContextError(this.getPhase(), phase);
    }

    return context.data;
  }

  /**
   * Save current phase context
   */
  protected async savePhaseContext(data: any): Promise<void> {
    if (!this.contextManager) {
      throw new Error('Context manager not initialized');
    }

    await this.contextManager.savePhaseContext(this.getPhase(), data, {
      ttlHours: 24, // Keep phase context for 24 hours
    });

    this.log('info', `Saved ${this.getPhase()} phase context`);
  }

  /**
   * Generate a unique session ID
   */
  protected generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `nexus-${timestamp}-${random}`;
  }

  /**
   * Save progress indicators
   */
  protected async saveProgress(): Promise<void> {
    if (!this.contextManager || !this.sessionId) {
      return;
    }

    // TypeScript assertion: sessionId is definitely not null here
    const sessionId = this.sessionId;

    // Update session status
    if (this.db) {
      const session = this.db.getSession(sessionId);
      if (session) {
        this.db.updateSession(sessionId, {
          phase: this.getPhase(),
          status: 'active',
        });
      }
    }

    // Save progress metadata
    await this.contextManager.set('progress:lastUpdate', new Date().toISOString());
    await this.contextManager.set('progress:phase', this.getPhase());
    await this.contextManager.set('progress:status', 'completed');
  }

  /**
   * Clean up resources
   */
  protected async cleanup(): Promise<void> {
    try {
      // Close context manager
      if (this.contextManager) {
        await this.contextManager.close();
        this.contextManager = null;
      }

      // Close database
      if (this.db) {
        this.db.close();
        this.db = null;
      }
    } catch (error) {
      this.log('warn', 'Error during cleanup');
    }
  }

  /**
   * Handle errors with appropriate messaging
   */
  protected handleError(error: unknown): CommandResult {
    if (error instanceof ConstitutionalViolationError) {
      this.log('error', chalk.red.bold('⚖️  Constitutional Violation!'));
      this.log('error', error.message);
      this.log('info', chalk.yellow('The Nexus workflow requires strict TDD adherence.'));
      return {
        success: false,
        message: error.message,
        error: error as Error,
      };
    }

    if (error instanceof MissingContextError) {
      this.log('error', chalk.red('📋 Missing Required Context'));
      this.log('error', error.message);
      return {
        success: false,
        message: error.message,
        error: error as Error,
      };
    }

    if (error instanceof NexusError) {
      this.log('error', error.message);
      return {
        success: false,
        message: error.message,
        error: error as Error,
      };
    }

    // Unknown error
    const message = error instanceof Error ? error.message : String(error);
    this.log('error', chalk.red('Unexpected error:'), message);

    return {
      success: false,
      message: `Unexpected error: ${message}`,
      error: error instanceof Error ? error : new Error(message),
    };
  }

  /**
   * Show progress indicator
   */
  protected showProgress(message: string): void {
    if (this.verbose) {
      console.log(chalk.cyan('⏳'), chalk.gray(message));
    }
  }

  /**
   * Log a message with appropriate formatting
   */
  protected log(level: 'info' | 'warn' | 'error' | 'success', ...args: any[]): void {
    const isoString = new Date().toISOString();
    const timePart = isoString.split('T')[1] || '';
    const timestamp = timePart.split('.')[0] || '';
    const prefix = chalk.gray(`[${timestamp}]`);

    switch (level) {
      case 'info':
        console.log(prefix, chalk.blue('ℹ'), ...args);
        break;
      case 'warn':
        console.log(prefix, chalk.yellow('⚠'), ...args);
        break;
      case 'error':
        console.error(prefix, chalk.red('✖'), ...args);
        break;
      case 'success':
        console.log(prefix, chalk.green('✓'), ...args);
        break;
    }
  }

  /**
   * Ask user for confirmation
   */
  protected async confirm(message: string): Promise<boolean> {
    // In a real implementation, this would use inquirer or similar
    // For now, we'll return true for testing
    this.log('info', `Confirmation requested: ${message}`);
    return true;
  }

  /**
   * Write content to a file in the current directory
   */
  protected writeToCurrentDir(filename: string, content: string): void {
    const filepath = join(this.currentDir, filename);
    writeFileSync(filepath, content, 'utf-8');
    this.log('success', `Wrote ${filename} to current directory`);
  }

  /**
   * Read content from a file in the current directory
   */
  protected readFromCurrentDir(filename: string): string | null {
    const filepath = join(this.currentDir, filename);

    if (!existsSync(filepath)) {
      return null;
    }

    try {
      return readFileSync(filepath, 'utf-8');
    } catch (error) {
      this.log('warn', `Failed to read ${filename}`);
      return null;
    }
  }

  /**
   * Check if a file exists in the current directory
   */
  protected fileExistsInCurrentDir(filename: string): boolean {
    return existsSync(join(this.currentDir, filename));
  }
}