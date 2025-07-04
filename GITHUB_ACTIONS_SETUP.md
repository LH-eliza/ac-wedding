# GitHub Actions E2E Testing Pipeline - Setup Guide

## ✅ **Corrected Directory Structure**

The GitHub Actions pipeline has been properly configured for the correct directory structure:

```
ac-wedding/                    # Root repository
├── .github/                   # GitHub configuration
│   ├── workflows/
│   │   └── e2e-tests.yml     # Main workflow file
│   ├── branch-protection.yml  # Branch protection documentation
│   ├── pull_request_template.md # PR template
│   └── README.md             # GitHub Actions documentation
├── scripts/
│   └── test-pr.sh            # Pre-PR testing script
└── wedding-rsvp/             # Main application
    ├── cypress/
    │   └── e2e/
    │       ├── dashboard.cy.js
    │       └── visual.cy.js
    ├── src/
    └── package.json
```

## 🔧 **What Was Fixed**

### **Issue**:

GitHub Actions files were incorrectly placed in `wedding-rsvp/.github/` instead of the root `.github/` directory.

### **Solution**:

1. ✅ **Moved workflow files** to root `.github/` directory
2. ✅ **Updated workflow paths** to reference `wedding-rsvp/` subdirectory
3. ✅ **Updated test script** to work from project root
4. ✅ **Updated documentation** to reflect correct structure

## 🚀 **Key Features**

### **Workflow Configuration**

- **Triggers**: PRs and pushes to main/master
- **Working Directory**: `wedding-rsvp/`
- **Cache Path**: `wedding-rsvp/package-lock.json`
- **Artifact Paths**: `wedding-rsvp/cypress/screenshots`, etc.

### **Jobs**

1. **Cypress E2E Tests** - Functional testing (27+ tests)
2. **Visual Regression Tests** - Visual testing (10 tests)
3. **Test Summary** - Results summary in PR

### **Branch Protection**

- Requires both e2e test jobs to pass
- Prevents merging until tests succeed
- Enforces PR reviews and conversation resolution

## 🧪 **Local Testing**

### **From Project Root**:

```bash
# Run complete pre-PR testing
./scripts/test-pr.sh
```

### **From Application Directory**:

```bash
cd wedding-rsvp

# Start development server
npm run dev

# Run e2e tests
npm run test:e2e

# Open Cypress runner
npm run test:e2e:open
```

## 📋 **Setup Instructions**

### **1. Enable Branch Protection**

1. Go to GitHub repository Settings
2. Navigate to Branches
3. Add rule for `main` branch
4. Enable "Require status checks to pass before merging"
5. Select status checks:
   - `E2E Tests / Cypress E2E Tests`
   - `E2E Tests / Visual Regression Tests`
6. Enable additional protections:
   - Require branches to be up to date
   - Require pull request reviews
   - Require conversation resolution

### **2. Test the Workflow**

1. Create a feature branch
2. Make changes to `wedding-rsvp/` files
3. Create a pull request
4. Verify workflow runs automatically
5. Check that tests pass before merging

### **3. Verify Local Testing**

```bash
# Test the complete pipeline locally
./scripts/test-pr.sh
```

## 🎯 **Test Coverage**

### **Functional Tests (27+ cases)**

- Authentication flow (4 tests)
- RSVP table functionality (11 tests)
- Group management (8 tests)
- Error handling (2 tests)
- Responsive design (2 tests)

### **Visual Tests (10 cases)**

- Login page appearance
- Dashboard views
- Modal interactions
- Responsive design
- Error states

## 🔍 **Monitoring**

### **Success Metrics**

- **Test Execution**: 5-8 minutes average
- **Success Rate**: Tracked in GitHub Actions
- **Artifact Storage**: Screenshots/videos on failure
- **Test Summary**: Automatic PR comments

### **Troubleshooting**

- **Logs**: Available in GitHub Actions tab
- **Artifacts**: Downloadable from failed runs
- **Local Debugging**: Use `./scripts/test-pr.sh`

## 📚 **Documentation**

- **`.github/README.md`** - Comprehensive setup guide
- **`.github/pull_request_template.md`** - PR template with testing info
- **`scripts/test-pr.sh`** - Local testing script
- **`GITHUB_ACTIONS_SETUP.md`** - This setup guide

## ✅ **Verification Checklist**

- [ ] GitHub Actions workflow file is in `.github/workflows/`
- [ ] Workflow references `wedding-rsvp/` working directory
- [ ] Test script works from project root
- [ ] Branch protection is configured
- [ ] PR template includes testing instructions
- [ ] Local testing script is executable
- [ ] Documentation reflects correct structure

## 🎉 **Ready to Use**

The GitHub Actions pipeline is now properly configured and ready to:

- ✅ Run e2e tests on every PR
- ✅ Prevent merging until tests pass
- ✅ Provide detailed test feedback
- ✅ Support local testing workflow
- ✅ Maintain code quality standards
