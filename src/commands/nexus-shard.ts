import { DocumentSharder } from '../engine/sharding/DocumentSharder';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';

interface ShardOptions {
  input: string;
  output?: string;
  maxLines?: number;
  preview?: boolean;
  force?: boolean;
}

export class NexusShardCommand {
  private sharder: DocumentSharder;

  constructor() {
    this.sharder = new DocumentSharder();
  }

  /**
   * Execute the shard command
   */
  async execute(options: ShardOptions): Promise<void> {
    console.log('🔀 Nexus Document Sharder');
    console.log('Version: 1.0.0');
    console.log('─'.repeat(50));

    try {
      // Validate input file
      if (!options.input) {
        throw new Error('Input file is required. Usage: /nexus-shard <input-file>');
      }

      if (!await fs.pathExists(options.input)) {
        throw new Error(`Input file not found: ${options.input}`);
      }

      const stats = await fs.stat(options.input);
      if (!stats.isFile()) {
        throw new Error(`Input must be a file: ${options.input}`);
      }

      // Configure sharder
      const config: any = {};
      if (options.maxLines) {
        config.maxLines = options.maxLines;
      }
      if (options.output) {
        config.outputDir = options.output;
      } else {
        config.outputDir = '.nexus/specs/sharded';
      }

      // Check for existing shards
      const baseName = path.basename(options.input, path.extname(options.input));
      const outputPath = path.join(config.outputDir, baseName);

      if (await fs.pathExists(outputPath) && !options.force) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `Shards already exist at ${outputPath}. Overwrite?`,
            default: false
          }
        ]);

        if (!overwrite) {
          console.log('❌ Sharding cancelled');
          return;
        }

        await fs.remove(outputPath);
      }

      // Preview mode
      if (options.preview) {
        await this.previewSharding(options.input, config);
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Proceed with sharding?',
            default: true
          }
        ]);

        if (!proceed) {
          console.log('❌ Sharding cancelled');
          return;
        }
      }

      // Initialize sharder with config
      this.sharder = new DocumentSharder(config);

      // Perform sharding
      console.log(`\n📄 Processing: ${options.input}`);
      const startTime = Date.now();

      const result = await this.sharder.shardDocument(options.input);

      // Display results
      console.log('\n✅ Sharding Complete!');
      console.log('─'.repeat(50));

      // Display hierarchy
      console.log('\n📊 Shard Hierarchy:');
      console.log(`├── Epics: ${result.hierarchy.epics.length}`);

      for (const epic of result.hierarchy.epics) {
        console.log(`│   ├── ${chalk.cyan(epic.title)} (${epic.lineCount} lines)`);

        const stories = result.hierarchy.stories.get(epic.id) || [];
        for (const story of stories) {
          console.log(`│   │   ├── ${chalk.green(story.title)} (${story.lineCount} lines)`);

          const tasks = result.hierarchy.tasks.get(story.id) || [];
          for (const task of tasks) {
            console.log(`│   │   │   └── ${chalk.yellow(task.title)} (${task.lineCount} lines)`);
          }
        }
      }

      // Display metrics
      console.log('\n📈 Metrics:');
      console.log(`├── Original Size: ${result.metrics.originalLines} lines`);
      console.log(`├── Total Shards: ${result.totalShards}`);
      console.log(`├── Compression Ratio: ${(result.metrics.compressionRatio * 100).toFixed(1)}%`);
      console.log(`├── Average Shard Size: ${result.metrics.averageShardSize} lines`);
      console.log(`├── Max Shard Size: ${result.metrics.maxShardSize} lines`);
      console.log(`├── Min Shard Size: ${result.metrics.minShardSize} lines`);
      console.log(`├── Cross References: ${result.metrics.crossReferenceCount}`);
      console.log(`└── Processing Time: ${result.metrics.processingTime}ms`);

      // Display output location
      console.log(`\n📁 Output Location: ${outputPath}`);
      console.log(`├── index.json - Navigation index`);
      console.log(`├── epics/ - Epic-level shards`);
      console.log(`├── stories/ - Story-level shards`);
      console.log(`└── tasks/ - Task-level shards`);

      // Offer next steps
      await this.offerNextSteps(outputPath);

    } catch (error: any) {
      console.error('❌ Sharding failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Preview sharding without writing files
   */
  private async previewSharding(inputFile: string, config: any): Promise<void> {
    console.log('\n🔍 Preview Mode');
    console.log('─'.repeat(50));

    const content = await fs.readFile(inputFile, 'utf-8');
    const lines = content.split('\n');

    console.log(`📄 File: ${inputFile}`);
    console.log(`├── Total Lines: ${lines.length}`);
    console.log(`├── Max Shard Size: ${config.maxLines || 500} lines`);

    // Estimate shard count
    const estimatedShards = Math.ceil(lines.length / (config.maxLines || 500));
    console.log(`└── Estimated Shards: ~${estimatedShards}`);

    // Detect major sections
    const sections: string[] = [];
    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/)) {
        sections.push(line.replace(/^#{1,3}\s+/, '').trim());
      }
    }

    if (sections.length > 0) {
      console.log(`\n📑 Detected Sections (${sections.length}):`);
      sections.slice(0, 10).forEach(section => {
        console.log(`  • ${section}`);
      });
      if (sections.length > 10) {
        console.log(`  ... and ${sections.length - 10} more`);
      }
    }
  }

  /**
   * Offer next steps after sharding
   */
  private async offerNextSteps(outputPath: string): Promise<void> {
    console.log('\n📋 Next Steps:');

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do next?',
        choices: [
          { name: 'View shard index', value: 'view-index' },
          { name: 'Browse shards', value: 'browse' },
          { name: 'Create tasks from shards', value: 'decompose' },
          { name: 'Test reassembly', value: 'reassemble' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'view-index':
        await this.viewIndex(outputPath);
        break;

      case 'browse':
        await this.browseShards(outputPath);
        break;

      case 'decompose':
        console.log('\nTo create tasks from shards, run:');
        console.log(`/nexus-decompose --shards="${outputPath}"`);
        break;

      case 'reassemble':
        await this.testReassembly(outputPath);
        break;

      case 'exit':
        console.log('\n✅ Sharding complete!');
        break;
    }
  }

  /**
   * View the shard index
   */
  private async viewIndex(outputPath: string): Promise<void> {
    const indexPath = path.join(outputPath, 'index.json');
    const index = await fs.readJSON(indexPath);

    console.log('\n📄 Shard Index:');
    console.log(JSON.stringify(index, null, 2));
  }

  /**
   * Browse shards interactively
   */
  private async browseShards(outputPath: string): Promise<void> {
    const indexPath = path.join(outputPath, 'index.json');
    const index = await fs.readJSON(indexPath);

    const choices = [];

    for (const epic of index.epics) {
      choices.push({
        name: `📘 ${epic.title} (Epic)`,
        value: { type: 'epics', id: epic.id }
      });

      const stories = index.stories.find((s: any) => s.epicId === epic.id);
      if (stories) {
        for (const story of stories.stories) {
          choices.push({
            name: `  📗 ${story.title} (Story)`,
            value: { type: 'stories', id: story.id }
          });

          const tasks = index.tasks.find((t: any) => t.storyId === story.id);
          if (tasks) {
            for (const task of tasks.tasks) {
              choices.push({
                name: `    📙 ${task.title} (Task)`,
                value: { type: 'tasks', id: task.id }
              });
            }
          }
        }
      }
    }

    choices.push({ name: '← Back', value: null });

    const { shard } = await inquirer.prompt([
      {
        type: 'list',
        name: 'shard',
        message: 'Select a shard to view:',
        choices,
        pageSize: 15
      }
    ]);

    if (shard) {
      const shardPath = path.join(outputPath, shard.type, `${shard.id}.md`);
      const content = await fs.readFile(shardPath, 'utf-8');

      console.log('\n' + '─'.repeat(80));
      console.log(content);
      console.log('─'.repeat(80));

      await this.browseShards(outputPath);
    }
  }

  /**
   * Test reassembly of shards
   */
  private async testReassembly(outputPath: string): Promise<void> {
    console.log('\n🔄 Testing Reassembly...');

    const reassembled = await this.sharder.reassembleDocument(outputPath);

    const outputFile = `${outputPath}-reassembled.md`;
    await fs.writeFile(outputFile, reassembled);

    console.log(`✅ Reassembled document written to: ${outputFile}`);

    // Compare with original
    const originalFile = path.join(outputPath, '..', '..', 'monolithic', `${path.basename(outputPath)}.md`);
    if (await fs.pathExists(originalFile)) {
      const original = await fs.readFile(originalFile, 'utf-8');
      const similarity = this.calculateSimilarity(original, reassembled);

      console.log(`📊 Similarity to original: ${(similarity * 100).toFixed(1)}%`);
    }
  }

  /**
   * Calculate similarity between two texts
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const lines1 = text1.split('\n').filter(l => l.trim());
    const lines2 = text2.split('\n').filter(l => l.trim());

    let matches = 0;
    for (const line of lines1) {
      if (lines2.includes(line)) {
        matches++;
      }
    }

    return matches / Math.max(lines1.length, lines2.length);
  }
}

// CLI entry point
if (require.main === module) {
  const command = new NexusShardCommand();

  const args = process.argv.slice(2);
  const input = args.find(arg => !arg.startsWith('--')) || '';

  const options: ShardOptions = {
    input
  };

  // Parse flags
  args.forEach(arg => {
    if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg.startsWith('--max-lines=')) {
      options.maxLines = parseInt(arg.split('=')[1]);
    } else if (arg === '--preview') {
      options.preview = true;
    } else if (arg === '--force') {
      options.force = true;
    }
  });

  command.execute(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}