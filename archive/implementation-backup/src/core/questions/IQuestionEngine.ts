/**
 * Question Engine Interface
 *
 * Defines the contract for adaptive questioning in the Nexus workflow.
 * The engine continues asking questions until confidence threshold is reached,
 * ensuring complete understanding before proceeding to implementation.
 */

import type { WorkflowPhase } from '../context/IContextManager.js';

/**
 * Represents a single question in the workflow
 */
export interface Question {
  id: string;
  phase: WorkflowPhase;
  question: string;
  category: QuestionCategory;
  priority: QuestionPriority;
  followUpTo?: string; // ID of parent question if this is a follow-up
  metadata?: Record<string, unknown>;
}

/**
 * Categories of questions for different aspects of understanding
 */
export type QuestionCategory =
  | 'requirements'     // What needs to be built
  | 'constraints'      // Limitations and boundaries
  | 'architecture'     // Technical design decisions
  | 'edge-cases'       // Exceptional scenarios
  | 'performance'      // Performance requirements
  | 'security'         // Security considerations
  | 'testing'          // Testing strategy
  | 'clarification'    // Ambiguity resolution
  | 'validation';      // Confirming understanding

/**
 * Priority levels for questions
 */
export type QuestionPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Represents an answer to a question
 */
export interface Answer {
  questionId: string;
  answer: string;
  confidence: number; // 0-1 confidence in the answer
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Context for generating questions
 */
export interface QuestionContext {
  phase: WorkflowPhase;
  topic: string;
  previousAnswers: Answer[];
  existingKnowledge?: Record<string, unknown>;
  targetConfidence: number; // Default 0.85 (85%)
}

/**
 * Result of a questioning session
 */
export interface QuestioningResult {
  questions: Question[];
  answers: Answer[];
  overallConfidence: number;
  shouldContinue: boolean;
  insights: string[];
  nextQuestions?: Question[]; // Suggested follow-up questions
}

/**
 * Statistics about questioning effectiveness
 */
export interface QuestioningStats {
  totalQuestions: number;
  questionsPerPhase: Record<WorkflowPhase, number>;
  averageConfidenceGain: number;
  mostEffectiveCategories: QuestionCategory[];
  convergenceRate: number; // How quickly confidence increases
}

/**
 * Question template for generating questions
 */
export interface QuestionTemplate {
  id: string;
  template: string; // Template with placeholders like {topic}
  category: QuestionCategory;
  phase: WorkflowPhase[];
  priority: QuestionPriority;
  conditions?: Record<string, unknown>; // When to use this template
  followUps?: string[]; // IDs of follow-up templates
}

/**
 * Main interface for the Question Engine
 */
export interface IQuestionEngine {
  /**
   * Initialize the question engine with a session
   */
  initialize(sessionId: string, projectPath: string): Promise<void>;

  /**
   * Generate the next adaptive question based on context
   * @param context The current questioning context
   * @returns The next question to ask, or null if confidence is sufficient
   */
  generateNextQuestion(context: QuestionContext): Promise<Question | null>;

  /**
   * Process an answer and update confidence
   * @param answer The answer to process
   * @returns Updated confidence score
   */
  processAnswer(answer: Answer): Promise<number>;

  /**
   * Calculate overall confidence from all answers
   * @param answers All answers in the current session
   * @returns Confidence score between 0 and 1
   */
  calculateConfidence(answers: Answer[]): Promise<number>;

  /**
   * Determine if questioning should continue
   * @param confidence Current confidence level
   * @param targetConfidence Target confidence level (default 0.85)
   * @returns True if more questions needed, false if confidence is sufficient
   */
  shouldContinueQuestioning(
    confidence: number,
    targetConfidence?: number
  ): boolean;

  /**
   * Generate multiple diverse questions for a topic
   * @param topic The topic to explore
   * @param phase The current workflow phase
   * @param count Number of questions to generate
   * @returns Array of diverse questions
   */
  generateQuestions(
    topic: string,
    phase: WorkflowPhase,
    count?: number
  ): Promise<Question[]>;

  /**
   * Get follow-up questions based on an answer
   * @param answer The answer that may trigger follow-ups
   * @returns Array of follow-up questions
   */
  getFollowUpQuestions(answer: Answer): Promise<Question[]>;

  /**
   * Store a question-answer pair in the database
   * @param question The question asked
   * @param answer The answer received
   */
  storeQuestionAnswer(question: Question, answer: Answer): Promise<void>;

  /**
   * Retrieve questions and answers for a session
   * @param sessionId The session to retrieve Q&A for
   * @returns Array of question-answer pairs
   */
  getSessionQuestions(sessionId: string): Promise<{
    question: Question;
    answer?: Answer;
  }[]>;

  /**
   * Get statistics about questioning effectiveness
   * @returns Questioning statistics
   */
  getStats(): Promise<QuestioningStats>;

  /**
   * Load question templates from templates file
   * @param templatePath Path to question templates
   */
  loadTemplates(templatePath?: string): Promise<void>;

  /**
   * Extract insights from the questioning session
   * @param answers All answers from the session
   * @returns Key insights and patterns identified
   */
  extractInsights(answers: Answer[]): Promise<string[]>;

  /**
   * Detect ambiguity in an answer that requires clarification
   * @param answer The answer to analyze
   * @returns True if ambiguous and needs clarification
   */
  detectAmbiguity(answer: string): boolean;

  /**
   * Generate a clarification question for ambiguous answer
   * @param originalQuestion The original question
   * @param ambiguousAnswer The ambiguous answer
   * @returns A clarification question
   */
  generateClarificationQuestion(
    originalQuestion: Question,
    ambiguousAnswer: string
  ): Promise<Question>;

  /**
   * Close the question engine and clean up resources
   */
  close(): Promise<void>;
}

/**
 * Factory function type for creating question engines
 */
export type QuestionEngineFactory = (
  config?: QuestionEngineConfig
) => IQuestionEngine;

/**
 * Configuration for question engine
 */
export interface QuestionEngineConfig {
  defaultTargetConfidence?: number; // Default 0.85
  maxQuestionsPerSession?: number; // Default unlimited
  enableAdaptivePriority?: boolean; // Adjust priority based on answers
  templatesPath?: string; // Path to custom templates
  persistQuestions?: boolean; // Store Q&A in database
}

/**
 * Events emitted by the question engine
 */
export interface QuestionEngineEvents {
  'question:generated': (question: Question) => void;
  'answer:processed': (answer: Answer, confidence: number) => void;
  'confidence:updated': (newConfidence: number) => void;
  'threshold:reached': (finalConfidence: number) => void;
  'ambiguity:detected': (answer: string) => void;
  'insight:extracted': (insight: string) => void;
}