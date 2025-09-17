#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { PipelineIntegration, WorkflowRequest, WorkflowConfiguration, WorkflowResult } from '../engine/integration/PipelineIntegration';

interface RunOptions {
  autoAdvance?: boolean;
  validationLevel?: 'basic' | 'standard' | 'comprehensive';
  parallel?: boolean;
  compliance?: 'strict' | 'standard' | 'lenient';
  contextMode?: 'minimal' | 'standard' | 'comprehensive';
  errorHandling?: 'fail_fast' | 'graceful_degradation' | 'continue_on_error';
  dryRun?: boolean;
  outputDir?: string;
  verbose?: boolean;
  interactive?: boolean;
  resume?: boolean;
}

const program = new Command();

program
  .name('nexus-run')
  .description('Run the complete Nexus Enhanced Workflow from requirement to implementation')
  .version('1.0.0');

program
  .command('workflow')
  .description('Execute complete workflow: brainstorm → specify → shard → decompose → implement')
  .argument('<requirement>', 'The initial requirement or feature description')
  .option('-a, --auto-advance', 'Automatically advance through phases without approval prompts', false)
  .option('-l, --validation-level <level>', 'Validation level: basic, standard, comprehensive', 'standard')
  .option('--parallel', 'Enable parallel processing where possible', true)
  .option('-c, --compliance <level>', 'Constitutional compliance level: strict, standard, lenient', 'standard')
  .option('--context-mode <mode>', 'Context preservation mode: minimal, standard, comprehensive', 'standard')
  .option('--error-handling <strategy>', 'Error handling strategy: fail_fast, graceful_degradation, continue_on_error', 'graceful_degradation')
  .option('--dry-run', 'Perform dry run without generating actual files', false)
  .option('-o, --output-dir <path>', 'Output directory for generated code', './src')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-i, --interactive', 'Enable interactive mode with prompts', true)
  .action(async (requirement: string, options: RunOptions) => {
    try {
      console.log('🚀 Nexus Enhanced Workflow - Complete Pipeline Execution');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`💡 Requirement: ${requirement}`);
      console.log('');

      await executeCompleteWorkflow(requirement, options);

    } catch (error) {
      console.error('❌ Workflow execution failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('resume')
  .description('Resume a paused or interrupted workflow')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-i, --interactive', 'Enable interactive mode', true)
  .action(async (options: RunOptions) => {
    try {
      console.log('🔄 Resuming Nexus Workflow');
      console.log('════════════════════════════');

      await resumeWorkflow(options);

    } catch (error) {
      console.error('❌ Failed to resume workflow:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show current workflow status and progress')
  .action(async () => {
    try {
      console.log('📊 Nexus Workflow Status');
      console.log('═══════════════════════════');

      await showWorkflowStatus();

    } catch (error) {
      console.error('❌ Failed to get workflow status:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('clean')
  .description('Clean up workflow artifacts and reset project state')
  .option('--force', 'Force cleanup without confirmation', false)
  .action(async (options: { force?: boolean }) => {
    try {
      console.log('🧹 Cleaning Nexus Workflow Artifacts');
      console.log('════════════════════════════════════');

      await cleanWorkflowArtifacts(options.force || false);

    } catch (error) {
      console.error('❌ Failed to clean artifacts:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function executeCompleteWorkflow(requirement: string, options: RunOptions): Promise<void> {
  // Validate environment
  await validateEnvironment();

  // Get project information
  const projectInfo = await getProjectInformation(options.interactive ?? true);

  console.log('🔧 Configuration:');
  console.log(`  📝 Project: ${projectInfo.name}`);
  console.log(`  📁 Directory: ${projectInfo.directory}`);
  console.log(`  🎯 Auto-advance: ${options.autoAdvance ? 'Yes' : 'No'}`);
  console.log(`  📊 Validation: ${options.validationLevel}`);
  console.log(`  ⚖️ Compliance: ${options.compliance}`);
  console.log(`  🔄 Parallel: ${options.parallel ? 'Yes' : 'No'}`);
  console.log('');

  // Confirm execution
  if (options.interactive && !options.autoAdvance) {
    const confirmed = await confirmExecution(requirement, projectInfo, options);
    if (!confirmed) {
      console.log('🚫 Workflow execution cancelled by user');
      return;
    }
  }

  // Initialize pipeline integration
  console.log('⚡ Initializing Nexus Enhanced Workflow...');
  const pipelineIntegration = new PipelineIntegration();

  // Create workflow request
  const workflowRequest: WorkflowRequest = {
    project_name: projectInfo.name,
    initial_requirement: requirement,
    project_directory: projectInfo.directory,
    configuration: createWorkflowConfiguration(options),
    context_hints: projectInfo.contextHints || [],
    constraints: projectInfo.constraints || []
  };

  // Save workflow state
  await saveWorkflowState({
    workflow_id: generateWorkflowId(),
    project_name: projectInfo.name,
    initial_requirement: requirement,
    project_directory: projectInfo.directory,
    start_time: new Date().toISOString(),
    current_phase: 'starting',
    options: options
  });

  console.log('🚀 Starting complete workflow execution...');
  console.log('');

  // Execute workflow with progress monitoring
  const result = await executeWithProgressMonitoring(pipelineIntegration, workflowRequest, options);

  // Display results
  await displayWorkflowResults(result, options);

  // Update final state
  await updateWorkflowState({
    current_phase: 'completed',
    completion_time: new Date().toISOString(),
    final_status: result.status,
    result_summary: result.execution_summary
  });

  console.log('');
  console.log('🎉 Nexus Enhanced Workflow completed successfully!');

  if (result.status === 'completed') {
    console.log('');
    console.log('📂 Generated artifacts can be found in:');
    console.log(`  • Source code: ${options.outputDir || './src'}`);
    console.log(`  • Workflow artifacts: .nexus/`);
    console.log(`  • Documentation: .nexus/specs/`);
    console.log(`  • Decision log: .nexus/decisions/`);
  }
}

async function resumeWorkflow(options: RunOptions): Promise<void> {
  const workflowStateFile = '.nexus/workflow-state.json';

  if (!fs.existsSync(workflowStateFile)) {
    throw new Error('No workflow state found. Cannot resume.');
  }

  const workflowState = JSON.parse(fs.readFileSync(workflowStateFile, 'utf-8'));

  console.log('📋 Found existing workflow:');
  console.log(`  📝 Project: ${workflowState.project_name}`);
  console.log(`  💡 Requirement: ${workflowState.initial_requirement}`);
  console.log(`  🔄 Current Phase: ${workflowState.current_phase}`);
  console.log(`  📅 Started: ${new Date(workflowState.start_time).toLocaleString()}`);
  console.log('');

  if (workflowState.current_phase === 'completed') {
    console.log('✅ Workflow already completed. Use "nexus-run clean" to start fresh.');
    return;
  }

  const shouldResume = options.interactive ? await promptConfirmation('Resume this workflow?') : true;

  if (!shouldResume) {
    console.log('🚫 Resume cancelled by user');
    return;
  }

  // Resume execution
  console.log('🔄 Resuming workflow execution...');

  const pipelineIntegration = new PipelineIntegration();
  const workflowRequest: WorkflowRequest = {
    project_name: workflowState.project_name,
    initial_requirement: workflowState.initial_requirement,
    project_directory: workflowState.project_directory,
    configuration: createWorkflowConfiguration(workflowState.options || {})
  };

  const result = await executeWithProgressMonitoring(pipelineIntegration, workflowRequest, options);
  await displayWorkflowResults(result, options);
}

async function executeWithProgressMonitoring(
  pipelineIntegration: PipelineIntegration,
  workflowRequest: WorkflowRequest,
  options: RunOptions
): Promise<WorkflowResult> {

  // Set up progress monitoring
  pipelineIntegration.on('workflow:started', (data) => {
    console.log(`🎬 Workflow started: ${data.workflowId}`);
    console.log('');
  });

  pipelineIntegration.on('phase:started', (data) => {
    console.log(`🔄 Phase started: ${data.phase}`);
  });

  pipelineIntegration.on('phase:completed', (data) => {
    console.log(`✅ Phase completed: ${data.phase} (${data.duration}ms)`);
  });

  pipelineIntegration.on('workflow:completed', (data) => {
    console.log(`🎉 Workflow completed: ${data.workflowId}`);
  });

  pipelineIntegration.on('workflow:failed', (data) => {
    console.log(`❌ Workflow failed: ${data.workflowId} - ${data.error}`);
  });

  // Execute workflow
  return await pipelineIntegration.executeFullWorkflow(workflowRequest);
}

async function showWorkflowStatus(): Promise<void> {
  const nexusDir = '.nexus';
  const workflowStateFile = path.join(nexusDir, 'workflow-state.json');

  if (!fs.existsSync(nexusDir)) {
    console.log('❌ No Nexus project found in current directory');
    console.log('💡 Run "nexus-init <project-name>" to initialize a new project');
    return;
  }

  console.log('📁 Project Structure:');
  const subDirs = ['brainstorms', 'specs', 'tasks', 'artifacts', 'decisions'];
  subDirs.forEach(dir => {
    const dirPath = path.join(nexusDir, dir);
    const exists = fs.existsSync(dirPath);
    const fileCount = exists ? fs.readdirSync(dirPath).length : 0;
    console.log(`  ${exists ? '✅' : '❌'} ${dir}: ${fileCount} files`);
  });

  console.log('');

  if (fs.existsSync(workflowStateFile)) {
    const workflowState = JSON.parse(fs.readFileSync(workflowStateFile, 'utf-8'));

    console.log('🔄 Active Workflow:');
    console.log(`  📝 Project: ${workflowState.project_name}`);
    console.log(`  💡 Requirement: ${workflowState.initial_requirement}`);
    console.log(`  🎯 Current Phase: ${workflowState.current_phase}`);
    console.log(`  📅 Started: ${new Date(workflowState.start_time).toLocaleString()}`);

    if (workflowState.completion_time) {
      console.log(`  ✅ Completed: ${new Date(workflowState.completion_time).toLocaleString()}`);
      console.log(`  📊 Final Status: ${workflowState.final_status}`);
    }

    console.log('');

    if (workflowState.current_phase !== 'completed') {
      console.log('💡 Available Actions:');
      console.log('  • nexus-run resume          # Resume the workflow');
      console.log('  • nexus-run clean           # Clean and start fresh');
    } else {
      console.log('💡 Available Actions:');
      console.log('  • nexus-run clean           # Clean and start fresh');
      console.log('  • Review generated code in ./src');
    }

  } else {
    console.log('⚪ No active workflow');
    console.log('');
    console.log('💡 Available Actions:');
    console.log('  • nexus-run workflow "<requirement>"  # Start new workflow');
  }
}

async function cleanWorkflowArtifacts(force: boolean): Promise<void> {
  const nexusDir = '.nexus';

  if (!fs.existsSync(nexusDir)) {
    console.log('⚪ No Nexus artifacts found');
    return;
  }

  if (!force) {
    const confirmed = await promptConfirmation('This will delete all workflow artifacts. Are you sure?');
    if (!confirmed) {
      console.log('🚫 Cleanup cancelled');
      return;
    }
  }

  console.log('🧹 Cleaning workflow artifacts...');

  // Clean specific subdirectories but preserve configuration
  const cleanDirs = ['brainstorms', 'specs/sharded', 'tasks', 'artifacts'];
  const cleanFiles = ['workflow-state.json', 'decisions.json'];

  cleanDirs.forEach(dir => {
    const dirPath = path.join(nexusDir, dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`  🗑️ Cleaned: ${dir}`);
    }
  });

  cleanFiles.forEach(file => {
    const filePath = path.join(nexusDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  🗑️ Removed: ${file}`);
    }
  });

  console.log('✅ Cleanup completed');
  console.log('💡 You can now start a new workflow with "nexus-run workflow"');
}

async function validateEnvironment(): Promise<void> {
  const requiredFiles = ['.nexus/constitution.md'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

  if (missingFiles.length > 0) {
    throw new Error(`Required files missing: ${missingFiles.join(', ')}. Please run 'nexus-init' first.`);
  }
}

async function getProjectInformation(interactive: boolean): Promise<{
  name: string;
  directory: string;
  contextHints?: string[];
  constraints?: string[];
}> {
  const currentDir = process.cwd();
  const defaultName = path.basename(currentDir);

  if (!interactive) {
    return {
      name: defaultName,
      directory: currentDir
    };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`📝 Project name (${defaultName}): `, (name) => {
      const projectName = name.trim() || defaultName;

      rl.question('💡 Additional context hints (comma-separated, optional): ', (hints) => {
        const contextHints = hints.trim() ? hints.split(',').map(h => h.trim()) : [];

        rl.question('⚠️ Project constraints (comma-separated, optional): ', (constraints) => {
          const projectConstraints = constraints.trim() ? constraints.split(',').map(c => c.trim()) : [];

          rl.close();
          resolve({
            name: projectName,
            directory: currentDir,
            contextHints,
            constraints: projectConstraints
          });
        });
      });
    });
  });
}

async function confirmExecution(requirement: string, projectInfo: any, options: RunOptions): Promise<boolean> {
  console.log('📋 Workflow Summary:');
  console.log(`  💡 Requirement: ${requirement}`);
  console.log(`  📝 Project: ${projectInfo.name}`);
  console.log(`  📊 Validation Level: ${options.validationLevel}`);
  console.log(`  ⚖️ Constitutional Compliance: ${options.compliance}`);
  console.log(`  🔄 Auto-advance: ${options.autoAdvance ? 'Yes' : 'No'}`);
  console.log('');

  return await promptConfirmation('Proceed with workflow execution?');
}

async function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

function createWorkflowConfiguration(options: RunOptions): WorkflowConfiguration {
  return {
    auto_advance: options.autoAdvance || false,
    validation_level: options.validationLevel || 'standard',
    parallel_processing: options.parallel ?? true,
    constitutional_compliance: options.compliance || 'standard',
    context_preservation_mode: options.contextMode || 'standard',
    error_handling: options.errorHandling || 'graceful_degradation',
    approval_required: !options.autoAdvance,
    dry_run: options.dryRun || false
  };
}

async function displayWorkflowResults(result: WorkflowResult, options: RunOptions): Promise<void> {
  console.log('');
  console.log('📊 Workflow Execution Results');
  console.log('═══════════════════════════════');

  console.log(`📈 Overall Status: ${result.status}`);
  console.log(`⏱️ Total Duration: ${result.metrics.total_duration_ms}ms`);
  console.log(`📋 Phases Executed: ${result.phases_executed.length}`);
  console.log(`📁 Artifacts Generated: ${result.artifacts_generated.length}`);
  console.log(`📝 Decisions Made: ${result.decisions_made.length}`);
  console.log(`🏆 Performance Score: ${result.execution_summary.performance_score}/100`);
  console.log(`💎 Quality Score: ${result.execution_summary.quality_score}/100`);

  if (options.verbose) {
    console.log('');
    console.log('📋 Phase Details:');
    result.phases_executed.forEach((phase, index) => {
      console.log(`  ${index + 1}. ${phase.phase}: ${phase.status} (${phase.duration_ms}ms)`);
      if (phase.artifacts_created.length > 0) {
        console.log(`     📁 Artifacts: ${phase.artifacts_created.slice(0, 3).join(', ')}${phase.artifacts_created.length > 3 ? '...' : ''}`);
      }
    });

    if (result.execution_summary.recommendations.length > 0) {
      console.log('');
      console.log('💡 Recommendations:');
      result.execution_summary.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    if (result.errors.length > 0) {
      console.log('');
      console.log('⚠️ Issues Encountered:');
      result.errors.forEach(error => {
        console.log(`  • ${error.phase}: ${error.error_message} (${error.impact_level})`);
      });
    }
  }
}

async function saveWorkflowState(state: any): Promise<void> {
  const stateFile = '.nexus/workflow-state.json';
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

async function updateWorkflowState(updates: any): Promise<void> {
  const stateFile = '.nexus/workflow-state.json';
  if (fs.existsSync(stateFile)) {
    const currentState = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    const updatedState = { ...currentState, ...updates };
    fs.writeFileSync(stateFile, JSON.stringify(updatedState, null, 2));
  }
}

function generateWorkflowId(): string {
  return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse command line arguments
program.parse();