import { readFileSync, writeFileSync } from 'fs';
import * as matter from 'gray-matter';
import { Decision } from '../constitution/ConstitutionalTDDEnforcer';

export interface TaskMetrics {
  red_completed_at?: string;
  green_completed_at?: string;
  refactor_completed_at?: string;
  total_duration?: number;
  test_coverage?: number;
  violations_count?: number;
}

export interface TaskStatus {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  tdd_phase?: 'red' | 'green' | 'refactor' | 'complete';
  modified: string;
  metrics: TaskMetrics;
}

export class TaskStatusManager {
  updateTaskStatus(taskId: string, phase: 'red' | 'green' | 'refactor' | 'complete'): void {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');
    const { data: frontmatter, content: body } = matter(content);

    // Update frontmatter
    frontmatter.status = phase === 'complete' ? 'completed' : 'in_progress';
    frontmatter.modified = new Date().toISOString();
    frontmatter.tdd_phase = phase;

    // Update metrics
    frontmatter.metrics = {
      ...frontmatter.metrics,
      [`${phase}_completed_at`]: new Date().toISOString()
    };

    // Calculate total duration if complete
    if (phase === 'complete' && frontmatter.metrics.red_completed_at) {
      const start = new Date(frontmatter.created || frontmatter.metrics.red_completed_at);
      const end = new Date();
      frontmatter.metrics.total_duration = end.getTime() - start.getTime();
    }

    // Write updated file
    const updatedContent = matter.stringify(body, frontmatter);
    writeFileSync(taskFile, updatedContent, 'utf8');

    console.log(`📊 Task ${taskId} status updated to ${phase}`);
    this.logStatusChange(taskId, phase);
  }

  logImplementationDecision(taskId: string, decision: Decision): void {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');

    // Append to decision log section
    const decisionEntry = `
### ${new Date().toISOString()}
**Decision**: ${decision.title}
**Context**: ${decision.context}
**Options Considered**: ${decision.options.join(', ')}
**Chosen**: ${decision.chosen}
**Rationale**: ${decision.rationale}
**Confidence**: ${decision.confidence}%
`;

    let updatedContent: string;
    if (content.includes('## Decision Log')) {
      // Replace existing decision log placeholder
      updatedContent = content.replace(
        /## Decision Log\n\[To be filled with implementation decisions\]/,
        '## Decision Log' + decisionEntry
      );
    } else {
      // Add decision log section
      updatedContent = content + '\n\n## Decision Log' + decisionEntry;
    }

    writeFileSync(taskFile, updatedContent, 'utf8');
    console.log(`📝 Decision logged for task ${taskId}: ${decision.title}`);
  }

  getTaskStatus(taskId: string): TaskStatus {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');
    const { data: frontmatter } = matter(content);

    return {
      id: taskId,
      status: frontmatter.status || 'pending',
      tdd_phase: frontmatter.tdd_phase,
      modified: frontmatter.modified || frontmatter.created || new Date().toISOString(),
      metrics: frontmatter.metrics || {}
    };
  }

  updateTaskMetrics(taskId: string, metrics: Partial<TaskMetrics>): void {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');
    const { data: frontmatter, content: body } = matter(content);

    // Update metrics
    frontmatter.metrics = {
      ...frontmatter.metrics,
      ...metrics
    };

    frontmatter.modified = new Date().toISOString();

    // Write updated file
    const updatedContent = matter.stringify(body, frontmatter);
    writeFileSync(taskFile, updatedContent, 'utf8');

    console.log(`📊 Metrics updated for task ${taskId}`);
  }

  markTaskBlocked(taskId: string, reason: string, violationType: string): void {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');
    const { data: frontmatter, content: body } = matter(content);

    // Update status and add blocking information
    frontmatter.status = 'blocked';
    frontmatter.blocked_reason = reason;
    frontmatter.blocked_type = violationType;
    frontmatter.blocked_at = new Date().toISOString();
    frontmatter.modified = new Date().toISOString();

    // Update metrics
    frontmatter.metrics = {
      ...frontmatter.metrics,
      violations_count: (frontmatter.metrics?.violations_count || 0) + 1
    };

    // Write updated file
    const updatedContent = matter.stringify(body, frontmatter);
    writeFileSync(taskFile, updatedContent, 'utf8');

    console.log(`🛑 Task ${taskId} blocked: ${reason}`);
    this.logStatusChange(taskId, 'blocked', { reason, violationType });
  }

  unblockTask(taskId: string, resolution: string): void {
    const taskFile = `.nexus/tasks/${taskId}.md`;
    const content = readFileSync(taskFile, 'utf8');
    const { data: frontmatter, content: body } = matter(content);

    // Remove blocking information
    delete frontmatter.blocked_reason;
    delete frontmatter.blocked_type;
    delete frontmatter.blocked_at;

    // Set status back to in_progress
    frontmatter.status = 'in_progress';
    frontmatter.unblocked_at = new Date().toISOString();
    frontmatter.unblock_resolution = resolution;
    frontmatter.modified = new Date().toISOString();

    // Write updated file
    const updatedContent = matter.stringify(body, frontmatter);
    writeFileSync(taskFile, updatedContent, 'utf8');

    console.log(`✅ Task ${taskId} unblocked: ${resolution}`);
    this.logStatusChange(taskId, 'unblocked', { resolution });
  }

  getAllTaskStatuses(): TaskStatus[] {
    // This would typically read from a task index or scan the tasks directory
    // For now, return empty array as this would require directory scanning
    return [];
  }

  getTasksByStatus(status: 'pending' | 'in_progress' | 'completed' | 'blocked'): TaskStatus[] {
    // This would filter tasks by status
    // Implementation would scan task directory or use an index
    return [];
  }

  getTasksByPhase(phase: 'red' | 'green' | 'refactor' | 'complete'): TaskStatus[] {
    // This would filter tasks by TDD phase
    // Implementation would scan task directory or use an index
    return [];
  }

  generateStatusReport(): string {
    const timestamp = new Date().toISOString();

    // This would generate a comprehensive status report
    // For now, return a basic template
    return `
# Task Status Report
Generated: ${timestamp}

## Summary
- Pending: 0
- In Progress: 0
- Completed: 0
- Blocked: 0

## TDD Phase Distribution
- RED: 0
- GREEN: 0
- REFACTOR: 0
- COMPLETE: 0

## Recent Activity
No recent activity

## Blocked Tasks
No blocked tasks

## Performance Metrics
- Average completion time: N/A
- Average test coverage: N/A
- Constitutional violations: 0
`;
  }

  private logStatusChange(taskId: string, status: string, metadata?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      taskId,
      status,
      metadata: metadata || {}
    };

    const logPath = '.nexus/metrics/task-status.log';
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      writeFileSync(logPath, logLine, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log status change:', error.message);
    }
  }
}