# GitHub Actions & CI/CD Setup

This directory contains the GitHub Actions workflows and configuration files for automated testing and deployment.

## 🚀 Workflows

### E2E Tests (`e2e-tests.yml`)

**Purpose**: Runs comprehensive end-to-end tests on pull requests and pushes to main branch.

**Triggers**:

- Pull requests to `main` or `master` branch
- Pushes to `main` or `master` branch
- Changes to `wedding-rsvp/src/`, `wedding-rsvp/cypress/`, `wedding-rsvp/package.json`, or `wedding-rsvp/cypress.config.js` files

**Jobs**:

1. **Cypress E2E Tests** - Runs functional tests
2. **Visual Regression Tests** - Runs visual tests (screenshots)
3. **Test Summary** - Generates test results summary

**Features**:

- ✅ Automatic test execution on PRs
- ✅ Screenshot and video artifacts on failure
- ✅ Test summary in PR comments
- ✅ Parallel job execution
- ✅ 10-minute timeout per job
- ✅ Chrome headless browser
- ✅ Working directory: `wedding-rsvp/`

## 🔒 Branch Protection

### Required Status Checks

The following status checks must pass before merging to main:

1. **E2E Tests / Cypress E2E Tests** - Functional testing
2. **E2E Tests / Visual Regression Tests** - Visual testing

### Protection Rules

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require pull request reviews before merging
- ✅ Require conversation resolution before merging
- ✅ Restrict pushes that create files larger than 100MB
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

## 📋 Pull Request Template

The PR template includes:

- ✅ Type of change checklist
- ✅ E2E testing requirements
- ✅ Testing checklist for contributors
- ✅ Local testing instructions
- ✅ Test command references

## 🧪 Test Coverage

### Functional Tests (27+ test cases)

- **Authentication** (4 tests)

  - Login form display
  - Password validation
  - Authentication flow
  - State persistence

- **RSVP Table** (11 tests)

  - Table loading and display
  - Search functionality
  - Group expansion/collapse
  - Individual editing
  - Individual deletion
  - CSV export

- **Group Management** (8 tests)

  - Adding new groups
  - Adding members to existing groups
  - Form validation
  - Modal interactions

- **Error Handling** (2 tests)

  - API error handling
  - Network error handling

- **Responsive Design** (2 tests)
  - Mobile compatibility
  - Tablet compatibility

### Visual Tests (10 test cases)

- Login page appearance
- Dashboard full view
- Dashboard table view
- Add group modal
- Add member modal
- Expanded group view
- Mobile responsive design
- Tablet responsive design
- Error state appearance
- Search functionality

## 🔧 Configuration

### Environment

- **OS**: Ubuntu Latest
- **Node.js**: 18.x
- **Browser**: Chrome (Headless)
- **Cache**: npm dependencies
- **Working Directory**: `wedding-rsvp/`

### Timeouts

- **Job timeout**: 10 minutes
- **Application startup**: 60 seconds
- **Cypress wait**: 120 seconds

### Artifacts

- **Screenshots**: Uploaded on test failure
- **Videos**: Uploaded on test failure
- **Test results**: Always uploaded

## 🚨 Troubleshooting

### Common Issues

1. **Tests fail due to application not starting**

   - Check if the application builds successfully in `wedding-rsvp/`
   - Verify the application starts on port 3000
   - Check for any missing environment variables

2. **Tests timeout**

   - Increase timeout values in the workflow
   - Check for slow API responses
   - Verify database connections

3. **Visual tests fail**

   - Check for UI changes that affect screenshots
   - Verify responsive design is working
   - Check for dynamic content that changes between runs

4. **Authentication tests fail**
   - Verify the password in the dashboard component
   - Check if the authentication flow has changed
   - Ensure the login form is accessible

### Debugging

1. **View test artifacts**

   - Download screenshots and videos from failed runs
   - Check the test summary in PR comments
   - Review detailed logs in GitHub Actions

2. **Run tests locally**

   ```bash
   # From project root
   ./scripts/test-pr.sh

   # Or manually:
   cd wedding-rsvp
   npm run dev

   # In another terminal:
   cd wedding-rsvp
   npm run test:e2e

   # Run visual tests
   npx cypress run --spec "cypress/e2e/visual.cy.js"
   ```

3. **Check workflow logs**
   - Go to Actions tab in GitHub
   - Click on the failed workflow run
   - Review step-by-step logs

## 📈 Monitoring

### Test Metrics

- **Total test cases**: 37+ (27 functional + 10 visual)
- **Average run time**: 5-8 minutes
- **Success rate**: Tracked in GitHub Actions
- **Failure patterns**: Monitored through artifacts

### Performance

- **Parallel execution**: 2 jobs run simultaneously
- **Caching**: npm dependencies cached between runs
- **Optimization**: Only runs on relevant file changes

## 🔄 Maintenance

### Regular Tasks

- [ ] Update Node.js version when needed
- [ ] Review and update test coverage
- [ ] Monitor test execution times
- [ ] Update Cypress version
- [ ] Review and update branch protection rules

### Adding New Tests

1. Add test files to `wedding-rsvp/cypress/e2e/`
2. Update test coverage documentation
3. Verify tests pass locally
4. Create PR to test the workflow
5. Update this documentation

### Workflow Updates

1. Test changes locally first
2. Create feature branch
3. Update workflow files
4. Test on PR
5. Merge to main

## 📁 Directory Structure

```
ac-wedding/
├── .github/
│   ├── workflows/
│   │   └── e2e-tests.yml
│   ├── branch-protection.yml
│   ├── pull_request_template.md
│   └── README.md
├── scripts/
│   └── test-pr.sh
└── wedding-rsvp/
    ├── cypress/
    │   └── e2e/
    │       ├── dashboard.cy.js
    │       └── visual.cy.js
    ├── src/
    └── package.json
```
