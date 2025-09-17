#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { PipelineIntegration, WorkflowRequest, WorkflowConfiguration } from '../engine/integration/PipelineIntegration';
import { AgentOrchestrator } from '../engine/agents/AgentOrchestrator';
import { DecisionLogger } from '../engine/intelligence/DecisionLogger';
import { ContextInheritance } from '../engine/context/ContextInheritance';
import { ConstitutionalEnforcer } from '../engine/constitution/ConstitutionalEnforcer';

interface ImplementOptions {
  standalone?: boolean;
  taskFile?: string;
  outputDir?: string;
  tddRequired?: boolean;
  dryRun?: boolean;
  parallelExecution?: boolean;
  constitutionalCompliance?: 'strict' | 'standard' | 'lenient';
  approvalRequired?: boolean;
  verbose?: boolean;
}

const program = new Command();

program
  .name('nexus-implement')
  .description('Implement code from decomposed tasks using Nexus Enhanced Workflow')
  .version('1.0.0');

program
  .command('run')
  .description('Run implementation phase on decomposed tasks')
  .option('-s, --standalone', 'Run as standalone implementation (not part of full workflow)', false)
  .option('-t, --task-file <path>', 'Specific task file to implement')
  .option('-o, --output-dir <path>', 'Output directory for generated code', './src')
  .option('--tdd-required', 'Enforce TDD (Test-Driven Development)', true)
  .option('--dry-run', 'Perform dry run without generating actual files', false)
  .option('--parallel', 'Enable parallel task execution', true)
  .option('--compliance <level>', 'Constitutional compliance level', 'standard')
  .option('--no-approval', 'Skip approval prompts (auto-approve)', false)
  .option('-v, --verbose', 'Enable verbose logging', false)
  .action(async (options: ImplementOptions) => {
    try {
      console.log('🚀 Nexus Implement - Code Generation & Implementation');
      console.log('═══════════════════════════════════════════════════');

      if (options.verbose) {
        console.log('🔧 Configuration:');
        console.log(`  • Standalone mode: ${options.standalone ? 'Yes' : 'No'}`);
        console.log(`  • TDD required: ${options.tddRequired ? 'Yes' : 'No'}`);
        console.log(`  • Output directory: ${options.outputDir}`);
        console.log(`  • Constitutional compliance: ${options.constitutionalCompliance}`);
        console.log(`  • Parallel execution: ${options.parallelExecution ? 'Yes' : 'No'}`);
        console.log('');
      }

      // Validate project structure
      validateProjectStructure();

      if (options.standalone) {
        console.log('🔧 Running standalone implementation...');
        await runStandaloneImplementation(options);
      } else {
        console.log('🔗 Running as part of integrated workflow...');
        await runIntegratedImplementation(options);
      }

    } catch (error) {
      console.error('❌ Implementation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('task')
  .description('Implement a specific task file')
  .argument('<taskFile>', 'Path to the task file to implement')
  .option('-o, --output-dir <path>', 'Output directory for generated code', './src')
  .option('--tdd-required', 'Enforce TDD (Test-Driven Development)', true)
  .option('--dry-run', 'Perform dry run without generating actual files', false)
  .option('-v, --verbose', 'Enable verbose logging', false)
  .action(async (taskFile: string, options: ImplementOptions) => {
    try {
      console.log(`🎯 Implementing specific task: ${taskFile}`);
      console.log('═══════════════════════════════════════════════════');

      await implementSpecificTask(taskFile, options);

    } catch (error) {
      console.error('❌ Task implementation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show implementation status and progress')
  .action(async () => {
    try {
      console.log('📊 Implementation Status');
      console.log('════════════════════════');

      await showImplementationStatus();

    } catch (error) {
      console.error('❌ Failed to get status:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function validateProjectStructure(): Promise<void> {
  const requiredDirs = ['.nexus', '.nexus/tasks'];
  const optionalDirs = ['.nexus/specs/sharded', '.nexus/brainstorms'];

  console.log('🔍 Validating project structure...');

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      throw new Error(`Required directory missing: ${dir}. Please run 'nexus-init' first.`);
    }
  }

  for (const dir of optionalDirs) {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Optional directory missing: ${dir} (workflow may be incomplete)`);
    }
  }

  console.log('✅ Project structure validated');
}

async function runStandaloneImplementation(options: ImplementOptions): Promise<void> {
  console.log('🔧 Initializing standalone implementation...');

  // Initialize components
  const decisionLogger = new DecisionLogger();
  const agentOrchestrator = new AgentOrchestrator(decisionLogger);
  const contextInheritance = new ContextInheritance();

  // Load decomposed tasks
  const tasksDir = '.nexus/tasks';
  const taskFiles = fs.readdirSync(tasksDir)
    .filter(file => file.endsWith('.md') || file.endsWith('.json'))
    .map(file => path.join(tasksDir, file));

  if (taskFiles.length === 0) {
    throw new Error('No task files found. Please run decomposition phase first.');
  }

  console.log(`📋 Found ${taskFiles.length} task files to implement`);

  // Load tasks with context
  const tasks = [];
  for (const taskFile of taskFiles) {
    console.log(`  📄 Loading: ${path.basename(taskFile)}`);
    const taskContent = fs.readFileSync(taskFile, 'utf-8');
    const task = parseTaskFile(taskContent, taskFile);
    tasks.push(task);
  }

  // Inherit context from previous phases
  console.log('🧠 Loading inherited context...');
  const inheritedContext = await contextInheritance.inheritFromPreviousPhase(
    'decomposition',
    { tasks },
    { preserve_decisions: true, include_artifacts: true }
  );

  // Configure implementation
  const implementationConfig = {
    enforce_tdd: options.tddRequired ?? true,
    require_tests: options.tddRequired ?? true,
    apply_quality_gates: true,
    constitutional_compliance: options.constitutionalCompliance || 'standard',
    output_directory: options.outputDir || './src',
    dry_run: options.dryRun || false,
    parallel_execution: options.parallelExecution ?? true
  };

  console.log('⚡ Starting implementation...');

  // Execute implementation
  const result = await agentOrchestrator.orchestrateImplementation(tasks, implementationConfig);

  console.log('\n🎉 Implementation Results:');
  console.log(`  ✅ Successfully implemented: ${result.implementations.filter((i: any) => i.status === 'completed').length} tasks`);
  console.log(`  ❌ Failed implementations: ${result.implementations.filter((i: any) => i.status === 'failed').length} tasks`);
  console.log(`  📁 Files generated: ${result.implementations.reduce((sum: number, i: any) => sum + (i.files_generated?.length || 0), 0)}`);
  console.log(`  🧪 Tests generated: ${result.implementations.reduce((sum: number, i: any) => sum + (i.tests_generated?.length || 0), 0)}`);

  // Log decision
  await decisionLogger.logDecision(
    'Standalone Implementation Execution',
    `Implemented ${tasks.length} tasks using standalone mode`,
    'implementation',
    {
      phase: 'implementation',
      component: 'nexus_implement_command',
      stakeholders: ['developer'],
      environmental_factors: [],
      constraints: [],
      assumptions: []
    },
    {
      primary_reason: `Standalone implementation of ${tasks.length} decomposed tasks`,
      supporting_reasons: [
        `Generated ${result.implementations.length} implementations`,
        `Applied TDD: ${implementationConfig.enforce_tdd}`,
        `Constitutional compliance: ${implementationConfig.constitutional_compliance}`
      ],
      risk_assessment: {
        risk_level: result.implementations.some((i: any) => i.status === 'failed') ? 'medium' : 'low',
        identified_risks: [],
        mitigation_strategies: [],
        contingency_plans: []
      },
      trade_offs: [],
      success_criteria: ['All tasks implemented', 'Tests generated', 'Quality gates passed'],
      failure_conditions: ['Implementation failures', 'Test generation failures'],
      review_triggers: ['Before deployment', 'Quality concerns']
    }
  );

  // Show detailed results if verbose
  if (options.verbose) {
    console.log('\n📋 Detailed Results:');
    result.implementations.forEach((impl: any, index: number) => {
      console.log(`\n  Task ${index + 1}: ${impl.task_title || `Task_${index}`}`);
      console.log(`    Status: ${impl.status}`);
      console.log(`    Files: ${impl.files_generated?.join(', ') || 'None'}`);
      console.log(`    Tests: ${impl.tests_generated?.join(', ') || 'None'}`);
      if (impl.errors?.length > 0) {
        console.log(`    Errors: ${impl.errors.join(', ')}`);
      }
    });
  }
}

async function runIntegratedImplementation(options: ImplementOptions): Promise<void> {
  console.log('🔗 Initializing integrated workflow implementation...');

  // Check if we're in the middle of a workflow
  const workflowStateFile = '.nexus/workflow-state.json';
  if (!fs.existsSync(workflowStateFile)) {
    throw new Error('No active workflow found. Run the full workflow or use --standalone mode.');
  }

  const workflowState = JSON.parse(fs.readFileSync(workflowStateFile, 'utf-8'));

  if (workflowState.current_phase !== 'ready_for_implementation') {
    throw new Error(`Workflow not ready for implementation. Current phase: ${workflowState.current_phase}`);
  }

  // Initialize pipeline integration
  const pipelineIntegration = new PipelineIntegration();

  // Create workflow request from stored state
  const workflowRequest: WorkflowRequest = {
    project_name: workflowState.project_name,
    initial_requirement: workflowState.initial_requirement,
    project_directory: workflowState.project_directory,
    configuration: {
      auto_advance: !options.approvalRequired,
      validation_level: 'standard',
      parallel_processing: options.parallelExecution ?? true,
      constitutional_compliance: options.constitutionalCompliance || 'standard',
      context_preservation_mode: 'standard',
      error_handling: 'graceful_degradation',
      approval_required: options.approvalRequired ?? true,
      dry_run: options.dryRun || false
    }
  };

  console.log('⚡ Executing implementation phase within integrated workflow...');

  // Execute just the implementation phase (phases 1-4 already completed)
  const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

  console.log('\n🎉 Integrated Implementation Results:');
  console.log(`  📊 Workflow Status: ${result.status}`);
  console.log(`  📁 Artifacts Generated: ${result.artifacts_generated.length}`);
  console.log(`  📝 Decisions Made: ${result.decisions_made.length}`);
  console.log(`  ⚡ Performance Score: ${result.execution_summary.performance_score}`);
  console.log(`  🏆 Quality Score: ${result.execution_summary.quality_score}`);

  // Update workflow state
  workflowState.current_phase = 'completed';
  workflowState.completion_time = new Date().toISOString();
  workflowState.final_status = result.status;
  fs.writeFileSync(workflowStateFile, JSON.stringify(workflowState, null, 2));

  if (options.verbose) {
    console.log('\n📋 Workflow Summary:');
    result.phases_executed.forEach((phase, index) => {
      console.log(`  Phase ${index + 1}: ${phase.phase} - ${phase.status} (${phase.duration_ms}ms)`);
    });

    if (result.execution_summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.execution_summary.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
  }
}

async function implementSpecificTask(taskFile: string, options: ImplementOptions): Promise<void> {
  console.log(`🎯 Implementing task: ${taskFile}`);

  if (!fs.existsSync(taskFile)) {
    throw new Error(`Task file not found: ${taskFile}`);
  }

  // Initialize components
  const decisionLogger = new DecisionLogger();
  const agentOrchestrator = new AgentOrchestrator(decisionLogger);

  // Load and parse task
  const taskContent = fs.readFileSync(taskFile, 'utf-8');
  const task = parseTaskFile(taskContent, taskFile);

  console.log(`📋 Task: ${task.title || path.basename(taskFile)}`);
  console.log(`📄 Description: ${task.description || 'No description'}`);

  // Configure implementation
  const implementationConfig = {
    enforce_tdd: options.tddRequired ?? true,
    require_tests: options.tddRequired ?? true,
    apply_quality_gates: true,
    constitutional_compliance: 'standard',
    output_directory: options.outputDir || './src',
    dry_run: options.dryRun || false,
    parallel_execution: false // Single task, no need for parallel
  };

  console.log('⚡ Implementing task...');

  // Execute implementation for single task
  const result = await agentOrchestrator.orchestrateImplementation([task], implementationConfig);

  const implementation = result.implementations[0];

  console.log('\n🎉 Task Implementation Results:');
  console.log(`  📊 Status: ${implementation.status}`);
  console.log(`  📁 Files Generated: ${implementation.files_generated?.length || 0}`);
  console.log(`  🧪 Tests Generated: ${implementation.tests_generated?.length || 0}`);

  if (implementation.files_generated?.length > 0) {
    console.log('  📂 Generated Files:');
    implementation.files_generated.forEach((file: string) => {
      console.log(`    • ${file}`);
    });
  }

  if (implementation.tests_generated?.length > 0) {
    console.log('  🧪 Generated Tests:');
    implementation.tests_generated.forEach((test: string) => {
      console.log(`    • ${test}`);
    });
  }

  if (implementation.errors?.length > 0) {
    console.log('  ❌ Errors:');
    implementation.errors.forEach((error: string) => {
      console.log(`    • ${error}`);
    });
  }
}

async function showImplementationStatus(): Promise<void> {
  // Check project structure
  const nexusDir = '.nexus';
  if (!fs.existsSync(nexusDir)) {
    console.log('❌ No Nexus project found in current directory');
    return;
  }

  // Check workflow state
  const workflowStateFile = path.join(nexusDir, 'workflow-state.json');
  let workflowState = null;

  if (fs.existsSync(workflowStateFile)) {
    workflowState = JSON.parse(fs.readFileSync(workflowStateFile, 'utf-8'));
  }

  // Check for task files
  const tasksDir = path.join(nexusDir, 'tasks');
  const taskFiles = fs.existsSync(tasksDir)
    ? fs.readdirSync(tasksDir).filter(f => f.endsWith('.md') || f.endsWith('.json'))
    : [];

  // Check for generated code
  const srcDir = './src';
  const hasGeneratedCode = fs.existsSync(srcDir) && fs.readdirSync(srcDir).length > 0;

  console.log('📊 Project Status:');
  console.log(`  📁 Nexus Directory: ${fs.existsSync(nexusDir) ? '✅ Present' : '❌ Missing'}`);
  console.log(`  🔄 Workflow State: ${workflowState ? workflowState.current_phase || 'Unknown' : 'No active workflow'}`);
  console.log(`  📋 Task Files: ${taskFiles.length} found`);
  console.log(`  💻 Generated Code: ${hasGeneratedCode ? '✅ Present' : '❌ None found'}`);

  if (workflowState) {
    console.log('\n🔄 Workflow Details:');
    console.log(`  📝 Project: ${workflowState.project_name || 'Unknown'}`);
    console.log(`  💡 Requirement: ${workflowState.initial_requirement || 'Unknown'}`);
    console.log(`  📅 Started: ${workflowState.start_time ? new Date(workflowState.start_time).toLocaleString() : 'Unknown'}`);
    if (workflowState.completion_time) {
      console.log(`  ✅ Completed: ${new Date(workflowState.completion_time).toLocaleString()}`);
    }
  }

  if (taskFiles.length > 0) {
    console.log('\n📋 Available Tasks:');
    taskFiles.slice(0, 5).forEach(file => {
      console.log(`  • ${file}`);
    });
    if (taskFiles.length > 5) {
      console.log(`  ... and ${taskFiles.length - 5} more`);
    }
  }

  console.log('\n💡 Available Commands:');
  console.log('  • nexus-implement run --standalone    # Implement all tasks independently');
  console.log('  • nexus-implement run                 # Continue integrated workflow');
  console.log('  • nexus-implement task <file>         # Implement specific task');
}

function parseTaskFile(content: string, filePath: string): any {
  try {
    // Try parsing as JSON first
    if (filePath.endsWith('.json')) {
      return JSON.parse(content);
    }

    // Parse Markdown with YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (frontmatterMatch) {
      // Has YAML frontmatter
      const yamlContent = frontmatterMatch[1];
      const markdownContent = frontmatterMatch[2];

      // Simple YAML parser for basic task structure
      const task: any = {
        title: extractYamlValue(yamlContent, 'title'),
        description: extractYamlValue(yamlContent, 'description'),
        requirements: extractYamlArray(yamlContent, 'requirements'),
        acceptance_criteria: extractYamlArray(yamlContent, 'acceptance_criteria'),
        context: markdownContent,
        file_path: filePath
      };

      return task;
    } else {
      // Plain markdown - create basic task structure
      const lines = content.split('\n');
      const title = lines.find(line => line.startsWith('# '))?.replace('# ', '') || path.basename(filePath);

      return {
        title,
        description: content.slice(0, 200) + '...',
        context: content,
        file_path: filePath
      };
    }
  } catch (error) {
    console.warn(`⚠️  Failed to parse task file ${filePath}, using basic structure`);
    return {
      title: path.basename(filePath),
      description: 'Task file parsing failed',
      context: content,
      file_path: filePath
    };
  }
}

function extractYamlValue(yaml: string, key: string): string | undefined {
  const match = yaml.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

function extractYamlArray(yaml: string, key: string): string[] {
  const match = yaml.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, 'm'));
  if (match) {
    return match[1].split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
  }

  // Try multi-line array format
  const lines = yaml.split('\n');
  const keyIndex = lines.findIndex(line => line.startsWith(`${key}:`));
  if (keyIndex === -1) return [];

  const items: string[] = [];
  for (let i = keyIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('  - ')) break;
    items.push(line.replace(/^  - /, '').trim());
  }

  return items;
}

// Parse command line arguments
program.parse();