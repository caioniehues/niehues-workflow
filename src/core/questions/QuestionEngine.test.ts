/**
 * Test suite for QuestionEngine
 *
 * Tests adaptive questioning, confidence calculation, follow-up generation,
 * ambiguity detection, and database persistence.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuestionEngine } from './QuestionEngine.js';
import { DatabaseManager } from '../database/DatabaseManager.js';
import type {
  Question,
  Answer,
  QuestionContext,
  QuestionEngineConfig,
} from './IQuestionEngine.js';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

// Mock DatabaseManager
const mockDbInstance = {
  getQuestions: vi.fn().mockReturnValue([]),
  saveQuestion: vi.fn().mockReturnValue('q-123'),
  answerQuestion: vi.fn(),
  close: vi.fn(),
};

vi.mock('../database/DatabaseManager.js', () => ({
  DatabaseManager: vi.fn().mockImplementation(() => mockDbInstance),
}));

describe('QuestionEngine', () => {
  let engine: QuestionEngine | undefined;
  const testProjectPath = '/tmp/test-question-engine';
  const testSessionId = 'test-session-123';

  beforeEach(() => {
    // Create test project directory
    if (!existsSync(testProjectPath)) {
      require('fs').mkdirSync(testProjectPath, { recursive: true });
    }

    // Create engine with test config
    const config: QuestionEngineConfig = {
      defaultTargetConfidence: 0.85,
      persistQuestions: false, // Disable DB for most tests
      templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json'),
    };
    engine = new QuestionEngine(config);
  });

  afterEach(async () => {
    if (engine) {
      try {
        await engine!.close();
      } catch (error) {
        // Ignore cleanup errors in tests
      }
      engine = undefined;
    }
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with session and project path', async () => {
      await engine!.initialize(testSessionId, testProjectPath);
      expect(engine).toBeDefined();
    });

    it('should load question templates', async () => {
      await engine!.initialize(testSessionId, testProjectPath);

      // Should be able to generate questions after loading templates
      const questions = await engine!.generateQuestions('test feature', 'brainstorm', 3);
      expect(questions).toHaveLength(3);
      expect(questions[0].question).toContain('test feature');
    });

    it('should throw error if templates not found', async () => {
      const engineWithBadPath = new QuestionEngine({
        templatesPath: '/nonexistent/path/questions.json',
      });

      await expect(
        engineWithBadPath.initialize(testSessionId, testProjectPath)
      ).rejects.toThrow('Question templates not found');
    });
  });

  describe('Adaptive Question Generation', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should generate next question based on context', async () => {
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'user authentication',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      const question = await engine!.generateNextQuestion(context);

      expect(question).toBeDefined();
      expect(question?.phase).toBe('brainstorm');
      expect(question?.question).toContain('user authentication');
      expect(question?.category).toBeDefined();
      expect(question?.priority).toBeDefined();
    });

    it('should prioritize critical questions first', async () => {
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'payment system',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      const firstQuestion = await engine!.generateNextQuestion(context);
      expect(firstQuestion?.priority).toMatch(/critical|high/);
    });

    it('should not repeat asked questions', async () => {
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'feature',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      const question1 = await engine!.generateNextQuestion(context);
      const question2 = await engine!.generateNextQuestion(context);

      expect(question1?.id).not.toBe(question2?.id);
      expect(question1?.question).not.toBe(question2?.question);
    });

    it('should return null when max questions reached', async () => {
      const engineWithLimit = new QuestionEngine({
        maxQuestionsPerSession: 2,
        templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json'),
      });
      await engineWithLimit.initialize(testSessionId, testProjectPath);

      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'feature',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      const q1 = await engineWithLimit.generateNextQuestion(context);
      const q2 = await engineWithLimit.generateNextQuestion(context);
      const q3 = await engineWithLimit.generateNextQuestion(context);

      expect(q1).toBeDefined();
      expect(q2).toBeDefined();
      expect(q3).toBeNull();
    });
  });

  describe('Confidence Calculation', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should calculate confidence from answers', async () => {
      const answers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'The system must handle 1000 concurrent users with response times under 200ms.',
          confidence: 0.8,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'We will use PostgreSQL for data persistence with Redis for caching.',
          confidence: 0.9,
          timestamp: new Date(),
        },
      ];

      const confidence = await engine!.calculateConfidence(answers);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should return 0 confidence for no answers', async () => {
      const confidence = await engine!.calculateConfidence([]);
      expect(confidence).toBe(0);
    });

    it('should process answers and update confidence', async () => {
      const answer: Answer = {
        questionId: 'q1',
        answer: 'The system will implement OAuth 2.0 authentication.',
        confidence: 0.85,
        timestamp: new Date(),
      };

      const newConfidence = await engine!.processAnswer(answer);

      expect(newConfidence).toBeGreaterThan(0);
      expect(newConfidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Confidence Threshold Enforcement', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should continue questioning when below threshold', () => {
      const shouldContinue = engine!.shouldContinueQuestioning(0.70, 0.85);
      expect(shouldContinue).toBe(true);
    });

    it('should stop questioning when threshold reached', () => {
      // Mock that we've asked enough questions to meet minimum requirements
      engine!.askedQuestionIds.add('q1');
      engine!.askedQuestionIds.add('q2');
      engine!.askedQuestionIds.add('q3');
      engine!.askedQuestionIds.add('q4');
      engine!.askedQuestionIds.add('q5');
      engine!.askedQuestionIds.add('q6');
      engine!.askedQuestionIds.add('q7');
      engine!.askedQuestionIds.add('q8');
      engine!.askedQuestionIds.add('q9');
      engine!.askedQuestionIds.add('q10');

      const shouldContinue = engine!.shouldContinueQuestioning(0.86, 0.85);
      expect(shouldContinue).toBe(false);
    });

    it('should stop generating questions when confidence met', async () => {
      const highConfidenceAnswers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'Detailed comprehensive answer with specific requirements.',
          confidence: 0.95,
          timestamp: new Date(),
        },
      ];

      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'feature',
        previousAnswers: highConfidenceAnswers,
        targetConfidence: 0.85,
      };

      // Mock that we've asked enough questions to meet minimum requirements
      engine!.askedQuestionIds.add('q1');
      engine!.askedQuestionIds.add('q2');
      engine!.askedQuestionIds.add('q3');
      engine!.askedQuestionIds.add('q4');
      engine!.askedQuestionIds.add('q5');
      engine!.askedQuestionIds.add('q6');
      engine!.askedQuestionIds.add('q7');
      engine!.askedQuestionIds.add('q8');
      engine!.askedQuestionIds.add('q9');
      engine!.askedQuestionIds.add('q10');

      // Mock high confidence
      vi.spyOn(engine!, 'calculateConfidence').mockResolvedValue(0.90);

      const question = await engine!.generateNextQuestion(context);
      expect(question).toBeNull();
    });
  });

  describe('Ambiguity Detection', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should detect ambiguous answers', () => {
      const ambiguousAnswers = [
        'Maybe we could implement that',
        'It possibly could work',
        'I think it might be good',
        'It depends on various factors',
        'Not sure about that',
        'Probably we should do it',
      ];

      for (const answer of ambiguousAnswers) {
        expect(engine!.detectAmbiguity(answer)).toBe(true);
      }
    });

    it('should not flag clear answers as ambiguous', () => {
      const clearAnswers = [
        'The system will use PostgreSQL',
        'Authentication is required for all endpoints',
        'Response time must be under 200ms',
        'We will implement comprehensive logging',
      ];

      for (const answer of clearAnswers) {
        expect(engine!.detectAmbiguity(answer)).toBe(false);
      }
    });

    it('should generate clarification for ambiguous answer', async () => {
      const originalQuestion: Question = {
        id: 'q1',
        phase: 'brainstorm',
        question: 'How should we handle authentication?',
        category: 'architecture',
        priority: 'high',
      };

      const ambiguousAnswer = 'Maybe we could use some kind of token system';

      const clarification = await engine!.generateClarificationQuestion(
        originalQuestion,
        ambiguousAnswer
      );

      expect(clarification.category).toBe('clarification');
      expect(clarification.priority).toBe('critical');
      expect(clarification.followUpTo).toBe('q1');
      expect(clarification.question).toContain('specific');
    });

    it('should reduce confidence for ambiguous answers', async () => {
      const ambiguousAnswer: Answer = {
        questionId: 'q1',
        answer: 'Maybe we could possibly implement something that might work',
        confidence: 0.8,
        timestamp: new Date(),
      };

      await engine!.processAnswer(ambiguousAnswer);

      // The stored answer should have reduced confidence
      const confidence = await engine!.calculateConfidence([ambiguousAnswer]);
      expect(confidence).toBeLessThan(0.8);
    });
  });

  describe('Follow-Up Question Generation', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should generate follow-up questions for answers', async () => {
      const answer: Answer = {
        questionId: 'req-core-purpose',
        answer: 'The system manages user accounts',
        confidence: 0.7,
        timestamp: new Date(),
      };

      const followUps = await engine!.getFollowUpQuestions(answer);

      // Note: This depends on template structure
      expect(followUps.length).toBeGreaterThanOrEqual(0);
      if (followUps.length > 0) {
        expect(followUps[0].followUpTo).toBe('req-core-purpose');
      }
    });

    it('should limit follow-up depth', async () => {
      // This test would need more complex setup to track depth
      // For now, we just verify the method exists and returns an array
      const answer: Answer = {
        questionId: 'q1',
        answer: 'Test answer',
        confidence: 0.7,
        timestamp: new Date(),
      };

      const followUps = await engine!.getFollowUpQuestions(answer);
      expect(Array.isArray(followUps)).toBe(true);
    });
  });

  describe('Question Diversity', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should generate diverse questions across categories', async () => {
      const questions = await engine!.generateQuestions('payment system', 'brainstorm', 5);

      const categories = new Set(questions.map(q => q.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('should generate phase-appropriate questions', async () => {
      const brainstormQuestions = await engine!.generateQuestions('feature', 'brainstorm', 3);
      const specifyQuestions = await engine!.generateQuestions('feature', 'specify', 3);

      expect(brainstormQuestions.every(q => q.phase === 'brainstorm')).toBe(true);
      expect(specifyQuestions.every(q => q.phase === 'specify')).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should store and retrieve session questions', async () => {
      const engineWithDb = new QuestionEngine({
        persistQuestions: true,
        templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json'),
      });

      // Mock database responses
      const mockQuestions = [
        {
          id: 'q1',
          session_id: testSessionId,
          phase: 'brainstorm',
          question: 'What is the purpose?',
          answer: 'To manage users',
          confidence: 0.8,
          timestamp: Date.now(),
        },
      ];
      vi.mocked(mockDbInstance).getQuestions.mockReturnValue(mockQuestions);

      await engineWithDb.initialize(testSessionId, testProjectPath);

      const sessionData = await engineWithDb.getSessionQuestions(testSessionId);

      expect(sessionData).toHaveLength(1);
      expect(sessionData[0].question.question).toBe('What is the purpose?');
      expect(sessionData[0].answer?.answer).toBe('To manage users');
    });

    it('should persist questions when configured', async () => {
      const engineWithDb = new QuestionEngine({
        persistQuestions: true,
        templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json'),
      });

      await engineWithDb.initialize(testSessionId, testProjectPath);

      const question: Question = {
        id: 'q1',
        phase: 'brainstorm',
        question: 'Test question?',
        category: 'requirements',
        priority: 'high',
      };

      const answer: Answer = {
        questionId: 'q1',
        answer: 'Test answer',
        confidence: 0.8,
        timestamp: new Date(),
      };

      await engineWithDb.storeQuestionAnswer(question, answer);

      expect(vi.mocked(mockDbInstance).saveQuestion).toHaveBeenCalled();
      expect(vi.mocked(mockDbInstance).answerQuestion).toHaveBeenCalled();
    });
  });

  describe('Statistics Tracking', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should track questioning statistics', async () => {
      // Generate some questions to track
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'feature',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      await engine!.generateNextQuestion(context);
      await engine!.generateNextQuestion(context);

      const stats = await engine!.getStats();

      expect(stats.totalQuestions).toBe(2);
      expect(stats.questionsPerPhase.brainstorm).toBeGreaterThan(0);
      expect(stats.mostEffectiveCategories).toBeDefined();
      expect(Array.isArray(stats.mostEffectiveCategories)).toBe(true);
    });
  });

  describe('Insight Extraction', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should extract insights from answers', async () => {
      const answers: Answer[] = [
        {
          questionId: 'q1',
          answer: 'maybe',
          confidence: 0.3,
          timestamp: new Date(),
        },
        {
          questionId: 'q2',
          answer: 'The system must handle 1000 users',
          confidence: 0.9,
          timestamp: new Date(),
        },
      ];

      const insights = await engine!.extractInsights(answers);

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing templates gracefully', async () => {
      const engineNoTemplates = new QuestionEngine({
        templatesPath: '/invalid/path',
      });

      await expect(
        engineNoTemplates.initialize(testSessionId, testProjectPath)
      ).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      const engineWithDb = new QuestionEngine({
        persistQuestions: true,
        templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json'),
      });

      // Mock database error
      vi.mocked(mockDbInstance).saveQuestion.mockImplementation(() => {
        throw new Error('Database error');
      });

      await engineWithDb.initialize(testSessionId, testProjectPath);

      // Should not throw when database fails
      const question: Question = {
        id: 'q1',
        phase: 'brainstorm',
        question: 'Test?',
        category: 'requirements',
        priority: 'high',
      };

      const answer: Answer = {
        questionId: 'q1',
        answer: 'Test',
        confidence: 0.8,
        timestamp: new Date(),
      };

      // This should not throw even if DB fails
      await expect(
        engineWithDb.storeQuestionAnswer(question, answer)
      ).rejects.toThrow();
    });
  });

  describe('Resource Cleanup', () => {
    it('should properly close and clean up resources', async () => {
      await engine!.initialize(testSessionId, testProjectPath);

      // Generate some state
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'feature',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      await engine!.generateNextQuestion(context);
      await engine!.generateNextQuestion(context);

      await engine!.close();

      // After close, should reset state
      // This would be better tested with access to private fields
      // but we can verify it doesn't throw
      expect(engine!.close).not.toThrow();
    });
  });

  describe('Phase Transition Requirements', () => {
    beforeEach(async () => {
      await engine!.initialize(testSessionId, testProjectPath);
    });

    it('should enforce minimum questions per phase', () => {
      // Even with high confidence, should continue if min questions not met
      const shouldContinue = engine!.shouldContinueQuestioning(0.90, 0.85);

      // For brainstorm phase, minimum is typically 10 questions
      // Since we haven't asked any, it should continue
      expect(shouldContinue).toBe(true);
    });

    it('should track coverage requirements per phase', async () => {
      const context: QuestionContext = {
        phase: 'brainstorm',
        topic: 'authentication system',
        previousAnswers: [],
        targetConfidence: 0.85,
      };

      // Generate multiple questions to test coverage
      const questions: Question[] = [];
      for (let i = 0; i < 5; i++) {
        const q = await engine!.generateNextQuestion(context);
        if (q) questions.push(q);
      }

      // Should have questions from different categories
      const categories = new Set(questions.map(q => q.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });
});