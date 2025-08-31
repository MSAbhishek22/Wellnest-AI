# Contributing to WellNest.AI

Thank you for your interest in contributing to WellNest.AI! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/wellnest-ai.git
   cd wellnest-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Include detailed steps to reproduce
- Provide system information and error messages
- Add screenshots if applicable

### Suggesting Features
- Open an issue with the "enhancement" label
- Describe the feature and its benefits
- Provide mockups or examples if possible

### Code Contributions

#### 1. Choose an Issue
- Look for issues labeled "good first issue" for beginners
- Comment on the issue to let others know you're working on it

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

#### 3. Make Changes
- Follow our coding standards (see below)
- Write tests for new features
- Update documentation if needed

#### 4. Test Your Changes
```bash
npm run test          # Run all tests
npm run test:auth     # Test authentication
npm run test:api      # Test API endpoints
npm run lint          # Check code style
```

#### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add new wellness feature"
# or
git commit -m "fix: resolve authentication bug"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

#### 6. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots for UI changes
- Test results

## 📝 Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Implement proper error boundaries

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain dark/light mode compatibility
- Use consistent spacing and colors

### File Organization
```
client/src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components
│   └── [feature]/    # Feature-specific components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── contexts/         # React contexts
└── types/            # TypeScript type definitions
```

## 🧪 Testing Guidelines

### Unit Tests
- Write tests for utility functions
- Test React components with React Testing Library
- Aim for 80%+ code coverage

### Integration Tests
- Test API endpoints
- Test agent interactions
- Test authentication flows

### Manual Testing
- Test on different screen sizes
- Verify dark/light mode functionality
- Test with different API configurations

## 🎨 UI/UX Guidelines

### Design Principles
- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: Follow WCAG 2.1 guidelines
- **Performance**: Optimize for fast loading
- **Consistency**: Use design system components

### Color Scheme
- Primary: Purple gradient (#8B5CF6 to #A855F7)
- Secondary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Headings: Font weight 600-700
- Body text: Font weight 400
- Use consistent spacing (4px grid)

## 🤖 AI Agent Development

### Creating New Agents
1. Extend the base agent class
2. Implement required methods
3. Add agent-specific API integrations
4. Create corresponding UI components
5. Add tests and documentation

### Agent Guidelines
- Keep responses conversational and helpful
- Handle API failures gracefully
- Implement proper rate limiting
- Add logging for debugging

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples

### User Documentation
- Update README.md for new features
- Add setup instructions for new APIs
- Create user guides for complex features

## 🔍 Code Review Process

### For Contributors
- Ensure all tests pass
- Follow coding standards
- Keep PRs focused and small
- Respond to feedback promptly

### For Reviewers
- Check functionality and code quality
- Verify tests and documentation
- Test on different devices/browsers
- Provide constructive feedback

## 🚀 Release Process

### Version Numbering
We follow Semantic Versioning (SemVer):
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Security review completed

## 🆘 Getting Help

### Community Support
- GitHub Discussions for questions
- Discord server for real-time chat
- Stack Overflow with `wellnest-ai` tag

### Maintainer Contact
- Create an issue for bugs/features
- Email for security concerns
- Discord for urgent matters

## 🏆 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Invited to the contributors Discord channel
- Eligible for contributor swag

## 📋 Checklist for New Contributors

- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Join our Discord community
- [ ] Look for "good first issue" labels
- [ ] Make your first contribution
- [ ] Celebrate! 🎉

Thank you for contributing to WellNest.AI! Together, we're building a better wellness platform for everyone.
