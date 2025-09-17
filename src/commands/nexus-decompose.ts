import { DecomposeEngine } from '../pipeline/DecomposeEngine';
import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';

interface DecomposeOptions {
  spec: string;
  strategy?: 'auto' | 'manual' | 'guided';
  contextMode?: 'adaptive' | 'full' | 'minimal';
  maxContextSize?: number;
  output?: string;
  force?: boolean;
}

export class NexusDecomposeCommand {
  private engine: DecomposeEngine;

  constructor() {
    this.engine = new DecomposeEngine();
  }

  /**
   * Execute the decompose command
   */
  async execute(options: DecomposeOptions): Promise<void> {
    console.log('📋 Nexus Task Decomposition Engine');
    console.log('Version: 1.0.0');
    console.log('─'.repeat(50));

    try {
      // Validate spec path
      if (!options.spec) {
        // Default to sharded specs if they exist
        const defaultPath = '.nexus/specs/sharded';
        if (await fs.pathExists(defaultPath)) {
          options.spec = defaultPath;
          console.log(`📁 Using default sharded specs: ${defaultPath}`);
        } else {
          throw new Error('Spec path required. Usage: /nexus-decompose --spec=<path>');
        }
      }

      if (!await fs.pathExists(options.spec)) {
        throw new Error(`Specification not found: ${options.spec}`);
      }

      // Set defaults
      options.strategy = options.strategy || 'auto';
      options.contextMode = options.contextMode || 'adaptive';
      options.output = options.output || '.nexus/tasks';

      // Check for existing tasks
      if (await fs.pathExists(options.output) && !options.force) {
        const files = await fs.readdir(options.output);
        const taskFiles = files.filter(f => f.endsWith('.md'));

        if (taskFiles.length > 0) {
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `Found ${taskFiles.length} existing tasks in ${options.output}. Overwrite?`,
              default: false
            }
          ]);

          if (!overwrite) {
            console.log('❌ Decomposition cancelled');
            return;
          }

          // Clear existing tasks
          for (const file of taskFiles) {
            await fs.remove(path.join(options.output, file));
          }
        }
      }

      // Display configuration
      console.log('\n🔧 Configuration:');
      console.log(`├── Specification: ${options.spec}`);
      console.log(`├── Strategy: ${options.strategy}`);
      console.log(`├── Context Mode: ${options.contextMode}`);
      console.log(`├── Max Context Size: ${options.maxContextSize || 2000} lines`);
      console.log(`└── Output: ${options.output}`);

      // Interactive configuration if needed
      if (options.strategy === 'guided' || options.strategy === 'manual') {
        await this.interactiveConfiguration(options);
      }

      // Run decomposition
      console.log('\n🔄 Decomposing specification into tasks...');
      const startTime = Date.now();

      const result = await this.engine.decompose(options.spec, {
        strategy: options.strategy,
        contextMode: options.contextMode,
        maxContextSize: options.maxContextSize,
        outputDir: options.output
      });

      const elapsed = Date.now() - startTime;

      // Display results
      console.log('\n✅ Decomposition Complete!');
      console.log('─'.repeat(50));

      // Task summary
      console.log('\n📊 Task Summary:');
      console.log(`├── Total Tasks: ${result.summary.totalTasks}`);
      console.log(`├── Average Context Size: ${result.summary.avgContextSize} lines`);
      console.log(`├── Average Confidence: ${result.summary.avgConfidence}%`);
      console.log(`├── Critical Path Length: ${result.summary.criticalPathLength} tasks`);
      console.log(`├── Parallelizable: ${result.summary.parallelizablePercentage}%`);
      console.log(`└── Processing Time: ${elapsed}ms`);

      // Display task hierarchy
      console.log('\n📋 Task Hierarchy:');
      this.displayTaskHierarchy(result.tasks);

      // Display dependency graph
      console.log('\n🔗 Dependency Graph:');
      this.displayDependencyGraph(result.dependencyGraph);

      // Display critical path
      console.log('\n⚡ Critical Path:');
      if (result.dependencyGraph.criticalPath.length > 0) {
        result.dependencyGraph.criticalPath.forEach((taskId, index) => {
          const task = result.tasks.find(t => t.id === taskId);
          console.log(`  ${index + 1}. ${task?.title || taskId}`);
        });
      } else {
        console.log('  No critical path (all tasks independent)');
      }

      // Display parallel opportunities
      console.log('\n🚀 Parallel Opportunities:');
      if (result.dependencyGraph.parallelOpportunities.length > 0) {
        result.dependencyGraph.parallelOpportunities.forEach((group, index) => {
          console.log(`  Group ${index + 1}:`);
          group.forEach(taskId => {
            const task = result.tasks.find(t => t.id === taskId);
            console.log(`    • ${task?.title || taskId}`);
          });
        });
      } else {
        console.log('  No parallel opportunities identified');
      }

      // Confidence analysis
      console.log('\n🎯 Confidence Analysis:');
      const lowConfidenceTasks = result.tasks.filter(t => t.confidence < 70);
      const medConfidenceTasks = result.tasks.filter(t => t.confidence >= 70 && t.confidence < 85);
      const highConfidenceTasks = result.tasks.filter(t => t.confidence >= 85);

      console.log(`├── High (≥85%): ${highConfidenceTasks.length} tasks`);
      console.log(`├── Medium (70-84%): ${medConfidenceTasks.length} tasks`);
      console.log(`└── Low (<70%): ${lowConfidenceTasks.length} tasks`);

      if (lowConfidenceTasks.length > 0) {
        console.log('\n⚠️  Low confidence tasks requiring attention:');
        lowConfidenceTasks.forEach(task => {
          console.log(`  • ${task.title} (${task.confidence}%)`);
        });
      }

      // Offer next steps
      await this.offerNextSteps(result, options);

    } catch (error: any) {
      console.error('❌ Decomposition failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Interactive configuration for guided/manual modes
   */
  private async interactiveConfiguration(options: DecomposeOptions): Promise<void> {
    console.log('\n💬 Interactive Configuration');

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'contextDetail',
        message: 'How much context detail do you need?',
        choices: [
          { name: 'Adaptive (200-2000 lines based on confidence)', value: 'adaptive' },
          { name: 'Full (include all available context)', value: 'full' },
          { name: 'Minimal (core context only)', value: 'minimal' }
        ],
        default: options.contextMode
      },
      {
        type: 'number',
        name: 'maxContext',
        message: 'Maximum context size per task (lines):',
        default: options.maxContextSize || 2000,
        validate: (input) => input > 0 && input <= 5000
      },
      {
        type: 'confirm',
        name: 'includeTDD',
        message: 'Include TDD requirements in every task?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeEdgeCases',
        message: 'Include edge case analysis?',
        default: true
      }
    ]);

    // Update options
    options.contextMode = answers.contextDetail;
    options.maxContextSize = answers.maxContext;

    // Store preferences for engine
    (this.engine as any).includeTDD = answers.includeTDD;
    (this.engine as any).includeEdgeCases = answers.includeEdgeCases;
  }

  /**
   * Display task hierarchy
   */
  private displayTaskHierarchy(tasks: any[]): void {
    // Group tasks by epic and story
    const epics = new Map<string, Map<string, any[]>>();

    for (const task of tasks) {
      if (!epics.has(task.epic)) {
        epics.set(task.epic, new Map());
      }

      const stories = epics.get(task.epic)!;
      if (!stories.has(task.story)) {
        stories.set(task.story, []);
      }

      stories.get(task.story)!.push(task);
    }

    // Display hierarchy
    for (const [epicId, stories] of epics) {
      console.log(`├── Epic: ${chalk.cyan(epicId)}`);

      for (const [storyId, storyTasks] of stories) {
        console.log(`│   ├── Story: ${chalk.green(storyId)}`);

        storyTasks.forEach((task, index) => {
          const isLast = index === storyTasks.length - 1;
          const prefix = isLast ? '└──' : '├──';
          const confidence = task.confidence >= 85 ? chalk.green(`${task.confidence}%`) :
                           task.confidence >= 70 ? chalk.yellow(`${task.confidence}%`) :
                           chalk.red(`${task.confidence}%`);

          console.log(`│   │   ${prefix} ${task.title} [${confidence}]`);
        });
      }
    }
  }

  /**
   * Display dependency graph
   */
  private displayDependencyGraph(graph: any): void {
    console.log(`├── Nodes: ${graph.nodes.length}`);
    console.log(`├── Edges: ${graph.edges.length}`);

    // Show sample dependencies
    const sampleEdges = graph.edges.slice(0, 5);
    if (sampleEdges.length > 0) {
      console.log('└── Sample Dependencies:');
      sampleEdges.forEach(edge => {
        console.log(`    • ${edge.from} → ${edge.to} [${edge.type}]`);
      });

      if (graph.edges.length > 5) {
        console.log(`    ... and ${graph.edges.length - 5} more`);
      }
    }
  }

  /**
   * Offer next steps after decomposition
   */
  private async offerNextSteps(result: any, options: DecomposeOptions): Promise<void> {
    console.log('\n📋 Next Steps:');

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: [
          { name: 'Start implementing tasks', value: 'implement' },
          { name: 'View task details', value: 'view' },
          { name: 'Export to STM', value: 'export-stm' },
          { name: 'Generate implementation plan', value: 'plan' },
          { name: 'Analyze task complexity', value: 'analyze' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'implement':
        console.log('\nTo start implementation with TDD:');
        console.log('/nexus-implement --task=<task-id>');
        console.log('\nSuggested starting point:');
        if (result.dependencyGraph.criticalPath.length > 0) {
          const firstTask = result.tasks.find(t => t.id === result.dependencyGraph.criticalPath[0]);
          console.log(`/nexus-implement --task="${firstTask?.id}"`);
        } else {
          const highestConfidence = result.tasks.sort((a, b) => b.confidence - a.confidence)[0];
          console.log(`/nexus-implement --task="${highestConfidence.id}"`);
        }
        break;

      case 'view':
        await this.viewTaskDetails(result.tasks, options);
        break;

      case 'export-stm':
        await this.exportToSTM(result.tasks);
        break;

      case 'plan':
        await this.generateImplementationPlan(result);
        break;

      case 'analyze':
        await this.analyzeComplexity(result);
        break;

      case 'exit':
        console.log('\n✅ Decomposition complete!');
        break;
    }
  }

  /**
   * View detailed task information
   */
  private async viewTaskDetails(tasks: any[], options: DecomposeOptions): Promise<void> {
    const { taskId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'taskId',
        message: 'Select a task to view:',
        choices: tasks.map(t => ({
          name: `${t.title} (${t.confidence}% confidence)`,
          value: t.id
        })),
        pageSize: 10
      }
    ]);

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskPath = path.join(options.output || '.nexus/tasks', `${task.id}.md`);

    if (await fs.pathExists(taskPath)) {
      const content = await fs.readFile(taskPath, 'utf-8');
      console.log('\n' + '─'.repeat(80));
      console.log(content);
      console.log('─'.repeat(80));
    }

    // Offer to view another task
    const { viewAnother } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'viewAnother',
        message: 'View another task?',
        default: true
      }
    ]);

    if (viewAnother) {
      await this.viewTaskDetails(tasks, options);
    }
  }

  /**
   * Export tasks to STM
   */
  private async exportToSTM(tasks: any[]): Promise<void> {
    console.log('\n📤 Exporting to STM...');

    const { execSync } = require('child_process');
    let addedCount = 0;
    let failedCount = 0;

    for (const task of tasks) {
      try {
        const deps = task.dependencies.length > 0 ? task.dependencies.join(',') : '';
        const tags = [
          'nexus',
          'decomposed',
          task.epic,
          task.story,
          task.complexity || 'medium',
          `confidence-${Math.floor(task.confidence / 10) * 10}`
        ].join(',');

        const cmd = `stm add "${task.title}" ` +
                   `--description "${task.description || 'Generated task'}" ` +
                   `--tags "${tags}" ` +
                   (deps ? `--deps "${deps}"` : '');

        execSync(cmd, { stdio: 'pipe' });
        addedCount++;
        process.stdout.write('.');
      } catch (error) {
        failedCount++;
        process.stdout.write('x');
      }
    }

    console.log(`\n✅ Added ${addedCount} tasks to STM`);
    if (failedCount > 0) {
      console.log(`⚠️  Failed to add ${failedCount} tasks`);
    }
  }

  /**
   * Generate implementation plan
   */
  private async generateImplementationPlan(result: any): Promise<void> {
    console.log('\n📅 Implementation Plan');
    console.log('─'.repeat(50));

    // Calculate total effort
    const totalHours = result.tasks.reduce((sum: number, t: any) =>
      sum + (t.estimated_hours || 4), 0
    );

    const totalDays = Math.ceil(totalHours / 8);
    const totalWeeks = Math.ceil(totalDays / 5);

    console.log(`\n📊 Effort Estimate:`);
    console.log(`├── Total Hours: ${totalHours}`);
    console.log(`├── Total Days: ${totalDays}`);
    console.log(`└── Total Weeks: ${totalWeeks}`);

    // Group tasks by week
    console.log('\n📅 Week-by-Week Breakdown:');

    let currentWeek = 1;
    let weekHours = 0;
    let weekTasks: any[] = [];

    for (const taskId of result.dependencyGraph.criticalPath) {
      const task = result.tasks.find((t: any) => t.id === taskId);
      if (!task) continue;

      const taskHours = task.estimated_hours || 4;

      if (weekHours + taskHours > 40) {
        // Print current week
        console.log(`\nWeek ${currentWeek} (${weekHours} hours):`);
        weekTasks.forEach(t => {
          console.log(`  • ${t.title} (${t.estimated_hours || 4}h)`);
        });

        // Start new week
        currentWeek++;
        weekHours = taskHours;
        weekTasks = [task];
      } else {
        weekHours += taskHours;
        weekTasks.push(task);
      }
    }

    // Print final week
    if (weekTasks.length > 0) {
      console.log(`\nWeek ${currentWeek} (${weekHours} hours):`);
      weekTasks.forEach(t => {
        console.log(`  • ${t.title} (${t.estimated_hours || 4}h)`);
      });
    }

    // Risk assessment
    console.log('\n⚠️  Risk Factors:');
    const highRiskTasks = result.tasks.filter((t: any) => t.risk_level === 'high');
    const medRiskTasks = result.tasks.filter((t: any) => t.risk_level === 'medium');

    console.log(`├── High Risk: ${highRiskTasks.length} tasks`);
    console.log(`├── Medium Risk: ${medRiskTasks.length} tasks`);
    console.log(`└── Low Risk: ${result.tasks.length - highRiskTasks.length - medRiskTasks.length} tasks`);

    if (highRiskTasks.length > 0) {
      console.log('\nHigh risk tasks requiring special attention:');
      highRiskTasks.forEach((t: any) => {
        console.log(`  • ${t.title}`);
      });
    }
  }

  /**
   * Analyze task complexity
   */
  private async analyzeComplexity(result: any): Promise<void> {
    console.log('\n🔍 Complexity Analysis');
    console.log('─'.repeat(50));

    // Group by complexity
    const simple = result.tasks.filter((t: any) => t.complexity === 'simple');
    const medium = result.tasks.filter((t: any) => t.complexity === 'medium');
    const complex = result.tasks.filter((t: any) => t.complexity === 'complex');

    console.log('\n📊 Complexity Distribution:');
    console.log(`├── Simple: ${simple.length} tasks (${(simple.length / result.tasks.length * 100).toFixed(1)}%)`);
    console.log(`├── Medium: ${medium.length} tasks (${(medium.length / result.tasks.length * 100).toFixed(1)}%)`);
    console.log(`└── Complex: ${complex.length} tasks (${(complex.length / result.tasks.length * 100).toFixed(1)}%)`);

    // Complexity vs Confidence correlation
    console.log('\n📈 Complexity vs Confidence:');

    const avgConfidenceByComplexity = {
      simple: simple.length > 0 ?
        simple.reduce((sum: number, t: any) => sum + t.confidence, 0) / simple.length : 0,
      medium: medium.length > 0 ?
        medium.reduce((sum: number, t: any) => sum + t.confidence, 0) / medium.length : 0,
      complex: complex.length > 0 ?
        complex.reduce((sum: number, t: any) => sum + t.confidence, 0) / complex.length : 0
    };

    console.log(`├── Simple tasks: ${avgConfidenceByComplexity.simple.toFixed(1)}% avg confidence`);
    console.log(`├── Medium tasks: ${avgConfidenceByComplexity.medium.toFixed(1)}% avg confidence`);
    console.log(`└── Complex tasks: ${avgConfidenceByComplexity.complex.toFixed(1)}% avg confidence`);

    // Context size by complexity
    console.log('\n📏 Average Context Size by Complexity:');

    const avgContextByComplexity = {
      simple: simple.length > 0 ?
        simple.reduce((sum: number, t: any) => sum + t.context_size, 0) / simple.length : 0,
      medium: medium.length > 0 ?
        medium.reduce((sum: number, t: any) => sum + t.context_size, 0) / medium.length : 0,
      complex: complex.length > 0 ?
        complex.reduce((sum: number, t: any) => sum + t.context_size, 0) / complex.length : 0
    };

    console.log(`├── Simple tasks: ${Math.round(avgContextByComplexity.simple)} lines`);
    console.log(`├── Medium tasks: ${Math.round(avgContextByComplexity.medium)} lines`);
    console.log(`└── Complex tasks: ${Math.round(avgContextByComplexity.complex)} lines`);

    // Recommendations
    console.log('\n💡 Recommendations:');

    if (complex.length > result.tasks.length * 0.3) {
      console.log('• High proportion of complex tasks - consider further decomposition');
    }

    if (avgConfidenceByComplexity.complex < 70) {
      console.log('• Low confidence in complex tasks - gather more requirements');
    }

    const avgContextSize = result.tasks.reduce((sum: number, t: any) =>
      sum + t.context_size, 0
    ) / result.tasks.length;

    if (avgContextSize > 1500) {
      console.log('• Large average context size - consider more focused task definitions');
    }

    const independentTasks = result.tasks.filter((t: any) =>
      t.dependencies.length === 0
    );

    if (independentTasks.length > result.tasks.length * 0.5) {
      console.log('• Many independent tasks - good parallelization opportunities');
    }
  }
}

// CLI entry point
if (require.main === module) {
  const command = new NexusDecomposeCommand();

  const args = process.argv.slice(2);

  const options: DecomposeOptions = {
    spec: ''
  };

  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--spec=')) {
      options.spec = arg.split('=')[1];
    } else if (arg.startsWith('--strategy=')) {
      options.strategy = arg.split('=')[1] as 'auto' | 'manual' | 'guided';
    } else if (arg.startsWith('--context-mode=')) {
      options.contextMode = arg.split('=')[1] as 'adaptive' | 'full' | 'minimal';
    } else if (arg.startsWith('--max-context=')) {
      options.maxContextSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--force') {
      options.force = true;
    } else if (!arg.startsWith('--')) {
      options.spec = arg;
    }
  });

  command.execute(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}