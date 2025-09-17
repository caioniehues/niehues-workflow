import { SpecificationEngine } from '../pipeline/SpecificationEngine';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as inquirer from 'inquirer';

interface SpecifyOptions {
  topic: string;
  brainstorm?: string;
  confidence?: number;
  maxQuestions?: number;
  output?: string;
}

export class NexusSpecifyCommand {
  private engine: SpecificationEngine;

  constructor() {
    this.engine = new SpecificationEngine();
  }

  /**
   * Execute the specify command
   */
  async execute(options: SpecifyOptions): Promise<void> {
    console.log('🚀 Nexus Specification Engine');
    console.log('Version: 2.0.0');
    console.log('─'.repeat(50));

    try {
      // Validate topic
      if (!options.topic) {
        throw new Error('Topic is required. Usage: /nexus-specify <topic>');
      }

      // Load brainstorm session if provided
      let brainstormSession = null;
      if (options.brainstorm) {
        brainstormSession = await this.loadBrainstormSession(options.brainstorm);
        console.log('✅ Loaded brainstorm session as context');
      }

      // Configure engine if custom settings provided
      if (options.confidence) {
        (this.engine as any).CONFIDENCE_THRESHOLD = options.confidence;
        console.log(`📊 Target confidence: ${options.confidence}%`);
      }
      if (options.maxQuestions) {
        (this.engine as any).MAX_QUESTIONS = options.maxQuestions;
        console.log(`❓ Maximum questions: ${options.maxQuestions}`);
      }
      if (options.output) {
        (this.engine as any).OUTPUT_DIR = options.output;
        console.log(`📁 Output directory: ${options.output}`);
      }

      // Pre-specification checklist
      await this.preSpecificationChecklist();

      // Create specification through adaptive questioning
      console.log('\n' + '='.repeat(50));
      console.log('Starting Specification Process');
      console.log('='.repeat(50));

      const specification = await this.engine.createSpecification(
        options.topic,
        brainstormSession
      );

      // Post-specification options
      await this.postSpecificationOptions(specification);

    } catch (error: any) {
      console.error('❌ Specification failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Load a brainstorm session from file
   */
  private async loadBrainstormSession(filepath: string): Promise<any> {
    try {
      const content = await fs.readFile(filepath, 'utf-8');

      // Parse the markdown to extract key information
      const session: any = {
        problem_statement: '',
        constraints: [],
        success_criteria: [],
        selected_approaches: []
      };

      // Extract problem statement
      const problemMatch = content.match(/## Problem Statement\n([\s\S]*?)(?=\n##|$)/);
      if (problemMatch) {
        session.problem_statement = problemMatch[1].trim();
      }

      // Extract constraints
      const constraintsMatch = content.match(/## Constraints\n([\s\S]*?)(?=\n##|$)/);
      if (constraintsMatch) {
        session.constraints = constraintsMatch[1]
          .split('\n')
          .filter(line => line.startsWith('- '))
          .map(line => line.substring(2));
      }

      // Extract success criteria
      const criteriaMatch = content.match(/## Success Criteria\n([\s\S]*?)(?=\n##|$)/);
      if (criteriaMatch) {
        session.success_criteria = criteriaMatch[1]
          .split('\n')
          .filter(line => line.startsWith('- '))
          .map(line => line.substring(2));
      }

      // Extract selected approaches
      const selectedMatch = content.match(/## Selected Approaches\n([\s\S]*?)$/);
      if (selectedMatch) {
        const approachMatches = selectedMatch[1].matchAll(/### ✅ \d+\. (.+)\n/g);
        for (const match of approachMatches) {
          session.selected_approaches.push({ title: match[1] });
        }
      }

      return session;
    } catch (error) {
      console.warn('⚠️  Could not parse brainstorm file, continuing without it');
      return null;
    }
  }

  /**
   * Pre-specification checklist
   */
  private async preSpecificationChecklist(): Promise<void> {
    console.log('\n📋 Pre-Specification Checklist');
    console.log('Please ensure you have the following ready:');
    console.log('  ✓ Clear problem statement');
    console.log('  ✓ High-level solution approach');
    console.log('  ✓ Known constraints and limitations');
    console.log('  ✓ Success criteria');
    console.log('  ✓ List of stakeholders');

    const { ready } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: 'Are you ready to begin the specification process?',
        default: true
      }
    ]);

    if (!ready) {
      console.log('Please gather the necessary information and try again.');
      process.exit(0);
    }
  }

  /**
   * Post-specification options
   */
  private async postSpecificationOptions(specification: any): Promise<void> {
    console.log('\n' + '='.repeat(50));
    console.log('📊 SPECIFICATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Title: ${specification.title}`);
    console.log(`Version: ${specification.version}`);
    console.log(`Confidence: ${specification.confidence}%`);
    console.log(`Questions Asked: ${specification.total_questions}`);
    console.log(`Status: ${specification.status}`);

    // Summary statistics
    console.log('\n📈 Specification Summary:');
    console.log(`  • Functional Requirements: ${specification.functional_requirements.length}`);
    console.log(`  • Non-Functional Requirements: ${specification.non_functional_requirements.length}`);
    console.log(`  • User Stories: ${specification.user_stories.length}`);
    console.log(`  • Use Cases: ${specification.use_cases.length}`);
    console.log(`  • Risks Identified: ${specification.risks.length}`);

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '\n📋 What would you like to do next?',
        choices: [
          { name: 'Shard specification into smaller pieces', value: 'shard' },
          { name: 'Create implementation tasks', value: 'decompose' },
          { name: 'Review specification details', value: 'review' },
          { name: 'Export to different format', value: 'export' },
          { name: 'Run validation checks', value: 'validate' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'shard':
        console.log('\nTo shard this specification, run:');
        console.log(`/nexus-shard --spec="${specification.title}"`);
        break;

      case 'decompose':
        console.log('\nTo create implementation tasks, run:');
        console.log(`/nexus-decompose --spec="${specification.title}"`);
        break;

      case 'review':
        await this.reviewSpecification(specification);
        break;

      case 'export':
        await this.exportSpecification(specification);
        break;

      case 'validate':
        await this.validateSpecification(specification);
        break;

      case 'exit':
        console.log('\n✅ Specification saved successfully!');
        break;
    }
  }

  /**
   * Review specification details
   */
  private async reviewSpecification(spec: any): Promise<void> {
    const { section } = await inquirer.prompt([
      {
        type: 'list',
        name: 'section',
        message: 'Which section would you like to review?',
        choices: [
          'Executive Summary',
          'Functional Requirements',
          'Non-Functional Requirements',
          'User Stories',
          'Technical Architecture',
          'Risks',
          'Testing Strategy',
          'Back to main menu'
        ]
      }
    ]);

    switch (section) {
      case 'Executive Summary':
        console.log('\n📄 Executive Summary:');
        console.log(spec.executive_summary);
        console.log('\n📄 Problem Statement:');
        console.log(spec.problem_statement);
        console.log('\n📄 Solution Overview:');
        console.log(spec.solution_overview);
        break;

      case 'Functional Requirements':
        console.log('\n📋 Functional Requirements:');
        spec.functional_requirements.forEach((req: any, index: number) => {
          console.log(`\n${index + 1}. ${req.id}: ${req.description}`);
          console.log(`   Priority: ${req.priority}`);
          console.log(`   Confidence: ${req.confidence}%`);
          if (req.acceptance_criteria.length > 0) {
            console.log('   Acceptance Criteria:');
            req.acceptance_criteria.forEach((ac: string) => {
              console.log(`     - ${ac}`);
            });
          }
        });
        break;

      case 'Non-Functional Requirements':
        console.log('\n📋 Non-Functional Requirements:');
        spec.non_functional_requirements.forEach((req: any, index: number) => {
          console.log(`\n${index + 1}. ${req.id}: ${req.description}`);
          console.log(`   Priority: ${req.priority}`);
        });
        break;

      case 'User Stories':
        console.log('\n📖 User Stories:');
        spec.user_stories.forEach((story: any, index: number) => {
          console.log(`\n${index + 1}. ${story.id}:`);
          console.log(`   As a ${story.as_a},`);
          console.log(`   I want ${story.i_want},`);
          console.log(`   So that ${story.so_that}`);
          console.log(`   Priority: ${story.priority}`);
        });
        break;

      case 'Technical Architecture':
        console.log('\n🏗️ Technical Architecture:');
        console.log(spec.technical_architecture.overview);
        if (spec.technical_architecture.technology_stack.length > 0) {
          console.log('\n📚 Technology Stack:');
          spec.technical_architecture.technology_stack.forEach((tech: any) => {
            console.log(`  • ${tech.category}: ${tech.technology}`);
          });
        }
        break;

      case 'Risks':
        console.log('\n⚠️  Risks:');
        spec.risks.forEach((risk: any, index: number) => {
          console.log(`\n${index + 1}. ${risk.id}: ${risk.description}`);
          console.log(`   Probability: ${risk.probability}`);
          console.log(`   Impact: ${risk.impact}`);
          console.log(`   Mitigation: ${risk.mitigation}`);
        });
        break;

      case 'Testing Strategy':
        console.log('\n🧪 Testing Strategy:');
        console.log(`Approach: ${spec.testing_strategy.approach}`);
        console.log('\nTest Levels:');
        spec.testing_strategy.test_levels.forEach((level: any) => {
          console.log(`  • ${level.level}: ${level.scope}`);
          console.log(`    Responsibility: ${level.responsibility}`);
        });
        console.log('\nCoverage Targets:');
        spec.testing_strategy.coverage_targets.forEach((target: any) => {
          console.log(`  • ${target.metric}: ${target.target}%`);
        });
        break;
    }

    if (section !== 'Back to main menu') {
      await this.reviewSpecification(spec); // Return to review menu
    } else {
      await this.postSpecificationOptions(spec); // Return to main menu
    }
  }

  /**
   * Export specification to different formats
   */
  private async exportSpecification(spec: any): Promise<void> {
    const { format } = await inquirer.prompt([
      {
        type: 'list',
        name: 'format',
        message: 'Select export format:',
        choices: [
          { name: 'JSON', value: 'json' },
          { name: 'YAML', value: 'yaml' },
          { name: 'HTML', value: 'html' },
          { name: 'PDF (requires external tool)', value: 'pdf' }
        ]
      }
    ]);

    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `${timestamp}-${spec.title.toLowerCase().replace(/\s+/g, '-')}-srs`;

    switch (format) {
      case 'json':
        const jsonPath = `.nexus/specs/exports/${baseFilename}.json`;
        await fs.ensureDir(path.dirname(jsonPath));
        await fs.writeJSON(jsonPath, spec, { spaces: 2 });
        console.log(`✅ Exported to: ${jsonPath}`);
        break;

      case 'yaml':
        const yaml = await import('js-yaml');
        const yamlPath = `.nexus/specs/exports/${baseFilename}.yaml`;
        await fs.ensureDir(path.dirname(yamlPath));
        await fs.writeFile(yamlPath, yaml.dump(spec));
        console.log(`✅ Exported to: ${yamlPath}`);
        break;

      case 'html':
        const htmlContent = this.generateHTML(spec);
        const htmlPath = `.nexus/specs/exports/${baseFilename}.html`;
        await fs.ensureDir(path.dirname(htmlPath));
        await fs.writeFile(htmlPath, htmlContent);
        console.log(`✅ Exported to: ${htmlPath}`);
        break;

      case 'pdf':
        console.log('📄 To convert to PDF, use:');
        console.log(`pandoc .nexus/specs/monolithic/${baseFilename}.md -o ${baseFilename}.pdf`);
        break;
    }
  }

  /**
   * Generate HTML from specification
   */
  private generateHTML(spec: any): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${spec.title} - Software Requirements Specification</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .metadata { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    .requirement { border-left: 3px solid #007bff; padding-left: 15px; margin: 15px 0; }
    .priority-must-have { border-color: #dc3545; }
    .priority-should-have { border-color: #ffc107; }
    .priority-could-have { border-color: #28a745; }
    ul { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>${spec.title}</h1>
  <div class="metadata">
    <p><strong>Version:</strong> ${spec.version}</p>
    <p><strong>Generated:</strong> ${spec.created}</p>
    <p><strong>Confidence:</strong> ${spec.confidence}%</p>
    <p><strong>Status:</strong> ${spec.status}</p>
  </div>

  <h2>Executive Summary</h2>
  <p>${spec.executive_summary}</p>

  <h2>Problem Statement</h2>
  <p>${spec.problem_statement}</p>

  <h2>Solution Overview</h2>
  <p>${spec.solution_overview}</p>

  <h2>Functional Requirements</h2>
  ${spec.functional_requirements.map((req: any) => `
    <div class="requirement priority-${req.priority}">
      <h3>${req.id}: ${req.description}</h3>
      <p><strong>Priority:</strong> ${req.priority}</p>
      <p><strong>Confidence:</strong> ${req.confidence}%</p>
    </div>
  `).join('')}

  <h2>Non-Functional Requirements</h2>
  ${spec.non_functional_requirements.map((req: any) => `
    <div class="requirement priority-${req.priority}">
      <h3>${req.id}: ${req.description}</h3>
      <p><strong>Priority:</strong> ${req.priority}</p>
    </div>
  `).join('')}
</body>
</html>`;
  }

  /**
   * Validate specification completeness
   */
  private async validateSpecification(spec: any): Promise<void> {
    console.log('\n🔍 Validating Specification...\n');

    const validations = [
      {
        name: 'Has executive summary',
        check: () => spec.executive_summary && spec.executive_summary.length > 100,
        status: false
      },
      {
        name: 'Has problem statement',
        check: () => spec.problem_statement && spec.problem_statement.length > 50,
        status: false
      },
      {
        name: 'Has functional requirements',
        check: () => spec.functional_requirements && spec.functional_requirements.length >= 3,
        status: false
      },
      {
        name: 'Has non-functional requirements',
        check: () => spec.non_functional_requirements && spec.non_functional_requirements.length >= 2,
        status: false
      },
      {
        name: 'Has user stories',
        check: () => spec.user_stories && spec.user_stories.length >= 3,
        status: false
      },
      {
        name: 'Has use cases',
        check: () => spec.use_cases && spec.use_cases.length >= 2,
        status: false
      },
      {
        name: 'All requirements have acceptance criteria',
        check: () => spec.functional_requirements.every((req: any) => req.acceptance_criteria.length > 0),
        status: false
      },
      {
        name: 'Has technical architecture',
        check: () => spec.technical_architecture && spec.technical_architecture.overview,
        status: false
      },
      {
        name: 'Has testing strategy',
        check: () => spec.testing_strategy && spec.testing_strategy.test_levels.length > 0,
        status: false
      },
      {
        name: 'Has risks identified',
        check: () => spec.risks && spec.risks.length > 0,
        status: false
      },
      {
        name: 'Confidence >= 85%',
        check: () => spec.confidence >= 85,
        status: false
      }
    ];

    // Run validations
    for (const validation of validations) {
      validation.status = validation.check();
      console.log(`${validation.status ? '✅' : '❌'} ${validation.name}`);
    }

    const passedCount = validations.filter(v => v.status).length;
    const totalCount = validations.length;
    const percentage = Math.round((passedCount / totalCount) * 100);

    console.log('\n' + '─'.repeat(40));
    console.log(`Validation Score: ${passedCount}/${totalCount} (${percentage}%)`);

    if (percentage >= 90) {
      console.log('✅ Specification is comprehensive and ready for implementation!');
    } else if (percentage >= 70) {
      console.log('⚠️  Specification is good but could benefit from more detail.');
    } else {
      console.log('❌ Specification needs more work. Consider running more questions.');
    }

    await this.postSpecificationOptions(spec);
  }
}

// CLI entry point
if (require.main === module) {
  const command = new NexusSpecifyCommand();

  const args = process.argv.slice(2);
  const topic = args.find(arg => !arg.startsWith('--')) || '';

  const options: SpecifyOptions = {
    topic
  };

  // Parse flags
  args.forEach(arg => {
    if (arg.startsWith('--brainstorm=')) {
      options.brainstorm = arg.split('=')[1];
    } else if (arg.startsWith('--confidence=')) {
      options.confidence = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--max-questions=')) {
      options.maxQuestions = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    }
  });

  command.execute(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}