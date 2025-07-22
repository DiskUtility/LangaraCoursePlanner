# Contributing to Langara Course Planner

🎉 Thank you for your interest in contributing to the Langara Course Planner! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Issue Guidelines](#issue-guidelines)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please be respectful and considerate to others.

## 🛠️ How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node.js version)

### 💡 Suggesting Features

Feature requests are welcome! Please include:

- **Clear description** of the feature
- **Why this feature would be useful**
- **Possible implementation ideas**

### 💻 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test your changes**
5. **Submit a pull request**

## 🚀 Development Setup

### Prerequisites

- Node.js 18.0 or later
- Yarn or npm
- Git

### Setup Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/LangaraCoursePlanner.git
cd LangaraCoursePlanner

# 2. Install dependencies
yarn install

# 3. Start development server
yarn dev

# 4. Open http://localhost:3000
```

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utility libraries and API clients
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Test your changes locally
- [ ] Run `yarn lint` to check code style
- [ ] Update documentation if needed
- [ ] Write descriptive commit messages

### PR Requirements

1. **Clear title and description**
2. **Reference related issues** (e.g., "Fixes #123")
3. **Include screenshots** for UI changes
4. **Test instructions** for reviewers

### Branch Naming

Use descriptive branch names:
- `feature/course-search-improvements`
- `bugfix/calendar-rendering-issue`
- `docs/api-documentation`

## 🎨 Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components

- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types
- Keep components focused and reusable

### CSS/Styling

- Use Tailwind CSS classes
- Follow existing design patterns
- Ensure responsive design
- Test on mobile devices

### Commit Messages

Use conventional commit format:

```
feat: add course conflict detection
fix: resolve calendar rendering issue
docs: update installation instructions
style: format code with prettier
refactor: simplify API error handling
test: add unit tests for course search
```

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, browser, Node.js version
- **Steps to reproduce**: Clear, numbered steps
- **Expected vs actual behavior**
- **Screenshots or videos** if applicable
- **Error messages or console logs**

### Feature Requests

- **Problem description**: What issue does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other solutions you thought about
- **Additional context**: Any other relevant information

### Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - Should be addressed soon

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run linting
yarn lint
```

### Writing Tests

- Write unit tests for utility functions
- Test components with React Testing Library
- Test API integrations
- Aim for good test coverage

## 📚 Documentation

### Code Documentation

- Document complex functions with JSDoc
- Add inline comments for tricky logic
- Update README when adding new features

### API Documentation

- Document API endpoints
- Include request/response examples
- Update type definitions

## 🔄 Review Process

### What to Expect

1. **Automated checks** run on all PRs
2. **Code review** by maintainers
3. **Testing** of functionality
4. **Merge** after approval

### Review Criteria

- Code quality and style
- Functionality and testing
- Documentation updates
- Performance impact

## 🆘 Getting Help

### Need Help?

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Discord/Slack**: For real-time chat (if available)

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Priorities

### High Priority

- Bug fixes affecting core functionality
- Security vulnerabilities
- Performance improvements
- Accessibility improvements

### Medium Priority

- New features requested by users
- UI/UX improvements
- Documentation updates

### Low Priority

- Code refactoring
- Developer experience improvements
- Nice-to-have features

## 🏆 Recognition

Contributors will be:

- Listed in the contributors section
- Mentioned in release notes for significant contributions
- Given credit in the README

---

Thank you for contributing to the Langara Course Planner! 🎓✨
