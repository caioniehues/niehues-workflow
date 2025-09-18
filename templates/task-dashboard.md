# Task Dashboard: {{feature_name}}
Generated: {{timestamp}}
Sprint: {{sprint_number}}

## Summary
Total Tasks: {{total_tasks}}
Completed: {{completed_tasks}} ({{completion_percentage}}%)
In Progress: {{in_progress_tasks}}
Blocked: {{blocked_tasks}}
Remaining: {{remaining_tasks}}

## Progress Bar
```
[{{progress_bar}}] {{completion_percentage}}%
```

## State Distribution
```
PENDING:       {{pending_count}}     ████████
WRITING_TEST:  {{writing_test_count}} ██
IMPLEMENTING:  {{implementing_count}} ███
REVIEWING:     {{reviewing_count}}    ██
DONE:          {{done_count}}        ██████████████
BLOCKED:       {{blocked_count}}      ███
```

## Size Distribution
| Size | Count | Estimated | Actual | Variance |
|------|-------|-----------|--------|----------|
| XS   | {{xs_count}} | {{xs_estimated}} | {{xs_actual}} | {{xs_variance}} |
| S    | {{s_count}} | {{s_estimated}} | {{s_actual}} | {{s_variance}} |
| M    | {{m_count}} | {{m_estimated}} | {{m_actual}} | {{m_variance}} |
| L    | {{l_count}} | {{l_estimated}} | {{l_actual}} | {{l_variance}} |

## Critical Path
{{#each critical_path}}
{{@index}}. {{task_id}}: {{task_title}} ({{size}}, {{state}})
{{/each}}

Critical Path Duration: {{critical_duration}} hours
Estimated Completion: {{estimated_completion_date}}

## Parallel Execution Opportunities
{{#each parallel_groups}}
### Group: {{group_name}}
Tasks: {{task_count}}
Potential Time Saving: {{time_saved}} minutes ({{percentage_saved}}%)

Tasks in group:
{{#each tasks}}
- {{task_id}}: {{task_title}} ({{size}})
{{/each}}
{{/each}}

## Blocked Tasks
{{#each blocked_tasks}}
### {{task_id}}: {{task_title}}
- Blocked Since: {{blocked_since}}
- Blocked By: {{blocking_reason}}
- Resolution: {{proposed_resolution}}
{{/each}}

## In Progress Tasks
{{#each in_progress_tasks}}
### {{task_id}}: {{task_title}}
- State: {{current_state}}
- Assigned: {{assigned_to}}
- Started: {{started_at}}
- Expected: {{expected_completion}}
{{/each}}

## Velocity Metrics
- Average Completion Time: {{avg_completion}} minutes
- Daily Velocity: {{daily_velocity}} tasks/day
- Weekly Velocity: {{weekly_velocity}} tasks/week
- Estimation Accuracy: {{estimation_accuracy}}%

## Risk Items
{{#each risk_items}}
- {{risk_description}}
  Impact: {{impact}}, Mitigation: {{mitigation}}
{{/each}}

## Recent Completions
{{#each recent_completions}}
- {{task_id}}: {{task_title}}
  Completed: {{completed_at}}, Time: {{actual_time}}m (est: {{estimated_time}}m)
{{/each}}

## Upcoming Tasks (Ready to Start)
{{#each ready_tasks}}
- {{task_id}}: {{task_title}} ({{size}}, {{estimated_time}}m)
{{/each}}