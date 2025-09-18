/**
 * Tests for BrainstormFormatter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrainstormFormatter } from './BrainstormFormatter.js';
import type { BrainstormResult, BrainstormApproach } from '../commands/NexusBrainstormCommand.js';
import type { Question, Answer } from '../core/questions/IQuestionEngine.js';
import { readFileSync, existsSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('BrainstormFormatter', () => {
  const testOutputDir = './test-output';
  const testOutputPath = join(testOutputDir, '.nexus', 'current', 'brainstorm.md');

  beforeEach(() => {
    // Clean up any existing test files
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
    mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test files
    if (existsSync(testOutputDir)) {
      rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  const createMockBrainstormResult = (): BrainstormResult => {
    const approaches: BrainstormApproach[] = [
      {
        id: 'approach-1',
        title: 'Minimal Viable Approach',
        description: 'Start with the simplest possible solution that delivers core value quickly.',
        pros: ['Fast to implement', 'Low risk', 'Quick feedback'],
        cons: ['Limited functionality', 'May need significant rework'],
        complexity: 'low',
        feasibility: 'high',
        innovation: 'low'
      },
      {
        id: 'approach-2',
        title: 'Comprehensive Solution',
        description: 'Build a full-featured, enterprise-grade solution with all anticipated needs.',
        pros: ['Complete solution', 'Future-proof', 'Scalable'],
        cons: ['High complexity', 'Long development time', 'High cost'],
        complexity: 'high',
        feasibility: 'medium',
        innovation: 'medium'
      }
    ];

    const questions: Question[] = [
      {
        id: 'q1',
        question: 'What is the primary goal of this project?',
        category: 'goals',
        priority: 'high',
        tags: ['requirements'],
        followUpTriggers: []
      },
      {
        id: 'q2',
        question: 'What are the main constraints you need to work within?',
        category: 'constraints',
        priority: 'high',
        tags: ['limitations'],
        followUpTriggers: []
      }
    ];

    const answers: Answer[] = [
      {
        questionId: 'q1',
        answer: 'To build a user-friendly system that improves productivity',
        confidence: 0.8,
        timestamp: new Date()
      },
      {
        questionId: 'q2',
        answer: 'Limited budget and 6-month timeline',
        confidence: 0.7,
        timestamp: new Date()
      }
    ];

    return {
      topic: 'Test Project Planning',
      approaches,
      insights: [
        'User experience is a key priority',
        'Budget and timeline constraints identified',
        'Need to balance features with development speed'
      ],
      questions,
      answers,
      confidence: 0.85
    };
  };

  describe('formatToMarkdown', () => {
    it('should generate valid markdown with all sections', () => {
      const formatter = new BrainstormFormatter();
      const result = createMockBrainstormResult();

      const markdown = formatter.formatToMarkdown(result);

      expect(markdown).toContain('# Brainstorm Session: Test Project Planning');
      expect(markdown).toContain('## Executive Summary');
      expect(markdown).toContain('## Key Insights');
      expect(markdown).toContain('## Generated Approaches');
      expect(markdown).toContain('## Questioning Session');
      expect(markdown).toContain('## Session Metadata');
      expect(markdown).toContain('Confidence: 85.0%');
    });

    it('should format approaches correctly', () => {
      const formatter = new BrainstormFormatter();
      const result = createMockBrainstormResult();

      const markdown = formatter.formatToMarkdown(result);

      expect(markdown).toContain('### 1. Minimal Viable Approach');
      expect(markdown).toContain('🟢 **Low Complexity**');
      expect(markdown).toContain('🟢 **High Feasibility**');
      expect(markdown).toContain('🔵 **Low Innovation**');
      expect(markdown).toContain('- ✅ Fast to implement');
      expect(markdown).toContain('- ❌ Limited functionality');
    });

    it('should include questioning session when enabled', () => {
      const formatter = new BrainstormFormatter({ includeFullQuestions: true });
      const result = createMockBrainstormResult();

      const markdown = formatter.formatToMarkdown(result);

      expect(markdown).toContain('### Q1: GOALS');
      expect(markdown).toContain('What is the primary goal of this project?');
      expect(markdown).toContain('To build a user-friendly system that improves productivity');
    });

    it('should exclude questioning session when disabled', () => {
      const formatter = new BrainstormFormatter({ includeFullQuestions: false });
      const result = createMockBrainstormResult();

      const markdown = formatter.formatToMarkdown(result);

      expect(markdown).not.toContain('## Questioning Session');
    });

    it('should limit approaches when maxApproachesToShow is set', () => {
      const formatter = new BrainstormFormatter({ maxApproachesToShow: 1 });
      const result = createMockBrainstormResult();

      const markdown = formatter.formatToMarkdown(result);

      expect(markdown).toContain('### 1. Minimal Viable Approach');
      expect(markdown).not.toContain('### 2. Comprehensive Solution');
      expect(markdown).toContain('(Showing top 1)');
    });
  });

  describe('formatAndSave', () => {
    it('should create directory and save markdown file', async () => {
      const formatter = new BrainstormFormatter();
      const result = createMockBrainstormResult();

      await formatter.formatAndSave(result, testOutputDir);

      expect(existsSync(testOutputPath)).toBe(true);

      const content = readFileSync(testOutputPath, 'utf8');
      expect(content).toContain('# Brainstorm Session: Test Project Planning');
      expect(content).toContain('Confidence: 85.0%');
    });

    it('should use custom output path when provided', async () => {
      const customPath = join(testOutputDir, 'custom', 'brainstorm.md');
      const formatter = new BrainstormFormatter({ outputPath: 'custom/brainstorm.md' });
      const result = createMockBrainstormResult();

      await formatter.formatAndSave(result, testOutputDir);

      expect(existsSync(customPath)).toBe(true);
    });

    it('should handle save errors gracefully', async () => {
      const formatter = new BrainstormFormatter({ outputPath: '/invalid/path/brainstorm.md' });
      const result = createMockBrainstormResult();

      await expect(formatter.formatAndSave(result, testOutputDir)).rejects.toThrow('Failed to save brainstorm markdown');
    });
  });

  describe('helper function', () => {
    it('should export formatBrainstormResults helper', async () => {
      const { formatBrainstormResults } = await import('./BrainstormFormatter.js');
      const result = createMockBrainstormResult();

      await formatBrainstormResults(result, {}, testOutputDir);

      expect(existsSync(testOutputPath)).toBe(true);
    });
  });
});