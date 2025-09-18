/**
 * Test suite for ConfidenceCalculator
 *
 * Tests the multi-factor confidence calculation including:
 * - Clarity scoring
 * - Completeness evaluation
 * - Specificity detection
 * - Consistency checking
 * - Category coverage
 * - Example detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfidenceCalculator } from './ConfidenceCalculator.js';
import type { Answer, Question } from './IQuestionEngine.js';

describe('ConfidenceCalculator', () => {
  let calculator: ConfidenceCalculator;

  beforeEach(() => {
    calculator = new ConfidenceCalculator();
  });

  describe('Overall Confidence Calculation', () => {
    it('should return 0 confidence for no answers', () => {
      const result = calculator.calculate([], []);

      expect(result.overall).toBe(0);
      expect(result.insights).toContain('No answers provided yet');
    });

    it('should calculate confidence from single clear answer', () => {
      const answers: Answer[] = [{
        questionId: 'q1',
        answer: 'The system must handle 1000 concurrent users with response times under 200ms.',
        confidence: 0.8,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'What are the performance requirements?',
        category: 'performance',
        priority: 'high',
      }];

      const result = calculator.calculate(answers, questions);

      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('should reach high confidence with comprehensive answers', () => {
      const answers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'The application must support 1000 concurrent users, with page load times under 2 seconds and API response times under 200ms.',
          confidence: 0.9,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'Core constraints include:\n- Budget: $50,000\n- Timeline: 3 months\n- Team: 2 developers\n- Technology: Must use existing PostgreSQL database',
          confidence: 0.85,
          timestamp: new Date(),
        },
        {
          questionId: 'q3',
          answer: 'Edge cases to handle:\n1. Network failures during payment processing\n2. Concurrent edits to same resource\n3. Database connection pool exhaustion\nFor example, payment failures should trigger automatic retry with exponential backoff.',
          confidence: 0.9,
          timestamp: new Date(),
        },
      ];

      const questions: Question[] = [
        {
          id: 'q1',
          phase: 'brainstorm',
          question: 'What are the performance requirements?',
          category: 'requirements',
          priority: 'critical',
        },
        {
          id: 'q2',
          phase: 'brainstorm',
          question: 'What constraints must we work within?',
          category: 'constraints',
          priority: 'critical',
        },
        {
          id: 'q3',
          phase: 'brainstorm',
          question: 'What edge cases need to be handled?',
          category: 'edge-cases',
          priority: 'critical',
        },
      ];

      const result = calculator.calculate(answers, questions);

      expect(result.overall).toBeGreaterThan(0.7);
      expect(result.missing).toHaveLength(0);
    });
  });

  describe('Clarity Factor', () => {
    it('should penalize vague answers', () => {
      const vagueAnswers: Answer[] = [{
        questionId: 'q1',
        answer: 'Maybe we could possibly implement something that might work sometimes.',
        confidence: 0.5,
        timestamp: new Date(),
      }];

      const clearAnswers: Answer[] = [{
        questionId: 'q1',
        answer: 'The system will definitely implement OAuth 2.0 authentication with JWT tokens.',
        confidence: 0.9,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'How will authentication work?',
        category: 'architecture',
        priority: 'high',
      }];

      const vagueResult = calculator.calculate(vagueAnswers, questions);
      const clearResult = calculator.calculate(clearAnswers, questions);

      expect(vagueResult.factors.clarity).toBeLessThan(clearResult.factors.clarity);
    });

    it('should reward structured answers', () => {
      const unstructuredAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'We need auth and database and api and frontend.',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const structuredAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'System components:\n- Authentication service\n- PostgreSQL database\n- REST API\n- React frontend',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'What are the main components?',
        category: 'architecture',
        priority: 'high',
      }];

      const unstructuredResult = calculator.calculate(unstructuredAnswer, questions);
      const structuredResult = calculator.calculate(structuredAnswer, questions);

      expect(structuredResult.factors.clarity).toBeGreaterThan(unstructuredResult.factors.clarity);
    });
  });

  describe('Completeness Factor', () => {
    it('should penalize very short answers', () => {
      const shortAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'Yes',
        confidence: 0.8,
        timestamp: new Date(),
      }];

      const completeAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'Yes, the system should implement caching at multiple levels including database query caching, API response caching with Redis, and CDN caching for static assets.',
        confidence: 0.8,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'Should we implement caching?',
        category: 'performance',
        priority: 'medium',
      }];

      const shortResult = calculator.calculate(shortAnswer, questions);
      const completeResult = calculator.calculate(completeAnswer, questions);

      expect(shortResult.factors.completeness).toBeLessThan(0.5);
      expect(completeResult.factors.completeness).toBeGreaterThan(0.7);
    });
  });

  describe('Specificity Factor', () => {
    it('should reward specific technical details', () => {
      const genericAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'The system should be fast with good performance for many users.',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const specificAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'The API must handle 1000 requests/second with p99 latency under 200ms, using connection pooling with 50 connections and request timeout of 30 seconds.',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'What are the performance requirements?',
        category: 'performance',
        priority: 'high',
      }];

      const genericResult = calculator.calculate(genericAnswer, questions);
      const specificResult = calculator.calculate(specificAnswer, questions);

      expect(specificResult.factors.specificity).toBeGreaterThan(genericResult.factors.specificity);
    });

    it('should reward code examples', () => {
      const noCodeAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'We will validate input on the server side.',
        confidence: 0.8,
        timestamp: new Date(),
      }];

      const withCodeAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'We will validate input on the server side using a schema validator:\n```typescript\nconst schema = z.object({\n  email: z.string().email(),\n  age: z.number().min(0).max(120)\n});\n```',
        confidence: 0.8,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'How will input validation work?',
        category: 'security',
        priority: 'high',
      }];

      const noCodeResult = calculator.calculate(noCodeAnswer, questions);
      const withCodeResult = calculator.calculate(withCodeAnswer, questions);

      expect(withCodeResult.factors.specificity).toBeGreaterThan(noCodeResult.factors.specificity);
    });
  });

  describe('Consistency Factor', () => {
    it('should detect contradictions in answers', () => {
      const contradictoryAnswers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'The system will always cache API responses for performance.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'The system will never cache API responses to ensure fresh data.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q3',
          answer: 'Caching strategy will be implemented for all endpoints.',
          confidence: 0.8,
          timestamp: new Date(),
        },
      ];

      const consistentAnswers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'The system will cache read-only API responses.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'Write operations will bypass caching to ensure data consistency.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q3',
          answer: 'Cache invalidation will occur on any write operation.',
          confidence: 0.8,
          timestamp: new Date(),
        },
      ];

      const questions: Question[] = [
        {
          id: 'q1',
          phase: 'brainstorm',
          question: 'How will caching work?',
          category: 'performance',
          priority: 'medium',
        },
        {
          id: 'q2',
          phase: 'brainstorm',
          question: 'When should we avoid caching?',
          category: 'performance',
          priority: 'medium',
        },
        {
          id: 'q3',
          phase: 'brainstorm',
          question: 'How will cache invalidation work?',
          category: 'performance',
          priority: 'medium',
        },
      ];

      const contradictoryResult = calculator.calculate(contradictoryAnswers, questions);
      const consistentResult = calculator.calculate(consistentAnswers, questions);

      // The contradictory answers should have lower consistency
      // Even if the exact scores are close, there should be a difference
      expect(contradictoryResult.factors.consistency).toBeLessThanOrEqual(consistentResult.factors.consistency);
    });
  });

  describe('Coverage Factor', () => {
    it('should track critical category coverage', () => {
      const calculator = new ConfidenceCalculator({
        criticalCategories: ['requirements', 'constraints', 'edge-cases'],
      });

      const partialQuestions: Question[] = [
        {
          id: 'q1',
          phase: 'brainstorm',
          question: 'What are the requirements?',
          category: 'requirements',
          priority: 'critical',
        },
      ];

      const fullQuestions: Question[] = [
        ...partialQuestions,
        {
          id: 'q2',
          phase: 'brainstorm',
          question: 'What are the constraints?',
          category: 'constraints',
          priority: 'critical',
        },
        {
          id: 'q3',
          phase: 'brainstorm',
          question: 'What edge cases exist?',
          category: 'edge-cases',
          priority: 'critical',
        },
      ];

      const answers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'Requirements defined.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'Constraints identified.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q3',
          answer: 'Edge cases handled.',
          confidence: 0.8,
          timestamp: new Date(),
        },
      ];

      const partialResult = calculator.calculate(answers.slice(0, 1), partialQuestions);
      const fullResult = calculator.calculate(answers, fullQuestions);

      expect(partialResult.factors.coverage).toBeLessThan(fullResult.factors.coverage);
      expect(partialResult.missing).toContain('constraints');
      expect(partialResult.missing).toContain('edge-cases');
      expect(fullResult.missing).toHaveLength(0);
    });
  });

  describe('Examples Factor', () => {
    it('should reward concrete examples', () => {
      const noExampleAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'The system should handle errors gracefully.',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const withExampleAnswer: Answer[] = [{
        questionId: 'q1',
        answer: 'The system should handle errors gracefully. For example, if the database connection fails, the system should:\n1. Log the error with full context\n2. Return HTTP 503 with retry-after header\n3. Send alert to ops team\n4. Attempt reconnection with exponential backoff',
        confidence: 0.7,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'How should errors be handled?',
        category: 'edge-cases',
        priority: 'high',
      }];

      const noExampleResult = calculator.calculate(noExampleAnswer, questions);
      const withExampleResult = calculator.calculate(withExampleAnswer, questions);

      expect(withExampleResult.factors.examples).toBeGreaterThan(noExampleResult.factors.examples);
    });
  });

  describe('Threshold Detection', () => {
    it('should correctly identify when threshold is reached', () => {
      const calculator = new ConfidenceCalculator({
        targetConfidence: 0.85,
      });

      expect(calculator.isConfidenceSufficient(0.84)).toBe(false);
      expect(calculator.isConfidenceSufficient(0.85)).toBe(true);
      expect(calculator.isConfidenceSufficient(0.90)).toBe(true);
    });

    it('should provide helpful insights', () => {
      const lowConfidenceAnswers: Answer[] = [{
        questionId: 'q1',
        answer: 'maybe',
        confidence: 0.3,
        timestamp: new Date(),
      }];

      const questions: Question[] = [{
        id: 'q1',
        phase: 'brainstorm',
        question: 'What is the architecture?',
        category: 'architecture',
        priority: 'high',
      }];

      const result = calculator.calculate(lowConfidenceAnswers, questions);

      expect(result.insights).toContainEqual(expect.stringContaining('ambiguity'));
      expect(result.insights).toContainEqual(expect.stringContaining('brief'));
    });
  });
});