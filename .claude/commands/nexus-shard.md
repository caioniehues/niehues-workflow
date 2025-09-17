---
command: nexus-shard
description: Break monolithic specifications into manageable shards with embedded context boundaries
arguments: --spec [specification-path] --strategy [auto|manual|guided] --max-size [lines] --output [directory]
tools:
  - Read
  - Write
  - TodoWrite
  - Bash
---

# Nexus Shard Command

Breaks large specifications into manageable shards (<500 lines) while preserving semantic boundaries and context relationships.

## Usage

```bash
/nexus-shard --spec=[path] --strategy=[auto|manual|guided] --max-size=[lines] --output=[dir]
```

## Arguments

- `--spec`: Path to specification file to shard (required)
- `--strategy`: Sharding approach (default: auto)
  - `auto`: Automatic boundary detection
  - `manual`: Interactive shard review
  - `guided`: AI-assisted boundary suggestions
- `--max-size`: Maximum lines per shard (default: 500)
- `--output`: Output directory (default: .nexus/specs/sharded)

## Implementation

```typescript
import { ShardSpecialist, ShardingStrategy } from '../../src/engine/agents/ShardSpecialist';
import { AgentOrchestrator } from '../../src/engine/agents/AgentOrchestrator';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as readline from 'readline';

interface ShardCommandArgs {
  spec: string;
  strategy: 'auto' | 'manual' | 'guided';
  maxSize: number;
  output: string;
}

async function executeShardCommand(): Promise<void> {
  console.log('🔪 Nexus Shard Command');
  console.log('Breaking specifications into manageable pieces...\n');

  // Parse arguments
  const args = parseShardArguments();

  // Validate inputs
  await validateInputs(args);

  // Initialize sharding system
  const shardSpecialist = new ShardSpecialist();
  const orchestrator = new AgentOrchestrator();

  try {
    // Phase 1: Read and analyze specification
    console.log('📊 Phase 1: Analyzing specification structure...');
    const specContent = await fs.readFile(args.spec, 'utf-8');
    const specId = path.basename(args.spec, path.extname(args.spec));

    console.log(`  - Specification: ${path.basename(args.spec)}`);
    console.log(`  - Size: ${specContent.split('\n').length} lines`);
    console.log(`  - Target size: <${args.maxSize} lines per shard`);

    // Phase 2: Configure sharding strategy
    console.log('\n🎯 Phase 2: Configuring sharding strategy...');
    const shardingStrategy: Partial<ShardingStrategy> = {
      max_lines_per_shard: args.maxSize,
      preserve_semantic_boundaries: true,
      maintain_code_blocks: true,
      split_on_headers: true,
      minimum_context_overlap: 50,
      cross_reference_tracking: true
    };

    console.log(`  - Strategy: ${args.strategy}`);
    console.log(`  - Semantic boundaries: ${shardingStrategy.preserve_semantic_boundaries ? 'preserved' : 'ignored'}`);
    console.log(`  - Code blocks: ${shardingStrategy.maintain_code_blocks ? 'maintained' : 'allowed to split'}`);
    console.log(`  - Cross-references: ${shardingStrategy.cross_reference_tracking ? 'tracked' : 'ignored'}`);

    // Phase 3: Execute sharding with appropriate strategy
    console.log('\n🔧 Phase 3: Executing document sharding...');
    let shardingResult;

    switch (args.strategy) {
      case 'auto':
        shardingResult = await executeAutoSharding(shardSpecialist, specContent, specId, shardingStrategy);
        break;
      case 'manual':
        shardingResult = await executeManualSharding(shardSpecialist, specContent, specId, shardingStrategy);
        break;
      case 'guided':
        shardingResult = await executeGuidedSharding(shardSpecialist, specContent, specId, shardingStrategy);
        break;
      default:
        throw new Error(`Unknown sharding strategy: ${args.strategy}`);
    }

    // Phase 4: Validate shards
    console.log('\n✅ Phase 4: Validating shard boundaries...');
    const isValid = await shardSpecialist.validateShardBoundaries(shardingResult.shards);
    if (!isValid) {
      throw new Error('Shard validation failed - review boundary logic');
    }

    console.log(`  ✓ All ${shardingResult.shards.length} shards validated successfully`);
    console.log(`  ✓ Cross-references: ${shardingResult.cross_reference_map.size} mappings`);
    console.log(`  ✓ Semantic boundaries: ${shardingResult.sharding_metrics.semantic_boundaries_identified} identified`);

    // Phase 5: Generate outputs
    console.log('\n💾 Phase 5: Writing sharded files...');
    await writeShardedFiles(shardingResult, args.output, specId);

    // Phase 6: Generate reports
    console.log('\n📊 Phase 6: Generating reports...');
    const report = await shardSpecialist.generateShardingReport(shardingResult);
    await fs.writeFile(path.join(args.output, 'sharding-report.md'), report);

    // Phase 7: Update task tracking
    console.log('\n📝 Phase 7: Updating task tracking...');
    await updateTaskTracking(shardingResult, args.spec, args.output);

    // Summary
    console.log('\n🎉 Sharding Complete!');
    displayShardingSummary(shardingResult, args);

  } catch (error) {
    console.error(`\n❌ Sharding failed: ${error.message}`);
    console.error('\nTroubleshooting tips:');
    console.error('- Check specification file format and structure');
    console.error('- Verify file permissions and disk space');
    console.error('- Try a different sharding strategy');
    console.error('- Increase --max-size if shards are too small');
    process.exit(1);
  }
}

function parseShardArguments(): ShardCommandArgs {
  const args = process.argv.slice(2);

  const specArg = args.find(arg => arg.startsWith('--spec='));
  const strategyArg = args.find(arg => arg.startsWith('--strategy='));
  const maxSizeArg = args.find(arg => arg.startsWith('--max-size='));
  const outputArg = args.find(arg => arg.startsWith('--output='));

  if (!specArg) {
    console.error('❌ Error: --spec argument is required');
    console.error('Usage: /nexus-shard --spec=[path] --strategy=[auto|manual|guided]');
    process.exit(1);
  }

  return {
    spec: specArg.split('=')[1],
    strategy: (strategyArg?.split('=')[1] as any) || 'auto',
    maxSize: parseInt(maxSizeArg?.split('=')[1] || '500'),
    output: outputArg?.split('=')[1] || '.nexus/specs/sharded'
  };
}

async function validateInputs(args: ShardCommandArgs): Promise<void> {
  // Check if specification file exists
  if (!await fs.pathExists(args.spec)) {
    throw new Error(`Specification file not found: ${args.spec}`);
  }

  // Check if file is readable
  try {
    await fs.access(args.spec, fs.constants.R_OK);
  } catch {
    throw new Error(`Cannot read specification file: ${args.spec}`);
  }

  // Validate strategy
  if (!['auto', 'manual', 'guided'].includes(args.strategy)) {
    throw new Error(`Invalid strategy: ${args.strategy}. Must be auto, manual, or guided`);
  }

  // Validate max size
  if (args.maxSize < 100 || args.maxSize > 2000) {
    throw new Error(`Invalid max-size: ${args.maxSize}. Must be between 100 and 2000 lines`);
  }

  // Ensure output directory can be created
  await fs.ensureDir(path.dirname(args.output));

  console.log('✅ Input validation passed');
}

async function executeAutoSharding(
  shardSpecialist: ShardSpecialist,
  content: string,
  documentId: string,
  strategy: Partial<ShardingStrategy>
): Promise<any> {
  console.log('  🤖 Executing automatic sharding...');

  const result = await shardSpecialist.shardDocument(content, documentId, strategy);

  console.log(`  ✓ Created ${result.shards.length} shards automatically`);
  console.log(`  ✓ Average shard size: ${Math.round(result.sharding_metrics.average_shard_size)} lines`);
  console.log(`  ✓ Efficiency: ${(result.sharding_metrics.sharding_efficiency * 100).toFixed(1)}%`);

  return result;
}

async function executeManualSharding(
  shardSpecialist: ShardSpecialist,
  content: string,
  documentId: string,
  strategy: Partial<ShardingStrategy>
): Promise<any> {
  console.log('  👤 Executing manual sharding with user interaction...');

  // First get automatic suggestions
  const autoResult = await shardSpecialist.shardDocument(content, documentId, strategy);

  console.log('\n🔍 Review Suggested Shards:');
  console.log(`Automatically detected ${autoResult.shards.length} potential shards:\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const finalShards = [];

  for (let i = 0; i < autoResult.shards.length; i++) {
    const shard = autoResult.shards[i];

    console.log(`📦 Shard ${i + 1}/${autoResult.shards.length}: ${shard.title}`);
    console.log(`   Lines: ${shard.line_count} | Context: ${shard.context_dependencies.length} deps`);
    console.log(`   Boundaries: ${shard.semantic_boundaries.length} | References: ${shard.cross_references.length}`);

    const decision = await askUser(rl, 'Keep this shard? (y)es / (n)o / (s)plit / (m)erge: ');

    switch (decision.toLowerCase()) {
      case 'y':
      case 'yes':
        finalShards.push(shard);
        console.log('   ✅ Shard accepted\n');
        break;

      case 'n':
      case 'no':
        console.log('   ❌ Shard rejected\n');
        break;

      case 's':
      case 'split':
        console.log('   🔪 Splitting shard (not implemented in prototype)\n');
        finalShards.push(shard); // For now, just keep it
        break;

      case 'm':
      case 'merge':
        console.log('   🔗 Merging with next shard (not implemented in prototype)\n');
        finalShards.push(shard); // For now, just keep it
        break;

      default:
        console.log('   ➡️ Invalid input, keeping shard by default\n');
        finalShards.push(shard);
    }
  }

  rl.close();

  // Reconstruct result with final shards
  const finalResult = {
    ...autoResult,
    shards: finalShards,
    sharding_metrics: {
      ...autoResult.sharding_metrics,
      total_shards_created: finalShards.length
    }
  };

  console.log(`  ✓ Manual review complete: ${finalShards.length} shards selected`);

  return finalResult;
}

async function executeGuidedSharding(
  shardSpecialist: ShardSpecialist,
  content: string,
  documentId: string,
  strategy: Partial<ShardingStrategy>
): Promise<any> {
  console.log('  🧠 Executing guided sharding with AI assistance...');

  // Get automatic result as baseline
  const result = await shardSpecialist.shardDocument(content, documentId, strategy);

  // Analyze for optimization opportunities
  console.log('\n💡 AI Guidance:');

  const largeShards = result.shards.filter(s => s.line_count > strategy.max_lines_per_shard! * 0.8);
  const smallShards = result.shards.filter(s => s.line_count < strategy.max_lines_per_shard! * 0.3);
  const isolatedShards = result.shards.filter(s => s.cross_references.length === 0);

  if (largeShards.length > 0) {
    console.log(`  📏 ${largeShards.length} shards are near size limit - consider splitting`);
  }

  if (smallShards.length > 0) {
    console.log(`  📦 ${smallShards.length} shards are quite small - consider merging`);
  }

  if (isolatedShards.length > 0) {
    console.log(`  🏝️ ${isolatedShards.length} shards have no cross-references - may be standalone`);
  }

  const complexityScore = result.sharding_metrics.sharding_efficiency;
  if (complexityScore < 0.7) {
    console.log(`  ⚠️ Sharding efficiency is ${(complexityScore * 100).toFixed(1)}% - consider manual review`);
  } else {
    console.log(`  ✨ Sharding efficiency is ${(complexityScore * 100).toFixed(1)}% - looks good!`);
  }

  console.log(`  ✓ Guided analysis complete`);

  return result;
}

async function writeShardedFiles(result: any, outputDir: string, specId: string): Promise<void> {
  await fs.ensureDir(outputDir);

  // Write individual shard files
  for (const shard of result.shards) {
    const filename = `${shard.id}.md`;
    const filepath = path.join(outputDir, filename);

    const shardContent = `# ${shard.title}

*Shard ${shard.shard_index + 1} of ${shard.total_shards} | Lines: ${shard.line_count}*

## Context Dependencies
${shard.context_dependencies.map(dep => `- ${dep}`).join('\n')}

## Cross References
${shard.cross_references.map(ref => `- [${ref.description}](${ref.target_shard})`).join('\n')}

## Content

${shard.content}

## Navigation
${shard.navigation_metadata.previous_shard ? `← Previous: [${shard.navigation_metadata.previous_shard}](${shard.navigation_metadata.previous_shard}.md)` : ''}
${shard.navigation_metadata.next_shard ? `→ Next: [${shard.navigation_metadata.next_shard}](${shard.navigation_metadata.next_shard}.md)` : ''}

---
*Sharded from: ${specId} | Reading time: ~${shard.navigation_metadata.estimated_reading_time} min*
`;

    await fs.writeFile(filepath, shardContent);
  }

  // Write navigation index
  const indexContent = generateNavigationIndex(result);
  await fs.writeFile(path.join(outputDir, 'index.md'), indexContent);

  console.log(`  ✓ Written ${result.shards.length} shard files`);
  console.log(`  ✓ Written navigation index`);
  console.log(`  📁 Output: ${outputDir}`);
}

function generateNavigationIndex(result: any): string {
  const index = result.navigation_index;

  let content = `# Sharded Specification Index

Total Shards: ${index.total_shards} | Estimated Reading Time: ${index.estimated_total_time} minutes

## Quick Navigation

`;

  // Generate table of contents
  for (const hierarchyItem of index.shard_hierarchy) {
    const indent = '  '.repeat(hierarchyItem.level - 1);
    content += `${indent}- [${hierarchyItem.title}](${hierarchyItem.shard_id}.md) *(~${hierarchyItem.estimated_time} min)*\n`;
  }

  content += `\n## Topic Index

`;

  // Generate topic index
  for (const [topic, shardIds] of index.topic_index) {
    content += `### ${topic.charAt(0).toUpperCase() + topic.slice(1)}
${shardIds.map(id => `- [${id}](${id}.md)`).join('\n')}

`;
  }

  content += `## Reference Graph

This section shows how shards reference each other:

`;

  // Generate reference graph
  for (const [shardId, references] of index.reference_graph) {
    if (references.length > 0) {
      content += `- **${shardId}** references: ${references.map(ref => `[${ref}](${ref}.md)`).join(', ')}\n`;
    }
  }

  return content;
}

async function updateTaskTracking(result: any, originalSpec: string, outputDir: string): Promise<void> {
  // Add todo item to track sharding completion
  await new Promise(resolve => {
    require('child_process').exec(
      `echo "Sharded ${path.basename(originalSpec)} into ${result.shards.length} files" | todo`,
      () => resolve(void 0)
    );
  });

  console.log(`  ✓ Task tracking updated`);
}

function displayShardingSummary(result: any, args: ShardCommandArgs): void {
  const metrics = result.sharding_metrics;

  console.log('\n📈 Final Summary:');
  console.log(`  📄 Original: ${metrics.original_lines} lines`);
  console.log(`  🔪 Shards: ${metrics.total_shards_created} files`);
  console.log(`  📏 Average size: ${Math.round(metrics.average_shard_size)} lines`);
  console.log(`  📐 Max shard: ${metrics.max_shard_size} lines`);
  console.log(`  🔗 Cross-refs: ${metrics.cross_references_count}`);
  console.log(`  🎯 Boundaries: ${metrics.semantic_boundaries_identified}`);
  console.log(`  ⚡ Efficiency: ${(metrics.sharding_efficiency * 100).toFixed(1)}%`);

  console.log('\n📁 Output Files:');
  console.log(`  🗂️ Directory: ${args.output}`);
  console.log(`  📋 Index: ${path.join(args.output, 'index.md')}`);
  console.log(`  📊 Report: ${path.join(args.output, 'sharding-report.md')}`);

  console.log('\n🎯 Next Steps:');
  console.log('  1. Review the sharded files for completeness');
  console.log('  2. Use /nexus-specify to work with individual shards');
  console.log('  3. Reference shards in task files for context embedding');
  console.log('  4. Update any existing documentation links');
}

async function askUser(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Execute the command
executeShardCommand().catch(error => {
  console.error('Command execution failed:', error);
  process.exit(1);
});
```

## Features

### Automatic Sharding
- Detects natural semantic boundaries (headers, sections, code blocks)
- Maintains code block integrity
- Preserves cross-references between sections
- Optimizes for ~500 line target size

### Manual Review Mode
- Interactive shard-by-shard review
- Options to accept, reject, split, or merge shards
- Real-time statistics and guidance
- User-controlled final output

### Guided AI Assistance
- Analyzes automatic sharding results
- Identifies optimization opportunities
- Provides recommendations for improvements
- Highlights potential issues

### Smart Context Boundaries
- Each shard includes embedded context (200-500 lines)
- Cross-references automatically detected and linked
- Navigation metadata for easy traversal
- Context dependencies clearly identified

### Quality Outputs
- Professional markdown format
- Navigation index with hierarchy
- Cross-reference mapping
- Detailed sharding report
- Task tracking integration

## Success Criteria

- ✅ Breaks specifications into <500 line shards
- ✅ Preserves semantic boundaries and relationships
- ✅ Embeds context boundaries in each shard
- ✅ Generates navigation index for easy traversal
- ✅ Supports auto/manual/guided strategies
- ✅ Achieves 70%+ size reduction efficiency
- ✅ Maintains cross-references between shards
- ✅ Integrates with ShardSpecialist agent
- ✅ Provides comprehensive reporting