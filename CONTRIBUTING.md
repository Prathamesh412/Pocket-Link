# Contributing to BucketLink

Thank you for your interest in contributing to BucketLink! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

- Be respectful and inclusive
- Welcome different perspectives
- Report inappropriate behavior
- Focus on constructive criticism

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork locally**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bucketlink.git
   cd bucketlink
   ```
3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/bucketlink.git
   ```
4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js 14+
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Initial Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure .env with your values
# - MONGODB_URI
# - JWT_SECRET
# - GEMINI_API_KEY

# Build CSS
npm run build

# Start development server
npm run dev

# In another terminal, watch CSS changes
npm run watch
```

## Making Changes

### Branch Naming

Use descriptive branch names:

```
feature/add-user-preferences
fix/link-deletion-bug
docs/api-documentation
refactor/optimize-database-queries
test/add-api-tests
```

### Directory Structure

Follow existing structure:

```
src/
  controllers/    - Business logic
  routes/         - API routes
  models/         - Database schemas
  middleware/     - Express middleware
  utils/          - Helper functions
  views/          - EJS templates

public/
  js/             - Client-side JavaScript
  css/            - Stylesheets (generated)
  index.html      - Main page

tests/            - Test files
```

## Commit Messages

Write clear, descriptive commit messages:

### Format

```
<type>: <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Build, dependencies, configuration
- `ci`: CI/CD pipeline changes

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Limit to 50 characters

### Body

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Examples

```
feat: add dark mode toggle

Users can now switch between light and dark themes.
Preference is saved to localStorage and persists across sessions.

Fixes #123
```

```
fix: prevent duplicate tags in link update

The tag input wasn't deduplicating tags before saving,
causing duplicate entries in the database.

Closes #456
```

## Pull Request Process

### Before Creating PR

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**
   ```bash
   npm run build
   npm run dev
   npm test  # if tests exist
   ```

3. **Check code style**
   - No console.log() statements
   - Consistent indentation (2 spaces)
   - Meaningful variable names
   - Comments for complex logic

4. **Verify no sensitive data**
   - No API keys
   - No passwords
   - No MongoDB credentials

### Creating PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use descriptive title
   - Reference related issues (#123)
   - Describe changes clearly
   - Add screenshots if UI changes

3. **PR Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123, Relates to #456

## Testing
How to test these changes

## Checklist
- [ ] Tested locally
- [ ] No breaking changes
- [ ] Documentation updated
- [ ] CSS compiles without errors
- [ ] No console errors
```

### PR Review

- Respond to feedback constructively
- Make requested changes in new commits
- After approval, maintainer will merge
- Celebrate! 🎉

## Coding Standards

### JavaScript

```javascript
// Use const by default, let if needed, avoid var
const maxAttempts = 5;
let attempts = 0;

// Use arrow functions
const filterLinks = links => links.filter(l => l.tags.length > 0);

// Use template literals
const message = `User ${name} has ${count} links`;

// Use destructuring
const { title, description, tags } = link;

// Meaningful names
// ✅ Good
const userLinks = getUserLinks(userId);

// ❌ Avoid
const ul = getUL(uid);

// Comments for non-obvious code
// ✅ Good
// Multiply by 200 words/min to calculate reading time
const readingTime = Math.ceil(wordCount / 200);

// ❌ Unnecessary
// Set reading time
const readingTime = Math.ceil(wordCount / 200);
```

### HTML

```html
<!-- Use semantic HTML -->
<header>
<nav>
<main>
<section>
<article>
<footer>

<!-- Accessible attributes -->
<button aria-label="Delete link">🗑️</button>
<img alt="Link preview" src="...">

<!-- Readable formatting -->
<!-- Good: Multi-line for clarity -->
<div class="link-card">
  <h3>Link Title</h3>
  <p>Description...</p>
</div>

<!-- Avoid: Cramped single line -->
<div class="link-card"><h3>Link Title</h3></div>
```

### CSS/Tailwind

```css
/* Use Tailwind classes primarily */
<button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">

/* Avoid inline styles */
<button style="padding: 8px 16px;">

/* Custom CSS only when needed */
@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
  }
}
```

## Testing

### Local Testing

Before submitting PR:

1. **Test main features**
   - Create link
   - Edit link
   - Delete link
   - Search/filter
   - AI features

2. **Browser testing**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

3. **Edge cases**
   - Empty states
   - Invalid input
   - Network errors
   - Concurrent requests

### Test Coverage

If adding tests:

```javascript
// Tests go in tests/ directory
const assert = require('assert');

describe('Link Creation', () => {
  it('should create a link with valid URL', async () => {
    const link = await createLink({ url: 'https://example.com' });
    assert(link._id);
    assert.equal(link.url, 'https://example.com');
  });

  it('should reject invalid URL', async () => {
    assert.rejects(() => createLink({ url: 'not-a-url' }));
  });
});
```

## Reporting Bugs

### Before Reporting

- Check existing issues
- Test with latest code
- Try on different browser
- Reproduce consistently

### Bug Report Template

**Title:** Brief description of bug

**Description:**
A clear description of what the bug is.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser: Chrome 120
- OS: macOS 14
- Node version: v18.0.0

**Screenshots:**
Add screenshots if helpful

**Logs:**
Include error messages, console logs, etc.

## Suggesting Features

### Before Suggesting

- Check existing issues
- Ensure it aligns with project goals
- Think about implementation

### Feature Request Template

**Title:** Brief feature description

**Use Case:**
Why you need this feature

**Proposed Solution:**
How it should work

**Alternative Approaches:**
Other ways to solve this

**Additional Context:**
Any other information

### Good Feature Requests

- Solve a real problem
- Fit project scope
- Have clear benefits
- Minimal breaking changes

## Development Tips

### Debugging

```javascript
// Use console statements strategically
console.log('User links loaded:', state.allLinks);

// Use debugger in Chrome DevTools
debugger;  // Execution pauses here when DevTools open

// Check Network tab for API issues
// Check Console tab for JavaScript errors
```

### Performance

- Check browser DevTools Performance tab
- Look for too many re-renders
- Check database query efficiency
- Monitor bundle size

### Git Tips

```bash
# See what changed
git diff

# See staged changes
git diff --staged

# Undo local changes
git checkout -- file.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View commit history
git log --oneline -10

# Fix last commit
git commit --amend
```

## Getting Help

- **Discussions:** GitHub Discussions tab
- **Issues:** GitHub Issues for bugs/features
- **Wiki:** Project documentation
- **Email:** Contact maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

## Questions?

- Check README.md
- Review CODE_DOCUMENTATION.md
- Look at existing code
- Ask in Discussions

Thank you for contributing! 💙
