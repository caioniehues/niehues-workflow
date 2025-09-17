import { ContextEmbedder, Task, Shard, TaskWithContext } from './ContextEmbedder';

export class ContextInheritanceChain {
  private embedder: ContextEmbedder;

  constructor() {
    this.embedder = new ContextEmbedder();
  }

  async processTaskChain(tasks: Task[], shards: Shard[]): Promise<TaskWithContext[]> {
    const contextualizedTasks: TaskWithContext[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const shard = this.findShardForTask(task, shards);
      const previousTask = contextualizedTasks[i - 1]; // Previous task in chain

      // Embed context with inheritance
      const taskWithContext = await this.embedder.embedContext(
        task,
        shard,
        this.calculateConfidence(task),
        previousTask
      );

      contextualizedTasks.push(taskWithContext);

      console.log(`📋 Task ${task.id} context: ${taskWithContext.context_size} lines`);
    }

    return contextualizedTasks;
  }

  private findShardForTask(task: Task, shards: Shard[]): Shard {
    return shards.find(s => s.id === task.shard_id) || shards[0];
  }

  private calculateConfidence(task: Task): number {
    // Calculate confidence based on task complexity and available context
    let confidence = 70; // Base confidence

    // Adjust based on complexity
    switch (task.complexity) {
      case 'simple':
        confidence += 20;
        break;
      case 'medium':
        confidence += 10;
        break;
      case 'complex':
        confidence -= 10;
        break;
    }

    // Adjust based on dependencies
    if (task.dependencies.length === 0) {
      confidence += 10; // No dependencies = higher confidence
    } else if (task.dependencies.length > 3) {
      confidence -= 15; // Many dependencies = lower confidence
    }

    // Adjust based on task type
    if (task.type === 'feature') {
      confidence += 5; // Features are well-understood
    } else if (task.type === 'research') {
      confidence -= 20; // Research tasks have inherent uncertainty
    }

    return Math.max(0, Math.min(100, confidence));
  }
}