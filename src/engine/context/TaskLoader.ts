import { existsSync, readFileSync } from 'fs';
import * as matter from 'gray-matter';
import { TaskContext, EmbeddedContext, TDDRequirements, Requirement, AcceptanceCriterion, TechnicalContext, TestRequirement, ImplementationHint } from '../constitution/ConstitutionalTDDEnforcer';

export class TaskLoader {
  loadTask(taskId: string): TaskContext {
    const taskFile = `.nexus/tasks/${taskId}.md`;

    if (!existsSync(taskFile)) {
      throw new Error(`Task file not found: ${taskId}`);
    }

    // Parse frontmatter and content
    const content = readFileSync(taskFile, 'utf8');
    const { data: metadata, content: body } = matter(content);

    // Extract embedded context (no external file reads)
    const embeddedContext = this.parseEmbeddedContext(body);

    return {
      id: metadata.id || taskId,
      title: metadata.title || '',
      embedded_context: embeddedContext,
      tdd_requirements: embeddedContext.test_requirements?.[0] ? {
        minimum_coverage: embeddedContext.test_requirements[0].coverage_target || 80,
        test_types: embeddedContext.test_requirements.map(r => r.type),
        test_patterns: embeddedContext.test_requirements.flatMap(r => r.patterns),
        failure_requirements: ['Must fail in RED phase', 'Must pass in GREEN phase']
      } : {
        minimum_coverage: 80,
        test_types: ['unit'],
        test_patterns: ['describe/it'],
        failure_requirements: ['Must fail in RED phase', 'Must pass in GREEN phase']
      },
      dependencies: metadata.dependencies || [],
      confidence: metadata.confidence || 0
    };
  }

  private parseEmbeddedContext(body: string): EmbeddedContext {
    // Parse embedded context from markdown sections
    const sections = this.parseSections(body);

    return {
      requirements: this.parseRequirements(sections['Core Context'] || sections['Requirements'] || ''),
      acceptance_criteria: this.parseAcceptanceCriteria(sections['Core Context'] || sections['Acceptance Criteria'] || ''),
      technical_context: this.parseTechnicalContext(sections['Core Context'] || sections['Technical Context'] || ''),
      test_requirements: this.parseTestRequirements(sections['TDD Requirements'] || sections['Test Requirements'] || ''),
      implementation_hints: this.parseImplementationHints(sections['Extended Context'] || sections['Implementation Hints'] || ''),
      similar_patterns: this.parseSimilarPatterns(sections['Extended Context'] || sections['Patterns'] || '')
    };
  }

  private parseSections(body: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = body.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Check for section headers (## or ###)
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        // Start new section
        currentSection = headerMatch[2];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  private parseRequirements(content: string): Requirement[] {
    const requirements: Requirement[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Look for requirements in various formats
      const reqMatch = line.match(/^[-*]\s*(.+)$/) || line.match(/^\d+\.\s*(.+)$/);
      if (reqMatch) {
        const description = reqMatch[1].trim();
        if (description.length > 10) { // Filter out short non-requirements
          requirements.push({
            id: `REQ-${index + 1}`,
            description,
            priority: this.determinePriority(description),
            type: this.determineRequirementType(description)
          });
        }
      }
    });

    return requirements;
  }

  private parseAcceptanceCriteria(content: string): AcceptanceCriterion[] {
    const criteria: AcceptanceCriterion[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for Given/When/Then patterns
      if (line.startsWith('Given') || line.includes('Given:')) {
        const given = line.replace(/^Given:?\s*/, '');
        const when = this.findNextLine(lines, i, 'When');
        const then = this.findNextLine(lines, i, 'Then');

        if (when && then) {
          criteria.push({
            id: `AC-${criteria.length + 1}`,
            description: `${given} → ${when} → ${then}`,
            given,
            when,
            then
          });
        }
      }

      // Look for scenario descriptions
      const scenarioMatch = line.match(/^[-*]\s*(.+should.+)$/i);
      if (scenarioMatch) {
        const description = scenarioMatch[1];
        criteria.push({
          id: `AC-${criteria.length + 1}`,
          description,
          given: 'Standard context',
          when: 'Action is performed',
          then: description
        });
      }
    }

    return criteria;
  }

  private parseTechnicalContext(content: string): TechnicalContext {
    const context = {
      architecture_pattern: 'Generic',
      existing_patterns: [],
      dependencies: [],
      frameworks: []
    };

    const lines = content.split('\n');

    lines.forEach(line => {
      const lower = line.toLowerCase();

      // Detect architecture patterns
      if (lower.includes('rest') || lower.includes('api')) {
        context.architecture_pattern = 'REST API';
      } else if (lower.includes('component') || lower.includes('react')) {
        context.architecture_pattern = 'Component';
      } else if (lower.includes('class') || lower.includes('service')) {
        context.architecture_pattern = 'Service';
      }

      // Extract dependencies
      const depMatch = line.match(/import.+from\s+['"]([^'"]+)['"]/);
      if (depMatch) {
        context.dependencies.push(depMatch[1]);
      }

      // Extract frameworks
      if (lower.includes('react')) context.frameworks.push('React');
      if (lower.includes('express')) context.frameworks.push('Express');
      if (lower.includes('typescript')) context.frameworks.push('TypeScript');
    });

    return context;
  }

  private parseTestRequirements(content: string): TestRequirement[] {
    const requirements: TestRequirement[] = [];
    const lines = content.split('\n');

    let currentType: 'unit' | 'integration' | 'e2e' = 'unit';
    let currentFramework = 'vitest';
    let currentCoverage = 80;

    lines.forEach(line => {
      const lower = line.toLowerCase();

      // Detect test types
      if (lower.includes('unit')) currentType = 'unit';
      else if (lower.includes('integration')) currentType = 'integration';
      else if (lower.includes('e2e') || lower.includes('end-to-end')) currentType = 'e2e';

      // Detect frameworks
      if (lower.includes('jest')) currentFramework = 'jest';
      else if (lower.includes('vitest')) currentFramework = 'vitest';
      else if (lower.includes('cypress')) currentFramework = 'cypress';

      // Extract coverage requirements
      const coverageMatch = line.match(/(\d+)%.*coverage/i);
      if (coverageMatch) {
        currentCoverage = parseInt(coverageMatch[1]);
      }
    });

    requirements.push({
      type: currentType,
      framework: currentFramework,
      coverage_target: currentCoverage,
      patterns: ['describe', 'it', 'expect']
    });

    return requirements;
  }

  private parseImplementationHints(content: string): ImplementationHint[] {
    const hints: ImplementationHint[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      // Look for pattern hints
      const patternMatch = line.match(/pattern:\s*(.+)/i);
      if (patternMatch) {
        hints.push({
          pattern: patternMatch[1],
          rationale: 'Suggested pattern from context',
          example: 'See implementation details'
        });
      }

      // Look for implementation suggestions
      const suggestionMatch = line.match(/^[-*]\s*(use|implement|apply)\s+(.+)$/i);
      if (suggestionMatch) {
        hints.push({
          pattern: suggestionMatch[2],
          rationale: 'Implementation suggestion',
          example: 'Follow established patterns'
        });
      }
    });

    return hints;
  }

  private parseSimilarPatterns(content: string): any[] {
    const patterns: any[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      // Look for code examples
      if (line.includes('```')) {
        // This is a simplification - in practice, you'd parse full code blocks
        patterns.push({
          name: 'Code Example',
          usage: 'Reference implementation',
          code: 'See context for details'
        });
      }
    });

    return patterns;
  }

  private findNextLine(lines: string[], startIndex: number, prefix: string): string | null {
    for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith(prefix) || line.includes(`${prefix}:`)) {
        return line.replace(new RegExp(`^${prefix}:?\\s*`), '');
      }
    }
    return null;
  }

  private determinePriority(description: string): 'critical' | 'high' | 'medium' | 'low' {
    const lower = description.toLowerCase();
    if (lower.includes('must') || lower.includes('critical') || lower.includes('required')) {
      return 'critical';
    } else if (lower.includes('should') || lower.includes('important')) {
      return 'high';
    } else if (lower.includes('could') || lower.includes('optional')) {
      return 'low';
    }
    return 'medium';
  }

  private determineRequirementType(description: string): 'functional' | 'non-functional' {
    const lower = description.toLowerCase();
    if (lower.includes('performance') || lower.includes('security') || lower.includes('scalability') || lower.includes('coverage')) {
      return 'non-functional';
    }
    return 'functional';
  }
}