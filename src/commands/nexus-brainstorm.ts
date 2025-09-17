import { BrainstormEngine } from '../pipeline/BrainstormEngine';
import * as inquirer from 'inquirer';

interface BrainstormOptions {
  topic: string;
  problem?: string;
  minApproaches?: number;
  output?: string;
}

export class NexusBrainstormCommand {
  private engine: BrainstormEngine;

  constructor() {
    this.engine = new BrainstormEngine();
  }

  /**
   * Execute the brainstorm command
   */
  async execute(options: BrainstormOptions): Promise<void> {
    console.log('🚀 Nexus Brainstorm Engine');
    console.log('Version: 2.0.0');
    console.log('─'.repeat(50));

    try {
      // Validate topic
      if (!options.topic) {
        throw new Error('Topic is required. Usage: /nexus-brainstorm <topic>');
      }

      // Get problem statement if not provided
      let problemStatement = options.problem;
      if (!problemStatement) {
        const answers = await inquirer.prompt([
          {
            type: 'editor',
            name: 'problem',
            message: 'Describe the problem or requirement in detail:',
            default: `Problem: How to implement ${options.topic}\n\nContext:\n- \n\nRequirements:\n- \n\nConstraints:\n- `
          }
        ]);
        problemStatement = answers.problem;
      }

      // Configure engine if custom settings provided
      if (options.minApproaches) {
        (this.engine as any).MIN_APPROACHES = options.minApproaches;
      }
      if (options.output) {
        (this.engine as any).OUTPUT_DIR = options.output;
      }

      // Run brainstorm session
      const session = await this.engine.runBrainstorm(options.topic, problemStatement);

      // Post-brainstorm options
      await this.offerNextSteps(session);

    } catch (error: any) {
      console.error('❌ Brainstorm failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Offer next steps after brainstorming
   */
  private async offerNextSteps(session: any): Promise<void> {
    console.log('\n📋 Next Steps Available:');

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: [
          { name: 'Create specification for top approach', value: 'specify' },
          { name: 'Compare approaches in detail', value: 'compare' },
          { name: 'Generate another brainstorm', value: 'again' },
          { name: 'Export to task system', value: 'export' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'specify':
        console.log('\nTo create a specification, run:');
        console.log(`/nexus-specify --approach="${session.selected_approaches[0].title}"`);
        break;

      case 'compare':
        await this.compareApproaches(session);
        break;

      case 'again':
        console.log('\nTo run another brainstorm, use:');
        console.log(`/nexus-brainstorm "${session.topic}" --problem="Different angle or constraint"`);
        break;

      case 'export':
        await this.exportToTasks(session);
        break;

      case 'exit':
        console.log('\n✅ Brainstorm session complete!');
        break;
    }
  }

  /**
   * Compare selected approaches in detail
   */
  private async compareApproaches(session: any): Promise<void> {
    console.log('\n📊 Approach Comparison Matrix');
    console.log('─'.repeat(80));

    const headers = ['Approach', 'Category', 'Feasibility', 'Complexity', 'Risk', 'Innovation', 'Score'];
    const widths = [30, 12, 11, 10, 6, 11, 7];

    // Print headers
    headers.forEach((h, i) => {
      process.stdout.write(h.padEnd(widths[i]));
    });
    console.log();
    console.log('─'.repeat(80));

    // Print approaches
    session.selected_approaches.forEach((approach: any) => {
      const row = [
        approach.title.substring(0, 28),
        approach.category,
        approach.feasibility + '/10',
        approach.complexity + '/10',
        approach.risk + '/10',
        approach.innovation + '/10',
        approach.score + '/10'
      ];

      row.forEach((cell, i) => {
        process.stdout.write(String(cell).padEnd(widths[i]));
      });
      console.log();
    });

    console.log('─'.repeat(80));

    // Show detailed comparison
    const { approaches } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'approaches',
        message: 'Select approaches for detailed comparison:',
        choices: session.selected_approaches.map((a: any) => ({
          name: a.title,
          value: a,
          checked: true
        }))
      }
    ]);

    if (approaches.length > 0) {
      console.log('\n📝 Detailed Comparison:');
      approaches.forEach((approach: any) => {
        console.log(`\n### ${approach.title}`);
        console.log(`Category: ${approach.category}`);
        console.log(`\nPros:`);
        approach.pros.forEach((pro: string) => console.log(`  ✓ ${pro}`));
        console.log(`\nCons:`);
        approach.cons.forEach((con: string) => console.log(`  ✗ ${con}`));
        console.log(`\nRationale: ${approach.rationale}`);
      });
    }
  }

  /**
   * Export brainstorm results to task system
   */
  private async exportToTasks(session: any): Promise<void> {
    console.log('\n📤 Exporting to Task System...');

    const tasks = session.selected_approaches.map((approach: any, index: number) => ({
      title: `Investigate: ${approach.title}`,
      description: approach.description,
      priority: index === 0 ? 'high' : 'medium',
      tags: ['brainstorm', session.topic.toLowerCase().replace(/\s+/g, '-'), approach.category],
      metadata: {
        feasibility: approach.feasibility,
        complexity: approach.complexity,
        risk: approach.risk,
        innovation: approach.innovation,
        score: approach.score
      }
    }));

    // Try to add to STM if available
    const { execSync } = require('child_process');
    let addedCount = 0;

    for (const task of tasks) {
      try {
        execSync(
          `stm add "${task.title}" --description "${task.description}" --tags "${task.tags.join(',')}"`,
          { stdio: 'pipe' }
        );
        addedCount++;
      } catch {
        // Fallback to console output
        console.log(`\nTask: ${task.title}`);
        console.log(`Description: ${task.description}`);
        console.log(`Tags: ${task.tags.join(', ')}`);
      }
    }

    if (addedCount > 0) {
      console.log(`\n✅ Added ${addedCount} tasks to STM`);
    } else {
      console.log('\n✅ Tasks displayed above (STM not available)');
    }
  }
}

// CLI entry point
if (require.main === module) {
  const command = new NexusBrainstormCommand();

  const args = process.argv.slice(2);
  const topic = args.find(arg => !arg.startsWith('--')) || '';

  const options: BrainstormOptions = {
    topic
  };

  // Parse flags
  args.forEach(arg => {
    if (arg.startsWith('--problem=')) {
      options.problem = arg.split('=')[1];
    } else if (arg.startsWith('--min-approaches=')) {
      options.minApproaches = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  });

  command.execute(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}