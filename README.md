<div align="center">

# 🚀 Nexus Enhanced Workflow v5

### **A Self-Improving Development Methodology That Learns From Your Patterns**

[![Methodology Version](https://img.shields.io/badge/version-5.0-blue.svg)](https://github.com/yourusername/nexus-workflow-v5)
[![Documentation](https://img.shields.io/badge/docs-comprehensive-green.svg)](docs/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Claude Compatible](https://img.shields.io/badge/claude-compatible-orange.svg)](https://claude.ai)
[![TDD](https://img.shields.io/badge/TDD-flexible-yellow.svg)](docs/workflow-usage-guide.md#tdd-approach)
[![Security First](https://img.shields.io/badge/security-first-red.svg)](docs/workflow-usage-guide.md#security)

</div>

---

<div align="center">

**Transform your development workflow with unlimited questioning, flexible TDD, and continuous evolution**

[📖 **Quick Start**](#-quick-start) •
[🎯 **Features**](#-key-features) •
[📚 **Documentation**](#-documentation) •
[🛠️ **Installation**](#-installation) •
[💡 **Examples**](examples/)

</div>

---

## 🌟 What is Nexus?

**Nexus is NOT software** - it's a comprehensive **development methodology** implemented through Claude commands that ensures exceptional code quality through:

<table>
<tr>
<td width="50%">

### ✨ Core Innovations

- **🤔 Unlimited Questioning** - No artificial limits on clarification
- **🧪 Flexible TDD** - Strong defaults with pragmatic exceptions
- **🔄 Continuous Evolution** - Learns from your patterns
- **🛡️ Security-First** - Built-in vulnerability scanning
- **📊 Smart Task Sizing** - Realistic time estimates

</td>
<td width="50%">

### 🎯 Key Benefits

- **📈 Higher Quality** - Through thorough understanding
- **⚡ Faster Iteration** - Learn once, apply everywhere
- **🔍 Better Discovery** - Questions reveal hidden requirements
- **🛠️ Adaptable Process** - Evolves to your needs
- **📝 Self-Documenting** - Captures decisions and patterns

</td>
</tr>
</table>

## 🚀 Quick Start

```bash
# 1. Install Nexus globally or locally
curl -sSL https://raw.githubusercontent.com/yourusername/nexus-workflow-v5/main/install.sh | bash

# 2. Initialize your project
/nexus-init

# 3. Start your first feature
/nexus-brainstorm "Add user authentication"

# 4. Follow the intelligent pipeline
# The system guides you through each phase automatically
```

<details>
<summary>📺 <b>See it in action (click to expand)</b></summary>

```mermaid
graph LR
    B[🧠 BRAINSTORM] --> S[📋 SPECIFY]
    S --> D[🏗️ DESIGN]
    D --> DC[✂️ DECOMPOSE]
    DC --> I[⚡ IMPLEMENT]
    I --> V[✅ VALIDATE]
    V --> E[🔄 EVOLVE]
    E --> M[🔧 MAINTAIN]

    style B fill:#e1f5fe
    style S fill:#f3e5f5
    style D fill:#fff3e0
    style DC fill:#e8f5e9
    style I fill:#fce4ec
    style V fill:#e0f2f1
    style E fill:#f1f8e9
    style M fill:#fafafa
```

Each phase can navigate backward when issues are discovered, ensuring quality at every step.

</details>

## 🎯 Key Features

### 🤔 **Unlimited Adaptive Questioning**
The system asks as many questions as needed to achieve complete understanding. No arbitrary limits.

<details>
<summary>Learn more</summary>

- Questions adapt based on your responses
- Continues until ambiguity is eliminated
- Builds comprehensive context understanding
- Questions become templates after 5+ occurrences

</details>

### 🧪 **Flexible Test-Driven Development**
Strong TDD by default with documented exceptions for real-world scenarios.

<details>
<summary>Learn more</summary>

**Default Flow:**
```
RED → GREEN → REFACTOR
```

**Allowed Exceptions:**
- **Exploratory Spikes** - Max 2 hours, then formalize
- **Emergency Hotfixes** - Tests within 24 hours
- **Proof of Concepts** - Clearly marked as POC

</details>

### 🔄 **Three-Layer Evolution System**

<table>
<tr>
<th>Layer</th>
<th>When</th>
<th>What Happens</th>
</tr>
<tr>
<td><b>Continuous</b></td>
<td>Always</td>
<td>Pattern detection, question refinement</td>
</tr>
<tr>
<td><b>Micro</b></td>
<td>After each phase</td>
<td>Phase-specific improvements</td>
</tr>
<tr>
<td><b>Formal</b></td>
<td>Pipeline complete</td>
<td>Deep reflection, major adaptations</td>
</tr>
</table>

### 📊 **Smart Task Management**

```
┌─────────────────────────────────────┐
│  Task Sizing & Estimation           │
├─────────────────────────────────────┤
│  XS  │  < 30 minutes               │
│  S   │  30-60 minutes              │
│  M   │  1-2 hours                  │
│  L   │  2-4 hours                  │
│  XL  │  MUST SPLIT!                │
└─────────────────────────────────────┘
```

**12-State Task Lifecycle:**
`PENDING → BLOCKED → WRITING_TEST → TEST_FAILING → IMPLEMENTING → TEST_PASSING → REVIEWING → NEEDS_REWORK → REFACTORING → PAUSED → CANCELLED → FAILED → DONE`

## 🛠️ Installation

### Option 1: Quick Install (Recommended)

```bash
# Install globally (all projects)
curl -sSL https://raw.githubusercontent.com/yourusername/nexus-workflow-v5/main/install.sh | bash

# Or install for current project only
curl -sSL https://raw.githubusercontent.com/yourusername/nexus-workflow-v5/main/install.sh | bash -s -- --local
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-workflow-v5.git

# Copy Claude integration
cp -r nexus-workflow-v5/.claude your-project/
cp nexus-workflow-v5/CLAUDE.md your-project/

# Initialize
cd your-project
/nexus-init
```

## 📚 Documentation

<table>
<tr>
<td width="33%">

### 🚀 **Getting Started**
- [**Quick Start Guide**](docs/quickstart.md)
- [**Installation**](#-installation)
- [**First Project**](examples/first-project.md)

</td>
<td width="33%">

### 📖 **Core Guides**
- [**Workflow Usage Guide**](docs/workflow-usage-guide.md)
- [**Command Reference**](docs/command-reference.md)
- [**Agent System**](docs/agents.md)

</td>
<td width="33%">

### 🔧 **Advanced**
- [**Full Specification**](docs/specs/nexus-enhanced-specification-v5.md)
- [**Pattern Templates**](templates/)
- [**Evolution System**](docs/evolution.md)

</td>
</tr>
</table>

### 📋 Available Commands

| Command | Purpose | Phase |
|---------|---------|-------|
| `/nexus-init` | Initialize workflow system | Setup |
| `/nexus-brainstorm` | Generate solutions through questioning | 🧠 Brainstorm |
| `/nexus-specify` | Create formal specifications | 📋 Specify |
| `/nexus-design` | Architectural design with security | 🏗️ Design |
| `/nexus-decompose` | Break into sized tasks | ✂️ Decompose |
| `/nexus-implement` | Execute with TDD | ⚡ Implement |
| `/nexus-validate` | Quality verification | ✅ Validate |
| `/nexus-evolve` | Reflection and learning | 🔄 Evolve |
| `/nexus-maintain` | Handle maintenance | 🔧 Maintain |
| `/nexus-task` | Task management | 📊 Utility |

## 🎓 Philosophy

<div align="center">

**"Question everything, assume nothing"**

**"Test-driven by default, pragmatic when needed"**

**"Learn continuously, evolve systematically"**

</div>

## 🤝 Contributing

Nexus is a methodology, not traditional software. Contributions should focus on:

- 📝 **Command Implementations** - `.claude/commands/`
- 🤖 **Agent Specifications** - `.claude/agents/`
- 📋 **Pattern Templates** - `templates/`
- 💡 **Usage Examples** - `examples/`
- 📚 **Documentation** - `docs/`

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## ⚡ Status

| Component | Status | Description |
|-----------|--------|-------------|
| **Specification** | ✅ Complete | v5 specification finalized |
| **Commands** | ✅ Complete | All 10+ commands implemented |
| **Agents** | 🚧 In Progress | Agent system being refined |
| **Documentation** | 📚 Active | Continuously improving |
| **Examples** | 🌱 Growing | Adding real-world examples |

## 📄 License

MIT License - Use freely and adapt to your needs.

---

<div align="center">

**Nexus v5** - *Quality through understanding, evolution through learning*

[⬆ Back to Top](#-nexus-enhanced-workflow-v5)

</div>