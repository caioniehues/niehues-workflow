# Nexus Enhanced Workflow v5

## What is Nexus?
Nexus is a self-improving development workflow methodology that learns from your patterns and evolves to match your needs. It's not software you install - it's a comprehensive workflow system you use with Claude to ensure high-quality development through unlimited questioning and flexible TDD practices.

## Key Innovation
Unlike traditional development methodologies, Nexus:
- **Asks unlimited questions** until understanding is complete (no artificial limits)
- **Enforces TDD flexibly** with documented exceptions for spikes and emergencies
- **Learns continuously** at three levels (continuous, micro, formal)
- **Evolves automatically** by extracting patterns and suggesting improvements

## How It Works

### 1. Initialize Your Project
```bash
/nexus-init  # Sets up .nexus/ directory with guidelines and tracking
```

### 2. Follow the Pipeline
```
BRAINSTORM → SPECIFY → DESIGN → DECOMPOSE → IMPLEMENT → VALIDATE → EVOLVE → MAINTAIN
```
Each phase has specialized agents and specific outputs.

### 3. Let It Learn
- Patterns extracted after 3+ repetitions
- Questions added to templates after 5+ occurrences
- Workflow improvements suggested continuously

## Core Features

### 🎯 Unlimited Adaptive Questioning
No limits on clarification - continues until complete understanding achieved.

### 🛡️ Security-First Development
SecurityGuardian agent reviews all code for vulnerabilities throughout pipeline.

### 📊 T-Shirt Task Sizing
Clear estimation: XS (<30min), S (30-60min), M (1-2hr), L (2-4hr), XL (split!)

### 🔄 Three-Layer Evolution
- **Continuous**: Pattern detection always running
- **Micro**: Learning after each phase
- **Formal**: Deep reflection after full pipeline

### 🔀 Backward Phase Navigation
Jump back to any previous phase when issues discovered - realistic iterative development.

## Project Structure
```
niehues-workflow/
├── .nexus/          # Workflow data (created by /nexus-init)
├── .claude/         # Claude commands and agents
├── docs/            # Specifications and research
├── examples/        # Usage examples
├── templates/       # Reusable templates
└── CLAUDE.md        # Claude integration instructions
```

## Quick Start
1. Open project in Claude
2. Run `/nexus-init` to initialize workflow
3. Start with `/nexus-brainstorm "your feature idea"`
4. Follow the pipeline phases
5. Watch the system learn and evolve

## Documentation
- **[Full Specification](docs/specs/nexus-enhanced-specification-v5.md)** - Complete v5 specification
- **[Claude Integration](CLAUDE.md)** - How to use with Claude
- **[Research & Analysis](docs/research/)** - Comparative workflow analysis

## Philosophy
- **Question everything, assume nothing**
- **Test-driven by default, pragmatic when needed**
- **Sequential execution, parallel when beneficial**
- **Learn continuously, evolve systematically**

## Status
- ✅ **Specification**: Complete v5 specification ready
- 🚧 **Implementation**: Commands and agents being developed
- 📚 **Documentation**: Core docs complete, examples in progress

## Contributing
This is a workflow methodology, not traditional software. Contributions should focus on:
- Command implementations (`.claude/commands/`)
- Agent specifications (`.claude/agents/`)
- Pattern templates (`templates/`)
- Usage examples (`examples/`)

## License
MIT - Use freely and adapt to your needs

---

*Nexus v5 - Quality through understanding, evolution through learning*