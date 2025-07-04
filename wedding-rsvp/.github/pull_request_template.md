## Pull Request

### 📋 Description

<!-- Provide a brief description of the changes made -->

### 🔍 Type of Change

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] 🔧 Refactoring (no functional changes)
- [ ] 🧪 Test addition or improvement

### 🧪 E2E Testing

<!-- The following e2e tests will automatically run on this PR -->

#### ✅ Required Tests

- [ ] **Authentication Tests** - Login form, password validation, state persistence
- [ ] **RSVP Table Tests** - Table loading, search, group expansion, editing, deletion, export
- [ ] **Group Management Tests** - Adding new groups, adding members, form validation
- [ ] **Error Handling Tests** - API errors, network failures
- [ ] **Responsive Design Tests** - Mobile and tablet compatibility

#### 🔍 Test Coverage

- **Total Tests**: 27+ test cases
- **Browser**: Chrome (Headless)
- **Environment**: Ubuntu Latest
- **Timeout**: 10 minutes per job

### 📁 Files Changed

<!-- List the main files that were modified -->

### 🎯 Testing Checklist

- [ ] I have tested the changes locally
- [ ] I have run the e2e tests locally (`npm run test:e2e`)
- [ ] I have verified the changes work on different screen sizes
- [ ] I have tested the authentication flow
- [ ] I have tested the RSVP table functionality
- [ ] I have tested group management features
- [ ] I have tested error scenarios

### 📸 Screenshots/Videos

<!-- If applicable, add screenshots or videos showing the changes -->

### 🔗 Related Issues

<!-- Link to any related issues -->

Closes #

### 📝 Additional Notes

<!-- Any additional information that reviewers should know -->

---

## 🚨 Important Notes

### E2E Test Requirements

- **All e2e tests must pass** before this PR can be merged
- Tests run automatically on pull requests
- Test artifacts (screenshots, videos) are uploaded on failure
- Visual regression tests are included

### Branch Protection

- This PR requires e2e tests to pass
- Branch must be up to date with main
- Pull request reviews are required
- Conversation resolution is required

### Local Testing

To run e2e tests locally:

```bash
# Start the development server
npm run dev

# In another terminal, run e2e tests
npm run test:e2e

# Or open Cypress runner
npm run test:e2e:open
```

### Test Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run only dashboard tests
npm run test:e2e:dashboard

# Open Cypress runner
npm run test:e2e:open
```
