/**
 * Context Manager Interface for Nexus Workflow System
 *
 * Manages all context storage in SQLite with TTL support, providing
 * session isolation, agent context sharing, and phase-based context loading.
 */

import type { AgentContextRow } from '../../types/database.js';

/**
 * Question asked during a workflow phase
 */
export interface Question {
  id: string;
  phase: WorkflowPhase;
  question: string;
  answer: string | null;
  confidenceImpact?: number;
  timestamp: Date;
}

/**
 * Result from an individual specialist agent
 */
export interface AgentResult {
  agent: string;
  findings: any;
  confidence: number;
  suggestions?: string[];
  warnings?: string[];
}

/**
 * Test scenario for specification phase
 */
export interface TestScenario {
  description: string;
  given: string;
  when: string;
  then: string;
}

/**
 * Synthesis result from combining multiple agent outputs
 */
export interface SynthesisResult {
  sessionId: string;
  phase: string;
  combinedConfidence: number;
  recommendations: any;
  conflictsResolved: any;
  finalDecision: string;
}

/**
 * Context for the brainstorming phase
 */
export interface BrainstormContext {
  topic: string;
  approaches: string[];
  selectedApproach?: string;
  confidence: number;
  questionsAsked: Question[];
  agentFindings: AgentResult[];
}

/**
 * Context for the specification phase
 */
export interface SpecificationContext {
  brainstorm: BrainstormContext;
  specification: string;
  testScenarios: TestScenario[];
  architecture: string;
  dataFlow: string;
  synthesizedRecommendations: SynthesisResult;
}

/**
 * Context for the decomposition phase
 */
export interface DecomposeContext {
  specification: SpecificationContext;
  tasks: TaskDefinition[];
  dependencies: TaskDependency[];
}

/**
 * Context for the implementation phase
 */
export interface ImplementContext {
  decompose: DecomposeContext;
  currentTask: TaskDefinition;
  testsWritten: boolean;
  implementationComplete: boolean;
  patterns: Pattern[];
}

/**
 * Task definition for decomposed work items
 */
export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  filesAffected: string[];
  status: 'todo' | 'wip' | 'done';
  dependencies: string[];
}

/**
 * Task dependency relationship
 */
export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
}

/**
 * Pattern extracted from successful implementations
 */
export interface Pattern {
  id: string;
  code: string;
  testCode: string;
  context: string;
  successCount: number;
  lastUsed: Date;
  createdAt: Date;
}

/**
 * Workflow phases in the Nexus pipeline
 */
export type WorkflowPhase = 'init' | 'brainstorm' | 'specify' | 'decompose' | 'implement';

/**
 * Phase-specific context types
 */
export type PhaseContext =
  | { phase: 'init'; data: null }
  | { phase: 'brainstorm'; data: BrainstormContext }
  | { phase: 'specify'; data: SpecificationContext }
  | { phase: 'decompose'; data: DecomposeContext }
  | { phase: 'implement'; data: ImplementContext };

/**
 * Options for context operations
 */
export interface ContextOptions {
  /** TTL in hours for cached data (default: 1) */
  ttlHours?: number;
  /** Whether to overwrite existing context */
  overwrite?: boolean;
  /** Session ID for context isolation */
  sessionId?: string;
}

/**
 * Context manager interface for managing workflow context
 *
 * Provides methods for storing, retrieving, and managing context
 * throughout the Nexus workflow pipeline. All context is stored
 * in SQLite with TTL support for automatic expiration.
 */
export interface IContextManager {
  /**
   * Initialize the context manager with a session ID
   * @param sessionId - Unique identifier for the current workflow session
   * @param projectPath - Path to the project directory (default: '.')
   */
  initialize(sessionId: string, projectPath?: string): Promise<void>;

  /**
   * Get a value from context by key
   * @param key - The key to retrieve
   * @returns The stored value or undefined if not found/expired
   */
  get<T = any>(key: string): Promise<T | undefined>;

  /**
   * Set a value in context with optional TTL
   * @param key - The key to store under
   * @param value - The value to store (will be JSON serialized)
   * @param options - Optional settings for the context entry
   */
  set(key: string, value: any, options?: ContextOptions): Promise<void>;

  /**
   * Load all context for a specific workflow phase
   * @param phase - The workflow phase to load context for
   * @returns Phase-specific context object
   */
  loadPhaseContext(phase: WorkflowPhase): Promise<PhaseContext | undefined>;

  /**
   * Save context for a specific workflow phase
   * @param phase - The workflow phase to save context for
   * @param context - The phase-specific context to save
   * @param options - Optional settings for the context entry
   */
  savePhaseContext(phase: WorkflowPhase, context: any, options?: ContextOptions): Promise<void>;

  /**
   * Share context from a specialist agent
   * @param agentName - Name of the agent sharing context
   * @param data - The agent's findings/results
   * @param confidence - Confidence level (0-1) of the agent's findings
   */
  shareAgentContext(agentName: string, data: any, confidence: number): Promise<void>;

  /**
   * Get all agent contexts for the current phase
   * @param phase - Optional phase filter
   * @returns Array of agent context records
   */
  getAgentContexts(phase?: WorkflowPhase): Promise<AgentContextRow[]>;

  /**
   * Invalidate a cached context entry
   * @param key - The key to invalidate
   */
  invalidate(key: string): Promise<void>;

  /**
   * Invalidate all context for a specific phase
   * @param phase - The phase to invalidate
   */
  invalidatePhase(phase: WorkflowPhase): Promise<void>;

  /**
   * Clean up expired context entries
   * @returns Number of entries cleaned
   */
  cleanExpired(): Promise<number>;

  /**
   * Get the current session ID
   */
  getSessionId(): string;

  /**
   * Get the current workflow phase
   */
  getCurrentPhase(): WorkflowPhase;

  /**
   * Set the current workflow phase
   * @param phase - The phase to set as current
   */
  setCurrentPhase(phase: WorkflowPhase): Promise<void>;

  /**
   * Check if context exists for a key
   * @param key - The key to check
   * @returns True if context exists and is not expired
   */
  has(key: string): Promise<boolean>;

  /**
   * Get all keys matching a pattern
   * @param pattern - Pattern to match keys against (supports * wildcard)
   * @returns Array of matching keys
   */
  getKeys(pattern?: string): Promise<string[]>;

  /**
   * Clear all context for the current session
   */
  clear(): Promise<void>;

  /**
   * Close the context manager and clean up resources
   */
  close(): Promise<void>;
}
