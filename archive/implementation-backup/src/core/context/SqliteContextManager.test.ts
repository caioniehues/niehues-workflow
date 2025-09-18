import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SqliteContextManager } from './SqliteContextManager.js';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  BrainstormContext,
  SpecificationContext,
  DecomposeContext,
  ImplementContext,
  AgentResult,
} from './IContextManager.js';

describe('SqliteContextManager', () => {
  let manager: SqliteContextManager;
  const testProjectPath = './test-context-manager';
  const testSessionId = 'test-session-123';

  beforeEach(async () => {
    // Clean up any existing test database
    if (existsSync(join(testProjectPath, '.nexus'))) {
      rmSync(join(testProjectPath, '.nexus'), { recursive: true, force: true });
    }
    manager = new SqliteContextManager();
  });

  afterEach(async () => {
    if (manager) {
      await manager.close();
    }
    // Clean up test database
    if (existsSync(join(testProjectPath, '.nexus'))) {
      rmSync(join(testProjectPath, '.nexus'), { recursive: true, force: true });
    }
    // Also clean up the default location
    if (existsSync('.nexus')) {
      rmSync('.nexus', { recursive: true, force: true });
    }
  });

  describe('Initialization', () => {
    it('should initialize with session ID and project path', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      expect(manager.getSessionId()).toBeDefined();
      expect(manager.getCurrentPhase()).toBe('init');
    });

    it('should throw error if initialized twice', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      await expect(
        manager.initialize('another-session', testProjectPath)
      ).rejects.toThrow('Context manager already initialized');
    });

    it('should throw error when using methods before initialization', async () => {
      await expect(manager.get('test')).rejects.toThrow(
        'Context manager not initialized'
      );
    });

    it('should create database directory structure', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      expect(existsSync(join(testProjectPath, '.nexus'))).toBe(true);
      expect(existsSync(join(testProjectPath, '.nexus', 'nexus.db'))).toBe(true);
    });

    it('should reuse existing session if ID matches', async () => {
      // First initialization
      await manager.initialize(testSessionId, testProjectPath);
      await manager.setCurrentPhase('brainstorm');
      const firstSessionId = manager.getSessionId();
      await manager.close();

      // Second initialization with same requested ID
      const manager2 = new SqliteContextManager();
      await manager2.initialize(firstSessionId, testProjectPath);

      expect(manager2.getSessionId()).toBe(firstSessionId);
      expect(manager2.getCurrentPhase()).toBe('brainstorm');

      await manager2.close();
    });
  });

  describe('Context Operations', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should set and get simple values', async () => {
      await manager.set('test-key', 'test-value');
      const value = await manager.get<string>('test-key');

      expect(value).toBe('test-value');
    });

    it('should set and get complex objects', async () => {
      const complexData = {
        name: 'test',
        nested: {
          array: [1, 2, 3],
          flag: true,
        },
      };

      await manager.set('complex', complexData);
      const retrieved = await manager.get('complex');

      expect(retrieved).toEqual(complexData);
    });

    it('should return undefined for non-existent keys', async () => {
      const value = await manager.get('non-existent');
      expect(value).toBeUndefined();
    });

    it('should respect TTL settings', async () => {
      // Set with very short TTL (negative means already expired)
      await manager.set('expired', 'value', { ttlHours: -1 });

      const value = await manager.get('expired');
      expect(value).toBeUndefined();
    });

    it('should throw error when overwrite is false and key exists', async () => {
      await manager.set('existing', 'value1');

      await expect(
        manager.set('existing', 'value2', { overwrite: false })
      ).rejects.toThrow('Context key "existing" already exists');
    });

    it('should overwrite when overwrite is not specified', async () => {
      await manager.set('key', 'value1');
      await manager.set('key', 'value2');

      const value = await manager.get('key');
      expect(value).toBe('value2');
    });

    it('should check if key exists', async () => {
      await manager.set('exists', 'value');

      expect(await manager.has('exists')).toBe(true);
      expect(await manager.has('not-exists')).toBe(false);
    });
  });

  describe('Phase Context Management', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should save and load brainstorm context', async () => {
      const brainstormContext: BrainstormContext = {
        topic: 'Test Topic',
        approaches: ['approach1', 'approach2'],
        selectedApproach: 'approach1',
        confidence: 0.85,
        questionsAsked: [],
        agentFindings: [],
      };

      await manager.savePhaseContext('brainstorm', brainstormContext);
      const loaded = await manager.loadPhaseContext('brainstorm');

      expect(loaded?.phase).toBe('brainstorm');
      expect(loaded?.data).toEqual(brainstormContext);
    });

    it('should save and load specification context', async () => {
      const specContext: SpecificationContext = {
        brainstorm: {
          topic: 'Test',
          approaches: [],
          confidence: 0.9,
          questionsAsked: [],
          agentFindings: [],
        },
        specification: 'Test spec',
        testScenarios: [
          {
            description: 'Test scenario',
            given: 'Given X',
            when: 'When Y',
            then: 'Then Z',
          },
        ],
        architecture: 'Test architecture',
        dataFlow: 'Test flow',
        synthesizedRecommendations: {
          sessionId: testSessionId,
          phase: 'specify',
          combinedConfidence: 0.88,
          recommendations: {},
          conflictsResolved: {},
          finalDecision: 'proceed',
        },
      };

      await manager.savePhaseContext('specify', specContext);
      const loaded = await manager.loadPhaseContext('specify');

      expect(loaded?.phase).toBe('specify');
      expect(loaded?.data).toEqual(specContext);
    });

    it('should save individual phase components', async () => {
      const brainstormContext: BrainstormContext = {
        topic: 'Component Test',
        approaches: ['a1', 'a2'],
        confidence: 0.75,
        questionsAsked: [],
        agentFindings: [],
      };

      await manager.savePhaseContext('brainstorm', brainstormContext);

      // Check individual components were saved
      expect(await manager.get('brainstorm:topic')).toBe('Component Test');
      expect(await manager.get('brainstorm:approaches')).toEqual(['a1', 'a2']);
      expect(await manager.get('brainstorm:confidence')).toBe(0.75);
    });

    it('should handle phase transitions', async () => {
      await manager.setCurrentPhase('brainstorm');
      expect(manager.getCurrentPhase()).toBe('brainstorm');

      await manager.setCurrentPhase('specify');
      expect(manager.getCurrentPhase()).toBe('specify');

      // Check transition metadata was saved
      expect(await manager.get('phase:current')).toBe('specify');
      expect(await manager.get('phase:specify:startTime')).toBeDefined();
    });

    it('should return undefined for non-existent phase context', async () => {
      const context = await manager.loadPhaseContext('brainstorm');
      expect(context).toBeUndefined();
    });
  });

  describe('Agent Context Sharing', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should share agent context', async () => {
      const agentData = {
        patterns: ['pattern1', 'pattern2'],
        risks: [],
      };

      await manager.shareAgentContext('PatternScout', agentData, 0.85);

      const contexts = await manager.getAgentContexts();
      expect(contexts).toHaveLength(1);
      expect(contexts[0].agent_name).toBe('PatternScout');
      expect(contexts[0].confidence).toBe(0.85);
      expect(JSON.parse(contexts[0].findings)).toEqual(agentData);
    });

    it('should throw error for invalid confidence values', async () => {
      await expect(
        manager.shareAgentContext('Agent', {}, -0.1)
      ).rejects.toThrow('Confidence must be between 0 and 1');

      await expect(
        manager.shareAgentContext('Agent', {}, 1.1)
      ).rejects.toThrow('Confidence must be between 0 and 1');
    });

    it('should filter agent contexts by phase', async () => {
      await manager.shareAgentContext('Agent1', { data: 1 }, 0.7);

      await manager.setCurrentPhase('specify');
      await manager.shareAgentContext('Agent2', { data: 2 }, 0.8);
      await manager.shareAgentContext('Agent3', { data: 3 }, 0.9);

      const specifyContexts = await manager.getAgentContexts('specify');
      expect(specifyContexts).toHaveLength(2);

      const allContexts = await manager.getAgentContexts();
      expect(allContexts).toHaveLength(3);
    });

    it('should save agent context as regular context too', async () => {
      await manager.shareAgentContext('TestAgent', { result: 'test' }, 0.95);

      const saved = await manager.get('agent:TestAgent:init');
      expect(saved).toEqual({ data: { result: 'test' }, confidence: 0.95 });
    });
  });

  describe('Key Pattern Matching', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should get all keys without pattern', async () => {
      await manager.set('key1', 'value1');
      await manager.set('key2', 'value2');
      await manager.set('key3', 'value3');

      const keys = await manager.getKeys();
      // Filter out system keys like 'requested_session_id'
      const userKeys = keys.filter(k => k.startsWith('key'));
      expect(userKeys).toHaveLength(3);
      expect(userKeys).toContain('key1');
      expect(userKeys).toContain('key2');
      expect(userKeys).toContain('key3');
    });

    it('should match keys with wildcard pattern', async () => {
      await manager.set('prefix:key1', 'value1');
      await manager.set('prefix:key2', 'value2');
      await manager.set('other:key3', 'value3');

      const keys = await manager.getKeys('prefix:*');
      expect(keys).toHaveLength(2);
      expect(keys).toContain('prefix:key1');
      expect(keys).toContain('prefix:key2');
    });

    it('should handle complex wildcard patterns', async () => {
      await manager.set('agent:Scout:brainstorm', 'data1');
      await manager.set('agent:Hunter:brainstorm', 'data2');
      await manager.set('agent:Scout:specify', 'data3');

      const brainstormAgents = await manager.getKeys('agent:*:brainstorm');
      expect(brainstormAgents).toHaveLength(2);

      const scoutContexts = await manager.getKeys('agent:Scout:*');
      expect(scoutContexts).toHaveLength(2);
    });
  });

  describe('Invalidation and Cleanup', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should invalidate specific keys', async () => {
      await manager.set('to-invalidate', 'value');
      expect(await manager.has('to-invalidate')).toBe(true);

      await manager.invalidate('to-invalidate');
      expect(await manager.has('to-invalidate')).toBe(false);
    });

    it('should invalidate entire phase', async () => {
      await manager.setCurrentPhase('brainstorm');
      await manager.set('brainstorm:item1', 'value1');
      await manager.set('brainstorm:item2', 'value2');
      await manager.savePhaseContext('brainstorm', {
        topic: 'test',
        approaches: [],
        confidence: 0.5,
        questionsAsked: [],
        agentFindings: [],
      });

      await manager.invalidatePhase('brainstorm');

      expect(await manager.has('brainstorm:item1')).toBe(false);
      expect(await manager.has('brainstorm:item2')).toBe(false);
      expect(await manager.loadPhaseContext('brainstorm')).toBeUndefined();
    });

    it('should clean expired entries', async () => {
      // Set entries with different TTLs
      await manager.set('keep', 'value', { ttlHours: 1 });
      await manager.set('expire1', 'value', { ttlHours: -1 });
      await manager.set('expire2', 'value', { ttlHours: -1 });

      const cleaned = await manager.cleanExpired();
      expect(cleaned).toBe(2);

      expect(await manager.has('keep')).toBe(true);
      expect(await manager.has('expire1')).toBe(false);
      expect(await manager.has('expire2')).toBe(false);
    });

    it('should clear all context for session', async () => {
      await manager.set('key1', 'value1');
      await manager.set('key2', 'value2');
      await manager.shareAgentContext('Agent', {}, 0.5);

      await manager.clear();

      expect(await manager.has('key1')).toBe(false);
      expect(await manager.has('key2')).toBe(false);
      expect(await manager.getAgentContexts()).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await manager.initialize(testSessionId, testProjectPath);
    });

    it('should provide usage statistics', async () => {
      await manager.set('active1', 'value', { ttlHours: 1 });
      await manager.set('active2', 'value', { ttlHours: 1 });
      await manager.set('expired', 'value', { ttlHours: -1 });

      await manager.shareAgentContext('Agent1', {}, 0.8);
      await manager.shareAgentContext('Agent2', {}, 0.9);

      const stats = await manager.getStats();

      // Note: Agent contexts are also saved as regular context, so total is higher
      // requested_session_id + active1 + active2 + expired + 2 agent contexts = 6
      expect(stats.totalEntries).toBeGreaterThanOrEqual(5);
      expect(stats.expiredEntries).toBeGreaterThanOrEqual(1);
      expect(stats.activeEntries).toBeGreaterThanOrEqual(2);
      expect(stats.agentContexts).toBe(2);
      expect(stats.phasesUsed).toContain('init');
    });

    it('should track phases used', async () => {
      await manager.set('init-data', 'value');

      await manager.setCurrentPhase('brainstorm');
      await manager.set('brainstorm-data', 'value');

      await manager.setCurrentPhase('specify');
      await manager.set('specify-data', 'value');

      const stats = await manager.getStats();
      expect(stats.phasesUsed).toHaveLength(3);
      expect(stats.phasesUsed).toContain('init');
      expect(stats.phasesUsed).toContain('brainstorm');
      expect(stats.phasesUsed).toContain('specify');
    });
  });

  describe('Session Management', () => {
    it('should handle session lifecycle', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      // Set data in init phase (default)
      await manager.set('init-data', 'init-value');

      // Move to brainstorm and set data
      await manager.setCurrentPhase('brainstorm');
      await manager.set('brainstorm-data', 'brainstorm-value');

      // Save session ID before closing
      const savedSessionId = manager.getSessionId();

      // Close should update session status
      await manager.close();

      // Reinitialize with the same session ID
      const manager2 = new SqliteContextManager();
      await manager2.initialize(savedSessionId, testProjectPath);

      // Phase should be preserved from the session
      expect(manager2.getCurrentPhase()).toBe('brainstorm');

      // Check that brainstorm data is accessible
      expect(await manager2.get('brainstorm-data')).toBe('brainstorm-value');

      // Switch back to init phase and check that data
      await manager2.setCurrentPhase('init');
      expect(await manager2.get('init-data')).toBe('init-value');

      await manager2.close();
    });

    it('should clean expired entries on close', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      await manager.set('expired1', 'value', { ttlHours: -1 });
      await manager.set('expired2', 'value', { ttlHours: -1 });
      await manager.set('keep', 'value', { ttlHours: 1 });

      // Save session ID before closing
      const savedSessionId = manager.getSessionId();

      await manager.close();

      // Reinitialize and check
      const manager2 = new SqliteContextManager();
      await manager2.initialize(savedSessionId, testProjectPath);

      expect(await manager2.has('expired1')).toBe(false);
      expect(await manager2.has('expired2')).toBe(false);
      expect(await manager2.has('keep')).toBe(true);

      await manager2.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle close on uninitialized manager', async () => {
      await expect(manager.close()).resolves.not.toThrow();
    });

    it('should handle invalid phase names', async () => {
      await manager.initialize(testSessionId, testProjectPath);

      await expect(
        manager.loadPhaseContext('invalid' as any)
      ).rejects.toThrow('Unknown phase: invalid');
    });

    it('should isolate sessions', async () => {
      // First session
      await manager.initialize('session1', testProjectPath);
      await manager.set('key', 'value1');
      const session1Id = manager.getSessionId();
      await manager.close();

      // Second session
      const manager2 = new SqliteContextManager();
      await manager2.initialize('session2', testProjectPath);
      await manager2.set('key', 'value2');
      const session2Id = manager2.getSessionId();

      // Sessions should be different
      expect(session1Id).not.toBe(session2Id);

      // First session's data should be isolated
      const manager3 = new SqliteContextManager();
      await manager3.initialize(session1Id, testProjectPath);
      expect(await manager3.get('key')).toBe('value1');

      await manager2.close();
      await manager3.close();
    });
  });
});