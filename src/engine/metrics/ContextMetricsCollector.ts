import { writeFileSync, readFileSync, existsSync } from 'fs';

export interface ContextEmbeddingMetrics {
  average_context_size: number;
  confidence_improvement: number;
  external_lookup_elimination: number;
  pattern_reuse_rate: number;
  inheritance_effectiveness: number;
}

export interface ContextEffectivenessReport {
  total_tasks_processed: number;
  average_context_size: number;
  confidence_improvement_avg: number;
  external_lookups_eliminated: number;
  pattern_reuse_instances: number;
  inheritance_success_rate: number;
  recommendations: string[];
}

export interface ContextEmbeddingEntry {
  task_id: string;
  before_confidence: number;
  after_confidence: number;
  confidence_improvement: number;
  context_size: number;
  timestamp: string;
  patterns_reused: number;
  inheritance_applied: boolean;
  external_lookups_before: number;
  external_lookups_after: number;
}

export class ContextMetricsCollector {
  private metricsPath = '.nexus/metrics/context-embedding.log';
  private summaryPath = '.nexus/metrics/context-summary.json';

  trackContextEmbedding(
    taskId: string,
    beforeConfidence: number,
    afterConfidence: number,
    contextSize: number,
    patternsReused: number = 0,
    inheritanceApplied: boolean = false,
    externalLookupsBefore: number = 0,
    externalLookupsAfter: number = 0
  ): void {
    const entry: ContextEmbeddingEntry = {
      task_id: taskId,
      before_confidence: beforeConfidence,
      after_confidence: afterConfidence,
      confidence_improvement: afterConfidence - beforeConfidence,
      context_size: contextSize,
      timestamp: new Date().toISOString(),
      patterns_reused: patternsReused,
      inheritance_applied: inheritanceApplied,
      external_lookups_before: externalLookupsBefore,
      external_lookups_after: externalLookupsAfter
    };

    this.appendToMetrics(entry);
    this.updateSummary(entry);

    console.log(`📊 Context embedding tracked: ${taskId} - ${contextSize} lines, +${entry.confidence_improvement}% confidence`);
  }

  generateEffectivenessReport(): ContextEffectivenessReport {
    const allMetrics = this.loadAllMetrics();

    if (allMetrics.length === 0) {
      return {
        total_tasks_processed: 0,
        average_context_size: 0,
        confidence_improvement_avg: 0,
        external_lookups_eliminated: 0,
        pattern_reuse_instances: 0,
        inheritance_success_rate: 0,
        recommendations: ['No context embedding data available']
      };
    }

    const totalTasks = allMetrics.length;
    const avgContextSize = this.calculateAverage(allMetrics, 'context_size');
    const avgConfidenceImprovement = this.calculateAverage(allMetrics, 'confidence_improvement');
    const externalLookupsEliminated = this.calculateLookupElimination(allMetrics);
    const patternReuseInstances = allMetrics.reduce((sum, m) => sum + m.patterns_reused, 0);
    const inheritanceSuccessRate = this.calculateInheritanceEffectiveness(allMetrics);

    return {
      total_tasks_processed: totalTasks,
      average_context_size: Math.round(avgContextSize),
      confidence_improvement_avg: Math.round(avgConfidenceImprovement * 10) / 10,
      external_lookups_eliminated: Math.round(externalLookupsEliminated),
      pattern_reuse_instances: patternReuseInstances,
      inheritance_success_rate: Math.round(inheritanceSuccessRate * 10) / 10,
      recommendations: this.generateRecommendations(allMetrics)
    };
  }

  trackPatternReuse(taskId: string, patternId: string, effectiveness: number): void {
    const entry = {
      task_id: taskId,
      pattern_id: patternId,
      effectiveness: effectiveness,
      timestamp: new Date().toISOString()
    };

    const patternPath = '.nexus/metrics/pattern-reuse.log';
    try {
      const logLine = JSON.stringify(entry) + '\n';
      writeFileSync(patternPath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log pattern reuse:', error.message);
    }
  }

  trackInheritanceChain(
    taskChain: string[],
    contextSizes: number[],
    inheritancePoints: number[]
  ): void {
    const chainEntry = {
      task_chain: taskChain,
      context_sizes: contextSizes,
      inheritance_points: inheritancePoints,
      total_inheritance_effect: inheritancePoints.reduce((sum, p) => sum + p, 0),
      timestamp: new Date().toISOString()
    };

    const chainPath = '.nexus/metrics/inheritance-chains.log';
    try {
      const logLine = JSON.stringify(chainEntry) + '\n';
      writeFileSync(chainPath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log inheritance chain:', error.message);
    }
  }

  getContextSizeDistribution(): { [range: string]: number } {
    const allMetrics = this.loadAllMetrics();
    const distribution = {
      '0-500': 0,
      '501-1000': 0,
      '1001-1500': 0,
      '1501-2000': 0,
      '2000+': 0
    };

    allMetrics.forEach(metric => {
      const size = metric.context_size;
      if (size <= 500) distribution['0-500']++;
      else if (size <= 1000) distribution['501-1000']++;
      else if (size <= 1500) distribution['1001-1500']++;
      else if (size <= 2000) distribution['1501-2000']++;
      else distribution['2000+']++;
    });

    return distribution;
  }

  getConfidenceImpactAnalysis(): { [improvement: string]: number } {
    const allMetrics = this.loadAllMetrics();
    const analysis = {
      'negative': 0,  // Confidence decreased
      'minimal': 0,   // 0-5% improvement
      'moderate': 0,  // 5-15% improvement
      'significant': 0, // 15%+ improvement
    };

    allMetrics.forEach(metric => {
      const improvement = metric.confidence_improvement;
      if (improvement < 0) analysis['negative']++;
      else if (improvement <= 5) analysis['minimal']++;
      else if (improvement <= 15) analysis['moderate']++;
      else analysis['significant']++;
    });

    return analysis;
  }

  generateContextOptimizationReport(): string {
    const report = this.generateEffectivenessReport();
    const distribution = this.getContextSizeDistribution();
    const confidenceAnalysis = this.getConfidenceImpactAnalysis();

    return `
# Context Embedding Optimization Report

Generated: ${new Date().toISOString()}

## Summary Statistics
- **Total Tasks Processed**: ${report.total_tasks_processed}
- **Average Context Size**: ${report.average_context_size} lines
- **Average Confidence Improvement**: ${report.confidence_improvement_avg}%
- **External Lookups Eliminated**: ${report.external_lookups_eliminated}
- **Pattern Reuse Instances**: ${report.pattern_reuse_instances}
- **Inheritance Success Rate**: ${report.inheritance_success_rate}%

## Context Size Distribution
- **0-500 lines**: ${distribution['0-500']} tasks (${Math.round(distribution['0-500'] / report.total_tasks_processed * 100)}%)
- **501-1000 lines**: ${distribution['501-1000']} tasks (${Math.round(distribution['501-1000'] / report.total_tasks_processed * 100)}%)
- **1001-1500 lines**: ${distribution['1001-1500']} tasks (${Math.round(distribution['1001-1500'] / report.total_tasks_processed * 100)}%)
- **1501-2000 lines**: ${distribution['1501-2000']} tasks (${Math.round(distribution['1501-2000'] / report.total_tasks_processed * 100)}%)
- **2000+ lines**: ${distribution['2000+']} tasks (${Math.round(distribution['2000+'] / report.total_tasks_processed * 100)}%)

## Confidence Impact Analysis
- **Significant Improvement (15%+)**: ${confidenceAnalysis['significant']} tasks
- **Moderate Improvement (5-15%)**: ${confidenceAnalysis['moderate']} tasks
- **Minimal Improvement (0-5%)**: ${confidenceAnalysis['minimal']} tasks
- **Negative Impact**: ${confidenceAnalysis['negative']} tasks

## Success Metrics Achievement
- **Target: 60%+ External Lookup Elimination**: ${report.external_lookups_eliminated >= 60 ? '✅ ACHIEVED' : '❌ MISSED'} (${report.external_lookups_eliminated}%)
- **Target: 25%+ Confidence Improvement**: ${report.confidence_improvement_avg >= 25 ? '✅ ACHIEVED' : '❌ MISSED'} (${report.confidence_improvement_avg}%)
- **Target: Pattern Reuse Integration**: ${report.pattern_reuse_instances > 0 ? '✅ ACHIEVED' : '❌ MISSED'} (${report.pattern_reuse_instances} instances)

## Recommendations
${report.recommendations.map(r => `- ${r}`).join('\n')}

## Next Actions
1. ${report.confidence_improvement_avg < 25 ? 'Focus on improving context quality to boost confidence' : 'Maintain current context quality standards'}
2. ${report.external_lookups_eliminated < 60 ? 'Enhance context embedding to reduce external dependencies' : 'Continue optimizing embedded context'}
3. ${report.pattern_reuse_instances < report.total_tasks_processed * 0.5 ? 'Increase pattern library utilization' : 'Expand pattern library with successful implementations'}
`;
  }

  resetMetrics(): void {
    try {
      writeFileSync(this.metricsPath, '', 'utf8');
      writeFileSync(this.summaryPath, '{}', 'utf8');
      console.log('📊 Context embedding metrics reset');
    } catch (error) {
      console.error('Failed to reset metrics:', error.message);
    }
  }

  private appendToMetrics(entry: ContextEmbeddingEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      writeFileSync(this.metricsPath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log context embedding metrics:', error.message);
    }
  }

  private updateSummary(entry: ContextEmbeddingEntry): void {
    let summary = { total_entries: 0, last_updated: '' };

    if (existsSync(this.summaryPath)) {
      try {
        const content = readFileSync(this.summaryPath, 'utf8');
        summary = JSON.parse(content);
      } catch (error) {
        console.warn('Failed to read summary, using defaults');
      }
    }

    summary.total_entries++;
    summary.last_updated = entry.timestamp;

    try {
      writeFileSync(this.summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to update summary:', error.message);
    }
  }

  private loadAllMetrics(): ContextEmbeddingEntry[] {
    if (!existsSync(this.metricsPath)) {
      return [];
    }

    try {
      const content = readFileSync(this.metricsPath, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      console.error('Failed to load metrics:', error.message);
      return [];
    }
  }

  private calculateAverage(metrics: ContextEmbeddingEntry[], field: keyof ContextEmbeddingEntry): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + (m[field] as number), 0);
    return sum / metrics.length;
  }

  private calculateLookupElimination(metrics: ContextEmbeddingEntry[]): number {
    if (metrics.length === 0) return 0;

    const totalBefore = metrics.reduce((sum, m) => sum + m.external_lookups_before, 0);
    const totalAfter = metrics.reduce((sum, m) => sum + m.external_lookups_after, 0);

    if (totalBefore === 0) return 0;
    return ((totalBefore - totalAfter) / totalBefore) * 100;
  }

  private calculateInheritanceEffectiveness(metrics: ContextEmbeddingEntry[]): number {
    const inheritanceTasks = metrics.filter(m => m.inheritance_applied);
    if (inheritanceTasks.length === 0) return 0;

    const avgImprovement = this.calculateAverage(inheritanceTasks, 'confidence_improvement');
    const nonInheritanceImprovement = this.calculateAverage(
      metrics.filter(m => !m.inheritance_applied),
      'confidence_improvement'
    );

    // Effectiveness is the ratio of improvement with inheritance vs without
    return nonInheritanceImprovement > 0 ? (avgImprovement / nonInheritanceImprovement) * 100 : 100;
  }

  private generateRecommendations(metrics: ContextEmbeddingEntry[]): string[] {
    const recommendations: string[] = [];
    const avgSize = this.calculateAverage(metrics, 'context_size');
    const avgImprovement = this.calculateAverage(metrics, 'confidence_improvement');

    // Size recommendations
    if (avgSize > 1500) {
      recommendations.push('Average context size is high - consider more aggressive pruning');
    } else if (avgSize < 300) {
      recommendations.push('Average context size is low - consider including more extended context');
    }

    // Confidence recommendations
    if (avgImprovement < 10) {
      recommendations.push('Low confidence improvement - enhance pattern matching and context quality');
    } else if (avgImprovement > 30) {
      recommendations.push('High confidence improvement achieved - consider reducing context size for efficiency');
    }

    // Pattern reuse recommendations
    const avgPatternReuse = this.calculateAverage(metrics, 'patterns_reused');
    if (avgPatternReuse < 2) {
      recommendations.push('Low pattern reuse - expand pattern library and improve matching algorithms');
    }

    // Inheritance recommendations
    const inheritanceRate = metrics.filter(m => m.inheritance_applied).length / metrics.length;
    if (inheritanceRate < 0.3) {
      recommendations.push('Low inheritance utilization - improve task sequencing and context propagation');
    }

    return recommendations;
  }
}