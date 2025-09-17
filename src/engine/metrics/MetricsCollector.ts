import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface WorkflowMetrics {
  total_brainstorms: number;
  total_specifications: number;
  total_shards: number;
  total_tasks: number;
  tasks_completed: number;
  average_confidence: number;
  average_context_size: number;
}

export interface QualityMetrics {
  test_coverage: number;
  code_complexity: number;
  documentation_coverage: number;
  technical_debt: number;
}

export interface PerformanceMetrics {
  average_task_time: number;
  specification_to_implementation: number;
  rework_rate: number;
  first_pass_success: number;
}

export interface MetricsData {
  project: string;
  initialized: string;
  baseline: {
    test_coverage: number;
    code_complexity: number;
    technical_debt: number;
    documentation_coverage: number;
  };
  targets: {
    test_coverage: number;
    code_complexity: number;
    technical_debt: number;
    documentation_coverage: number;
  };
  current?: {
    workflow_metrics: WorkflowMetrics;
    quality_metrics: QualityMetrics;
    performance_metrics: PerformanceMetrics;
  };
  history: Array<{
    timestamp: string;
    workflow_metrics: WorkflowMetrics;
    quality_metrics: QualityMetrics;
    performance_metrics: PerformanceMetrics;
  }>;
}

export class MetricsCollector {
  private metricsPath: string;
  private metricsData: MetricsData | null = null;

  constructor(metricsPath: string = '.nexus/metrics.yaml') {
    this.metricsPath = metricsPath;
  }

  /**
   * Initialize metrics with baseline values
   */
  async initialize(initialData: Partial<MetricsData>): Promise<void> {
    const defaultData: MetricsData = {
      project: initialData.project || 'Unknown Project',
      initialized: initialData.initialized || new Date().toISOString(),
      baseline: initialData.baseline || {
        test_coverage: 0,
        code_complexity: 0,
        technical_debt: 0,
        documentation_coverage: 0
      },
      targets: initialData.targets || {
        test_coverage: 80,
        code_complexity: 10,
        technical_debt: 0,
        documentation_coverage: 80
      },
      history: initialData.history || []
    };

    this.metricsData = { ...defaultData, ...initialData } as MetricsData;
    await this.save();
  }

  /**
   * Load metrics from file
   */
  async load(): Promise<MetricsData> {
    if (this.metricsData) {
      return this.metricsData;
    }

    try {
      if (await fs.pathExists(this.metricsPath)) {
        const content = await fs.readFile(this.metricsPath, 'utf-8');
        this.metricsData = yaml.load(content) as MetricsData;
        return this.metricsData;
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }

    throw new Error('Metrics not initialized. Run initialize() first.');
  }

  /**
   * Save metrics to file
   */
  async save(): Promise<void> {
    if (!this.metricsData) {
      throw new Error('No metrics data to save');
    }

    await fs.ensureDir(path.dirname(this.metricsPath));
    await fs.writeFile(this.metricsPath, yaml.dump(this.metricsData), 'utf-8');
  }

  /**
   * Update workflow metrics
   */
  async updateWorkflowMetrics(metrics: Partial<WorkflowMetrics>): Promise<void> {
    await this.load();

    if (!this.metricsData!.current) {
      this.metricsData!.current = this.createEmptyCurrentMetrics();
    }

    this.metricsData!.current.workflow_metrics = {
      ...this.metricsData!.current.workflow_metrics,
      ...metrics
    };

    await this.save();
  }

  /**
   * Update quality metrics
   */
  async updateQualityMetrics(metrics: Partial<QualityMetrics>): Promise<void> {
    await this.load();

    if (!this.metricsData!.current) {
      this.metricsData!.current = this.createEmptyCurrentMetrics();
    }

    this.metricsData!.current.quality_metrics = {
      ...this.metricsData!.current.quality_metrics,
      ...metrics
    };

    await this.save();
  }

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): Promise<void> {
    await this.load();

    if (!this.metricsData!.current) {
      this.metricsData!.current = this.createEmptyCurrentMetrics();
    }

    this.metricsData!.current.performance_metrics = {
      ...this.metricsData!.current.performance_metrics,
      ...metrics
    };

    await this.save();
  }

  /**
   * Take a snapshot of current metrics and add to history
   */
  async takeSnapshot(): Promise<void> {
    await this.load();

    if (!this.metricsData!.current) {
      return; // No current metrics to snapshot
    }

    this.metricsData!.history.push({
      timestamp: new Date().toISOString(),
      ...this.metricsData!.current
    });

    // Keep only last 100 snapshots
    if (this.metricsData!.history.length > 100) {
      this.metricsData!.history = this.metricsData!.history.slice(-100);
    }

    await this.save();
  }

  /**
   * Increment a workflow counter
   */
  async incrementCounter(counter: keyof WorkflowMetrics): Promise<void> {
    await this.load();

    if (!this.metricsData!.current) {
      this.metricsData!.current = this.createEmptyCurrentMetrics();
    }

    const metrics = this.metricsData!.current.workflow_metrics;

    if (typeof metrics[counter] === 'number') {
      (metrics[counter] as number)++;
    }

    await this.save();
  }

  /**
   * Record task completion time
   */
  async recordTaskTime(taskId: string, startTime: Date, endTime: Date): Promise<void> {
    const duration = endTime.getTime() - startTime.getTime();
    const hours = duration / (1000 * 60 * 60);

    await this.load();

    if (!this.metricsData!.current) {
      this.metricsData!.current = this.createEmptyCurrentMetrics();
    }

    const perf = this.metricsData!.current.performance_metrics;

    // Update average task time
    const totalTasks = this.metricsData!.current.workflow_metrics.tasks_completed || 0;
    perf.average_task_time = (perf.average_task_time * totalTasks + hours) / (totalTasks + 1);

    await this.incrementCounter('tasks_completed');
  }

  /**
   * Check if metrics meet targets
   */
  async checkTargets(): Promise<{
    passing: boolean;
    failures: string[];
  }> {
    await this.load();

    const failures: string[] = [];

    if (!this.metricsData!.current) {
      return { passing: true, failures: [] };
    }

    const quality = this.metricsData!.current.quality_metrics;
    const targets = this.metricsData!.targets;

    if (quality.test_coverage < targets.test_coverage) {
      failures.push(`Test coverage (${quality.test_coverage}%) below target (${targets.test_coverage}%)`);
    }

    if (quality.code_complexity > targets.code_complexity) {
      failures.push(`Code complexity (${quality.code_complexity}) exceeds target (${targets.code_complexity})`);
    }

    if (quality.technical_debt > targets.technical_debt) {
      failures.push(`Technical debt (${quality.technical_debt}) exceeds target (${targets.technical_debt})`);
    }

    if (quality.documentation_coverage < targets.documentation_coverage) {
      failures.push(`Documentation coverage (${quality.documentation_coverage}%) below target (${targets.documentation_coverage}%)`);
    }

    return {
      passing: failures.length === 0,
      failures
    };
  }

  /**
   * Generate metrics report
   */
  async generateReport(): Promise<string> {
    await this.load();

    const data = this.metricsData!;
    let report = `# Metrics Report\n\n`;
    report += `**Project**: ${data.project}\n`;
    report += `**Initialized**: ${data.initialized}\n\n`;

    if (data.current) {
      report += `## Current Metrics\n\n`;

      report += `### Workflow Metrics\n`;
      report += `- Total Brainstorms: ${data.current.workflow_metrics.total_brainstorms}\n`;
      report += `- Total Specifications: ${data.current.workflow_metrics.total_specifications}\n`;
      report += `- Total Shards: ${data.current.workflow_metrics.total_shards}\n`;
      report += `- Total Tasks: ${data.current.workflow_metrics.total_tasks}\n`;
      report += `- Tasks Completed: ${data.current.workflow_metrics.tasks_completed}\n`;
      report += `- Average Confidence: ${data.current.workflow_metrics.average_confidence.toFixed(1)}%\n`;
      report += `- Average Context Size: ${data.current.workflow_metrics.average_context_size} lines\n\n`;

      report += `### Quality Metrics\n`;
      report += `- Test Coverage: ${data.current.quality_metrics.test_coverage}% (Target: ${data.targets.test_coverage}%)\n`;
      report += `- Code Complexity: ${data.current.quality_metrics.code_complexity} (Target: ${data.targets.code_complexity})\n`;
      report += `- Documentation Coverage: ${data.current.quality_metrics.documentation_coverage}% (Target: ${data.targets.documentation_coverage}%)\n`;
      report += `- Technical Debt: ${data.current.quality_metrics.technical_debt} (Target: ${data.targets.technical_debt})\n\n`;

      report += `### Performance Metrics\n`;
      report += `- Average Task Time: ${data.current.performance_metrics.average_task_time.toFixed(2)} hours\n`;
      report += `- Spec to Implementation: ${data.current.performance_metrics.specification_to_implementation.toFixed(2)} hours\n`;
      report += `- Rework Rate: ${data.current.performance_metrics.rework_rate.toFixed(1)}%\n`;
      report += `- First-Pass Success: ${data.current.performance_metrics.first_pass_success.toFixed(1)}%\n\n`;
    }

    const targetCheck = await this.checkTargets();
    report += `## Target Status\n`;
    report += targetCheck.passing ? '✅ All targets met\n' : '❌ Some targets not met:\n';
    for (const failure of targetCheck.failures) {
      report += `  - ${failure}\n`;
    }

    if (data.history.length > 0) {
      report += `\n## History\n`;
      report += `${data.history.length} snapshots recorded\n`;

      // Show trend for last 5 snapshots
      const recent = data.history.slice(-5);
      if (recent.length > 1) {
        report += `\n### Recent Trends\n`;

        const first = recent[0];
        const last = recent[recent.length - 1];

        const coverageChange = last.quality_metrics.test_coverage - first.quality_metrics.test_coverage;
        const tasksChange = last.workflow_metrics.tasks_completed - first.workflow_metrics.tasks_completed;

        report += `- Test Coverage: ${coverageChange >= 0 ? '+' : ''}${coverageChange.toFixed(1)}%\n`;
        report += `- Tasks Completed: +${tasksChange}\n`;
      }
    }

    return report;
  }

  /**
   * Get metrics for dashboard display
   */
  async getDashboardMetrics(): Promise<{
    summary: Record<string, any>;
    charts: Record<string, any[]>;
  }> {
    await this.load();

    const summary: Record<string, any> = {};
    const charts: Record<string, any[]> = {};

    if (this.metricsData!.current) {
      summary.workflow = this.metricsData!.current.workflow_metrics;
      summary.quality = this.metricsData!.current.quality_metrics;
      summary.performance = this.metricsData!.current.performance_metrics;
      summary.targets = this.metricsData!.targets;
    }

    // Prepare chart data from history
    if (this.metricsData!.history.length > 0) {
      charts.testCoverage = this.metricsData!.history.map(h => ({
        timestamp: h.timestamp,
        value: h.quality_metrics.test_coverage
      }));

      charts.tasksCompleted = this.metricsData!.history.map(h => ({
        timestamp: h.timestamp,
        value: h.workflow_metrics.tasks_completed
      }));

      charts.averageConfidence = this.metricsData!.history.map(h => ({
        timestamp: h.timestamp,
        value: h.workflow_metrics.average_confidence
      }));
    }

    return { summary, charts };
  }

  /**
   * Create empty current metrics structure
   */
  private createEmptyCurrentMetrics() {
    return {
      workflow_metrics: {
        total_brainstorms: 0,
        total_specifications: 0,
        total_shards: 0,
        total_tasks: 0,
        tasks_completed: 0,
        average_confidence: 0,
        average_context_size: 0
      },
      quality_metrics: {
        test_coverage: 0,
        code_complexity: 0,
        documentation_coverage: 0,
        technical_debt: 0
      },
      performance_metrics: {
        average_task_time: 0,
        specification_to_implementation: 0,
        rework_rate: 0,
        first_pass_success: 0
      }
    };
  }

  /**
   * Reset metrics to baseline
   */
  async reset(): Promise<void> {
    await this.load();

    this.metricsData!.current = undefined;
    this.metricsData!.history = [];

    await this.save();
  }

  /**
   * Export metrics to JSON
   */
  async exportToJSON(filePath: string): Promise<void> {
    await this.load();
    await fs.writeJSON(filePath, this.metricsData, { spaces: 2 });
  }

  /**
   * Import metrics from JSON
   */
  async importFromJSON(filePath: string): Promise<void> {
    const data = await fs.readJSON(filePath);
    this.metricsData = data;
    await this.save();
  }
}