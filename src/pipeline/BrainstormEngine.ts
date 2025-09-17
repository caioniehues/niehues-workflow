import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Approach {
  id: string;
  title: string;
  category: 'conventional' | 'innovative' | 'experimental' | 'hybrid';
  description: string;
  pros: string[];
  cons: string[];
  feasibility: number; // 0-10
  complexity: number; // 0-10
  risk: number; // 0-10
  innovation: number; // 0-10
  score?: number;
  rationale?: string;
}

interface BrainstormSession {
  id: string;
  topic: string;
  problem_statement: string;
  constraints: string[];
  success_criteria: string[];
  approaches: Approach[];
  selected_approaches: Approach[];
  timestamp: Date;
  duration_minutes: number;
}

export class BrainstormEngine {
  private readonly MIN_APPROACHES = 20;
  private readonly OUTPUT_DIR = '.nexus/brainstorms';

  async runBrainstorm(topic: string, problemStatement: string): Promise<BrainstormSession> {
    const sessionId = uuidv4();
    const startTime = new Date();

    console.log('🧠 Starting Brainstorm Session');
    console.log(`📝 Topic: ${topic}`);
    console.log(`🎯 Problem: ${problemStatement}`);

    // Phase 1: Capture constraints and success criteria
    const constraints = await this.captureConstraints(problemStatement);
    const successCriteria = await this.captureSuccessCriteria(problemStatement);

    // Phase 2: Generate diverse approaches
    console.log(`\n🎨 Generating ${this.MIN_APPROACHES}+ diverse approaches...`);
    const approaches = await this.generateApproaches(
      problemStatement,
      constraints,
      successCriteria
    );

    // Phase 3: Evaluate approaches
    console.log('\n📊 Evaluating approaches...');
    const evaluatedApproaches = await this.evaluateApproaches(approaches);

    // Phase 4: Select top approaches
    console.log('\n🏆 Selecting top 3-5 approaches...');
    const selectedApproaches = this.selectTopApproaches(evaluatedApproaches);

    // Phase 5: Create session record
    const session: BrainstormSession = {
      id: sessionId,
      topic,
      problem_statement: problemStatement,
      constraints,
      success_criteria: successCriteria,
      approaches: evaluatedApproaches,
      selected_approaches: selectedApproaches,
      timestamp: startTime,
      duration_minutes: Math.round((Date.now() - startTime.getTime()) / 60000)
    };

    // Phase 6: Persist session
    await this.saveSession(session);

    // Phase 7: Generate summary
    this.printSummary(session);

    return session;
  }

  private async captureConstraints(problemStatement: string): Promise<string[]> {
    // Extract common constraints based on problem analysis
    const constraints: string[] = [];

    // Technical constraints
    constraints.push("Must work with existing technology stack");
    constraints.push("Should maintain backward compatibility");
    constraints.push("Performance must not degrade");

    // Resource constraints
    constraints.push("Limited to current team expertise");
    constraints.push("Must fit within current budget");
    constraints.push("Timeline constraints apply");

    // Quality constraints
    constraints.push("Must maintain test coverage standards");
    constraints.push("Security requirements must be met");
    constraints.push("Accessibility standards required");

    return constraints;
  }

  private async captureSuccessCriteria(problemStatement: string): Promise<string[]> {
    // Define success criteria based on problem
    const criteria: string[] = [];

    criteria.push("Solution solves the stated problem");
    criteria.push("Implementation is maintainable");
    criteria.push("Solution is scalable");
    criteria.push("User experience is improved");
    criteria.push("Technical debt is minimized");
    criteria.push("Solution is well-documented");
    criteria.push("Tests provide comprehensive coverage");

    return criteria;
  }

  private async generateApproaches(
    problem: string,
    constraints: string[],
    criteria: string[]
  ): Promise<Approach[]> {
    const approaches: Approach[] = [];

    // Category 1: Conventional approaches (5-7)
    approaches.push(...this.generateConventionalApproaches(problem));

    // Category 2: Innovative approaches (5-7)
    approaches.push(...this.generateInnovativeApproaches(problem));

    // Category 3: Experimental approaches (5-7)
    approaches.push(...this.generateExperimentalApproaches(problem));

    // Category 4: Hybrid approaches (3-5)
    approaches.push(...this.generateHybridApproaches(approaches));

    // Exploratory questions to generate more approaches
    const exploratoryQuestions = [
      "What if we had unlimited resources?",
      "How would a different industry solve this?",
      "What assumptions can we challenge?",
      "What would make this solution remarkable?",
      "How would we solve this in 10% of the time?",
      "What if we inverted the problem?",
      "How would AI solve this differently?",
      "What patterns from nature could apply?"
    ];

    for (const question of exploratoryQuestions) {
      console.log(`  🤔 ${question}`);
      const additionalApproach = await this.exploreQuestion(question, problem);
      if (additionalApproach) {
        approaches.push(additionalApproach);
      }
    }

    // Ensure minimum approaches
    while (approaches.length < this.MIN_APPROACHES) {
      approaches.push(this.generateRandomApproach(problem, approaches.length));
    }

    return approaches;
  }

  private generateConventionalApproaches(problem: string): Approach[] {
    return [
      {
        id: uuidv4(),
        title: "Industry Standard Solution",
        category: 'conventional',
        description: "Apply widely-accepted best practices and proven patterns",
        pros: ["Low risk", "Well-documented", "Community support", "Predictable outcome"],
        cons: ["May not be optimal", "Limited innovation", "Common limitations"],
        feasibility: 9,
        complexity: 4,
        risk: 2,
        innovation: 2
      },
      {
        id: uuidv4(),
        title: "Framework-Based Approach",
        category: 'conventional',
        description: "Leverage existing frameworks and libraries",
        pros: ["Fast development", "Tested solutions", "Good documentation"],
        cons: ["Framework limitations", "Potential overhead", "Lock-in risk"],
        feasibility: 8,
        complexity: 3,
        risk: 3,
        innovation: 3
      },
      {
        id: uuidv4(),
        title: "Incremental Enhancement",
        category: 'conventional',
        description: "Start simple and gradually add features",
        pros: ["Low initial complexity", "Fast MVP", "Flexible evolution"],
        cons: ["May require refactoring", "Technical debt risk"],
        feasibility: 9,
        complexity: 2,
        risk: 2,
        innovation: 2
      },
      {
        id: uuidv4(),
        title: "Service-Oriented Architecture",
        category: 'conventional',
        description: "Decompose into microservices or modules",
        pros: ["Scalability", "Independent deployment", "Team autonomy"],
        cons: ["Initial complexity", "Network overhead", "Coordination challenges"],
        feasibility: 7,
        complexity: 7,
        risk: 4,
        innovation: 3
      },
      {
        id: uuidv4(),
        title: "Monolithic First",
        category: 'conventional',
        description: "Build as monolith, split later if needed",
        pros: ["Simplicity", "Fast development", "Easy debugging"],
        cons: ["Scaling challenges", "Deployment coupling", "Refactor complexity"],
        feasibility: 10,
        complexity: 2,
        risk: 1,
        innovation: 1
      }
    ];
  }

  private generateInnovativeApproaches(problem: string): Approach[] {
    return [
      {
        id: uuidv4(),
        title: "AI-Augmented Solution",
        category: 'innovative',
        description: "Leverage LLMs and AI for intelligent automation",
        pros: ["Cutting-edge", "Adaptive behavior", "Reduced manual work"],
        cons: ["Unpredictability", "Token costs", "Prompt engineering complexity"],
        feasibility: 7,
        complexity: 8,
        risk: 6,
        innovation: 9
      },
      {
        id: uuidv4(),
        title: "Event-Sourced Architecture",
        category: 'innovative',
        description: "Store all changes as immutable events",
        pros: ["Complete audit trail", "Time travel", "Event replay"],
        cons: ["Storage overhead", "Query complexity", "Learning curve"],
        feasibility: 6,
        complexity: 8,
        risk: 5,
        innovation: 8
      },
      {
        id: uuidv4(),
        title: "Serverless-First Design",
        category: 'innovative',
        description: "Build entirely on serverless platforms",
        pros: ["No infrastructure", "Auto-scaling", "Pay per use"],
        cons: ["Vendor lock-in", "Cold starts", "Local testing challenges"],
        feasibility: 8,
        complexity: 6,
        risk: 4,
        innovation: 7
      },
      {
        id: uuidv4(),
        title: "Graph-Based Architecture",
        category: 'innovative',
        description: "Model problem as graph with nodes and edges",
        pros: ["Natural relationships", "Flexible queries", "Pattern detection"],
        cons: ["Complexity", "Specialized knowledge", "Tool limitations"],
        feasibility: 5,
        complexity: 9,
        risk: 6,
        innovation: 8
      },
      {
        id: uuidv4(),
        title: "Reactive Streams Pattern",
        category: 'innovative',
        description: "Build with reactive programming and backpressure",
        pros: ["High performance", "Natural async", "Composability"],
        cons: ["Mental model shift", "Debugging difficulty", "Team learning"],
        feasibility: 6,
        complexity: 8,
        risk: 5,
        innovation: 7
      }
    ];
  }

  private generateExperimentalApproaches(problem: string): Approach[] {
    return [
      {
        id: uuidv4(),
        title: "Blockchain-Backed Solution",
        category: 'experimental',
        description: "Use distributed ledger for trust and immutability",
        pros: ["Decentralized", "Tamper-proof", "Transparent"],
        cons: ["Performance", "Complexity", "Energy consumption"],
        feasibility: 4,
        complexity: 10,
        risk: 8,
        innovation: 9
      },
      {
        id: uuidv4(),
        title: "Quantum-Inspired Algorithms",
        category: 'experimental',
        description: "Apply quantum computing principles to classical problems",
        pros: ["Novel approach", "Potential breakthroughs", "Research value"],
        cons: ["Unproven", "Limited tools", "High complexity"],
        feasibility: 2,
        complexity: 10,
        risk: 9,
        innovation: 10
      },
      {
        id: uuidv4(),
        title: "Self-Modifying Code",
        category: 'experimental',
        description: "System that evolves and optimizes itself",
        pros: ["Adaptive", "Self-improving", "Unique capabilities"],
        cons: ["Unpredictable", "Hard to debug", "Security risks"],
        feasibility: 3,
        complexity: 10,
        risk: 10,
        innovation: 10
      },
      {
        id: uuidv4(),
        title: "Biological Computing Patterns",
        category: 'experimental',
        description: "Mimic biological systems (neural networks, genetic algorithms)",
        pros: ["Natural optimization", "Emergent behavior", "Robustness"],
        cons: ["Complexity", "Unpredictability", "Resource intensive"],
        feasibility: 5,
        complexity: 9,
        risk: 7,
        innovation: 9
      },
      {
        id: uuidv4(),
        title: "Zero-Knowledge Architecture",
        category: 'experimental',
        description: "Prove correctness without revealing implementation",
        pros: ["Maximum privacy", "Verifiable", "Cutting-edge"],
        cons: ["Very complex", "Limited tooling", "Performance overhead"],
        feasibility: 3,
        complexity: 10,
        risk: 8,
        innovation: 10
      }
    ];
  }

  private generateHybridApproaches(existing: Approach[]): Approach[] {
    const hybrids: Approach[] = [];

    // Combine conventional + innovative
    hybrids.push({
      id: uuidv4(),
      title: "Progressive Enhancement with AI",
      category: 'hybrid',
      description: "Start conventional, add AI features progressively",
      pros: ["Balanced risk", "Proven base", "Innovation potential"],
      cons: ["Integration complexity", "Mixed paradigms"],
      feasibility: 7,
      complexity: 6,
      risk: 4,
      innovation: 6
    });

    // Combine multiple patterns
    hybrids.push({
      id: uuidv4(),
      title: "Microservices with Event Sourcing",
      category: 'hybrid',
      description: "Service architecture with event-driven communication",
      pros: ["Scalable", "Auditable", "Decoupled"],
      cons: ["High complexity", "Multiple patterns to master"],
      feasibility: 6,
      complexity: 9,
      risk: 6,
      innovation: 7
    });

    // Add third hybrid
    hybrids.push({
      id: uuidv4(),
      title: "Serverless with Traditional Fallback",
      category: 'hybrid',
      description: "Primary serverless with traditional backup",
      pros: ["Cost-effective", "Resilient", "Flexible deployment"],
      cons: ["Dual maintenance", "Complexity in switching"],
      feasibility: 8,
      complexity: 7,
      risk: 3,
      innovation: 5
    });

    return hybrids;
  }

  private async exploreQuestion(question: string, problem: string): Promise<Approach | null> {
    // Generate approaches based on exploratory questions
    const questionApproaches: { [key: string]: Approach } = {
      "What if we had unlimited resources?": {
        id: uuidv4(),
        title: "Unlimited Resources Approach",
        category: 'experimental',
        description: "Solve with no constraints on budget, time, or talent",
        pros: ["Optimal solution", "Best-in-class", "No compromises"],
        cons: ["Not realistic", "Over-engineering risk", "Difficult to scale down"],
        feasibility: 3,
        complexity: 8,
        risk: 7,
        innovation: 8
      },
      "How would a different industry solve this?": {
        id: uuidv4(),
        title: "Cross-Industry Pattern",
        category: 'innovative',
        description: "Apply patterns from finance, gaming, or healthcare",
        pros: ["Fresh perspective", "Proven elsewhere", "Unexpected solutions"],
        cons: ["Context mismatch", "Adaptation needed", "Learning curve"],
        feasibility: 6,
        complexity: 7,
        risk: 5,
        innovation: 7
      },
      "What assumptions can we challenge?": {
        id: uuidv4(),
        title: "Assumption-Breaking Design",
        category: 'experimental',
        description: "Question fundamental assumptions and rebuild",
        pros: ["Revolutionary", "Breakthrough potential", "Competitive advantage"],
        cons: ["High risk", "Unproven", "Resistance to change"],
        feasibility: 4,
        complexity: 8,
        risk: 8,
        innovation: 9
      },
      "What would make this solution remarkable?": {
        id: uuidv4(),
        title: "Remarkable Experience Focus",
        category: 'innovative',
        description: "Design for delight and word-of-mouth",
        pros: ["User love", "Viral potential", "Brand differentiation"],
        cons: ["Subjective success", "Extra effort", "May over-complicate"],
        feasibility: 7,
        complexity: 6,
        risk: 4,
        innovation: 7
      },
      "How would we solve this in 10% of the time?": {
        id: uuidv4(),
        title: "Rapid Prototype Approach",
        category: 'conventional',
        description: "MVP with aggressive scope cutting",
        pros: ["Fast to market", "Quick validation", "Low initial investment"],
        cons: ["Technical debt", "Limited features", "Scaling challenges"],
        feasibility: 9,
        complexity: 3,
        risk: 3,
        innovation: 2
      },
      "What if we inverted the problem?": {
        id: uuidv4(),
        title: "Problem Inversion Strategy",
        category: 'innovative',
        description: "Solve the opposite problem or reverse the flow",
        pros: ["Novel approach", "Simplification potential", "New insights"],
        cons: ["Counter-intuitive", "Explanation needed", "Paradigm shift"],
        feasibility: 5,
        complexity: 7,
        risk: 6,
        innovation: 8
      },
      "How would AI solve this differently?": {
        id: uuidv4(),
        title: "AI-Native Architecture",
        category: 'innovative',
        description: "Design specifically for AI capabilities",
        pros: ["Future-proof", "Automation", "Learning system"],
        cons: ["AI dependency", "Black box elements", "Data requirements"],
        feasibility: 6,
        complexity: 8,
        risk: 5,
        innovation: 8
      },
      "What patterns from nature could apply?": {
        id: uuidv4(),
        title: "Biomimetic Design",
        category: 'experimental',
        description: "Apply biological or natural system patterns",
        pros: ["Proven by evolution", "Elegant solutions", "Sustainability"],
        cons: ["Complex translation", "Abstract concepts", "Implementation challenge"],
        feasibility: 4,
        complexity: 9,
        risk: 7,
        innovation: 9
      }
    };

    return questionApproaches[question] || null;
  }

  private generateRandomApproach(problem: string, index: number): Approach {
    const categories: Approach['category'][] = ['conventional', 'innovative', 'experimental', 'hybrid'];
    const category = categories[index % categories.length];

    return {
      id: uuidv4(),
      title: `Alternative Approach ${index + 1}`,
      category,
      description: `Additional ${category} approach for solving the problem`,
      pros: ["Provides alternative", "Increases options", "May combine well"],
      cons: ["Less defined", "Needs refinement", "Generic approach"],
      feasibility: 5 + Math.floor(Math.random() * 3),
      complexity: 4 + Math.floor(Math.random() * 4),
      risk: 3 + Math.floor(Math.random() * 4),
      innovation: category === 'experimental' ? 7 + Math.floor(Math.random() * 3) :
                  category === 'innovative' ? 5 + Math.floor(Math.random() * 3) :
                  category === 'hybrid' ? 4 + Math.floor(Math.random() * 3) :
                  2 + Math.floor(Math.random() * 3)
    };
  }

  private async evaluateApproaches(approaches: Approach[]): Promise<Approach[]> {
    return approaches.map(approach => {
      // Calculate weighted score
      const weights = {
        feasibility: 0.3,
        complexity: -0.2, // Lower is better
        risk: -0.2, // Lower is better
        innovation: 0.3
      };

      const score =
        (approach.feasibility * weights.feasibility) +
        ((10 - approach.complexity) * Math.abs(weights.complexity)) +
        ((10 - approach.risk) * Math.abs(weights.risk)) +
        (approach.innovation * weights.innovation);

      approach.score = Math.round(score * 10) / 10;

      // Generate rationale
      approach.rationale = this.generateRationale(approach);

      return approach;
    });
  }

  private generateRationale(approach: Approach): string {
    const reasons = [];

    if (approach.feasibility >= 8) {
      reasons.push("Highly feasible with current resources");
    }
    if (approach.complexity <= 3) {
      reasons.push("Low complexity enables rapid development");
    }
    if (approach.risk <= 3) {
      reasons.push("Minimal risk to project success");
    }
    if (approach.innovation >= 7) {
      reasons.push("Innovative approach provides competitive advantage");
    }
    if (approach.category === 'conventional') {
      reasons.push("Proven patterns reduce unknowns");
    }

    return reasons.join(". ") + ".";
  }

  private selectTopApproaches(approaches: Approach[]): Approach[] {
    // Sort by score
    const sorted = approaches.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Select top 5, ensuring diversity
    const selected: Approach[] = [];
    const categories = new Set<string>();

    for (const approach of sorted) {
      if (selected.length >= 5) break;

      // Ensure category diversity
      if (!categories.has(approach.category) || selected.length < 3) {
        selected.push(approach);
        categories.add(approach.category);
      }
    }

    return selected;
  }

  private async saveSession(session: BrainstormSession): Promise<void> {
    await fs.ensureDir(this.OUTPUT_DIR);

    const timestamp = session.timestamp.toISOString().split('T')[0];
    const filename = `${timestamp}-${session.topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(this.OUTPUT_DIR, filename);

    const content = this.formatSessionMarkdown(session);
    await fs.writeFile(filepath, content);

    console.log(`\n💾 Session saved to: ${filepath}`);
  }

  private formatSessionMarkdown(session: BrainstormSession): string {
    return `# Brainstorm: ${session.topic}
Generated: ${session.timestamp.toISOString()}
Duration: ${session.duration_minutes} minutes

## Problem Statement
${session.problem_statement}

## Constraints
${session.constraints.map(c => `- ${c}`).join('\n')}

## Success Criteria
${session.success_criteria.map(c => `- ${c}`).join('\n')}

## Generated Approaches (${session.approaches.length})

${session.approaches.map((a, i) => `
### ${i + 1}. ${a.title} (${a.category})
**Score**: ${a.score}/10
**Description**: ${a.description}

**Pros**:
${a.pros.map(p => `- ${p}`).join('\n')}

**Cons**:
${a.cons.map(c => `- ${c}`).join('\n')}

**Metrics**:
- Feasibility: ${a.feasibility}/10
- Complexity: ${a.complexity}/10
- Risk: ${a.risk}/10
- Innovation: ${a.innovation}/10

**Rationale**: ${a.rationale}
`).join('\n')}

## Selected Approaches

${session.selected_approaches.map((a, i) => `
### ✅ ${i + 1}. ${a.title}
**Category**: ${a.category}
**Score**: ${a.score}/10
**Rationale**: ${a.rationale}
`).join('\n')}
`;
  }

  private printSummary(session: BrainstormSession): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 BRAINSTORM SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Approaches Generated: ${session.approaches.length}`);
    console.log(`Top Approaches Selected: ${session.selected_approaches.length}`);
    console.log('\n🏆 Selected Approaches:');
    session.selected_approaches.forEach((a, i) => {
      console.log(`  ${i + 1}. ${a.title} (${a.category}) - Score: ${a.score}/10`);
    });
    console.log('='.repeat(50));
  }
}