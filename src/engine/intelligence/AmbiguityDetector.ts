import { EventEmitter } from 'events';

export interface Ambiguity {
  id: string;
  type: AmbiguityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: AmbiguityLocation;
  description: string;
  ambiguous_text: string;
  context: string;
  score: number; // 0-100, higher = more ambiguous
  impact_assessment: string;
  suggested_questions: string[];
  resolution_suggestions: string[];
  status: 'detected' | 'clarifying' | 'resolved' | 'ignored';
  detected_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export type AmbiguityType =
  | 'vague_term'
  | 'overloaded_term'
  | 'missing_context'
  | 'contradictory_statement'
  | 'incomplete_requirement'
  | 'subjective_criteria'
  | 'undefined_relationship'
  | 'scope_boundary_unclear'
  | 'acceptance_criteria_vague'
  | 'performance_criteria_missing'
  | 'error_handling_undefined'
  | 'business_rule_ambiguous';

export interface AmbiguityLocation {
  document: string;
  section?: string;
  line_number?: number;
  paragraph?: number;
  requirement_id?: string;
  context_snippet: string;
}

export interface AmbiguityAnalysis {
  total_ambiguities: number;
  by_type: Record<AmbiguityType, number>;
  by_severity: Record<string, number>;
  overall_clarity_score: number; // 0-100, higher = clearer
  high_risk_areas: string[];
  clarification_priorities: ClarificationPriority[];
  resolution_tracking: ResolutionTracking;
  improvement_suggestions: ImprovementSuggestion[];
}

export interface ClarificationPriority {
  ambiguity_id: string;
  priority_score: number;
  blocking_factor: number;
  urgency_reason: string;
  stakeholders_to_engage: string[];
}

export interface ResolutionTracking {
  total_detected: number;
  resolved: number;
  in_progress: number;
  ignored: number;
  resolution_rate: number;
  average_resolution_time_hours: number;
}

export interface ImprovementSuggestion {
  category: 'terminology' | 'structure' | 'completeness' | 'clarity';
  title: string;
  description: string;
  impact: string;
  effort_estimate: string;
  examples: string[];
}

export interface ClarificationQuestion {
  id: string;
  ambiguity_id: string;
  question: string;
  question_type: 'open_ended' | 'multiple_choice' | 'yes_no' | 'clarification';
  context: string;
  urgency: 'low' | 'medium' | 'high' | 'blocking';
  stakeholder_role: string;
  follow_up_questions?: string[];
  expected_answer_format: string;
  validation_criteria?: string[];
}

export interface VagueTerm {
  term: string;
  frequency: number;
  contexts: string[];
  vagueness_indicators: string[];
  suggested_alternatives: string[];
  domain_specificity: number; // 0-100, higher = more domain-specific
}

export interface OverloadedTerm {
  term: string;
  different_meanings: TermMeaning[];
  confusion_potential: number;
  disambiguation_strategy: string;
  recommended_action: 'define_clearly' | 'use_specific_terms' | 'create_glossary';
}

export interface TermMeaning {
  meaning: string;
  context: string;
  usage_frequency: number;
  stakeholder_groups: string[];
}

export interface MissingContext {
  category: 'business_rule' | 'technical_constraint' | 'user_workflow' | 'integration_point' | 'data_flow';
  description: string;
  impact_on_implementation: string;
  questions_to_resolve: string[];
  information_sources: string[];
  criticality: number; // 0-100
}

export interface ContradictoryStatement {
  statement_1: string;
  statement_2: string;
  contradiction_type: 'direct' | 'implicit' | 'conditional';
  severity: 'minor' | 'major' | 'blocking';
  resolution_approach: string;
  stakeholders_to_involve: string[];
}

export interface DetectionResult {
  ambiguities: Ambiguity[];
  analysis: AmbiguityAnalysis;
  vague_terms: VagueTerm[];
  overloaded_terms: OverloadedTerm[];
  missing_contexts: MissingContext[];
  contradictions: ContradictoryStatement[];
  clarification_questions: ClarificationQuestion[];
  clarity_score: number;
  recommendations: string[];
}

export class AmbiguityDetector extends EventEmitter {
  private detectedAmbiguities: Map<string, Ambiguity> = new Map();
  private vaguenessPatterns: VaguenessPattern[] = [];
  private domainTerms: Map<string, DomainTerm> = new Map();
  private clarificationQuestions: Map<string, ClarificationQuestion> = new Map();
  private businessGlossary: Map<string, TermDefinition> = new Map();
  private resolutionHistory: ResolutionRecord[] = [];

  constructor() {
    super();
    this.initializeVaguenessPatterns();
    this.loadDomainTerms();
    this.loadBusinessGlossary();
  }

  // Main detection method
  async detectAmbiguities(
    requirements: string[],
    documentContext?: DocumentContext,
    existingGlossary?: Map<string, string>
  ): Promise<DetectionResult> {
    console.log('🔍 AmbiguityDetector: Starting comprehensive ambiguity analysis');

    try {
      const ambiguities: Ambiguity[] = [];
      const vague_terms: VagueTerm[] = [];
      const overloaded_terms: OverloadedTerm[] = [];
      const missing_contexts: MissingContext[] = [];
      const contradictions: ContradictoryStatement[] = [];

      // Detect different types of ambiguities
      for (let i = 0; i < requirements.length; i++) {
        const requirement = requirements[i];
        const location: AmbiguityLocation = {
          document: documentContext?.document_name || 'requirements',
          line_number: i + 1,
          requirement_id: documentContext?.requirement_ids?.[i],
          context_snippet: requirement.substring(0, 100)
        };

        // Detect vague terms
        const vagueness = await this.detectVagueTerms(requirement, location);
        ambiguities.push(...vagueness.ambiguities);
        vague_terms.push(...vagueness.terms);

        // Detect overloaded terms
        const overloaded = await this.detectOverloadedTerms(requirement, location);
        ambiguities.push(...overloaded.ambiguities);
        overloaded_terms.push(...overloaded.terms);

        // Detect missing context
        const missing = await this.detectMissingContext(requirement, location);
        ambiguities.push(...missing.ambiguities);
        missing_contexts.push(...missing.contexts);

        // Detect contradictions with other requirements
        const contradictory = await this.detectContradictions(requirement, requirements, i, location);
        ambiguities.push(...contradictory.ambiguities);
        contradictions.push(...contradictory.contradictions);

        // Detect incomplete requirements
        const incomplete = await this.detectIncompleteRequirements(requirement, location);
        ambiguities.push(...incomplete);

        // Detect subjective criteria
        const subjective = await this.detectSubjectiveCriteria(requirement, location);
        ambiguities.push(...subjective);

        // Detect undefined relationships
        const relationships = await this.detectUndefinedRelationships(requirement, location);
        ambiguities.push(...relationships);
      }

      // Store detected ambiguities
      for (const ambiguity of ambiguities) {
        this.detectedAmbiguities.set(ambiguity.id, ambiguity);
      }

      // Generate analysis
      const analysis = this.analyzeAmbiguities(ambiguities);

      // Generate clarification questions
      const clarification_questions = await this.generateClarificationQuestions(ambiguities);

      // Calculate overall clarity score
      const clarity_score = this.calculateClarityScore(ambiguities, requirements.length);

      // Generate recommendations
      const recommendations = this.generateRecommendations(analysis, vague_terms, overloaded_terms);

      const result: DetectionResult = {
        ambiguities,
        analysis,
        vague_terms,
        overloaded_terms,
        missing_contexts,
        contradictions,
        clarification_questions,
        clarity_score,
        recommendations
      };

      this.emit('detection:completed', result);
      console.log(`✅ AmbiguityDetector: Detected ${ambiguities.length} ambiguities with ${clarity_score}% clarity score`);

      return result;

    } catch (error) {
      console.error('❌ AmbiguityDetector: Detection failed:', error);
      this.emit('detection:failed', error);
      throw error;
    }
  }

  // Detect vague terms and language
  private async detectVagueTerms(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<{ ambiguities: Ambiguity[], terms: VagueTerm[] }> {
    const ambiguities: Ambiguity[] = [];
    const terms: VagueTerm[] = [];

    for (const pattern of this.vaguenessPatterns) {
      const matches = requirement.match(new RegExp(pattern.regex, 'gi'));
      if (matches) {
        for (const match of matches) {
          const vagueTerm: VagueTerm = {
            term: match,
            frequency: this.countTermFrequency(match, requirement),
            contexts: [requirement],
            vagueness_indicators: pattern.indicators,
            suggested_alternatives: pattern.alternatives,
            domain_specificity: this.calculateDomainSpecificity(match)
          };

          const ambiguity: Ambiguity = {
            id: this.generateAmbiguityId(),
            type: 'vague_term',
            severity: this.assessVaguenessSeverity(match, pattern.severity_base),
            location,
            description: `Vague term "${match}" detected`,
            ambiguous_text: match,
            context: requirement,
            score: pattern.ambiguity_score,
            impact_assessment: `May lead to different interpretations during implementation`,
            suggested_questions: [
              `What specific criteria define "${match}"?`,
              `How should "${match}" be measured or evaluated?`,
              `What are the boundaries or limits for "${match}"?`
            ],
            resolution_suggestions: pattern.alternatives,
            status: 'detected',
            detected_at: new Date().toISOString()
          };

          ambiguities.push(ambiguity);
          terms.push(vagueTerm);
        }
      }
    }

    return { ambiguities, terms };
  }

  // Detect overloaded terms (same word, multiple meanings)
  private async detectOverloadedTerms(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<{ ambiguities: Ambiguity[], terms: OverloadedTerm[] }> {
    const ambiguities: Ambiguity[] = [];
    const terms: OverloadedTerm[] = [];

    const words = this.extractSignificantWords(requirement);

    for (const word of words) {
      const termInfo = this.domainTerms.get(word.toLowerCase());
      if (termInfo && termInfo.multiple_meanings.length > 1) {
        const overloadedTerm: OverloadedTerm = {
          term: word,
          different_meanings: termInfo.multiple_meanings.map(meaning => ({
            meaning: meaning.definition,
            context: meaning.context,
            usage_frequency: meaning.frequency,
            stakeholder_groups: meaning.stakeholder_groups
          })),
          confusion_potential: this.calculateConfusionPotential(termInfo),
          disambiguation_strategy: this.suggestDisambiguationStrategy(termInfo),
          recommended_action: this.determineRecommendedAction(termInfo)
        };

        const ambiguity: Ambiguity = {
          id: this.generateAmbiguityId(),
          type: 'overloaded_term',
          severity: this.assessOverloadSeverity(termInfo),
          location,
          description: `Overloaded term "${word}" has multiple meanings`,
          ambiguous_text: word,
          context: requirement,
          score: termInfo.confusion_score,
          impact_assessment: `Different stakeholders may interpret "${word}" differently`,
          suggested_questions: [
            `Which specific meaning of "${word}" applies here?`,
            `Should we use a more specific term instead of "${word}"?`,
            `How do different teams currently interpret "${word}"?`
          ],
          resolution_suggestions: [
            `Use specific terminology instead of "${word}"`,
            `Add definition to glossary`,
            `Qualify the term with additional context`
          ],
          status: 'detected',
          detected_at: new Date().toISOString()
        };

        ambiguities.push(ambiguity);
        terms.push(overloadedTerm);
      }
    }

    return { ambiguities, terms };
  }

  // Detect missing context
  private async detectMissingContext(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<{ ambiguities: Ambiguity[], contexts: MissingContext[] }> {
    const ambiguities: Ambiguity[] = [];
    const contexts: MissingContext[] = [];

    // Check for missing business context
    if (this.hasMissingBusinessContext(requirement)) {
      const missingContext: MissingContext = {
        category: 'business_rule',
        description: 'Business rules or constraints not specified',
        impact_on_implementation: 'Implementation may not align with business needs',
        questions_to_resolve: [
          'What are the underlying business rules?',
          'What constraints apply to this requirement?',
          'What are the business consequences if this fails?'
        ],
        information_sources: ['Business analysts', 'Domain experts', 'Stakeholders'],
        criticality: 80
      };

      const ambiguity: Ambiguity = {
        id: this.generateAmbiguityId(),
        type: 'missing_context',
        severity: 'high',
        location,
        description: 'Missing business context for requirement',
        ambiguous_text: requirement,
        context: requirement,
        score: 75,
        impact_assessment: 'Implementation may not meet business expectations',
        suggested_questions: missingContext.questions_to_resolve,
        resolution_suggestions: [
          'Engage business stakeholders for clarification',
          'Document business rules explicitly',
          'Add context to requirement specification'
        ],
        status: 'detected',
        detected_at: new Date().toISOString()
      };

      ambiguities.push(ambiguity);
      contexts.push(missingContext);
    }

    // Check for missing technical context
    if (this.hasMissingTechnicalContext(requirement)) {
      const missingContext: MissingContext = {
        category: 'technical_constraint',
        description: 'Technical constraints or integration points not specified',
        impact_on_implementation: 'Technical implementation may be infeasible',
        questions_to_resolve: [
          'What technical constraints apply?',
          'What systems need to integrate?',
          'What are the performance requirements?'
        ],
        information_sources: ['Technical architects', 'System administrators', 'API documentation'],
        criticality: 85
      };

      const ambiguity: Ambiguity = {
        id: this.generateAmbiguityId(),
        type: 'missing_context',
        severity: 'high',
        location,
        description: 'Missing technical context for requirement',
        ambiguous_text: requirement,
        context: requirement,
        score: 80,
        impact_assessment: 'Technical implementation may face unexpected constraints',
        suggested_questions: missingContext.questions_to_resolve,
        resolution_suggestions: [
          'Consult technical architects',
          'Document integration requirements',
          'Specify performance criteria'
        ],
        status: 'detected',
        detected_at: new Date().toISOString()
      };

      ambiguities.push(ambiguity);
      contexts.push(missingContext);
    }

    // Check for missing user workflow context
    if (this.hasMissingUserContext(requirement)) {
      const missingContext: MissingContext = {
        category: 'user_workflow',
        description: 'User workflow or interaction patterns not specified',
        impact_on_implementation: 'User experience may be poor or unintuitive',
        questions_to_resolve: [
          'How do users currently perform this task?',
          'What is the expected user workflow?',
          'What are the user pain points?'
        ],
        information_sources: ['UX designers', 'End users', 'Support teams'],
        criticality: 70
      };

      const ambiguity: Ambiguity = {
        id: this.generateAmbiguityId(),
        type: 'missing_context',
        severity: 'medium',
        location,
        description: 'Missing user workflow context',
        ambiguous_text: requirement,
        context: requirement,
        score: 65,
        impact_assessment: 'User experience may not meet expectations',
        suggested_questions: missingContext.questions_to_resolve,
        resolution_suggestions: [
          'Conduct user research',
          'Map current user workflows',
          'Define interaction patterns'
        ],
        status: 'detected',
        detected_at: new Date().toISOString()
      };

      ambiguities.push(ambiguity);
      contexts.push(missingContext);
    }

    return { ambiguities, contexts };
  }

  // Detect contradictions between requirements
  private async detectContradictions(
    currentRequirement: string,
    allRequirements: string[],
    currentIndex: number,
    location: AmbiguityLocation
  ): Promise<{ ambiguities: Ambiguity[], contradictions: ContradictoryStatement[] }> {
    const ambiguities: Ambiguity[] = [];
    const contradictions: ContradictoryStatement[] = [];

    // Check against all other requirements
    for (let i = 0; i < allRequirements.length; i++) {
      if (i === currentIndex) continue;

      const otherRequirement = allRequirements[i];
      const contradiction = this.analyzeContradiction(currentRequirement, otherRequirement);

      if (contradiction) {
        const contradictoryStatement: ContradictoryStatement = {
          statement_1: currentRequirement,
          statement_2: otherRequirement,
          contradiction_type: contradiction.type,
          severity: contradiction.severity,
          resolution_approach: contradiction.resolution,
          stakeholders_to_involve: contradiction.stakeholders
        };

        const ambiguity: Ambiguity = {
          id: this.generateAmbiguityId(),
          type: 'contradictory_statement',
          severity: contradiction.severity === 'blocking' ? 'critical' :
                   contradiction.severity === 'major' ? 'high' : 'medium',
          location,
          description: `Contradictory requirements detected`,
          ambiguous_text: currentRequirement,
          context: `Contradicts: ${otherRequirement}`,
          score: contradiction.severity === 'blocking' ? 95 :
                contradiction.severity === 'major' ? 80 : 60,
          impact_assessment: `Cannot implement both requirements as stated`,
          suggested_questions: [
            'Which requirement takes precedence?',
            'Can both requirements be satisfied simultaneously?',
            'What is the intended behavior in this scenario?'
          ],
          resolution_suggestions: [
            contradiction.resolution,
            'Clarify requirement priorities',
            'Modify one or both requirements'
          ],
          status: 'detected',
          detected_at: new Date().toISOString()
        };

        ambiguities.push(ambiguity);
        contradictions.push(contradictoryStatement);
      }
    }

    return { ambiguities, contradictions };
  }

  // Detect incomplete requirements
  private async detectIncompleteRequirements(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<Ambiguity[]> {
    const ambiguities: Ambiguity[] = [];

    const incompleteness = this.assessRequirementCompleteness(requirement);

    if (incompleteness.score > 50) {
      const ambiguity: Ambiguity = {
        id: this.generateAmbiguityId(),
        type: 'incomplete_requirement',
        severity: incompleteness.score > 80 ? 'high' : 'medium',
        location,
        description: `Incomplete requirement detected`,
        ambiguous_text: requirement,
        context: requirement,
        score: incompleteness.score,
        impact_assessment: `Missing information may lead to incorrect implementation`,
        suggested_questions: incompleteness.missing_aspects.map(aspect =>
          `What are the details for ${aspect}?`
        ),
        resolution_suggestions: [
          'Add missing details to requirement',
          'Clarify scope and boundaries',
          'Specify acceptance criteria'
        ],
        status: 'detected',
        detected_at: new Date().toISOString()
      };

      ambiguities.push(ambiguity);
    }

    return ambiguities;
  }

  // Detect subjective criteria
  private async detectSubjectiveCriteria(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<Ambiguity[]> {
    const ambiguities: Ambiguity[] = [];

    const subjectiveTerms = ['good', 'bad', 'better', 'best', 'nice', 'clean', 'intuitive', 'user-friendly', 'easy', 'fast', 'slow', 'efficient', 'optimal'];

    for (const term of subjectiveTerms) {
      if (requirement.toLowerCase().includes(term)) {
        const ambiguity: Ambiguity = {
          id: this.generateAmbiguityId(),
          type: 'subjective_criteria',
          severity: 'medium',
          location,
          description: `Subjective criteria "${term}" needs objective definition`,
          ambiguous_text: term,
          context: requirement,
          score: 70,
          impact_assessment: `Subjective terms lead to different interpretations`,
          suggested_questions: [
            `How should "${term}" be measured objectively?`,
            `What specific criteria define "${term}"?`,
            `What are the measurable indicators of "${term}"?`
          ],
          resolution_suggestions: [
            `Replace "${term}" with measurable criteria`,
            'Define objective success metrics',
            'Specify quantitative thresholds'
          ],
          status: 'detected',
          detected_at: new Date().toISOString()
        };

        ambiguities.push(ambiguity);
      }
    }

    return ambiguities;
  }

  // Detect undefined relationships
  private async detectUndefinedRelationships(
    requirement: string,
    location: AmbiguityLocation
  ): Promise<Ambiguity[]> {
    const ambiguities: Ambiguity[] = [];

    // Look for relationship indicators without clear definition
    const relationshipKeywords = ['integrate', 'connect', 'sync', 'interface', 'communicate', 'depend', 'trigger'];

    for (const keyword of relationshipKeywords) {
      if (requirement.toLowerCase().includes(keyword)) {
        // Check if the relationship is well-defined
        if (!this.hasWellDefinedRelationship(requirement, keyword)) {
          const ambiguity: Ambiguity = {
            id: this.generateAmbiguityId(),
            type: 'undefined_relationship',
            severity: 'medium',
            location,
            description: `Undefined relationship involving "${keyword}"`,
            ambiguous_text: keyword,
            context: requirement,
            score: 65,
            impact_assessment: `Unclear relationships may lead to integration issues`,
            suggested_questions: [
              `How should the ${keyword} operation work?`,
              `What data needs to be exchanged?`,
              `What are the timing requirements?`,
              `What happens if the ${keyword} fails?`
            ],
            resolution_suggestions: [
              'Define integration specifications',
              'Specify data exchange formats',
              'Document error handling procedures'
            ],
            status: 'detected',
            detected_at: new Date().toISOString()
          };

          ambiguities.push(ambiguity);
        }
      }
    }

    return ambiguities;
  }

  // Generate clarification questions
  private async generateClarificationQuestions(ambiguities: Ambiguity[]): Promise<ClarificationQuestion[]> {
    const questions: ClarificationQuestion[] = [];

    for (const ambiguity of ambiguities) {
      for (let i = 0; i < ambiguity.suggested_questions.length; i++) {
        const question: ClarificationQuestion = {
          id: `q_${ambiguity.id}_${i}`,
          ambiguity_id: ambiguity.id,
          question: ambiguity.suggested_questions[i],
          question_type: this.determineQuestionType(ambiguity.suggested_questions[i]),
          context: ambiguity.context,
          urgency: this.mapSeverityToUrgency(ambiguity.severity),
          stakeholder_role: this.determineStakeholderRole(ambiguity.type),
          expected_answer_format: this.determineAnswerFormat(ambiguity.type),
          validation_criteria: this.generateValidationCriteria(ambiguity.type)
        };

        questions.push(question);
        this.clarificationQuestions.set(question.id, question);
      }
    }

    return questions;
  }

  // Analysis and scoring methods
  private analyzeAmbiguities(ambiguities: Ambiguity[]): AmbiguityAnalysis {
    const by_type: Record<AmbiguityType, number> = {
      vague_term: 0,
      overloaded_term: 0,
      missing_context: 0,
      contradictory_statement: 0,
      incomplete_requirement: 0,
      subjective_criteria: 0,
      undefined_relationship: 0,
      scope_boundary_unclear: 0,
      acceptance_criteria_vague: 0,
      performance_criteria_missing: 0,
      error_handling_undefined: 0,
      business_rule_ambiguous: 0
    };

    const by_severity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    for (const ambiguity of ambiguities) {
      by_type[ambiguity.type]++;
      by_severity[ambiguity.severity]++;
    }

    const overall_clarity_score = this.calculateOverallClarityScore(ambiguities);
    const high_risk_areas = this.identifyHighRiskAreas(by_type);
    const clarification_priorities = this.generateClarificationPriorities(ambiguities);
    const resolution_tracking = this.calculateResolutionTracking(ambiguities);
    const improvement_suggestions = this.generateImprovementSuggestions(by_type);

    return {
      total_ambiguities: ambiguities.length,
      by_type,
      by_severity,
      overall_clarity_score,
      high_risk_areas,
      clarification_priorities,
      resolution_tracking,
      improvement_suggestions
    };
  }

  private calculateClarityScore(ambiguities: Ambiguity[], totalRequirements: number): number {
    if (totalRequirements === 0) return 100;

    const totalAmbiguityScore = ambiguities.reduce((sum, amb) => sum + amb.score, 0);
    const averageAmbiguityScore = totalAmbiguityScore / totalRequirements;

    return Math.max(0, 100 - averageAmbiguityScore);
  }

  private generateRecommendations(
    analysis: AmbiguityAnalysis,
    vagueTerms: VagueTerm[],
    overloadedTerms: OverloadedTerm[]
  ): string[] {
    const recommendations: string[] = [];

    if (analysis.by_severity.critical > 0) {
      recommendations.push(`Address ${analysis.by_severity.critical} critical ambiguities immediately`);
    }

    if (vagueTerms.length > 5) {
      recommendations.push('Create a project glossary to define vague terms');
    }

    if (overloadedTerms.length > 3) {
      recommendations.push('Establish consistent terminology across the project');
    }

    if (analysis.overall_clarity_score < 70) {
      recommendations.push('Requirements need significant clarification before implementation');
    }

    if (analysis.by_type.missing_context > analysis.total_ambiguities * 0.3) {
      recommendations.push('Engage stakeholders to provide missing context');
    }

    return recommendations;
  }

  // Helper methods for detection
  private extractSignificantWords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  private hasMissingBusinessContext(requirement: string): boolean {
    const businessKeywords = ['business', 'rule', 'policy', 'constraint', 'goal', 'objective'];
    const hasBusinessKeywords = businessKeywords.some(keyword =>
      requirement.toLowerCase().includes(keyword)
    );

    // If business keywords are mentioned but context is missing
    return hasBusinessKeywords && !this.hasDetailedContext(requirement);
  }

  private hasMissingTechnicalContext(requirement: string): boolean {
    const technicalKeywords = ['integrate', 'api', 'database', 'system', 'performance', 'security'];
    const hasTechnicalKeywords = technicalKeywords.some(keyword =>
      requirement.toLowerCase().includes(keyword)
    );

    return hasTechnicalKeywords && !this.hasDetailedContext(requirement);
  }

  private hasMissingUserContext(requirement: string): boolean {
    const userKeywords = ['user', 'customer', 'interface', 'workflow', 'experience'];
    const hasUserKeywords = userKeywords.some(keyword =>
      requirement.toLowerCase().includes(keyword)
    );

    return hasUserKeywords && !this.hasDetailedContext(requirement);
  }

  private hasDetailedContext(requirement: string): boolean {
    // Simple heuristic: longer requirements with specific details are more likely to have context
    return requirement.length > 200 && this.countSpecificDetails(requirement) > 2;
  }

  private countSpecificDetails(requirement: string): number {
    // Count numbers, proper nouns, and detailed phrases
    const numberMatches = requirement.match(/\d+/g) || [];
    const capitalizedWords = requirement.match(/[A-Z][a-z]+/g) || [];
    const detailPhrases = requirement.match(/(when|where|how|why|which|what)/gi) || [];

    return numberMatches.length + capitalizedWords.length + detailPhrases.length;
  }

  private analyzeContradiction(req1: string, req2: string): ContradictionInfo | null {
    // Simplified contradiction detection
    const contradictoryPairs = [
      { keywords1: ['must', 'required'], keywords2: ['optional', 'may'], type: 'direct' as const },
      { keywords1: ['always', 'never'], keywords2: ['sometimes', 'occasionally'], type: 'direct' as const },
      { keywords1: ['all', 'every'], keywords2: ['some', 'partial'], type: 'implicit' as const }
    ];

    for (const pair of contradictoryPairs) {
      const has1 = pair.keywords1.some(k => req1.toLowerCase().includes(k));
      const has2 = pair.keywords2.some(k => req2.toLowerCase().includes(k));

      if (has1 && has2) {
        return {
          type: pair.type,
          severity: 'major',
          resolution: 'Clarify which requirement takes precedence',
          stakeholders: ['Product Owner', 'Business Analyst']
        };
      }
    }

    return null;
  }

  private assessRequirementCompleteness(requirement: string): { score: number, missing_aspects: string[] } {
    const aspects = ['what', 'who', 'when', 'where', 'why', 'how'];
    const missing: string[] = [];

    // Simple heuristic for completeness
    if (!requirement.toLowerCase().includes('user') && !requirement.toLowerCase().includes('system')) {
      missing.push('actor specification');
    }

    if (!requirement.includes('will') && !requirement.includes('should') && !requirement.includes('must')) {
      missing.push('action specification');
    }

    if (requirement.length < 50) {
      missing.push('detailed description');
    }

    const score = (missing.length / aspects.length) * 100;
    return { score, missing_aspects: missing };
  }

  private hasWellDefinedRelationship(requirement: string, keyword: string): boolean {
    // Check if relationship details are provided
    const detailIndicators = ['protocol', 'format', 'api', 'endpoint', 'method', 'data', 'frequency'];
    return detailIndicators.some(indicator => requirement.toLowerCase().includes(indicator));
  }

  // Utility methods
  private countTermFrequency(term: string, text: string): number {
    const regex = new RegExp(term, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  private calculateDomainSpecificity(term: string): number {
    const domainTerm = this.domainTerms.get(term.toLowerCase());
    return domainTerm ? domainTerm.domain_specificity : 0;
  }

  private assessVaguenessSeverity(term: string, baseSeverity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (baseSeverity > 80) return 'critical';
    if (baseSeverity > 60) return 'high';
    if (baseSeverity > 40) return 'medium';
    return 'low';
  }

  private calculateConfusionPotential(termInfo: DomainTerm): number {
    return termInfo.confusion_score;
  }

  private suggestDisambiguationStrategy(termInfo: DomainTerm): string {
    if (termInfo.multiple_meanings.length > 3) {
      return 'Create comprehensive glossary entry';
    } else {
      return 'Use context-specific qualifiers';
    }
  }

  private determineRecommendedAction(termInfo: DomainTerm): 'define_clearly' | 'use_specific_terms' | 'create_glossary' {
    if (termInfo.confusion_score > 80) return 'create_glossary';
    if (termInfo.multiple_meanings.length > 2) return 'use_specific_terms';
    return 'define_clearly';
  }

  private assessOverloadSeverity(termInfo: DomainTerm): 'low' | 'medium' | 'high' | 'critical' {
    if (termInfo.confusion_score > 90) return 'critical';
    if (termInfo.confusion_score > 70) return 'high';
    if (termInfo.confusion_score > 50) return 'medium';
    return 'low';
  }

  private calculateOverallClarityScore(ambiguities: Ambiguity[]): number {
    if (ambiguities.length === 0) return 100;

    const totalScore = ambiguities.reduce((sum, amb) => sum + amb.score, 0);
    const averageAmbiguityScore = totalScore / ambiguities.length;

    return Math.max(0, 100 - averageAmbiguityScore);
  }

  private identifyHighRiskAreas(byType: Record<AmbiguityType, number>): string[] {
    const highRiskAreas: string[] = [];

    Object.entries(byType).forEach(([type, count]) => {
      if (count > 3) {
        highRiskAreas.push(`High concentration of ${type.replace('_', ' ')} issues`);
      }
    });

    return highRiskAreas;
  }

  private generateClarificationPriorities(ambiguities: Ambiguity[]): ClarificationPriority[] {
    return ambiguities
      .map(amb => ({
        ambiguity_id: amb.id,
        priority_score: amb.score,
        blocking_factor: amb.severity === 'critical' ? 100 : amb.severity === 'high' ? 80 : 50,
        urgency_reason: `${amb.type} with ${amb.severity} severity`,
        stakeholders_to_engage: this.getStakeholdersForType(amb.type)
      }))
      .sort((a, b) => b.priority_score - a.priority_score);
  }

  private calculateResolutionTracking(ambiguities: Ambiguity[]): ResolutionTracking {
    const resolved = ambiguities.filter(amb => amb.status === 'resolved').length;
    const inProgress = ambiguities.filter(amb => amb.status === 'clarifying').length;
    const ignored = ambiguities.filter(amb => amb.status === 'ignored').length;

    return {
      total_detected: ambiguities.length,
      resolved,
      in_progress: inProgress,
      ignored,
      resolution_rate: ambiguities.length > 0 ? (resolved / ambiguities.length) * 100 : 0,
      average_resolution_time_hours: this.calculateAverageResolutionTime()
    };
  }

  private generateImprovementSuggestions(byType: Record<AmbiguityType, number>): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    if (byType.vague_term > 5) {
      suggestions.push({
        category: 'terminology',
        title: 'Establish Clear Terminology Standards',
        description: 'Create and maintain a project glossary with precise definitions',
        impact: 'Reduces miscommunication and implementation errors',
        effort_estimate: '2-3 days',
        examples: ['Define "user-friendly" as specific usability metrics', 'Replace "fast" with response time requirements']
      });
    }

    if (byType.missing_context > 3) {
      suggestions.push({
        category: 'completeness',
        title: 'Implement Context Review Process',
        description: 'Add systematic review for business and technical context',
        impact: 'Prevents implementation gaps and rework',
        effort_estimate: '1-2 weeks',
        examples: ['Business context review checklist', 'Technical constraint documentation']
      });
    }

    return suggestions;
  }

  // Question and stakeholder mapping
  private determineQuestionType(question: string): 'open_ended' | 'multiple_choice' | 'yes_no' | 'clarification' {
    if (question.toLowerCase().includes('what') || question.toLowerCase().includes('how')) {
      return 'open_ended';
    }
    if (question.toLowerCase().includes('should') || question.toLowerCase().includes('can')) {
      return 'yes_no';
    }
    return 'clarification';
  }

  private mapSeverityToUrgency(severity: string): 'low' | 'medium' | 'high' | 'blocking' {
    switch (severity) {
      case 'critical': return 'blocking';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  }

  private determineStakeholderRole(type: AmbiguityType): string {
    const roleMap: Record<AmbiguityType, string> = {
      vague_term: 'Business Analyst',
      overloaded_term: 'Domain Expert',
      missing_context: 'Product Owner',
      contradictory_statement: 'Product Owner',
      incomplete_requirement: 'Business Analyst',
      subjective_criteria: 'UX Designer',
      undefined_relationship: 'System Architect',
      scope_boundary_unclear: 'Product Owner',
      acceptance_criteria_vague: 'Quality Assurance',
      performance_criteria_missing: 'System Architect',
      error_handling_undefined: 'Technical Lead',
      business_rule_ambiguous: 'Business Analyst'
    };

    return roleMap[type] || 'Business Analyst';
  }

  private determineAnswerFormat(type: AmbiguityType): string {
    const formatMap: Record<AmbiguityType, string> = {
      vague_term: 'Precise definition with measurable criteria',
      overloaded_term: 'Disambiguation or specific term selection',
      missing_context: 'Detailed context with business rules',
      contradictory_statement: 'Priority clarification or requirement modification',
      incomplete_requirement: 'Complete requirement specification',
      subjective_criteria: 'Objective, measurable criteria',
      undefined_relationship: 'Integration specification with protocols',
      scope_boundary_unclear: 'Clear scope definition with boundaries',
      acceptance_criteria_vague: 'Specific, testable acceptance criteria',
      performance_criteria_missing: 'Quantitative performance requirements',
      error_handling_undefined: 'Error handling strategy and procedures',
      business_rule_ambiguous: 'Clear business rule definition'
    };

    return formatMap[type] || 'Detailed clarification';
  }

  private generateValidationCriteria(type: AmbiguityType): string[] {
    const criteriaMap: Record<AmbiguityType, string[]> = {
      vague_term: ['Definition is measurable', 'Definition is unambiguous', 'Definition is testable'],
      overloaded_term: ['Term usage is consistent', 'Context is clear', 'Meaning is specific'],
      missing_context: ['Business rules are complete', 'Technical constraints are specified', 'Dependencies are identified'],
      contradictory_statement: ['Contradiction is resolved', 'Requirements are consistent', 'Priority is clear'],
      incomplete_requirement: ['All aspects are covered', 'Acceptance criteria are defined', 'Dependencies are specified'],
      subjective_criteria: ['Criteria are objective', 'Criteria are measurable', 'Thresholds are defined'],
      undefined_relationship: ['Integration is specified', 'Data exchange is defined', 'Error handling is addressed'],
      scope_boundary_unclear: ['Boundaries are clear', 'Inclusions/exclusions are specified', 'Scope is measurable'],
      acceptance_criteria_vague: ['Criteria are testable', 'Criteria are specific', 'Success is measurable'],
      performance_criteria_missing: ['Metrics are specified', 'Thresholds are defined', 'Measurement method is clear'],
      error_handling_undefined: ['Error scenarios are identified', 'Recovery procedures are defined', 'User impact is specified'],
      business_rule_ambiguous: ['Rule is precise', 'Conditions are clear', 'Actions are specific']
    };

    return criteriaMap[type] || ['Clarification is complete', 'Information is actionable'];
  }

  private getStakeholdersForType(type: AmbiguityType): string[] {
    const stakeholderMap: Record<AmbiguityType, string[]> = {
      vague_term: ['Business Analyst', 'Domain Expert'],
      overloaded_term: ['Domain Expert', 'Technical Writer'],
      missing_context: ['Product Owner', 'Business Analyst', 'Subject Matter Expert'],
      contradictory_statement: ['Product Owner', 'Stakeholders'],
      incomplete_requirement: ['Business Analyst', 'Product Owner'],
      subjective_criteria: ['UX Designer', 'Product Owner'],
      undefined_relationship: ['System Architect', 'Technical Lead'],
      scope_boundary_unclear: ['Product Owner', 'Stakeholders'],
      acceptance_criteria_vague: ['Quality Assurance', 'Business Analyst'],
      performance_criteria_missing: ['System Architect', 'Performance Engineer'],
      error_handling_undefined: ['Technical Lead', 'Quality Assurance'],
      business_rule_ambiguous: ['Business Analyst', 'Domain Expert']
    };

    return stakeholderMap[type] || ['Business Analyst'];
  }

  private calculateAverageResolutionTime(): number {
    if (this.resolutionHistory.length === 0) return 0;

    const totalTime = this.resolutionHistory.reduce((sum, record) => {
      const start = new Date(record.detected_at).getTime();
      const end = new Date(record.resolved_at).getTime();
      return sum + (end - start);
    }, 0);

    return (totalTime / this.resolutionHistory.length) / (1000 * 60 * 60); // Convert to hours
  }

  // Initialization methods
  private initializeVaguenessPatterns(): void {
    this.vaguenessPatterns = [
      {
        regex: '\\b(good|better|best|nice|clean|intuitive)\\b',
        indicators: ['subjective quality term'],
        alternatives: ['specific measurable criteria'],
        ambiguity_score: 75,
        severity_base: 60
      },
      {
        regex: '\\b(fast|slow|quick|efficient|optimal)\\b',
        indicators: ['performance term without metrics'],
        alternatives: ['specific performance requirements'],
        ambiguity_score: 80,
        severity_base: 70
      },
      {
        regex: '\\b(easy|simple|complex|difficult)\\b',
        indicators: ['complexity term without definition'],
        alternatives: ['specific usability criteria'],
        ambiguity_score: 70,
        severity_base: 55
      },
      {
        regex: '\\b(many|few|several|most|some)\\b',
        indicators: ['quantity term without specification'],
        alternatives: ['specific numbers or ranges'],
        ambiguity_score: 85,
        severity_base: 75
      }
    ];
  }

  private loadDomainTerms(): void {
    // In a real implementation, this would load from a domain vocabulary
    this.domainTerms.set('user', {
      multiple_meanings: [
        { definition: 'End user of the system', context: 'User experience', frequency: 60, stakeholder_groups: ['UX', 'Product'] },
        { definition: 'System administrator', context: 'System management', frequency: 30, stakeholder_groups: ['IT', 'Operations'] },
        { definition: 'Database user account', context: 'Technical implementation', frequency: 10, stakeholder_groups: ['Development'] }
      ],
      confusion_score: 70,
      domain_specificity: 30
    });

    this.domainTerms.set('process', {
      multiple_meanings: [
        { definition: 'Business workflow', context: 'Business operations', frequency: 50, stakeholder_groups: ['Business', 'Product'] },
        { definition: 'System process', context: 'Technical implementation', frequency: 40, stakeholder_groups: ['Development', 'Operations'] },
        { definition: 'Data processing', context: 'Data management', frequency: 10, stakeholder_groups: ['Data', 'Analytics'] }
      ],
      confusion_score: 80,
      domain_specificity: 40
    });
  }

  private loadBusinessGlossary(): void {
    // Load existing business terms and definitions
    this.businessGlossary.set('customer', {
      definition: 'External party who purchases or uses our services',
      context: 'Business domain',
      alternative_terms: ['client', 'user', 'subscriber'],
      usage_notes: 'Use when referring to paying customers'
    });
  }

  // ID generation
  private generateAmbiguityId(): string {
    return `amb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getDetectedAmbiguities(): Ambiguity[] {
    return Array.from(this.detectedAmbiguities.values());
  }

  getAmbiguitiesByType(type: AmbiguityType): Ambiguity[] {
    return this.getDetectedAmbiguities().filter(amb => amb.type === type);
  }

  getAmbiguitiesBySeverity(severity: string): Ambiguity[] {
    return this.getDetectedAmbiguities().filter(amb => amb.severity === severity);
  }

  getClarificationQuestions(): ClarificationQuestion[] {
    return Array.from(this.clarificationQuestions.values());
  }

  async resolveAmbiguity(
    ambiguityId: string,
    resolution: string,
    resolvedBy: string
  ): Promise<void> {
    const ambiguity = this.detectedAmbiguities.get(ambiguityId);
    if (ambiguity) {
      ambiguity.status = 'resolved';
      ambiguity.resolved_at = new Date().toISOString();
      ambiguity.resolution_notes = resolution;

      // Track resolution
      this.resolutionHistory.push({
        ambiguity_id: ambiguityId,
        detected_at: ambiguity.detected_at,
        resolved_at: ambiguity.resolved_at,
        resolved_by: resolvedBy,
        resolution_method: 'manual'
      });

      this.emit('ambiguity:resolved', { ambiguity, resolution, resolvedBy });
    }
  }

  async generateImprovementReport(): Promise<ImprovementReport> {
    const ambiguities = this.getDetectedAmbiguities();
    const analysis = this.analyzeAmbiguities(ambiguities);

    return {
      generated_at: new Date().toISOString(),
      clarity_score: analysis.overall_clarity_score,
      total_ambiguities: analysis.total_ambiguities,
      resolution_progress: analysis.resolution_tracking,
      improvement_areas: analysis.improvement_suggestions,
      recommendations: this.generateDetailedRecommendations(analysis),
      next_actions: this.generateNextActions(analysis)
    };
  }

  private generateDetailedRecommendations(analysis: AmbiguityAnalysis): DetailedRecommendation[] {
    // Implementation would generate specific, actionable recommendations
    return [];
  }

  private generateNextActions(analysis: AmbiguityAnalysis): NextAction[] {
    // Implementation would generate prioritized next actions
    return [];
  }
}

// Supporting interfaces
interface VaguenessPattern {
  regex: string;
  indicators: string[];
  alternatives: string[];
  ambiguity_score: number;
  severity_base: number;
}

interface DomainTerm {
  multiple_meanings: TermMeaningDetail[];
  confusion_score: number;
  domain_specificity: number;
}

interface TermMeaningDetail {
  definition: string;
  context: string;
  frequency: number;
  stakeholder_groups: string[];
}

interface TermDefinition {
  definition: string;
  context: string;
  alternative_terms: string[];
  usage_notes: string;
}

interface ContradictionInfo {
  type: 'direct' | 'implicit' | 'conditional';
  severity: 'minor' | 'major' | 'blocking';
  resolution: string;
  stakeholders: string[];
}

interface DocumentContext {
  document_name: string;
  requirement_ids?: string[];
  sections?: string[];
}

interface ResolutionRecord {
  ambiguity_id: string;
  detected_at: string;
  resolved_at: string;
  resolved_by: string;
  resolution_method: 'manual' | 'automated' | 'clarification';
}

interface ImprovementReport {
  generated_at: string;
  clarity_score: number;
  total_ambiguities: number;
  resolution_progress: ResolutionTracking;
  improvement_areas: ImprovementSuggestion[];
  recommendations: DetailedRecommendation[];
  next_actions: NextAction[];
}

interface DetailedRecommendation {
  priority: number;
  category: string;
  title: string;
  description: string;
  rationale: string;
  implementation_steps: string[];
  success_criteria: string[];
  timeline: string;
}

interface NextAction {
  action: string;
  assignee: string;
  deadline: string;
  dependencies: string[];
  success_criteria: string[];
}