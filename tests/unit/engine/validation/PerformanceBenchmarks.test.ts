import {
  PerformanceBenchmarks,
  BenchmarkConfiguration,
  PerformanceBenchmarkResult,
  ComponentBenchmark,
  OptimizationRecommendation,
  Bottleneck,
  PerformanceTrend
} from '../../../../src/engine/validation/PerformanceBenchmarks';
import { WorkflowMetrics } from '../../../../src/engine/metrics/WorkflowMetrics';
import { DecisionLogger } from '../../../../src/engine/intelligence/DecisionLogger';

// Mock dependencies
jest.mock('../../../../src/engine/metrics/WorkflowMetrics');
jest.mock('../../../../src/engine/intelligence/DecisionLogger');

describe('PerformanceBenchmarks', () => {
  let performanceBenchmarks: PerformanceBenchmarks;
  let mockWorkflowMetrics: jest.Mocked<WorkflowMetrics>;
  let mockDecisionLogger: jest.Mocked<DecisionLogger>;
  let mockBenchmarkConfig: BenchmarkConfiguration;

  beforeEach(() => {
    mockWorkflowMetrics = new WorkflowMetrics() as jest.Mocked<WorkflowMetrics>;
    mockDecisionLogger = new DecisionLogger() as jest.Mocked<DecisionLogger>;
    performanceBenchmarks = new PerformanceBenchmarks(mockWorkflowMetrics, mockDecisionLogger);

    mockBenchmarkConfig = {
      test_duration_ms: 30000, // 30 seconds for faster tests
      load_simulation: {
        concurrent_users: 5,
        request_rate: 25,
        ramp_up_time_ms: 2000,
        steady_state_time_ms: 26000,
        ramp_down_time_ms: 2000
      },
      component_selection: {
        include_sharding: true,
        include_context_embedding: true,
        include_questioning: true,
        include_implementation: true,
        include_validation: true,
        include_decision_logging: true,
        include_pipeline: true
      },
      profiling_depth: 'standard',
      include_stress_testing: false,
      include_memory_profiling: true,
      include_token_analysis: true,
      parallel_execution: true,
      baseline_comparison: false, // Disable for faster tests
      generate_reports: true
    };

    // Setup mocks
    mockDecisionLogger.logDecision = jest.fn().mockResolvedValue({
      id: 'benchmark_decision_123',
      title: 'Performance Benchmark',
      status: 'approved'
    });
  });

  describe('runComprehensiveBenchmark', () => {
    it('should perform comprehensive performance benchmark', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(result).toMatchObject({
        benchmark_id: expect.any(String),
        timestamp: expect.any(Date),
        overall_performance_score: expect.any(Number),
        component_benchmarks: expect.any(Array),
        system_metrics: expect.any(Object),
        optimization_recommendations: expect.any(Array),
        performance_trends: expect.any(Array),
        bottlenecks_identified: expect.any(Array),
        benchmark_metadata: expect.objectContaining({
          benchmark_version: '1.0.0',
          execution_time_ms: expect.any(Number),
          configuration_used: mockBenchmarkConfig
        })
      });
    });

    it('should benchmark all selected components', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      // Should have benchmarks for all enabled components
      const componentTypes = result.component_benchmarks.map(b => b.component_type);
      expect(componentTypes).toContain('sharding');
      expect(componentTypes).toContain('context_embedding');
      expect(componentTypes).toContain('questioning');
      expect(componentTypes).toContain('implementation');
      expect(componentTypes).toContain('validation');
      expect(componentTypes).toContain('decision_logging');
      expect(componentTypes).toContain('pipeline_orchestration');
    });

    it('should calculate overall performance score within valid range', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(result.overall_performance_score).toBeGreaterThanOrEqual(0);
      expect(result.overall_performance_score).toBeLessThanOrEqual(1);
    });

    it('should include comprehensive system metrics', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(result.system_metrics).toMatchObject({
        sharding_performance: expect.objectContaining({
          average_shard_size: expect.any(Number),
          sharding_time_ms: expect.any(Number),
          size_reduction_percentage: expect.any(Number),
          context_preservation_score: expect.any(Number)
        }),
        context_embedding: expect.objectContaining({
          embedding_generation_time_ms: expect.any(Number),
          context_size_bytes: expect.any(Number),
          embedding_accuracy_score: expect.any(Number),
          cache_hit_rate: expect.any(Number)
        }),
        question_answer_velocity: expect.objectContaining({
          questions_per_minute: expect.any(Number),
          average_question_processing_time_ms: expect.any(Number),
          answer_generation_time_ms: expect.any(Number),
          adaptive_questioning_efficiency: expect.any(Number)
        }),
        implementation_speed: expect.objectContaining({
          code_generation_velocity: expect.any(Number),
          test_creation_speed: expect.any(Number),
          first_pass_success_rate: expect.any(Number)
        }),
        memory_profiling: expect.objectContaining({
          peak_memory_usage_mb: expect.any(Number),
          average_memory_usage_mb: expect.any(Number),
          memory_leak_detection: expect.any(Object)
        }),
        token_consumption: expect.objectContaining({
          total_tokens_consumed: expect.any(Number),
          input_tokens: expect.any(Number),
          output_tokens: expect.any(Number)
        }),
        pipeline_throughput: expect.objectContaining({
          requests_per_second: expect.any(Number),
          average_response_time_ms: expect.any(Number)
        }),
        error_rates: expect.objectContaining({
          overall_error_rate: expect.any(Number),
          critical_error_rate: expect.any(Number)
        })
      });
    });

    it('should generate optimization recommendations', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.optimization_recommendations.forEach((recommendation: OptimizationRecommendation) => {
        expect(recommendation).toMatchObject({
          category: expect.stringMatching(/^(performance|memory|token_efficiency|throughput|latency|cost|quality|scalability)$/),
          priority: expect.stringMatching(/^(critical|high|medium|low)$/),
          title: expect.any(String),
          description: expect.any(String),
          current_metric: expect.any(Number),
          target_metric: expect.any(Number),
          potential_improvement: expect.any(Number),
          implementation_effort: expect.stringMatching(/^(low|medium|high)$/),
          impact_analysis: expect.any(Object),
          action_items: expect.any(Array),
          expected_roi: expect.any(Number)
        });
      });
    });

    it('should identify performance trends', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.performance_trends.forEach((trend: PerformanceTrend) => {
        expect(trend).toMatchObject({
          metric_name: expect.any(String),
          trend_direction: expect.stringMatching(/^(improving|degrading|stable|volatile)$/),
          change_rate: expect.any(Number),
          historical_data: expect.any(Array),
          forecast: expect.objectContaining({
            predicted_value: expect.any(Number),
            confidence: expect.any(Number),
            time_horizon_days: expect.any(Number)
          }),
          anomaly_detection: expect.objectContaining({
            anomalies_detected: expect.any(Boolean),
            anomaly_score: expect.any(Number)
          })
        });
      });
    });

    it('should detect bottlenecks when present', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.bottlenecks_identified.forEach((bottleneck: Bottleneck) => {
        expect(bottleneck).toMatchObject({
          component: expect.any(String),
          bottleneck_type: expect.stringMatching(/^(cpu_bound|memory_bound|io_bound|network_bound|algorithm_inefficiency|resource_contention|synchronization|external_dependency)$/),
          severity: expect.stringMatching(/^(critical|high|medium|low)$/),
          description: expect.any(String),
          impact_percentage: expect.any(Number),
          resolution_suggestions: expect.any(Array),
          estimated_improvement: expect.any(Number),
          dependencies: expect.any(Array)
        });
      });
    });

    it('should log benchmark decision', async () => {
      await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(mockDecisionLogger.logDecision).toHaveBeenCalledWith(
        expect.stringContaining('Performance Benchmark'),
        expect.any(String),
        'performance',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should include comprehensive benchmark metadata', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(result.benchmark_metadata).toMatchObject({
        benchmark_version: '1.0.0',
        execution_time_ms: expect.any(Number),
        configuration_used: mockBenchmarkConfig,
        baseline_comparison_available: expect.any(Boolean),
        test_conditions: expect.any(Object),
        system_info: expect.any(Object)
      });

      expect(result.benchmark_metadata.execution_time_ms).toBeGreaterThan(0);
    });
  });

  describe('component benchmarks', () => {
    it('should benchmark sharding performance correctly', async () => {
      const config = {
        ...mockBenchmarkConfig,
        component_selection: {
          include_sharding: true,
          include_context_embedding: false,
          include_questioning: false,
          include_implementation: false,
          include_validation: false,
          include_decision_logging: false,
          include_pipeline: false
        }
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(config);

      const shardingBenchmark = result.component_benchmarks.find(b => b.component_type === 'sharding');
      expect(shardingBenchmark).toMatchObject({
        component_name: 'document_sharder',
        component_type: 'sharding',
        performance_score: expect.any(Number),
        metrics: expect.objectContaining({
          execution_time_ms: expect.any(Number),
          throughput: expect.any(Number),
          error_rate: expect.any(Number),
          success_rate: expect.any(Number),
          quality_score: expect.any(Number),
          efficiency_score: expect.any(Number)
        }),
        execution_profile: expect.objectContaining({
          cpu_usage_percentage: expect.any(Number),
          memory_usage_mb: expect.any(Number),
          io_operations: expect.any(Number),
          cache_performance: expect.any(Object)
        }),
        resource_usage: expect.objectContaining({
          peak_cpu: expect.any(Number),
          average_cpu: expect.any(Number),
          peak_memory_mb: expect.any(Number),
          average_memory_mb: expect.any(Number)
        }),
        optimization_potential: expect.objectContaining({
          performance_gain_potential: expect.any(Number),
          memory_reduction_potential: expect.any(Number),
          cost_reduction_potential: expect.any(Number),
          implementation_effort: expect.stringMatching(/^(low|medium|high)$/)
        })
      });
    });

    it('should benchmark context embedding performance correctly', async () => {
      const config = {
        ...mockBenchmarkConfig,
        component_selection: {
          include_sharding: false,
          include_context_embedding: true,
          include_questioning: false,
          include_implementation: false,
          include_validation: false,
          include_decision_logging: false,
          include_pipeline: false
        }
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(config);

      const contextBenchmark = result.component_benchmarks.find(b => b.component_type === 'context_embedding');
      expect(contextBenchmark).toMatchObject({
        component_name: 'context_embedder',
        component_type: 'context_embedding',
        performance_score: expect.any(Number),
        metrics: expect.objectContaining({
          quality_score: expect.any(Number),
          efficiency_score: expect.any(Number)
        })
      });
    });

    it('should benchmark questioning performance correctly', async () => {
      const config = {
        ...mockBenchmarkConfig,
        component_selection: {
          include_sharding: false,
          include_context_embedding: false,
          include_questioning: true,
          include_implementation: false,
          include_validation: false,
          include_decision_logging: false,
          include_pipeline: false
        }
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(config);

      const questioningBenchmark = result.component_benchmarks.find(b => b.component_type === 'questioning');
      expect(questioningBenchmark).toMatchObject({
        component_name: 'adaptive_questioning_engine',
        component_type: 'questioning',
        performance_score: expect.any(Number)
      });
    });

    it('should validate component benchmark structure', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.component_benchmarks.forEach((benchmark: ComponentBenchmark) => {
        // Validate performance score range
        expect(benchmark.performance_score).toBeGreaterThanOrEqual(0);
        expect(benchmark.performance_score).toBeLessThanOrEqual(1);

        // Validate metrics structure
        expect(benchmark.metrics.execution_time_ms).toBeGreaterThan(0);
        expect(benchmark.metrics.throughput).toBeGreaterThan(0);
        expect(benchmark.metrics.error_rate).toBeGreaterThanOrEqual(0);
        expect(benchmark.metrics.error_rate).toBeLessThanOrEqual(1);
        expect(benchmark.metrics.success_rate).toBeGreaterThanOrEqual(0);
        expect(benchmark.metrics.success_rate).toBeLessThanOrEqual(1);

        // Validate execution profile
        expect(benchmark.execution_profile.cpu_usage_percentage).toBeGreaterThanOrEqual(0);
        expect(benchmark.execution_profile.cpu_usage_percentage).toBeLessThanOrEqual(100);
        expect(benchmark.execution_profile.memory_usage_mb).toBeGreaterThan(0);

        // Validate resource usage
        expect(benchmark.resource_usage.peak_cpu).toBeGreaterThanOrEqual(benchmark.resource_usage.average_cpu);
        expect(benchmark.resource_usage.peak_memory_mb).toBeGreaterThanOrEqual(benchmark.resource_usage.average_memory_mb);
      });
    });
  });

  describe('configuration options', () => {
    it('should respect parallel execution setting', async () => {
      const sequentialConfig = {
        ...mockBenchmarkConfig,
        parallel_execution: false
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(sequentialConfig);

      expect(result.benchmark_metadata.configuration_used.parallel_execution).toBe(false);
    });

    it('should respect component selection', async () => {
      const selectiveConfig = {
        ...mockBenchmarkConfig,
        component_selection: {
          include_sharding: true,
          include_context_embedding: false,
          include_questioning: false,
          include_implementation: false,
          include_validation: false,
          include_decision_logging: false,
          include_pipeline: false
        }
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(selectiveConfig);

      expect(result.component_benchmarks).toHaveLength(1);
      expect(result.component_benchmarks[0].component_type).toBe('sharding');
    });

    it('should handle memory profiling configuration', async () => {
      const noMemoryConfig = {
        ...mockBenchmarkConfig,
        include_memory_profiling: false
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(noMemoryConfig);

      // Should still have memory metrics but they would be default values
      expect(result.system_metrics.memory_profiling).toBeDefined();
    });

    it('should handle token analysis configuration', async () => {
      const noTokenConfig = {
        ...mockBenchmarkConfig,
        include_token_analysis: false
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(noTokenConfig);

      // Should still have token metrics but they would be default values
      expect(result.system_metrics.token_consumption).toBeDefined();
    });

    it('should use default configuration when none provided', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark();

      expect(result.benchmark_metadata.configuration_used).toMatchObject({
        test_duration_ms: 60000,
        profiling_depth: 'standard',
        include_memory_profiling: true,
        include_token_analysis: true,
        parallel_execution: true,
        baseline_comparison: true,
        generate_reports: true
      });
    });
  });

  describe('performance analysis', () => {
    it('should identify high-priority optimization opportunities', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      const highPriorityRecommendations = result.optimization_recommendations.filter(
        r => r.priority === 'high' || r.priority === 'critical'
      );

      highPriorityRecommendations.forEach(recommendation => {
        expect(recommendation.potential_improvement).toBeGreaterThan(0);
        expect(recommendation.expected_roi).toBeGreaterThan(0);
        expect(recommendation.action_items.length).toBeGreaterThan(0);
      });
    });

    it('should provide realistic performance targets', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.optimization_recommendations.forEach(recommendation => {
        expect(recommendation.target_metric).toBeGreaterThan(recommendation.current_metric);
        expect(recommendation.target_metric).toBeLessThanOrEqual(1.0); // Assuming normalized metrics
      });
    });

    it('should calculate meaningful bottleneck impact', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      result.bottlenecks_identified.forEach(bottleneck => {
        expect(bottleneck.impact_percentage).toBeGreaterThan(0);
        expect(bottleneck.impact_percentage).toBeLessThanOrEqual(100);
        expect(bottleneck.estimated_improvement).toBeGreaterThan(0);
        expect(bottleneck.resolution_suggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('performance scoring', () => {
    it('should weight components appropriately in overall score', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      // Overall score should be influenced by all component scores
      const componentScores = result.component_benchmarks.map(b => b.performance_score);
      const avgComponentScore = componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length;

      // Overall score should be reasonably close to average component score
      // (allowing for weighting and system factors)
      expect(Math.abs(result.overall_performance_score - avgComponentScore)).toBeLessThan(0.3);
    });

    it('should reflect poor performance in low scores', async () => {
      // This would require mocking poor performance scenarios
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      // Verify that components with performance issues get appropriate scores
      result.component_benchmarks.forEach(benchmark => {
        if (benchmark.metrics.error_rate > 0.1) {
          expect(benchmark.performance_score).toBeLessThan(0.8);
        }
      });
    });
  });

  describe('error handling and resilience', () => {
    it('should handle benchmark failures gracefully', async () => {
      // Create a configuration that might cause issues
      const problematicConfig = {
        ...mockBenchmarkConfig,
        test_duration_ms: 1, // Very short duration
        component_selection: {
          include_sharding: false,
          include_context_embedding: false,
          include_questioning: false,
          include_implementation: false,
          include_validation: false,
          include_decision_logging: false,
          include_pipeline: false
        }
      };

      const result = await performanceBenchmarks.runComprehensiveBenchmark(problematicConfig);

      expect(result.component_benchmarks).toHaveLength(0);
      expect(result.overall_performance_score).toBeDefined();
      expect(result.benchmark_metadata.execution_time_ms).toBeGreaterThan(0);
    });

    it('should provide meaningful benchmark IDs', async () => {
      const result1 = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);
      const result2 = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(result1.benchmark_id).toBeTruthy();
      expect(result2.benchmark_id).toBeTruthy();
      expect(result1.benchmark_id).not.toBe(result2.benchmark_id);
      expect(result1.benchmark_id).toMatch(/^benchmark_\d+_[a-z0-9]+$/);
    });
  });

  describe('performance and scalability', () => {
    it('should complete benchmarks within reasonable time', async () => {
      const startTime = Date.now();
      await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);
      const duration = Date.now() - startTime;

      // Should complete within a reasonable time (allowing for test overhead)
      expect(duration).toBeLessThan(45000); // 45 seconds max
    });

    it('should benefit from parallel execution', async () => {
      const sequentialConfig = { ...mockBenchmarkConfig, parallel_execution: false };
      const parallelConfig = { ...mockBenchmarkConfig, parallel_execution: true };

      const sequentialStart = Date.now();
      await performanceBenchmarks.runComprehensiveBenchmark(sequentialConfig);
      const sequentialDuration = Date.now() - sequentialStart;

      const parallelStart = Date.now();
      await performanceBenchmarks.runComprehensiveBenchmark(parallelConfig);
      const parallelDuration = Date.now() - parallelStart;

      // Parallel execution should generally be faster or at least not significantly slower
      expect(parallelDuration).toBeLessThanOrEqual(sequentialDuration * 1.2);
    });
  });

  describe('integration with external systems', () => {
    it('should integrate with DecisionLogger for audit trail', async () => {
      await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      expect(mockDecisionLogger.logDecision).toHaveBeenCalledTimes(1);

      const logCall = mockDecisionLogger.logDecision.mock.calls[0];
      expect(logCall[0]).toContain('Performance Benchmark');
      expect(logCall[2]).toBe('performance');
    });

    it('should provide results compatible with metrics systems', async () => {
      const result = await performanceBenchmarks.runComprehensiveBenchmark(mockBenchmarkConfig);

      // Ensure result structure is suitable for metrics collection
      expect(result.overall_performance_score).toBeGreaterThanOrEqual(0);
      expect(result.overall_performance_score).toBeLessThanOrEqual(1);
      expect(result.benchmark_metadata.execution_time_ms).toBeGreaterThan(0);
      expect(result.component_benchmarks.length).toBeGreaterThan(0);
    });
  });
});