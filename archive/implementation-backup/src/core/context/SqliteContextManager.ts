/**
 * SQLite-based implementation of the Context Manager
 *
 * Provides persistent context storage with TTL support, session isolation,
 * and agent context sharing capabilities using SQLite as the storage backend.
 */

import { DatabaseManager } from '../database/DatabaseManager.js';
import type {
  IContextManager,
  ContextOptions,
  WorkflowPhase,
  PhaseContext,
  BrainstormContext,
  SpecificationContext,
  DecomposeContext,
  ImplementContext,
} from './IContextManager.js';
import type { AgentContextRow } from '../../types/database.js';

/**
 * SQLite-based context manager implementation
 */
export class SqliteContextManager implements IContextManager {
  private db!: DatabaseManager;
  private sessionId!: string;
  private currentPhase: WorkflowPhase = 'init';
  private initialized = false;

  /**
   * Initialize the context manager with a session ID
   * @param sessionId - Unique identifier for the current workflow session
   * @param projectPath - Path to the project directory (default: '.')
   */
  async initialize(sessionId: string, projectPath: string = '.'): Promise<void> {
    if (this.initialized) {
      throw new Error('Context manager already initialized');
    }

    this.db = new DatabaseManager(projectPath);

    // Create or retrieve session
    let session = this.db.getSession(sessionId);
    if (!session) {
      // For now, we'll create a session and use its generated ID
      // In production, we'd extend DatabaseManager to accept custom IDs
      session = this.db.createSession(projectPath, 'init');
      this.sessionId = session.id;
      // Store the original requested sessionId as context
      this.db.setContext(session.id, 'init', 'requested_session_id', sessionId, 24 * 60 * 30);
    } else {
      this.sessionId = session.id;
      this.currentPhase = session.phase as WorkflowPhase;
    }

    this.initialized = true;

    // Clean expired entries on initialization
    await this.cleanExpired();
  }

  /**
   * Ensure the context manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Context manager not initialized. Call initialize() first.');
    }
  }

  /**
   * Get a value from context by key
   * @param key - The key to retrieve
   * @returns The stored value or undefined if not found/expired
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    this.ensureInitialized();
    return this.db.getContext<T>(this.sessionId, this.currentPhase, key);
  }

  /**
   * Set a value in context with optional TTL
   * @param key - The key to store under
   * @param value - The value to store (will be JSON serialized)
   * @param options - Optional settings for the context entry
   */
  async set(key: string, value: any, options?: ContextOptions): Promise<void> {
    this.ensureInitialized();

    const ttlMinutes = (options?.ttlHours ?? 1) * 60;
    const sessionId = options?.sessionId ?? this.sessionId;

    if (options?.overwrite === false) {
      const existing = await this.get(key);
      if (existing !== undefined) {
        throw new Error(`Context key "${key}" already exists and overwrite is false`);
      }
    }

    this.db.setContext(sessionId, this.currentPhase, key, value, ttlMinutes);
  }

  /**
   * Load all context for a specific workflow phase
   * @param phase - The workflow phase to load context for
   * @returns Phase-specific context object
   */
  async loadPhaseContext(phase: WorkflowPhase): Promise<PhaseContext | undefined> {
    this.ensureInitialized();

    // Validate phase first
    const validPhases = ['init', 'brainstorm', 'specify', 'decompose', 'implement'];
    if (!validPhases.includes(phase)) {
      throw new Error(`Unknown phase: ${phase}`);
    }

    const phaseKey = `phase:${phase}`;
    const contextData = await this.get(phaseKey);

    if (!contextData) {
      return undefined;
    }

    switch (phase) {
      case 'init':
        return { phase: 'init', data: null };
      case 'brainstorm':
        return { phase: 'brainstorm', data: contextData as BrainstormContext };
      case 'specify':
        return { phase: 'specify', data: contextData as SpecificationContext };
      case 'decompose':
        return { phase: 'decompose', data: contextData as DecomposeContext };
      case 'implement':
        return { phase: 'implement', data: contextData as ImplementContext };
      default:
        // This should never be reached due to validation above
        throw new Error(`Unknown phase: ${phase}`);
    }
  }

  /**
   * Save context for a specific workflow phase
   * @param phase - The workflow phase to save context for
   * @param context - The phase-specific context to save
   * @param options - Optional settings for the context entry
   */
  async savePhaseContext(phase: WorkflowPhase, context: any, options?: ContextOptions): Promise<void> {
    this.ensureInitialized();

    const phaseKey = `phase:${phase}`;
    await this.set(phaseKey, context, { ...options, ttlHours: options?.ttlHours ?? 24 });

    // Also save individual context items for easier access
    if (phase === 'brainstorm' && context.topic) {
      await this.set('brainstorm:topic', context.topic, options);
      await this.set('brainstorm:approaches', context.approaches || [], options);
      await this.set('brainstorm:confidence', context.confidence || 0, options);
    } else if (phase === 'specify' && context.specification) {
      await this.set('specify:specification', context.specification, options);
      await this.set('specify:architecture', context.architecture || '', options);
      await this.set('specify:dataFlow', context.dataFlow || '', options);
    } else if (phase === 'decompose' && context.tasks) {
      await this.set('decompose:tasks', context.tasks, options);
      await this.set('decompose:dependencies', context.dependencies || [], options);
    } else if (phase === 'implement' && context.currentTask) {
      await this.set('implement:currentTask', context.currentTask, options);
      await this.set('implement:testsWritten', context.testsWritten || false, options);
      await this.set('implement:patterns', context.patterns || [], options);
    }
  }

  /**
   * Share context from a specialist agent
   * @param agentName - Name of the agent sharing context
   * @param data - The agent's findings/results
   * @param confidence - Confidence level (0-1) of the agent's findings
   */
  async shareAgentContext(agentName: string, data: any, confidence: number): Promise<void> {
    this.ensureInitialized();

    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }

    this.db.saveAgentContext(this.sessionId, agentName, this.currentPhase, data, confidence);

    // Also save as regular context for easier access
    const agentKey = `agent:${agentName}:${this.currentPhase}`;
    await this.set(agentKey, { data, confidence }, { ttlHours: 24 });
  }

  /**
   * Get all agent contexts for the current phase
   * @param phase - Optional phase filter
   * @returns Array of agent context records
   */
  async getAgentContexts(phase?: WorkflowPhase): Promise<AgentContextRow[]> {
    this.ensureInitialized();
    return this.db.getAgentContexts(this.sessionId, phase);
  }

  /**
   * Invalidate a cached context entry
   * @param key - The key to invalidate
   */
  async invalidate(key: string): Promise<void> {
    this.ensureInitialized();

    // Set TTL to past time to effectively invalidate
    this.db.setContext(this.sessionId, this.currentPhase, key, null, -1);
  }

  /**
   * Invalidate all context for a specific phase
   * @param phase - The phase to invalidate
   */
  async invalidatePhase(phase: WorkflowPhase): Promise<void> {
    this.ensureInitialized();

    // Get all keys that are related to this phase
    const phaseKey = `phase:${phase}`;
    const allKeys = await this.getKeys();

    for (const key of allKeys) {
      // Invalidate if it's the phase key itself, starts with phase:, or contains the phase name
      if (key === phaseKey ||
          key.startsWith(`${phase}:`) ||
          key.startsWith(`phase:${phase}`) ||
          key.includes(`:${phase}`)) {
        await this.invalidate(key);
      }
    }
  }

  /**
   * Clean up expired context entries
   * @returns Number of entries cleaned
   */
  async cleanExpired(): Promise<number> {
    this.ensureInitialized();

    // Get all context entries for this session
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM context_cache
      WHERE session_id = ? AND ttl < ?
    `);

    const now = new Date().toISOString();
    const result = stmt.get(this.sessionId, now) as { count: number };
    const expiredCount = result.count;

    // Delete expired entries
    const deleteStmt = this.db.prepare(`
      DELETE FROM context_cache
      WHERE session_id = ? AND ttl < ?
    `);
    deleteStmt.run(this.sessionId, now);

    return expiredCount;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string {
    this.ensureInitialized();
    return this.sessionId;
  }

  /**
   * Get the current workflow phase
   */
  getCurrentPhase(): WorkflowPhase {
    this.ensureInitialized();
    return this.currentPhase;
  }

  /**
   * Set the current workflow phase
   * @param phase - The phase to set as current
   */
  async setCurrentPhase(phase: WorkflowPhase): Promise<void> {
    this.ensureInitialized();

    this.currentPhase = phase;
    this.db.updateSession(this.sessionId, { phase });

    // Save phase transition metadata
    await this.set('phase:current', phase, { ttlHours: 24 });
    await this.set(`phase:${phase}:startTime`, new Date().toISOString(), { ttlHours: 24 });
  }

  /**
   * Check if context exists for a key
   * @param key - The key to check
   * @returns True if context exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    this.ensureInitialized();
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - Pattern to match keys against (supports * wildcard)
   * @returns Array of matching keys
   */
  async getKeys(pattern?: string): Promise<string[]> {
    this.ensureInitialized();

    let query = `
      SELECT DISTINCT key FROM context_cache
      WHERE session_id = ? AND phase = ? AND ttl > ?
    `;

    const params: any[] = [this.sessionId, this.currentPhase, new Date().toISOString()];

    if (pattern) {
      // Convert * wildcard to SQL LIKE pattern
      const sqlPattern = pattern.replace(/\*/g, '%');
      query += ' AND key LIKE ?';
      params.push(sqlPattern);
    }

    const stmt = this.db.prepare(query);
    const results = stmt.all(...params) as { key: string }[];

    return results.map(r => r.key);
  }

  /**
   * Clear all context for the current session
   */
  async clear(): Promise<void> {
    this.ensureInitialized();

    const stmt = this.db.prepare(`
      DELETE FROM context_cache WHERE session_id = ?
    `);
    stmt.run(this.sessionId);

    // Also clear agent contexts
    const agentStmt = this.db.prepare(`
      DELETE FROM agent_context WHERE session_id = ?
    `);
    agentStmt.run(this.sessionId);
  }

  /**
   * Close the context manager and clean up resources
   */
  async close(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Final cleanup of expired entries
    await this.cleanExpired();

    // Update session status
    this.db.updateSession(this.sessionId, {
      status: 'completed',
      phase: this.currentPhase,
    });

    // Close database connection
    this.db.close();

    this.initialized = false;
  }

  /**
   * Get database statistics for monitoring
   * @returns Statistics about context usage
   */
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    activeEntries: number;
    agentContexts: number;
    phasesUsed: string[];
  }> {
    this.ensureInitialized();

    const now = new Date().toISOString();

    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM context_cache WHERE session_id = ?
    `);
    const total = (totalStmt.get(this.sessionId) as { count: number }).count;

    const expiredStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM context_cache
      WHERE session_id = ? AND ttl < ?
    `);
    const expired = (expiredStmt.get(this.sessionId, now) as { count: number }).count;

    const agentStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM agent_context WHERE session_id = ?
    `);
    const agents = (agentStmt.get(this.sessionId) as { count: number }).count;

    const phaseStmt = this.db.prepare(`
      SELECT DISTINCT phase FROM context_cache WHERE session_id = ?
    `);
    const phases = (phaseStmt.all(this.sessionId) as { phase: string }[]).map(r => r.phase);

    return {
      totalEntries: total,
      expiredEntries: expired,
      activeEntries: total - expired,
      agentContexts: agents,
      phasesUsed: phases,
    };
  }
}