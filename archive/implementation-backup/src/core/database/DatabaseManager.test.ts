import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseManager } from './DatabaseManager.js';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('DatabaseManager', () => {
  let db: DatabaseManager;
  const testProjectPath = './test-nexus-db';

  beforeEach(() => {
    // Clean up any existing test database
    if (existsSync(join(testProjectPath, '.nexus'))) {
      rmSync(join(testProjectPath, '.nexus'), { recursive: true, force: true });
    }
    db = new DatabaseManager(testProjectPath);
  });

  afterEach(() => {
    db.close();
    // Clean up test database
    if (existsSync(join(testProjectPath, '.nexus'))) {
      rmSync(join(testProjectPath, '.nexus'), { recursive: true, force: true });
    }
  });

  describe('Session Management', () => {
    it('should create a new session', () => {
      const session = db.createSession('test-project', 'brainstorm');

      expect(session).toBeDefined();
      expect(session.project_name).toBe('test-project');
      expect(session.phase).toBe('brainstorm');
      expect(session.status).toBe('active');
    });

    it('should retrieve an existing session', () => {
      const created = db.createSession('test-project');
      const retrieved = db.getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.project_name).toBe('test-project');
    });

    it('should update session status and phase', () => {
      const session = db.createSession('test-project');

      db.updateSession(session.id, {
        status: 'completed',
        phase: 'implement'
      });

      const updated = db.getSession(session.id);
      expect(updated?.status).toBe('completed');
      expect(updated?.phase).toBe('implement');
    });

    it('should return undefined for non-existent session', () => {
      const session = db.getSession('non-existent-id');
      expect(session).toBeUndefined();
    });
  });

  describe('Context Cache', () => {
    it('should store and retrieve context', () => {
      const session = db.createSession('test-project');
      const testData = { key: 'value', nested: { data: 123 } };

      db.setContext(session.id, 'brainstorm', 'test-key', testData);
      const retrieved = db.getContext(session.id, 'brainstorm', 'test-key');

      expect(retrieved).toEqual(testData);
    });

    it('should respect TTL expiration', () => {
      const session = db.createSession('test-project');

      // Set context with negative TTL (already expired)
      db.setContext(session.id, 'brainstorm', 'expired-key', 'data', -1);

      const retrieved = db.getContext(session.id, 'brainstorm', 'expired-key');
      expect(retrieved).toBeUndefined();
    });

    it('should overwrite existing context with same key', () => {
      const session = db.createSession('test-project');

      db.setContext(session.id, 'brainstorm', 'key', 'first-value');
      db.setContext(session.id, 'brainstorm', 'key', 'second-value');

      const retrieved = db.getContext(session.id, 'brainstorm', 'key');
      expect(retrieved).toBe('second-value');
    });

    it('should isolate context by session and phase', () => {
      const session1 = db.createSession('project1');
      const session2 = db.createSession('project2');

      db.setContext(session1.id, 'brainstorm', 'key', 'value1');
      db.setContext(session2.id, 'brainstorm', 'key', 'value2');
      db.setContext(session1.id, 'specify', 'key', 'value3');

      expect(db.getContext(session1.id, 'brainstorm', 'key')).toBe('value1');
      expect(db.getContext(session2.id, 'brainstorm', 'key')).toBe('value2');
      expect(db.getContext(session1.id, 'specify', 'key')).toBe('value3');
    });
  });

  describe('Pattern Management', () => {
    it('should save and retrieve patterns', () => {
      const patternData = { template: 'test', variables: ['a', 'b'] };

      db.savePattern('test-pattern', 'testing', patternData);
      const patterns = db.getPatterns('testing');

      expect(patterns).toHaveLength(1);
      expect(patterns[0].name).toBe('test-pattern');
      expect(patterns[0].category).toBe('testing');
      expect(JSON.parse(patterns[0].pattern)).toEqual(patternData);
    });

    it('should increment frequency on duplicate pattern names', () => {
      db.savePattern('duplicate', 'testing', { v: 1 });
      db.savePattern('duplicate', 'testing', { v: 2 });

      const patterns = db.getPatterns('testing');
      expect(patterns).toHaveLength(1);
      expect(patterns[0].frequency).toBe(2);
      expect(JSON.parse(patterns[0].pattern)).toEqual({ v: 2 });
    });

    it('should retrieve all patterns when no category specified', () => {
      db.savePattern('pattern1', 'category1', {});
      db.savePattern('pattern2', 'category2', {});

      const patterns = db.getPatterns();
      expect(patterns).toHaveLength(2);
    });

    it('should order patterns by success rate and frequency', () => {
      // Create patterns with different success rates using raw SQL
      const stmt = db.prepare(`
        INSERT INTO patterns (id, name, category, pattern, frequency, success_rate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run('1', 'low-success', 'test', '{}', 10, 0.5);
      stmt.run('2', 'high-success', 'test', '{}', 5, 0.9);
      stmt.run('3', 'medium-success', 'test', '{}', 15, 0.7);

      const patterns = db.getPatterns('test');
      expect(patterns[0].name).toBe('high-success');
      expect(patterns[1].name).toBe('medium-success');
      expect(patterns[2].name).toBe('low-success');
    });
  });

  describe('Question Management', () => {
    it('should save questions', () => {
      const session = db.createSession('test-project');

      const questionId = db.saveQuestion(session.id, 'brainstorm', 'What is the goal?');

      expect(questionId).toBeDefined();
      expect(typeof questionId).toBe('string');
    });

    it('should answer questions with confidence impact', () => {
      const session = db.createSession('test-project');
      const questionId = db.saveQuestion(session.id, 'brainstorm', 'Test question?');

      db.answerQuestion(questionId, 'Test answer', 0.15);

      const questions = db.getUnansweredQuestions(session.id);
      expect(questions).toHaveLength(0);
    });

    it('should retrieve only unanswered questions', () => {
      const session = db.createSession('test-project');

      const q1 = db.saveQuestion(session.id, 'brainstorm', 'Question 1?');
      const q2 = db.saveQuestion(session.id, 'brainstorm', 'Question 2?');
      const q3 = db.saveQuestion(session.id, 'brainstorm', 'Question 3?');

      db.answerQuestion(q2, 'Answer 2', 0.1);

      const unanswered = db.getUnansweredQuestions(session.id);
      expect(unanswered).toHaveLength(2);
      expect(unanswered.map(q => q.id)).toContain(q1);
      expect(unanswered.map(q => q.id)).toContain(q3);
    });
  });

  describe('Confidence Tracking', () => {
    it('should save confidence scores', () => {
      const session = db.createSession('test-project');
      const factors = { questions_answered: 5, patterns_found: 3 };

      db.saveConfidence(session.id, 'brainstorm', 0.75, factors);

      const confidence = db.getLatestConfidence(session.id, 'brainstorm');
      expect(confidence).toBe(0.75);
    });

    it('should return latest confidence for phase', () => {
      const session = db.createSession('test-project');

      db.saveConfidence(session.id, 'brainstorm', 0.5, {});
      db.saveConfidence(session.id, 'brainstorm', 0.7, {});
      db.saveConfidence(session.id, 'brainstorm', 0.9, {});

      const latest = db.getLatestConfidence(session.id, 'brainstorm');
      expect(latest).toBe(0.9);
    });

    it('should return 0 when no confidence scores exist', () => {
      const session = db.createSession('test-project');

      const confidence = db.getLatestConfidence(session.id, 'brainstorm');
      expect(confidence).toBe(0);
    });

    it('should isolate confidence by session and phase', () => {
      const session = db.createSession('test-project');

      db.saveConfidence(session.id, 'brainstorm', 0.6, {});
      db.saveConfidence(session.id, 'specify', 0.8, {});

      expect(db.getLatestConfidence(session.id, 'brainstorm')).toBe(0.6);
      expect(db.getLatestConfidence(session.id, 'specify')).toBe(0.8);
    });
  });

  describe('Task Management', () => {
    it('should create tasks with dependencies', () => {
      const session = db.createSession('test-project');

      const taskId = db.createTask(
        session.id,
        'Implement feature',
        'Add new functionality',
        ['task-1', 'task-2']
      );

      expect(taskId).toBeDefined();

      const tasks = db.getTasks(session.id);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toBe('Implement feature');
      expect(JSON.parse(tasks[0].dependencies)).toEqual(['task-1', 'task-2']);
    });

    it('should update task status', () => {
      const session = db.createSession('test-project');
      const taskId = db.createTask(session.id, 'Test task', 'Description');

      db.updateTaskStatus(taskId, 'in_progress');
      let tasks = db.getTasks(session.id);
      expect(tasks[0].status).toBe('in_progress');

      db.updateTaskStatus(taskId, 'completed');
      tasks = db.getTasks(session.id);
      expect(tasks[0].status).toBe('completed');
      expect(tasks[0].completed_at).toBeDefined();
    });

    it('should filter tasks by status', () => {
      const session = db.createSession('test-project');

      const task1 = db.createTask(session.id, 'Task 1', 'Desc 1');
      const task2 = db.createTask(session.id, 'Task 2', 'Desc 2');
      const task3 = db.createTask(session.id, 'Task 3', 'Desc 3');

      db.updateTaskStatus(task1, 'completed');
      db.updateTaskStatus(task2, 'in_progress');

      const completed = db.getTasks(session.id, 'completed');
      const inProgress = db.getTasks(session.id, 'in_progress');
      const pending = db.getTasks(session.id, 'pending');

      expect(completed).toHaveLength(1);
      expect(inProgress).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });
  });

  describe('Agent Context', () => {
    it('should save agent findings', () => {
      const session = db.createSession('test-project');
      const findings = { patterns: ['pattern1', 'pattern2'], risks: [] };

      db.saveAgentContext(
        session.id,
        'PatternScout',
        'brainstorm',
        findings,
        0.85
      );

      const contexts = db.getAgentContexts(session.id);
      expect(contexts).toHaveLength(1);
      expect(contexts[0].agent_name).toBe('PatternScout');
      expect(contexts[0].confidence).toBe(0.85);
      expect(JSON.parse(contexts[0].findings)).toEqual(findings);
    });

    it('should filter agent contexts by phase', () => {
      const session = db.createSession('test-project');

      db.saveAgentContext(session.id, 'Agent1', 'brainstorm', {}, 0.7);
      db.saveAgentContext(session.id, 'Agent2', 'specify', {}, 0.8);
      db.saveAgentContext(session.id, 'Agent3', 'brainstorm', {}, 0.9);

      const brainstormContexts = db.getAgentContexts(session.id, 'brainstorm');
      expect(brainstormContexts).toHaveLength(2);

      const allContexts = db.getAgentContexts(session.id);
      expect(allContexts).toHaveLength(3);
    });
  });

  describe('Constitution Management', () => {
    it('should save and retrieve constitution', () => {
      const rules = {
        tdd: 'Always write tests first',
        quality: 'Never compromise on quality',
        questioning: 'Question everything until 85% confidence'
      };

      db.saveConstitution('test-project', rules);
      const retrieved = db.getConstitution('test-project');

      expect(retrieved).toEqual(rules);
    });

    it('should update existing constitution', () => {
      const rules1 = { rule1: 'First version' };
      const rules2 = { rule1: 'Updated version', rule2: 'New rule' };

      db.saveConstitution('test-project', rules1);
      db.saveConstitution('test-project', rules2);

      const retrieved = db.getConstitution('test-project');
      expect(retrieved).toEqual(rules2);
    });

    it('should return undefined for non-existent constitution', () => {
      const constitution = db.getConstitution('non-existent');
      expect(constitution).toBeUndefined();
    });
  });

  describe('Transaction Support', () => {
    it('should rollback transaction on error', () => {
      const session = db.createSession('test-project');

      try {
        db.transaction(() => {
          db.createTask(session.id, 'Task 1', 'Description 1');
          db.createTask(session.id, 'Task 2', 'Description 2');
          throw new Error('Transaction error');
        });
      } catch (error) {
        // Expected error
      }

      const tasks = db.getTasks(session.id);
      expect(tasks).toHaveLength(0);
    });

    it('should commit transaction on success', () => {
      const session = db.createSession('test-project');

      db.transaction(() => {
        db.createTask(session.id, 'Task 1', 'Description 1');
        db.createTask(session.id, 'Task 2', 'Description 2');
        return true;
      });

      const tasks = db.getTasks(session.id);
      expect(tasks).toHaveLength(2);
    });
  });

  describe('Database Initialization', () => {
    it('should create database file in correct location', () => {
      expect(existsSync(join(testProjectPath, '.nexus', 'nexus.db'))).toBe(true);
    });

    it('should handle concurrent connections', () => {
      const db2 = new DatabaseManager(testProjectPath);

      const session1 = db.createSession('project1');
      const session2 = db2.createSession('project2');

      expect(db2.getSession(session1.id)).toBeDefined();
      expect(db.getSession(session2.id)).toBeDefined();

      db2.close();
    });
  });
});