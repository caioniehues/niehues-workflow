/**
 * ConfidenceCalculator.test.ts
 * Created: 2025-09-16 20:42:28 WEST
 *
 * TDD: Tests written BEFORE implementation
 * Defines expected behavior for confidence calculation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ConfidenceCalculator } from './ConfidenceCalculator';
import type { Task, Context, ConfidenceFactors, ConfidenceResult } from './types';

describe('ConfidenceCalculator', () => {
  let calculator: ConfidenceCalculator;

  beforeEach(() => {
    calculator = new ConfidenceCalculator();
  });

  describe('calculate()', () => {
    it('should return 100% confidence for perfectly clear task', () => {
      const task: Task = {
        id: 'TEST-001',
        title: 'Implement user login',
        requirements: [
          'User enters email and password',
          'System validates credentials against database',
          'System returns JWT token on success',
          'System returns 401 on failure'
        ],
        acceptanceCriteria: [
          'Valid credentials return token',
          'Invalid credentials return error',
          'Token expires in 30 minutes'
        ],
        testStrategy: 'Unit tests for validation, Integration tests for API',
        dependencies: ['Database connection established']
      };

      const context: Context = {
        core: {
          directRequirements: task.requirements,
          acceptanceCriteria: task.acceptanceCriteria,
          dependencies: { resolved: true, items: task.dependencies }
        },
        embedded: true,
        size: 500,
        source: 'specs/sharded/epic-1-auth.md'
      };

      const result = calculator.calculate(task, context);

      expect(result.overall).toBeGreaterThan(95);
      expect(result.breakdown.requirements_clarity).toBe(100);
      expect(result.breakdown.test_coverage_defined).toBe(100);
    });

    it('should return low confidence for ambiguous task', () => {
      const task: Task = {
        id: 'TEST-002',
        title: 'Make the app better',
        requirements: [
          'Improve stuff',
          'Make it fast',
          'Add some features maybe'
        ],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: []
      };

      const context: Context = {
        core: {
          directRequirements: task.requirements,
          acceptanceCriteria: [],
          dependencies: { resolved: false, items: [] }
        },
        embedded: false,
        size: 100,
        source: ''
      };

      const result = calculator.calculate(task, context);

      expect(result.overall).toBeLessThan(50);
      expect(result.breakdown.ambiguity_level).toBeLessThan(30);
    });

    it('should weight TDD factors according to constitution', () => {
      const task: Task = {
        id: 'TEST-003',
        title: 'Create user model',
        requirements: ['Define user schema'],
        acceptanceCriteria: ['Schema validated'],
        testStrategy: 'Full test coverage with TDD approach',
        dependencies: []
      };

      const context: Context = {
        core: {
          directRequirements: task.requirements,
          acceptanceCriteria: task.acceptanceCriteria,
          dependencies: { resolved: true, items: [] }
        },
        embedded: true,
        size: 300,
        source: 'specs/models.md'
      };

      const result = calculator.calculate(task, context);

      // TDD weight should be significant (20% of total)
      expect(result.weights.test_coverage_defined).toBe(0.20);
      expect(result.factors.test_coverage_defined).toBeGreaterThan(80);
    });

    it('should weight context completeness according to constitution', () => {
      const taskWithContext: Task = {
        id: 'TEST-004',
        title: 'Implement API endpoint',
        requirements: ['Create POST /users'],
        acceptanceCriteria: ['Returns 201 on success'],
        testStrategy: 'API tests',
        dependencies: []
      };

      const goodContext: Context = {
        core: {
          directRequirements: taskWithContext.requirements,
          acceptanceCriteria: taskWithContext.acceptanceCriteria,
          dependencies: { resolved: true, items: [] }
        },
        embedded: true,
        extended: {
          patterns: ['REST pattern from previous project'],
          historicalDecisions: ['Use Express router'],
          edgeCases: ['Duplicate email handling']
        },
        size: 800,
        source: 'full/path/to/spec.md'
      };

      const poorContext: Context = {
        core: {
          directRequirements: taskWithContext.requirements,
          acceptanceCriteria: taskWithContext.acceptanceCriteria,
          dependencies: { resolved: false, items: [] }
        },
        embedded: false,
        size: 50,
        source: ''
      };

      const goodResult = calculator.calculate(taskWithContext, goodContext);
      const poorResult = calculator.calculate(taskWithContext, poorContext);

      // Context Is Sacred - should significantly impact confidence
      expect(goodResult.overall - poorResult.overall).toBeGreaterThan(15);
      expect(goodResult.factors.context_completeness).toBeGreaterThan(80);
      expect(poorResult.factors.context_completeness).toBeLessThan(40);
    });
  });

  describe('detectAmbiguity()', () => {
    it('should detect ambiguous words in requirements', () => {
      const task: Task = {
        id: 'TEST-005',
        title: 'Do something',
        requirements: [
          'Make it fast',
          'Add some stuff',
          'It should be nice',
          'Maybe add things'
        ],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: []
      };

      const ambiguityScore = calculator.detectAmbiguity(task);

      expect(ambiguityScore).toBeGreaterThan(60); // High ambiguity
    });

    it('should return low ambiguity for precise requirements', () => {
      const task: Task = {
        id: 'TEST-006',
        title: 'Create user table',
        requirements: [
          'Create table with id (UUID), email (VARCHAR 255), created_at (TIMESTAMP)',
          'Add unique constraint on email column',
          'Add index on created_at for sorting'
        ],
        acceptanceCriteria: [
          'Table created in PostgreSQL',
          'Constraints verified with test data'
        ],
        testStrategy: 'Schema validation tests',
        dependencies: ['Database connection']
      };

      const ambiguityScore = calculator.detectAmbiguity(task);

      expect(ambiguityScore).toBeLessThan(10); // Low ambiguity
    });
  });

  describe('assessTestability()', () => {
    it('should score high for well-defined test strategy', () => {
      const task: Task = {
        id: 'TEST-007',
        title: 'Password validation',
        requirements: ['Validate password strength'],
        acceptanceCriteria: [
          'Minimum 8 characters',
          'At least one uppercase',
          'At least one number'
        ],
        testStrategy: 'Unit tests for each validation rule, property-based testing for edge cases',
        dependencies: []
      };

      const score = calculator.assessTestability(task);

      expect(score).toBeGreaterThan(90);
    });

    it('should score low for missing test strategy', () => {
      const task: Task = {
        id: 'TEST-008',
        title: 'Add feature',
        requirements: ['Add new feature'],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: []
      };

      const score = calculator.assessTestability(task);

      expect(score).toBeLessThan(30);
    });
  });

  describe('checkDependencies()', () => {
    it('should return 100 when all dependencies resolved', () => {
      const task: Task = {
        id: 'TEST-009',
        title: 'Create service',
        requirements: [],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: ['Database', 'Auth service', 'Logger']
      };

      const context: Context = {
        core: {
          directRequirements: [],
          acceptanceCriteria: [],
          dependencies: {
            resolved: true,
            items: task.dependencies,
            resolutionNotes: 'All services initialized in previous tasks'
          }
        },
        embedded: true,
        size: 200,
        source: ''
      };

      const score = calculator.checkDependencies(task, context);

      expect(score).toBe(100);
    });

    it('should return 0 when dependencies unresolved', () => {
      const task: Task = {
        id: 'TEST-010',
        title: 'Create service',
        requirements: [],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: ['External API key', 'Third-party service']
      };

      const context: Context = {
        core: {
          directRequirements: [],
          acceptanceCriteria: [],
          dependencies: {
            resolved: false,
            items: task.dependencies,
            resolutionNotes: 'Waiting for API credentials'
          }
        },
        embedded: true,
        size: 200,
        source: ''
      };

      const score = calculator.checkDependencies(task, context);

      expect(score).toBe(0);
    });
  });

  describe('findSimilarPatterns()', () => {
    it('should find patterns in task history', () => {
      const task: Task = {
        id: 'TEST-011',
        title: 'Create REST endpoint',
        requirements: ['POST /products', 'Validate input', 'Return 201'],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: []
      };

      // Simulate pattern history
      calculator.addPatternToHistory({
        id: 'PATTERN-001',
        type: 'REST endpoint',
        successRate: 0.95,
        implementation: 'Express router pattern'
      });

      const score = calculator.findSimilarPatterns(task);

      expect(score).toBeGreaterThan(70);
    });

    it('should return low score for novel tasks', () => {
      const task: Task = {
        id: 'TEST-012',
        title: 'Implement quantum algorithm',
        requirements: ['Implement Shor\'s algorithm'],
        acceptanceCriteria: [],
        testStrategy: '',
        dependencies: []
      };

      const score = calculator.findSimilarPatterns(task);

      expect(score).toBeLessThan(20);
    });
  });

  describe('confidence thresholds', () => {
    it('should trigger different questioning phases at correct thresholds', () => {
      const phases = calculator.getQuestioningPhase(25);
      expect(phases).toBe('TRIAGE');

      const exploration = calculator.getQuestioningPhase(55);
      expect(exploration).toBe('EXPLORATION');

      const edgeCases = calculator.getQuestioningPhase(75);
      expect(edgeCases).toBe('EDGE_CASES');

      const validation = calculator.getQuestioningPhase(90);
      expect(validation).toBe('VALIDATION');

      const complete = calculator.getQuestioningPhase(96);
      expect(complete).toBe('COMPLETE');
    });
  });
});