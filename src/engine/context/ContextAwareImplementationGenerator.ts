import { TaskContext, EmbeddedContext, TechnicalContext, Requirement, Implementation } from '../constitution/ConstitutionalTDDEnforcer';

export interface Template {
  header: string;
  footer: string;
  generateMethod(requirement: Requirement): string;
}

export class ContextAwareImplementationGenerator {
  private templates: Record<string, Template>;

  constructor() {
    this.templates = {
      restApi: new RestApiTemplate(),
      reactComponent: new ReactComponentTemplate(),
      generic: new GenericTemplate()
    };
  }

  generateImplementation(taskContext: TaskContext): Implementation {
    const { embedded_context } = taskContext;

    // Use embedded context (no external lookups)
    const template = this.selectImplementationTemplate(embedded_context.technical_context);
    const patterns = embedded_context.similar_patterns || [];
    const requirements = embedded_context.requirements;

    return {
      structure: this.generateCodeStructure(template, requirements),
      tests: this.generateTestImplementation(embedded_context),
      documentation: this.generateDocumentation(requirements)
    };
  }

  private selectImplementationTemplate(technicalContext: TechnicalContext): Template {
    // Select template based on embedded technical context
    if (technicalContext.architecture_pattern === 'REST API') {
      return this.templates.restApi;
    } else if (technicalContext.architecture_pattern === 'Component') {
      return this.templates.reactComponent;
    } else {
      return this.templates.generic;
    }
  }

  private generateCodeStructure(template: Template, requirements: Requirement[]): string {
    let code = template.header;

    for (const requirement of requirements) {
      code += template.generateMethod(requirement);
    }

    code += template.footer;
    return code;
  }

  private generateTestImplementation(embeddedContext: EmbeddedContext): string {
    const { test_requirements, acceptance_criteria } = embeddedContext;

    let testCode = '';

    if (test_requirements && test_requirements.length > 0) {
      const testReq = test_requirements[0];
      testCode += `// ${testReq.framework} tests\n`;

      for (const criterion of acceptance_criteria) {
        testCode += this.generateTestCase(criterion, testReq.framework);
      }
    }

    return testCode;
  }

  private generateTestCase(criterion: any, framework: string): string {
    if (framework === 'vitest' || framework === 'jest') {
      return `
describe('${criterion.description}', () => {
  it('${criterion.description}', async () => {
    // Given: ${criterion.given}
    // When: ${criterion.when}
    // Then: ${criterion.then}
    expect(true).toBe(true); // Placeholder
  });
});
`;
    }

    return `// Test for: ${criterion.description}\n`;
  }

  private generateDocumentation(requirements: Requirement[]): string {
    let docs = '# Implementation Documentation\n\n';

    docs += '## Requirements\n\n';
    for (const req of requirements) {
      docs += `- **${req.id}** (${req.priority}): ${req.description}\n`;
    }

    docs += '\n## Implementation Notes\n\n';
    docs += 'This implementation follows TDD principles and constitutional requirements.\n';

    return docs;
  }
}

class RestApiTemplate implements Template {
  header = `
import { Request, Response } from 'express';

export class ApiController {
`;

  footer = `
}
`;

  generateMethod(requirement: Requirement): string {
    const methodName = this.extractMethodName(requirement.description);
    return `
  async ${methodName}(req: Request, res: Response): Promise<void> {
    // Implementation for: ${requirement.description}
    try {
      // TODO: Implement ${requirement.id}
      res.status(200).json({
        success: true,
        message: 'Operation completed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
`;
  }

  private extractMethodName(description: string): string {
    // Extract method name from requirement description
    const words = description.toLowerCase().split(' ');
    const verbs = ['create', 'get', 'update', 'delete', 'list', 'find', 'process'];

    for (const verb of verbs) {
      if (words.includes(verb)) {
        return verb + words.slice(words.indexOf(verb) + 1)
          .filter(w => w.length > 2)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join('');
      }
    }

    return 'handleRequest';
  }
}

class ReactComponentTemplate implements Template {
  header = `
import React from 'react';

interface ComponentProps {
  // Define props based on requirements
}

export function Component(props: ComponentProps): JSX.Element {
`;

  footer = `
}
`;

  generateMethod(requirement: Requirement): string {
    const methodName = this.extractMethodName(requirement.description);
    return `
  const ${methodName} = () => {
    // Implementation for: ${requirement.description}
    // TODO: Implement ${requirement.id}
  };
`;
  }

  private extractMethodName(description: string): string {
    // Convert requirement to handler method name
    const words = description.toLowerCase().split(' ');
    return 'handle' + words
      .filter(w => w.length > 2)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .slice(0, 3) // Limit to reasonable length
      .join('');
  }
}

class GenericTemplate implements Template {
  header = `
export class Implementation {
`;

  footer = `
}
`;

  generateMethod(requirement: Requirement): string {
    const methodName = this.extractMethodName(requirement.description);
    return `
  ${methodName}(): void {
    // Implementation for: ${requirement.description}
    // TODO: Implement ${requirement.id}
    console.log('Executing ${methodName}');
  }
`;
  }

  private extractMethodName(description: string): string {
    // Extract method name from requirement description
    const words = description.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(' ')
      .filter(w => w.length > 2);

    if (words.length === 0) return 'execute';

    return words[0] + words.slice(1)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }
}