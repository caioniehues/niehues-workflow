# Evolution Report
Date: {{timestamp}}
Pipeline: {{pipeline_id}}
Duration: {{duration}}

## Executive Summary
{{summary}}

## Metrics

### Performance
- Pipeline duration: {{total_time}}
- Parallel efficiency: {{parallel_percentage}}%
- Bottlenecks identified: {{bottleneck_count}}

### Quality
- Tests passed: {{test_pass_rate}}%
- Guidelines followed: {{guideline_compliance}}%
- Security issues: {{security_issue_count}}

### Learning
- Patterns extracted: {{pattern_count}}
- Questions captured: {{question_count}}
- Process improvements: {{improvement_count}}

## Patterns Extracted

{{#each patterns}}
### {{name}}
- Category: {{category}}
- Frequency: {{count}}
- Confidence: {{confidence}}
- Template created: {{template_path}}
{{/each}}

## Process Improvements

{{#each improvements}}
### {{title}}
- Type: {{type}}
- Impact: {{impact}}
- Implementation: {{details}}
{{/each}}

## Agent Performance

{{#each agents}}
### {{agent_name}}
- Invocations: {{count}}
- Average time: {{avg_time}}
- Success rate: {{success_rate}}%
- Patterns detected: {{patterns}}
{{/each}}

## Guideline Updates

{{#each guideline_updates}}
- {{description}}
- Rationale: {{reason}}
- File: {{file_path}}
{{/each}}

## New Agent Proposals

{{#each agent_proposals}}
### {{agent_name}}
- Purpose: {{purpose}}
- Trigger: {{trigger}}
- Justification: {{justification}}
{{/each}}

## Next Steps
{{next_steps}}