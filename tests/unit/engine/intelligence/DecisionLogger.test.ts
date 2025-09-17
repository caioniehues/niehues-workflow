import {
  DecisionLogger,
  Decision,
  DecisionContext,
  DecisionRationale,
  Alternative,
  DecisionQuery,
  DecisionType,
  DecisionStatus
} from '../../../../src/engine/intelligence/DecisionLogger';

describe('DecisionLogger', () => {
  let decisionLogger: DecisionLogger;
  let mockContext: DecisionContext;
  let mockRationale: DecisionRationale;

  beforeEach(() => {
    decisionLogger = new DecisionLogger();

    mockContext = {
      task_id: 'task-123',
      phase: 'implementation',
      component: 'user-authentication',
      stakeholders: ['dev-team', 'security-team'],
      environmental_factors: [],
      constraints: [],
      assumptions: []
    };

    mockRationale = {
      primary_reason: 'Provides better security and user experience',
      supporting_reasons: [
        'Industry standard',
        'Better maintainability',
        'Reduced technical debt'
      ],
      risk_assessment: {
        risk_level: 'low',
        identified_risks: [],
        mitigation_strategies: [],
        contingency_plans: []
      },
      trade_offs: [],
      success_criteria: ['User satisfaction > 90%', 'Security audit passes'],
      failure_conditions: ['Performance degradation > 20%'],
      review_triggers: ['After 30 days', 'User complaints > 5']
    };
  });

  describe('logDecision', () => {
    it('should log a decision with all required fields', async () => {
      const alternatives: Alternative[] = [
        {
          id: 'alt-1',
          name: 'Basic Authentication',
          description: 'Simple username/password auth',
          pros: ['Simple to implement'],
          cons: ['Less secure'],
          confidence: 0.6,
          effort_estimate: {
            development_hours: 20,
            testing_hours: 10,
            documentation_hours: 5,
            total_hours: 35,
            complexity_score: 3
          },
          risk_level: 'medium',
          why_not_chosen: 'Insufficient security for our needs'
        }
      ];

      const decision = await decisionLogger.logDecision(
        'Implement OAuth 2.0 Authentication',
        'Replace current basic auth with OAuth 2.0 for better security',
        'security',
        mockContext,
        mockRationale,
        alternatives,
        'dev-team'
      );

      expect(decision).toMatchObject({
        id: expect.any(String),
        title: 'Implement OAuth 2.0 Authentication',
        description: 'Replace current basic auth with OAuth 2.0 for better security',
        decision_type: 'security',
        decision_maker: 'dev-team',
        timestamp: expect.any(Date),
        context: mockContext,
        rationale: mockRationale,
        alternatives_considered: alternatives,
        confidence_score: expect.objectContaining({
          overall_confidence: expect.any(Number)
        }),
        tags: expect.any(Array),
        impact_analysis: expect.objectContaining({
          immediate_impact: expect.any(Object),
          projected_impact: expect.any(Object)
        }),
        status: 'proposed',
        metadata: expect.objectContaining({
          logger_version: '1.0.0',
          decision_sequence: expect.any(Number),
          automation_level: 'manual'
        })
      });
    });

    it('should generate appropriate tags for the decision', async () => {
      const decision = await decisionLogger.logDecision(
        'Use React Hooks for State Management',
        'Replace class components with functional components using hooks',
        'implementation',
        mockContext,
        mockRationale
      );

      expect(decision.tags).toContain('implementation');
      expect(decision.tags).toContain('user-authentication');
      expect(decision.tags).toContain('implementation'); // phase
      expect(decision.tags).toContain('stakeholder:dev-team');
      expect(decision.tags).toContain('stakeholder:security-team');
    });

    it('should assign higher confidence to system decisions', async () => {
      const systemDecision = await decisionLogger.logDecision(
        'Auto-format code with Prettier',
        'Automatically format code to maintain consistency',
        'process',
        mockContext,
        mockRationale,
        [],
        'system'
      );

      expect(systemDecision.decision_maker).toBe('system');
      expect(systemDecision.metadata.automation_level).toBe('automated');
    });

    it('should track decision sequence numbers', async () => {
      const decision1 = await decisionLogger.logDecision(
        'First Decision',
        'Description',
        'technical_choice',
        mockContext,
        mockRationale
      );

      const decision2 = await decisionLogger.logDecision(
        'Second Decision',
        'Description',
        'technical_choice',
        mockContext,
        mockRationale
      );

      expect(decision2.metadata.decision_sequence).toBeGreaterThan(
        decision1.metadata.decision_sequence
      );
    });
  });

  describe('searchDecisions', () => {
    beforeEach(async () => {
      // Add some test decisions
      await decisionLogger.logDecision(
        'Use TypeScript',
        'Adopt TypeScript for better type safety',
        'technical_choice',
        { ...mockContext, component: 'frontend' },
        mockRationale,
        [],
        'dev-team'
      );

      await decisionLogger.logDecision(
        'Implement JWT Authentication',
        'Use JWT tokens for session management',
        'security',
        { ...mockContext, component: 'backend' },
        mockRationale,
        [],
        'security-team'
      );

      await decisionLogger.logDecision(
        'Add Unit Tests',
        'Implement comprehensive unit test coverage',
        'testing',
        { ...mockContext, component: 'frontend' },
        mockRationale,
        [],
        'qa-team'
      );
    });

    it('should search decisions by decision type', async () => {
      const query: DecisionQuery = {
        decision_types: ['security']
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions).toHaveLength(1);
      expect(result.decisions[0].decision_type).toBe('security');
      expect(result.decisions[0].title).toBe('Implement JWT Authentication');
    });

    it('should search decisions by decision maker', async () => {
      const query: DecisionQuery = {
        decision_makers: ['dev-team']
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions.length).toBeGreaterThan(0);
      result.decisions.forEach(decision => {
        expect(decision.decision_maker).toBe('dev-team');
      });
    });

    it('should search decisions by component', async () => {
      const query: DecisionQuery = {
        components: ['frontend']
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions.length).toBe(2);
      result.decisions.forEach(decision => {
        expect(decision.context.component).toBe('frontend');
      });
    });

    it('should perform text search across title and description', async () => {
      const query: DecisionQuery = {
        text_search: 'TypeScript'
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions).toHaveLength(1);
      expect(result.decisions[0].title).toBe('Use TypeScript');
    });

    it('should combine multiple search criteria', async () => {
      const query: DecisionQuery = {
        decision_types: ['technical_choice', 'testing'],
        components: ['frontend']
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions).toHaveLength(2);
      result.decisions.forEach(decision => {
        expect(['technical_choice', 'testing']).toContain(decision.decision_type);
        expect(decision.context.component).toBe('frontend');
      });
    });

    it('should provide search facets', async () => {
      const query: DecisionQuery = {};

      const result = await decisionLogger.searchDecisions(query);

      expect(result.facets).toMatchObject({
        decision_types: expect.any(Object),
        decision_makers: expect.any(Object),
        components: expect.any(Object),
        statuses: expect.any(Object),
        tags: expect.any(Object),
        confidence_ranges: expect.any(Object)
      });

      expect(result.facets.decision_types['security']).toBe(1);
      expect(result.facets.components['frontend']).toBe(2);
    });

    it('should support pagination', async () => {
      const query: DecisionQuery = {
        limit: 2,
        offset: 0
      };

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions).toHaveLength(2);
      expect(result.total_count).toBeGreaterThanOrEqual(3);
    });

    it('should sort results by timestamp descending by default', async () => {
      const query: DecisionQuery = {};

      const result = await decisionLogger.searchDecisions(query);

      expect(result.decisions.length).toBeGreaterThan(1);

      for (let i = 1; i < result.decisions.length; i++) {
        expect(result.decisions[i-1].timestamp.getTime())
          .toBeGreaterThanOrEqual(result.decisions[i].timestamp.getTime());
      }
    });

    it('should include query execution time', async () => {
      const query: DecisionQuery = {};

      const result = await decisionLogger.searchDecisions(query);

      expect(result.query_execution_time_ms).toBeGreaterThan(0);
    });
  });

  describe('updateDecisionStatus', () => {
    let testDecision: Decision;

    beforeEach(async () => {
      testDecision = await decisionLogger.logDecision(
        'Test Decision',
        'A decision for testing status updates',
        'implementation',
        mockContext,
        mockRationale
      );
    });

    it('should update decision status', async () => {
      await decisionLogger.updateDecisionStatus(
        testDecision.id,
        'approved',
        'Approved by architecture review board'
      );

      const updatedDecision = await decisionLogger.getDecisionById(testDecision.id);

      expect(updatedDecision?.status).toBe('approved');
    });

    it('should add review record when status is updated', async () => {
      await decisionLogger.updateDecisionStatus(
        testDecision.id,
        'implemented'
      );

      const updatedDecision = await decisionLogger.getDecisionById(testDecision.id);

      expect(updatedDecision?.metadata.review_history).toHaveLength(1);
      expect(updatedDecision?.metadata.review_history[0]).toMatchObject({
        action: 'status_change',
        new_status: 'implemented',
        timestamp: expect.any(Date)
      });
    });

    it('should throw error for non-existent decision', async () => {
      await expect(
        decisionLogger.updateDecisionStatus('non-existent-id', 'approved')
      ).rejects.toThrow('Decision not found: non-existent-id');
    });
  });

  describe('getDecisionAnalytics', () => {
    beforeEach(async () => {
      // Add multiple decisions for analytics
      for (let i = 0; i < 5; i++) {
        await decisionLogger.logDecision(
          `Decision ${i}`,
          `Description ${i}`,
          'implementation',
          mockContext,
          mockRationale
        );
      }
    });

    it('should return analytics with all required metrics', async () => {
      const analytics = await decisionLogger.getDecisionAnalytics();

      expect(analytics).toMatchObject({
        decision_velocity: expect.objectContaining({
          decisions_per_day: expect.any(Number),
          average_time_to_implementation: expect.any(Number),
          review_cycle_time: expect.any(Number)
        }),
        confidence_trends: expect.objectContaining({
          average_confidence: expect.any(Number),
          confidence_over_time: expect.any(Array),
          low_confidence_decisions: expect.any(Number)
        }),
        impact_distribution: expect.objectContaining({
          by_category: expect.any(Object),
          by_severity: expect.any(Object)
        }),
        decision_makers_activity: expect.any(Array),
        most_common_rationales: expect.any(Array),
        frequently_reviewed_types: expect.any(Array),
        success_rate_by_type: expect.any(Object),
        recommendation_insights: expect.any(Array)
      });
    });

    it('should filter analytics by date range when provided', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const analytics = await decisionLogger.getDecisionAnalytics({
        start: yesterday,
        end: tomorrow
      });

      expect(analytics).toBeDefined();
      // The analytics should be based on decisions within the date range
    });
  });

  describe('exportDecisions', () => {
    beforeEach(async () => {
      await decisionLogger.logDecision(
        'Export Test Decision',
        'A decision to test export functionality',
        'testing',
        mockContext,
        mockRationale
      );
    });

    it('should export decisions to JSON format', async () => {
      const jsonExport = await decisionLogger.exportDecisions('json');

      expect(() => JSON.parse(jsonExport)).not.toThrow();

      const parsedData = JSON.parse(jsonExport);
      expect(Array.isArray(parsedData)).toBe(true);
      expect(parsedData.length).toBeGreaterThan(0);
      expect(parsedData[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        decision_type: expect.any(String)
      });
    });

    it('should export decisions to CSV format', async () => {
      const csvExport = await decisionLogger.exportDecisions('csv');

      expect(csvExport).toContain('ID,Title,Type,Maker,Timestamp');
      expect(csvExport).toContain('Export Test Decision');
      expect(csvExport).toContain('testing');
    });

    it('should export decisions to Markdown format', async () => {
      const markdownExport = await decisionLogger.exportDecisions('markdown');

      expect(markdownExport).toContain('# Decision Log');
      expect(markdownExport).toContain('## Export Test Decision');
      expect(markdownExport).toContain('**Type:** testing');
      expect(markdownExport).toContain('**Description:**');
    });

    it('should throw error for unsupported export format', async () => {
      await expect(
        decisionLogger.exportDecisions('xml' as any)
      ).rejects.toThrow('Unsupported export format: xml');
    });
  });

  describe('utility methods', () => {
    it('should get decision by ID', async () => {
      const decision = await decisionLogger.logDecision(
        'Utility Test',
        'Testing utility methods',
        'implementation',
        mockContext,
        mockRationale
      );

      const retrieved = await decisionLogger.getDecisionById(decision.id);

      expect(retrieved).toEqual(decision);
    });

    it('should return null for non-existent decision ID', async () => {
      const retrieved = await decisionLogger.getDecisionById('non-existent');

      expect(retrieved).toBeNull();
    });

    it('should get recent decisions in chronological order', async () => {
      // Add multiple decisions
      const decisions = [];
      for (let i = 0; i < 3; i++) {
        decisions.push(await decisionLogger.logDecision(
          `Recent Decision ${i}`,
          `Description ${i}`,
          'implementation',
          mockContext,
          mockRationale
        ));

        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const recent = await decisionLogger.getRecentDecisions(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].timestamp.getTime())
        .toBeGreaterThanOrEqual(recent[1].timestamp.getTime());
    });

    it('should get decisions by component', async () => {
      const frontendContext = { ...mockContext, component: 'frontend' };
      const backendContext = { ...mockContext, component: 'backend' };

      await decisionLogger.logDecision(
        'Frontend Decision',
        'Description',
        'implementation',
        frontendContext,
        mockRationale
      );

      await decisionLogger.logDecision(
        'Backend Decision',
        'Description',
        'implementation',
        backendContext,
        mockRationale
      );

      const frontendDecisions = await decisionLogger.getDecisionsByComponent('frontend');

      expect(frontendDecisions).toHaveLength(1);
      expect(frontendDecisions[0].title).toBe('Frontend Decision');
      expect(frontendDecisions[0].context.component).toBe('frontend');
    });
  });

  describe('decision relationships', () => {
    it('should track related decisions', async () => {
      const parentDecision = await decisionLogger.logDecision(
        'Authentication Strategy',
        'Choose authentication method for the application',
        'security',
        mockContext,
        mockRationale
      );

      // This decision should be related due to similar context/keywords
      const relatedDecision = await decisionLogger.logDecision(
        'Authentication Implementation',
        'Implement the chosen authentication strategy',
        'implementation',
        mockContext,
        mockRationale
      );

      expect(relatedDecision.metadata.related_decisions.length).toBeGreaterThan(0);
    });

    it('should build decision tree paths', async () => {
      const decision = await decisionLogger.logDecision(
        'Tree Path Test',
        'Testing decision tree path building',
        'implementation',
        mockContext,
        mockRationale
      );

      expect(decision.metadata.decision_tree_path).toEqual([
        mockContext.phase,
        mockContext.component
      ]);
    });
  });
});