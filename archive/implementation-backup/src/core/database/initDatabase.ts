import { DatabaseManager } from './DatabaseManager.js';
import chalk from 'chalk';

export async function initializeDatabase(projectPath: string = '.'): Promise<DatabaseManager> {
  try {
    console.log(chalk.blue('Initializing Nexus database...'));

    const db = new DatabaseManager(projectPath);

    // Verify database is accessible
    const testSession = db.createSession('test-init', 'init');
    if (!testSession) {
      throw new Error('Failed to create test session');
    }

    // Clean up test session
    db.updateSession(testSession.id, { status: 'completed' });

    console.log(chalk.green('✓ Database initialized successfully'));
    return db;
  } catch (error) {
    console.error(chalk.red('Failed to initialize database:'), error);
    throw error;
  }
}

export function validateDatabaseStructure(db: DatabaseManager): boolean {
  try {
    // Test each major operation
    const session = db.createSession('validation-test', 'init');

    // Test context cache
    db.setContext(session.id, 'test', 'key', { value: 'test' });
    const context = db.getContext(session.id, 'test', 'key');
    if (!context) {
      throw new Error('Context cache validation failed');
    }

    // Test patterns
    db.savePattern('test-pattern', 'validation', { pattern: 'test' });
    const patterns = db.getPatterns('validation');
    if (patterns.length === 0) {
      throw new Error('Pattern storage validation failed');
    }

    // Test questions
    const questionId = db.saveQuestion(session.id, 'test', 'Test question?');
    db.answerQuestion(questionId, 'Test answer', 0.1);

    // Test confidence
    db.saveConfidence(session.id, 'test', 0.85, { test: true });
    const confidence = db.getLatestConfidence(session.id, 'test');
    if (confidence !== 0.85) {
      throw new Error('Confidence tracking validation failed');
    }

    // Test tasks
    const taskId = db.createTask(session.id, 'Test Task', 'Test description');
    db.updateTaskStatus(taskId, 'completed');
    const tasks = db.getTasks(session.id, 'completed');
    if (tasks.length === 0) {
      throw new Error('Task management validation failed');
    }

    // Test agent context
    db.saveAgentContext(session.id, 'TestAgent', 'test', { result: 'valid' }, 0.9);
    const agentContexts = db.getAgentContexts(session.id);
    if (agentContexts.length === 0) {
      throw new Error('Agent context validation failed');
    }

    // Test constitution
    db.saveConstitution('test-project', { rule1: 'TDD is mandatory' });
    const constitution = db.getConstitution('test-project');
    if (!constitution) {
      throw new Error('Constitution storage validation failed');
    }

    // Clean up
    db.updateSession(session.id, { status: 'completed' });

    return true;
  } catch (error) {
    console.error(chalk.red('Database structure validation failed:'), error);
    return false;
  }
}

export async function resetDatabase(projectPath: string = '.'): Promise<void> {
  const { rmSync, existsSync } = await import('fs');
  const { join } = await import('path');

  const nexusDir = join(projectPath, '.nexus');

  if (existsSync(nexusDir)) {
    console.log(chalk.yellow('Removing existing Nexus database...'));
    rmSync(nexusDir, { recursive: true, force: true });
    console.log(chalk.green('✓ Database reset complete'));
  } else {
    console.log(chalk.blue('No existing database found'));
  }
}

// CLI utility for database management
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'init':
      await initializeDatabase();
      break;

    case 'validate':
      const db = new DatabaseManager();
      const isValid = validateDatabaseStructure(db);
      db.close();
      process.exit(isValid ? 0 : 1);
      break;

    case 'reset':
      await resetDatabase();
      break;

    default:
      console.log(chalk.yellow('Usage: node initDatabase.js [init|validate|reset]'));
      process.exit(1);
  }
}