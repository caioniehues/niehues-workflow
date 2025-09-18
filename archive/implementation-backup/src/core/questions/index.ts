/**
 * Questions module exports
 *
 * Central export point for all question engine related types and interfaces
 */

export type {
  IQuestionEngine,
  Question,
  QuestionCategory,
  QuestionPriority,
  Answer,
  QuestionContext,
  QuestioningResult,
  QuestioningStats,
  QuestionTemplate,
  QuestionEngineFactory,
  QuestionEngineConfig,
  QuestionEngineEvents,
} from './IQuestionEngine.js';

export { QuestionEngine } from './QuestionEngine.js';
export { ConfidenceCalculator } from './ConfidenceCalculator.js';
export type {
  ConfidenceFactors,
  ConfidenceResult,
  ConfidenceConfig,
} from './ConfidenceCalculator.js';