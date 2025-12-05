# Contributing to LitLabs AI

Thank you for your interest in contributing to LitLabs AI! This document provides guidelines for contributing to the project.

## Getting Started

1. **Read the documentation**: Familiarize yourself with the project by reading:
   - [README.md](README.md) - Basic project information
   - [README_LITLABS.md](README_LITLABS.md) - Detailed LitLabs documentation
   - [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) - Environment setup guide
   - [.github/copilot-instructions.md](.github/copilot-instructions.md) - Comprehensive development guidelines

2. **Setup your development environment**:
   ```bash
   # Clone the repository
   git clone https://github.com/LiTree89/Labs-Ai.git
   cd Labs-Ai
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env.local
   # Fill in your environment variables
   
   # Start development server
   npm run dev
   ```

## Development Guidelines

All contributors should follow the comprehensive guidelines in [.github/copilot-instructions.md](.github/copilot-instructions.md), which includes:

- **Code Standards**: TypeScript, React, and Next.js best practices
- **Security Requirements**: Authentication, authorization, and input validation
- **Git Workflow**: Branch naming conventions and PR process
- **Testing Guidelines**: Manual testing requirements
- **Architecture Patterns**: Firebase integration, API routes, component structure

## Pull Request Process

1. **Create a branch** following our naming conventions:
   - Features: `feature/<description>` or `feat/<description>`
   - Bug fixes: `fix/<description>` or `bugfix/<description>`
   - Documentation: `docs/<description>`

2. **Make your changes**:
   - Follow the coding standards in copilot-instructions.md
   - Ensure all security requirements are met
   - Test your changes thoroughly

3. **Before submitting**:
   ```bash
   npm run lint    # Check for linting errors
   npm run build   # Ensure project builds successfully
   ```

4. **Submit your PR**:
   - Write a clear description of what changes you made and why
   - Link to any related issues
   - Wait for review and address any feedback

## Working with GitHub Copilot

This repository is configured to work with GitHub Copilot agents:

- Issues can be assigned to `@copilot` on GitHub.com
- Copilot will create a branch and open a PR automatically
- Review Copilot PRs like any peer developer's work
- Provide feedback using `@copilot` mentions in PR comments

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed Copilot guidelines.

## Code Review Standards

All PRs go through code review. Reviewers check for:

- **Type safety**: Proper TypeScript usage
- **Security**: Authentication, authorization, input validation
- **Code quality**: Following established patterns and conventions
- **Testing**: Changes are manually tested
- **Documentation**: Updated if functionality changes

Custom agents are available for automated reviews:
- `code-quality` - Reviews TypeScript, React, and Next.js code
- `security-reviewer` - Reviews security aspects of changes

## Security

Security is our top priority. When contributing:

- ✅ Never commit secrets or API keys
- ✅ All API routes must have authentication
- ✅ Validate and sanitize all user input
- ✅ Use rate limiting on public endpoints
- ✅ Follow the security patterns in copilot-instructions.md

Report security vulnerabilities privately via GitHub Security Advisories.

## Questions?

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for detailed guidelines
- Open an issue for questions or clarifications

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to LitLabs AI! 🚀
