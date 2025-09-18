# Pattern: {{pattern_name}}
Category: {{category}}
Created: {{created_date}}
Usage Count: {{usage_count}}
Confidence: {{confidence}}

## Purpose
{{purpose}}

## Context
When to use this pattern:
{{context}}

## Structure
```{{language}}
{{pattern_code}}
```

## Variables
{{#each variables}}
- {{name}}: {{description}}
{{/each}}

## Examples
{{#each examples}}
### Example {{@index}}
- File: {{file}}:{{line}}
- Context: {{context}}
{{/each}}

## Variations
{{#each variations}}
### {{name}}
- When: {{when}}
- How: {{how}}
{{/each}}

## Security Considerations
{{security_notes}}

## Performance Notes
{{performance_notes}}

## Evolution History
{{#each history}}
- {{version}}: {{changes}}
{{/each}}