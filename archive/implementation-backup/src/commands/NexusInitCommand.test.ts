/**
 * Test suite for NexusInitCommand
 *
 * Tests the initialization of the Nexus workflow system including:
 * - Directory structure creation
 * - Database initialization
 * - TDD commitment flow
 * - Constitution generation
 * - Error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NexusInitCommand, InitCommandConfig } from './NexusInitCommand.js';
import { existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import * as inquirer from 'inquirer';

// Mock inquirer for testing prompts
vi.mock('inquirer');

describe('NexusInitCommand', () => {
  const testProjectPath = '/tmp/test-nexus-init';
  const nexusDir = join(testProjectPath, '.nexus');

  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(testProjectPath)) {
      rmSync(testProjectPath, { recursive: true, force: true });
    }

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(testProjectPath)) {
      rmSync(testProjectPath, { recursive: true, force: true });
    }
  });

  describe('Directory Structure', () => {
    it('should create .nexus directory structure', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true, // Skip for this test
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      expect(existsSync(join(nexusDir, 'current'))).toBe(true);
      expect(existsSync(join(nexusDir, 'archive'))).toBe(true);
      expect(existsSync(join(nexusDir, 'cache'))).toBe(true);
    });

    it('should fail if .nexus already exists without force flag', async () => {
      // Create existing .nexus directory
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command1 = new NexusInitCommand(config);
      await command1.run();

      // Try to initialize again without force
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ proceed: false });

      const command2 = new NexusInitCommand(config);
      const result = await command2.run();

      expect(result.success).toBe(false);
      expect(result.message).toContain('cancelled');
    });

    it('should reinitialize with force flag', async () => {
      const config1: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command1 = new NexusInitCommand(config1);
      await command1.run();

      // Reinitialize with force flag
      const config2: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
        force: true,
      };

      const command2 = new NexusInitCommand(config2);
      const result = await command2.run();

      expect(result.success).toBe(true);
      expect(existsSync(nexusDir)).toBe(true);
    });
  });

  describe('TDD Commitment', () => {
    it('should require TDD commitment by default', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
      };

      // Mock user declining TDD commitment
      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ commitment: false });

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(false);
      expect(result.message).toContain('TDD commitment is required');
      // Directory should be cleaned up
      expect(existsSync(nexusDir)).toBe(false);
    });

    it('should accept TDD commitment and proceed', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
      };

      // Mock user accepting TDD commitment
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ commitment: true })
        .mockResolvedValueOnce({ explicitConfirm: 'I COMMIT TO TDD' })
        .mockResolvedValueOnce({ developerName: 'Test Developer' });

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      // Constitution should be generated
      expect(existsSync(join(nexusDir, 'current', 'constitution.md'))).toBe(true);
    });

    it('should require exact commitment phrase', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
      };

      // Mock user with incorrect phrase first, then correct
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ commitment: true })
        .mockResolvedValueOnce({ explicitConfirm: 'yes' }) // Wrong phrase
        .mockResolvedValueOnce({ explicitConfirm: 'I COMMIT TO TDD' }) // Correct phrase
        .mockResolvedValueOnce({ developerName: 'Test Developer' });

      const command = new NexusInitCommand(config);
      const result = await command.run();

      // Should eventually succeed after correct phrase
      expect(result.success).toBe(true);
    });

    it('should skip TDD commitment with skipTddCommitment flag', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      // No inquirer prompts should have been called for TDD
      expect(vi.mocked(inquirer.prompt)).not.toHaveBeenCalled();
    });
  });

  describe('Database Initialization', () => {
    it('should create SQLite database', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      expect(existsSync(join(nexusDir, 'nexus.db'))).toBe(true);
    });

    it('should initialize database tables', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);

      // Verify database was properly initialized
      expect(result.data).toBeDefined();
      expect(result.data?.sessionId).toBeDefined();
    });
  });

  describe('Constitution Generation', () => {
    it('should generate constitution with project name', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        projectName: 'test-project',
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);

      const constitutionPath = join(nexusDir, 'current', 'constitution.md');
      expect(existsSync(constitutionPath)).toBe(true);

      const constitution = readFileSync(constitutionPath, 'utf-8');
      expect(constitution).toContain('test-project');
      expect(constitution).toContain('Test-Driven Development');
    });

    it('should include developer name in constitution', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        projectName: 'test-project',
      };

      // Mock TDD commitment flow with developer name
      vi.mocked(inquirer.prompt)
        .mockResolvedValueOnce({ commitment: true })
        .mockResolvedValueOnce({ explicitConfirm: 'I COMMIT TO TDD' })
        .mockResolvedValueOnce({ developerName: 'John Doe' });

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);

      const constitutionPath = join(nexusDir, 'current', 'constitution.md');
      const constitution = readFileSync(constitutionPath, 'utf-8');
      expect(constitution).toContain('John Doe');
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors gracefully', async () => {
      const config: InitCommandConfig = {
        projectPath: '/invalid/path/that/does/not/exist',
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should clean up on initialization failure', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        // Don't skip TDD, and mock rejection
      };

      vi.mocked(inquirer.prompt).mockResolvedValueOnce({ commitment: false });

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(false);
      // .nexus directory should not exist after cleanup
      expect(existsSync(nexusDir)).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should create and track session ID', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      expect(result.data?.sessionId).toBeDefined();
      expect(typeof result.data?.sessionId).toBe('string');
      expect(result.data?.sessionId.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Templates', () => {
    it('should create initial pattern templates', async () => {
      const config: InitCommandConfig = {
        projectPath: testProjectPath,
        skipTddCommitment: true,
      };

      const command = new NexusInitCommand(config);
      const result = await command.run();

      expect(result.success).toBe(true);
      // Patterns should be initialized in the database
      expect(result.message).toContain('successfully');
    });
  });
});