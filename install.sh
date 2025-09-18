#!/bin/bash

# Nexus Workflow v5 Installation Script
# Usage:
#   Global install: ./install.sh
#   Local install:  ./install.sh --local
#   Custom path:    ./install.sh --path /custom/path

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
NEXUS_VERSION="5.0.0"
NEXUS_REPO="https://github.com/yourusername/nexus-workflow-v5"
TEMP_DIR="/tmp/nexus-install-$$"
INSTALL_MODE="global"
CUSTOM_PATH=""

# ASCII Art Banner
show_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
    _   _                       __        __         _     __ _
   | \ | | _____  ___   _ ___  \ \      / /__  _ __| | __/ _| | _____      __
   |  \| |/ _ \ \/ / | | / __|  \ \ /\ / / _ \| '__| |/ / |_| |/ _ \ \ /\ / /
   | |\  |  __/>  <| |_| \__ \   \ V  V / (_) | |  |   <|  _| | (_) \ V  V /
   |_| \_|\___/_/\_\\__,_|___/    \_/\_/ \___/|_|  |_|\_\_| |_|\___/ \_/\_/
                                                                           v5.0
EOF
    echo -e "${NC}"
}

# Print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_step() {
    echo -e "${MAGENTA}▶${NC} ${BOLD}$1${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --local|-l)
                INSTALL_MODE="local"
                shift
                ;;
            --path|-p)
                INSTALL_MODE="custom"
                CUSTOM_PATH="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            --version|-v)
                echo "Nexus Workflow Installer v${NEXUS_VERSION}"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Show help message
show_help() {
    cat << EOF
Nexus Workflow v5 Installation Script

Usage:
    curl -sSL [url] | bash                    # Global install
    curl -sSL [url] | bash -s -- --local      # Local project install
    curl -sSL [url] | bash -s -- --path PATH  # Custom path install

Options:
    --local, -l         Install to current project directory only
    --path, -p PATH     Install to custom path
    --help, -h          Show this help message
    --version, -v       Show version information

Examples:
    # Install globally (all projects can use Nexus)
    ./install.sh

    # Install for current project only
    ./install.sh --local

    # Install to specific directory
    ./install.sh --path ~/my-project

EOF
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."

    local has_errors=false

    # Check for git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        has_errors=true
    else
        print_success "git found: $(git --version | head -1)"
    fi

    # Check for curl or wget
    if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
        print_error "curl or wget is required"
        has_errors=true
    else
        if command -v curl &> /dev/null; then
            print_success "curl found"
        else
            print_success "wget found"
        fi
    fi

    # Check for Claude Code indicator (optional)
    if [ -f ".claude" ] || [ -d ".claude" ]; then
        print_warning "Existing .claude directory detected - will be backed up"
    fi

    if $has_errors; then
        print_error "Missing prerequisites. Please install required tools and try again."
        exit 1
    fi

    print_success "All prerequisites met!"
}

# Determine installation path
determine_install_path() {
    case $INSTALL_MODE in
        global)
            if [ -n "$HOME" ]; then
                INSTALL_PATH="$HOME/.nexus-workflow"
            else
                print_error "HOME directory not found"
                exit 1
            fi
            ;;
        local)
            INSTALL_PATH="$(pwd)"
            ;;
        custom)
            INSTALL_PATH="$CUSTOM_PATH"
            ;;
    esac

    print_info "Installation path: $INSTALL_PATH"
}

# Download Nexus files
download_nexus() {
    print_step "Downloading Nexus Workflow v${NEXUS_VERSION}..."

    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"

    # Try git clone first
    if command -v git &> /dev/null; then
        git clone --quiet --depth 1 "$NEXUS_REPO" nexus-temp 2>/dev/null || {
            print_error "Failed to clone repository"
            cleanup
            exit 1
        }
    else
        # Fallback to downloading archive
        if command -v curl &> /dev/null; then
            curl -L -o nexus.tar.gz "${NEXUS_REPO}/archive/main.tar.gz" 2>/dev/null
        else
            wget -O nexus.tar.gz "${NEXUS_REPO}/archive/main.tar.gz" 2>/dev/null
        fi

        tar -xzf nexus.tar.gz
        mv nexus-workflow-v5-main nexus-temp
    fi

    print_success "Downloaded successfully!"
}

# Backup existing installation
backup_existing() {
    if [ -d "$INSTALL_PATH/.claude" ] || [ -d "$INSTALL_PATH/.nexus" ]; then
        print_step "Backing up existing installation..."

        local backup_dir="${INSTALL_PATH}/.nexus-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$backup_dir"

        if [ -d "$INSTALL_PATH/.claude" ]; then
            cp -r "$INSTALL_PATH/.claude" "$backup_dir/"
            print_info "Backed up .claude to $backup_dir"
        fi

        if [ -d "$INSTALL_PATH/.nexus" ]; then
            cp -r "$INSTALL_PATH/.nexus" "$backup_dir/"
            print_info "Backed up .nexus to $backup_dir"
        fi

        if [ -f "$INSTALL_PATH/CLAUDE.md" ]; then
            cp "$INSTALL_PATH/CLAUDE.md" "$backup_dir/"
            print_info "Backed up CLAUDE.md to $backup_dir"
        fi

        print_success "Backup complete!"
    fi
}

# Install Nexus files
install_nexus() {
    print_step "Installing Nexus Workflow..."

    cd "$TEMP_DIR/nexus-temp"

    # Create installation directory if needed
    mkdir -p "$INSTALL_PATH"

    # Copy core files
    print_info "Copying core files..."
    cp -r .claude "$INSTALL_PATH/"
    cp CLAUDE.md "$INSTALL_PATH/"

    # Copy templates if they don't exist
    if [ ! -d "$INSTALL_PATH/templates" ]; then
        cp -r templates "$INSTALL_PATH/" 2>/dev/null || true
    fi

    # Copy examples if they don't exist
    if [ ! -d "$INSTALL_PATH/examples" ]; then
        cp -r examples "$INSTALL_PATH/" 2>/dev/null || true
    fi

    # Copy documentation
    if [ ! -d "$INSTALL_PATH/docs" ]; then
        mkdir -p "$INSTALL_PATH/docs"
    fi
    cp -r docs/* "$INSTALL_PATH/docs/" 2>/dev/null || true

    # Create symlinks for global install
    if [ "$INSTALL_MODE" = "global" ]; then
        print_info "Setting up global access..."

        # Create a nexus command wrapper
        cat > "$INSTALL_PATH/nexus" << 'WRAPPER'
#!/bin/bash
# Nexus Workflow Command Wrapper

# Check if we're in a project with Nexus
if [ ! -d ".nexus" ]; then
    echo "Not in a Nexus project. Run '/nexus-init' in Claude Code first."
    exit 1
fi

echo "Nexus Workflow is integrated with Claude Code."
echo "Use the /nexus-* commands within Claude Code to access functionality."
WRAPPER

        chmod +x "$INSTALL_PATH/nexus"

        # Add to PATH if not already there
        if [[ ":$PATH:" != *":$INSTALL_PATH:"* ]]; then
            print_info "Adding Nexus to PATH..."

            # Detect shell and update appropriate config
            if [ -n "$BASH_VERSION" ]; then
                echo "export PATH=\"\$PATH:$INSTALL_PATH\"" >> ~/.bashrc
                print_info "Added to ~/.bashrc"
            fi

            if [ -n "$ZSH_VERSION" ] || [ -f ~/.zshrc ]; then
                echo "export PATH=\"\$PATH:$INSTALL_PATH\"" >> ~/.zshrc
                print_info "Added to ~/.zshrc"
            fi
        fi
    fi

    print_success "Installation complete!"
}

# Setup initial configuration
setup_configuration() {
    print_step "Setting up configuration..."

    # Create .mcp.json for Claude Code integration if it doesn't exist
    if [ ! -f "$INSTALL_PATH/.mcp.json" ] && [ "$INSTALL_MODE" != "global" ]; then
        cat > "$INSTALL_PATH/.mcp.json" << 'EOF'
{
  "name": "nexus-workflow",
  "version": "5.0.0",
  "commands": ".claude/commands",
  "agents": ".claude/agents"
}
EOF
        print_success "Created MCP configuration"
    fi

    print_success "Configuration complete!"
}

# Cleanup temporary files
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Verify installation
verify_installation() {
    print_step "Verifying installation..."

    local verification_passed=true

    # Check core directories
    if [ -d "$INSTALL_PATH/.claude" ]; then
        print_success ".claude directory installed"
    else
        print_error ".claude directory not found"
        verification_passed=false
    fi

    if [ -f "$INSTALL_PATH/CLAUDE.md" ]; then
        print_success "CLAUDE.md installed"
    else
        print_error "CLAUDE.md not found"
        verification_passed=false
    fi

    # Check commands
    local command_count=$(ls -1 "$INSTALL_PATH/.claude/commands/" 2>/dev/null | wc -l)
    if [ "$command_count" -gt 0 ]; then
        print_success "Found $command_count Nexus commands"
    else
        print_error "No commands found"
        verification_passed=false
    fi

    if $verification_passed; then
        print_success "Installation verified successfully!"
        return 0
    else
        print_error "Installation verification failed"
        return 1
    fi
}

# Show post-installation instructions
show_next_steps() {
    echo
    echo -e "${GREEN}${BOLD}🎉 Nexus Workflow v${NEXUS_VERSION} installed successfully!${NC}"
    echo
    echo -e "${CYAN}${BOLD}Next Steps:${NC}"
    echo

    case $INSTALL_MODE in
        global)
            cat << EOF
1. ${BOLD}Restart your terminal${NC} or run:
   ${CYAN}source ~/.bashrc${NC} (or ~/.zshrc for zsh)

2. ${BOLD}Navigate to your project${NC}:
   ${CYAN}cd /path/to/your/project${NC}

3. ${BOLD}Open in Claude Code${NC} and initialize:
   ${CYAN}/nexus-init${NC}

4. ${BOLD}Start your first feature${NC}:
   ${CYAN}/nexus-brainstorm "your feature idea"${NC}
EOF
            ;;
        local|custom)
            cat << EOF
1. ${BOLD}Open this directory in Claude Code${NC}:
   ${CYAN}$INSTALL_PATH${NC}

2. ${BOLD}Initialize Nexus${NC}:
   ${CYAN}/nexus-init${NC}

3. ${BOLD}Start your first feature${NC}:
   ${CYAN}/nexus-brainstorm "your feature idea"${NC}
EOF
            ;;
    esac

    echo
    echo -e "${YELLOW}${BOLD}Quick Reference:${NC}"
    echo "  • Documentation: ${CYAN}$INSTALL_PATH/docs/${NC}"
    echo "  • Examples:      ${CYAN}$INSTALL_PATH/examples/${NC}"
    echo "  • Commands:      ${CYAN}$INSTALL_PATH/.claude/commands/${NC}"
    echo
    echo -e "${GREEN}Happy coding with Nexus!${NC} 🚀"
    echo
}

# Main installation flow
main() {
    # Clear screen for better visibility
    clear

    # Show banner
    show_banner

    # Parse arguments
    parse_args "$@"

    # Detect OS
    detect_os
    print_info "Detected OS: $OS"

    # Check prerequisites
    check_prerequisites

    # Determine installation path
    determine_install_path

    # Backup existing installation
    backup_existing

    # Download Nexus
    download_nexus

    # Install Nexus
    install_nexus

    # Setup configuration
    setup_configuration

    # Cleanup
    cleanup

    # Verify installation
    if verify_installation; then
        # Show next steps
        show_next_steps
        exit 0
    else
        print_error "Installation completed with errors. Please check the output above."
        exit 1
    fi
}

# Error handling
trap 'cleanup; print_error "Installation interrupted"; exit 1' INT TERM

# Run main function
main "$@"