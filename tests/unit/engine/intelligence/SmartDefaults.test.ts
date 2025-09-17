import { SmartDefaults, ProjectContext, DefaultGenerationRequest } from '../../../../src/engine/intelligence/SmartDefaults';

describe('SmartDefaults', () => {
  let smartDefaults: SmartDefaults;
  let mockProjectContext: ProjectContext;

  beforeEach(() => {
    smartDefaults = new SmartDefaults();
    mockProjectContext = {
      framework: 'react',
      language: 'typescript',
      architecture_pattern: 'mvc',
      existing_patterns: ['hooks', 'components'],
      team_preferences: {
        test_framework: 'jest',
        styling: 'css-modules'
      },
      constitutional_rules: []
    };
  });

  describe('generateDefaults', () => {
    it('should generate intelligent default for test framework', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result).toMatchObject({
        key: 'test_framework',
        confidence: expect.any(Number),
        source: expect.objectContaining({
          type: expect.any(String),
          name: expect.any(String),
          reliability_score: expect.any(Number)
        }),
        reasoning: expect.any(String),
        alternatives: expect.any(Array),
        validation_rules: expect.any(Array),
        context_factors: expect.any(Array),
        timestamp: expect.any(Date),
        metadata: expect.objectContaining({
          generator_version: '1.0.0',
          generation_time_ms: expect.any(Number),
          factors_considered: expect.any(Number)
        })
      });
    });

    it('should respect constitutional rules with maximum confidence', async () => {
      const constitutionalContext = {
        ...mockProjectContext,
        constitutional_rules: [{
          id: 'test-rule',
          name: 'TDD Required',
          description: 'All code must have tests',
          category: 'quality',
          enforcement_level: 'blocking' as const,
          applies_to: ['defaults'],
          enforcement_context: ['test_framework'],
          violation_message: 'Tests are required',
          auto_fix: false
        }]
      };

      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: constitutionalContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.source.type).toBe('constitutional_rule');
    });

    it('should provide alternatives for decision making', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.alternatives).toHaveLength(expect.any(Number));
      if (result.alternatives.length > 0) {
        expect(result.alternatives[0]).toMatchObject({
          value: expect.anything(),
          reasoning: expect.any(String),
          confidence: expect.any(Number),
          trade_offs: expect.any(Array),
          when_to_use: expect.any(String)
        });
      }
    });

    it('should generate validation rules for the default', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.validation_rules.length).toBeGreaterThan(0);
      expect(result.validation_rules[0]).toMatchObject({
        rule: expect.any(String),
        description: expect.any(String),
        severity: expect.stringMatching(/^(error|warning|info)$/),
        auto_fix: expect.any(Boolean)
      });
    });

    it('should analyze context factors that influence decisions', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.context_factors.length).toBeGreaterThan(0);
      expect(result.context_factors[0]).toMatchObject({
        factor: expect.any(String),
        influence: expect.any(Number),
        description: expect.any(String),
        source_data: expect.any(Object)
      });
    });
  });

  describe('generateProfile', () => {
    it('should generate comprehensive defaults profile', async () => {
      const profile = await smartDefaults.generateProfile(mockProjectContext);

      expect(profile).toMatchObject({
        profile_name: expect.stringContaining('react_typescript'),
        description: expect.any(String),
        defaults: expect.any(Object),
        confidence_threshold: expect.any(Number),
        auto_apply_threshold: expect.any(Number),
        review_threshold: expect.any(Number),
        last_updated: expect.any(Date)
      });

      // Check that common defaults are included
      expect(Object.keys(profile.defaults)).toContain('test_framework');
      expect(Object.keys(profile.defaults)).toContain('logging_level');
      expect(Object.keys(profile.defaults)).toContain('error_handling_strategy');
    });

    it('should include metadata for each default in profile', async () => {
      const profile = await smartDefaults.generateProfile(mockProjectContext);

      const firstDefault = Object.values(profile.defaults)[0];
      expect(firstDefault.metadata).toMatchObject({
        generator_version: '1.0.0',
        generation_time_ms: expect.any(Number),
        factors_considered: expect.any(Number),
        fallback_used: expect.any(Boolean),
        override_allowed: expect.any(Boolean),
        review_recommended: expect.any(Boolean)
      });
    });
  });

  describe('applyDefaults', () => {
    it('should apply defaults based on confidence thresholds', async () => {
      const profile = await smartDefaults.generateProfile(mockProjectContext);

      const result = await smartDefaults.applyDefaults(profile);

      expect(result).toMatchObject({
        applied_values: expect.any(Object),
        skipped_keys: expect.any(Array),
        review_required: expect.any(Array),
        conflicts: expect.any(Array),
        summary: expect.objectContaining({
          total_defaults: expect.any(Number),
          auto_applied: expect.any(Number),
          review_required: expect.any(Number),
          skipped: expect.any(Number),
          conflicts: expect.any(Number)
        })
      });
    });

    it('should respect user overrides', async () => {
      const profile = await smartDefaults.generateProfile(mockProjectContext);
      const overrides = { test_framework: 'vitest' };

      const result = await smartDefaults.applyDefaults(profile, overrides);

      expect(result.applied_values.test_framework).toBe('vitest');
    });

    it('should provide summary statistics', async () => {
      const profile = await smartDefaults.generateProfile(mockProjectContext);

      const result = await smartDefaults.applyDefaults(profile);

      expect(result.summary.total_defaults).toBeGreaterThan(0);
      expect(result.summary.auto_applied + result.summary.review_required + result.summary.skipped)
        .toBe(result.summary.total_defaults);
    });
  });

  describe('confidence scoring', () => {
    it('should assign higher confidence to framework conventions', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      // Framework-specific defaults should have reasonable confidence
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should assign maximum confidence to constitutional rules', async () => {
      const constitutionalContext = {
        ...mockProjectContext,
        constitutional_rules: [{
          id: 'mandatory-test',
          name: 'Mandatory Testing',
          description: 'Testing framework must be specified',
          category: 'quality',
          enforcement_level: 'blocking' as const,
          applies_to: ['defaults'],
          enforcement_context: ['test_framework'],
          violation_message: 'Test framework is mandatory',
          auto_fix: false
        }]
      };

      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: constitutionalContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });
  });

  describe('reasoning generation', () => {
    it('should provide clear reasoning for default selection', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      expect(result.reasoning).toBeTruthy();
      expect(result.reasoning.length).toBeGreaterThan(10);
      expect(result.reasoning).toContain('Selected based on');
    });

    it('should explain confidence levels in reasoning', async () => {
      const request: DefaultGenerationRequest = {
        key: 'test_framework',
        context: mockProjectContext
      };

      const result = await smartDefaults.generateDefaults(request);

      if (result.confidence >= 0.9) {
        expect(result.reasoning).toContain('High confidence');
      } else if (result.confidence >= 0.6) {
        expect(result.reasoning).toContain('Medium confidence');
      } else {
        expect(result.reasoning).toContain('Low confidence');
      }
    });
  });
});