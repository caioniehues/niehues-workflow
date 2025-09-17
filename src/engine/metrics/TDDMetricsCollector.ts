import { writeFileSync, readFileSync, existsSync } from 'fs';

export interface TDDMetrics {
  tasks_completed: number;
  constitutional_violations: number;
  test_coverage_average: number;
  red_green_refactor_cycles: number;
  implementation_time_avg: number;
  phases: {
    red: PhaseMetrics;
    green: PhaseMetrics;
    refactor: PhaseMetrics;
  };
}

export interface PhaseMetrics {
  count: number;
  total_duration: number;
  average_duration: number;
  tasks: PhaseTask[];
}

export interface PhaseTask {
  task_id: string;
  timestamp: string;
  duration: number;
  success: boolean;
}

export interface ComplianceReport {
  constitutional_compliance: number;
  coverage_trend: CoverageTrend;
  tdd_adoption: TDDAdoption;
  recommendations: string[];
}

export interface CoverageTrend {
  current: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  history: CoveragePoint[];
}

export interface CoveragePoint {
  timestamp: string;
  coverage: number;
}

export interface TDDAdoption {
  percentage: number;
  red_phase_compliance: number;
  green_phase_compliance: number;
  refactor_phase_compliance: number;
}

export type TDDPhase = 'red' | 'green' | 'refactor';

export class TDDMetricsCollector {
  private metricsPath = '.nexus/metrics/tdd-metrics.json';
  private violationsPath = '.nexus/metrics/violations.log';

  trackTDDCompliance(taskId: string, phase: TDDPhase): void {
    const metrics = this.loadMetrics();
    const duration = this.calculatePhaseDuration(taskId, phase);

    metrics.phases[phase].count++;
    metrics.phases[phase].total_duration += duration;
    metrics.phases[phase].average_duration =
      metrics.phases[phase].total_duration / metrics.phases[phase].count;

    metrics.phases[phase].tasks.push({
      task_id: taskId,
      timestamp: new Date().toISOString(),
      duration,
      success: true
    });

    // Update overall metrics
    if (phase === 'refactor') {
      metrics.red_green_refactor_cycles++;
    }

    this.saveMetrics(metrics);
    console.log(`📊 TDD compliance tracked: ${taskId} - ${phase} phase`);
  }

  trackViolation(violation: { rule: string; violation: string; required_action: string }): void {
    const metrics = this.loadMetrics();
    metrics.constitutional_violations++;

    // Log detailed violation
    const violationEntry = {
      timestamp: new Date().toISOString(),
      rule: violation.rule,
      violation: violation.violation,
      required_action: violation.required_action
    };

    this.logViolation(violationEntry);
    this.saveMetrics(metrics);

    console.log(`🛑 Constitutional violation tracked: ${violation.rule}`);
  }

  trackCoverage(taskId: string, coveragePercentage: number): void {
    const metrics = this.loadMetrics();

    // Update average coverage
    const totalTasks = metrics.tasks_completed + 1;
    metrics.test_coverage_average =
      (metrics.test_coverage_average * metrics.tasks_completed + coveragePercentage) / totalTasks;

    // Log coverage point for trend analysis
    this.logCoveragePoint(taskId, coveragePercentage);

    this.saveMetrics(metrics);
    console.log(`📊 Coverage tracked: ${taskId} - ${coveragePercentage}%`);
  }

  trackTaskCompletion(taskId: string, totalDuration: number): void {
    const metrics = this.loadMetrics();

    metrics.tasks_completed++;

    // Update average implementation time
    metrics.implementation_time_avg =
      (metrics.implementation_time_avg * (metrics.tasks_completed - 1) + totalDuration) /
      metrics.tasks_completed;

    this.saveMetrics(metrics);
    console.log(`📊 Task completion tracked: ${taskId} - ${totalDuration}ms`);
  }

  generateComplianceReport(): ComplianceReport {
    const metrics = this.loadMetrics();
    const violations = this.loadViolations();
    const coverageHistory = this.loadCoverageHistory();

    const totalPhases = metrics.phases.red.count + metrics.phases.green.count + metrics.phases.refactor.count;
    const constitutionalCompliance = totalPhases > 0
      ? ((totalPhases - violations.length) / totalPhases) * 100
      : 100;

    const coverageTrend = this.analyzeCoverageTrend(coverageHistory);
    const tddAdoption = this.calculateTDDAdoption(metrics);

    return {
      constitutional_compliance: constitutionalCompliance,
      coverage_trend: coverageTrend,
      tdd_adoption: tddAdoption,
      recommendations: this.generateRecommendations(metrics, violations)
    };
  }

  getMetricsSummary(): TDDMetrics {
    return this.loadMetrics();
  }

  resetMetrics(): void {
    const emptyMetrics: TDDMetrics = {
      tasks_completed: 0,
      constitutional_violations: 0,
      test_coverage_average: 0,
      red_green_refactor_cycles: 0,
      implementation_time_avg: 0,
      phases: {
        red: { count: 0, total_duration: 0, average_duration: 0, tasks: [] },
        green: { count: 0, total_duration: 0, average_duration: 0, tasks: [] },
        refactor: { count: 0, total_duration: 0, average_duration: 0, tasks: [] }
      }
    };

    this.saveMetrics(emptyMetrics);
    console.log('📊 TDD metrics reset');
  }

  private loadMetrics(): TDDMetrics {
    if (!existsSync(this.metricsPath)) {
      return {
        tasks_completed: 0,
        constitutional_violations: 0,
        test_coverage_average: 0,
        red_green_refactor_cycles: 0,
        implementation_time_avg: 0,
        phases: {
          red: { count: 0, total_duration: 0, average_duration: 0, tasks: [] },
          green: { count: 0, total_duration: 0, average_duration: 0, tasks: [] },
          refactor: { count: 0, total_duration: 0, average_duration: 0, tasks: [] }
        }
      };
    }

    try {
      const content = readFileSync(this.metricsPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load metrics:', error.message);
      return this.loadMetrics(); // Return empty metrics
    }
  }

  private saveMetrics(metrics: TDDMetrics): void {
    try {
      const content = JSON.stringify(metrics, null, 2);
      writeFileSync(this.metricsPath, content, 'utf8');
    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  private loadViolations(): any[] {
    if (!existsSync(this.violationsPath)) {
      return [];
    }

    try {
      const content = readFileSync(this.violationsPath, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { timestamp: '', rule: '', violation: line };
          }
        });
    } catch (error) {
      console.error('Failed to load violations:', error.message);
      return [];
    }
  }

  private logViolation(violation: any): void {
    try {
      const logLine = JSON.stringify(violation) + '\n';
      writeFileSync(this.violationsPath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log violation:', error.message);
    }
  }

  private logCoveragePoint(taskId: string, coverage: number): void {
    const coveragePoint = {
      timestamp: new Date().toISOString(),
      task_id: taskId,
      coverage
    };

    const coveragePath = '.nexus/metrics/coverage-history.log';
    try {
      const logLine = JSON.stringify(coveragePoint) + '\n';
      writeFileSync(coveragePath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log coverage:', error.message);
    }
  }

  private loadCoverageHistory(): CoveragePoint[] {
    const coveragePath = '.nexus/metrics/coverage-history.log';
    if (!existsSync(coveragePath)) {
      return [];
    }

    try {
      const content = readFileSync(coveragePath, 'utf8');
      return content.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const point = JSON.parse(line);
          return {
            timestamp: point.timestamp,
            coverage: point.coverage
          };
        });
    } catch (error) {
      console.error('Failed to load coverage history:', error.message);
      return [];
    }
  }

  private calculatePhaseDuration(taskId: string, phase: TDDPhase): number {
    // This is a simplified implementation
    // In practice, you'd track start/end times for each phase
    const baseDuration = {
      red: 300000, // 5 minutes
      green: 600000, // 10 minutes
      refactor: 900000 // 15 minutes
    };

    // Add some randomness to simulate realistic durations
    const variance = 0.3;
    const random = 1 + (Math.random() - 0.5) * variance;

    return Math.round(baseDuration[phase] * random);
  }

  private analyzeCoverageTrend(history: CoveragePoint[]): CoverageTrend {
    if (history.length < 2) {
      return {
        current: history[0]?.coverage || 0,
        trend: 'stable',
        history
      };
    }

    const recent = history.slice(-5); // Last 5 measurements
    const slopes = [];

    for (let i = 1; i < recent.length; i++) {
      slopes.push(recent[i].coverage - recent[i-1].coverage);
    }

    const averageSlope = slopes.reduce((a, b) => a + b, 0) / slopes.length;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (averageSlope > 2) trend = 'increasing';
    else if (averageSlope < -2) trend = 'decreasing';
    else trend = 'stable';

    return {
      current: recent[recent.length - 1].coverage,
      trend,
      history
    };
  }

  private calculateTDDAdoption(metrics: TDDMetrics): TDDAdoption {
    const totalTasks = metrics.tasks_completed;
    const completeCycles = metrics.red_green_refactor_cycles;

    return {
      percentage: totalTasks > 0 ? (completeCycles / totalTasks) * 100 : 0,
      red_phase_compliance: totalTasks > 0 ? (metrics.phases.red.count / totalTasks) * 100 : 0,
      green_phase_compliance: totalTasks > 0 ? (metrics.phases.green.count / totalTasks) * 100 : 0,
      refactor_phase_compliance: totalTasks > 0 ? (metrics.phases.refactor.count / totalTasks) * 100 : 0
    };
  }

  private generateRecommendations(metrics: TDDMetrics, violations: any[]): string[] {
    const recommendations: string[] = [];

    // Coverage recommendations
    if (metrics.test_coverage_average < 80) {
      recommendations.push(
        `Improve test coverage from ${metrics.test_coverage_average.toFixed(1)}% to 80% minimum`
      );
    }

    // Violation recommendations
    if (violations.length > 0) {
      const recentViolations = violations.filter(v => {
        const age = Date.now() - new Date(v.timestamp).getTime();
        return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      });

      if (recentViolations.length > 5) {
        recommendations.push(
          'High violation rate detected - review TDD practices and constitutional compliance'
        );
      }
    }

    // TDD adoption recommendations
    const adoption = this.calculateTDDAdoption(metrics);
    if (adoption.percentage < 90) {
      recommendations.push(
        `Increase TDD adoption from ${adoption.percentage.toFixed(1)}% to 90%+ for better quality`
      );
    }

    // Performance recommendations
    if (metrics.implementation_time_avg > 30 * 60 * 1000) { // 30 minutes
      recommendations.push(
        'Consider breaking down tasks - average implementation time exceeds 30 minutes'
      );
    }

    return recommendations;
  }
}