/**
 * types.ts
 * Created: 2025-09-16
 *
 * Type definitions for confidence calculation system
 */

/**
 * Task definition from story files
 */
export interface Task {
  id: string;
  title: string;
  requirements: string[];
  acceptanceCriteria: string[];
  testStrategy: string;
  dependencies: string[];
}

/**
 * Context extracted and embedded in stories
 */
export interface Context {
  core: {
    directRequirements: string[];
    acceptanceCriteria: string[];
    dependencies: {
      resolved: boolean;
      items: string[];
      resolutionNotes?: string;
    };
  };
  embedded: boolean;
  extended?: {
    patterns?: string[];
    historicalDecisions?: string[];
    edgeCases?: string[];
  };
  size: number;  // lines of context
  source: string;  // where context came from
}

/**
 * Individual confidence factors used in calculation
 */
export interface ConfidenceFactors {
  requirements_clarity: number;    // 0-100
  test_coverage_defined: number;   // 0-100
  ambiguity_level: number;         // 0-100 (lower is better)
  context_completeness: number;    // 0-100
  dependencies_resolved: number;   // 0-100
  pattern_similarity: number;      // 0-100
}

/**
 * Result of confidence calculation
 */
export interface ConfidenceResult {
  overall: number;  // 0-100 weighted average
  breakdown: ConfidenceFactors;
  factors: ConfidenceFactors;  // Same as breakdown for compatibility
  weights: {
    [key in keyof ConfidenceFactors]: number;
  };
  recommendations: string[];
  questioningPhase: QuestioningPhase;
}

/**
 * Phases of questioning based on confidence level
 */
export type QuestioningPhase =
  | 'TRIAGE'       // <30% - Major clarification needed
  | 'EXPLORATION'  // 30-60% - Significant gaps
  | 'EDGE_CASES'   // 60-80% - Minor clarifications
  | 'VALIDATION'   // 80-95% - Final confirmation
  | 'COMPLETE';    // >95% - Ready to proceed

/**
 * Pattern stored in history for similarity matching
 */
export interface Pattern {
  id: string;
  type: string;
  successRate: number;
  implementation: string;
}

/**
 * Constitutional weights for factors
 * Based on Nexus Enhanced Constitution
 */
export const CONSTITUTIONAL_WEIGHTS = {
  requirements_clarity: 0.25,      // Requirements First
  test_coverage_defined: 0.20,     // TDD Is Non-Negotiable
  ambiguity_level: 0.15,          // Agent Boundaries Are Absolute
  context_completeness: 0.20,     // Context Is Sacred
  dependencies_resolved: 0.10,     // Interactive Validation
  pattern_similarity: 0.10        // Historical patterns
};

/**
 * Ambiguity indicators in requirements
 */
export const AMBIGUOUS_WORDS = [
  'some', 'stuff', 'things', 'nice', 'good', 'better',
  'fast', 'slow', 'maybe', 'probably', 'various', 'several',
  'improve', 'optimize', 'enhance', 'various', 'etc',
  'appropriate', 'suitable', 'adequate', 'sufficient'
];

/**
 * Test coverage indicators
 */
export const TEST_INDICATORS = [
  'unit test', 'integration test', 'e2e', 'property-based',
  'test coverage', 'TDD', 'BDD', 'validation', 'verification',
  'acceptance test', 'smoke test', 'regression test'
];