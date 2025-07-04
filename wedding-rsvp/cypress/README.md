# Cypress Tests for Wedding RSVP Dashboard

This directory contains comprehensive end-to-end tests for the Wedding RSVP Dashboard using Cypress.

## Test Coverage

The tests cover the following functionality:

### Authentication

- Login form display
- Password validation
- Authentication state persistence

### RSVP Table

- Table loading and display
- Search functionality
- Group expansion/collapse
- RSVP status display and colors
- Individual editing (name, status, dietary restrictions)
- Individual deletion
- CSV export

### Group Management

- Adding new groups with multiple members
- Adding members to existing groups
- Form validation
- Modal interactions

### Statistics and Summary

- RSVP status statistics
- Dietary restriction statistics

### Error Handling

- API error handling
- Network error handling

### Responsive Design

- Mobile device compatibility
- Tablet device compatibility

## Prerequisites

1. Make sure the development server is running:

   ```bash
   npm run dev
   ```

2. Ensure the application is accessible at `http://localhost:3000`

## Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
npx cypress open
```

This will open the Cypress Test Runner where you can:

- See all test files
- Run tests in interactive mode
- Watch tests run in real-time
- Debug tests step by step

### Run Tests in Headless Mode

```bash
npx cypress run
```

This will run all tests in headless mode and generate reports.

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/dashboard.cy.js"
```

### Run Tests with Video Recording

```bash
npx cypress run --record
```

## Test Data

The tests use the following test data:

- **Correct Password**: `hello123`
- **Test Group Names**: "Test Family", "Large Family"
- **Test Member Names**: "John Doe", "Jane Doe", "New Member"

## Custom Commands

The tests use several custom commands defined in `cypress/support/commands.js`:

- `cy.loginToDashboard(password)` - Login to dashboard
- `cy.waitForTable()` - Wait for RSVP table to load
- `cy.expandGroup(index)` - Expand a group by index
- `cy.addNewGroup(groupName, members)` - Add a new group with members
- `cy.searchInTable(searchTerm)` - Search in the table
- `cy.exportCSV()` - Export data to CSV
- `cy.editIndividual(index, updates)` - Edit an individual's data
- `cy.deleteIndividual(index)` - Delete an individual
- `cy.addMemberToGroup(groupIndex, firstName, lastName)` - Add member to existing group

## Configuration

The Cypress configuration is in `cypress.config.js`:

- Base URL: `http://localhost:3000`
- Downloads folder: `cypress/downloads`
- Video recording: disabled
- Screenshots on failure: enabled

## Troubleshooting

### Common Issues

1. **Tests fail because server is not running**

   - Make sure to start the development server with `npm run dev`

2. **Authentication tests fail**

   - Verify the password in the dashboard component matches the test password (`hello123`)

3. **Table loading timeout**

   - Check that the API endpoints are working correctly
   - Verify database connection

4. **Modal tests fail**
   - Ensure React Modal is properly configured
   - Check that modal components have correct data-testid attributes

### Debugging

1. **Run tests in interactive mode** to step through tests:

   ```bash
   npx cypress open
   ```

2. **Add `cy.pause()`** in your tests to pause execution at specific points

3. **Use `cy.debug()`** to pause and inspect the current state

4. **Check browser console** for any JavaScript errors

## Adding New Tests

When adding new tests:

1. Add appropriate `data-testid` attributes to new components
2. Create custom commands for reusable actions
3. Follow the existing test structure and naming conventions
4. Add tests to the appropriate describe block

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Create custom commands** for reusable actions
3. **Test user workflows** rather than implementation details
4. **Keep tests independent** - each test should be able to run in isolation
5. **Use descriptive test names** that explain what is being tested
6. **Handle async operations** properly with appropriate waits and assertions

## File Structure

```
cypress/
├── e2e/
│   └── dashboard.cy.js          # Main dashboard tests
├── support/
│   ├── commands.js              # Custom Cypress commands
│   └── e2e.js                   # Global configuration
├── fixtures/                    # Test data files
└── downloads/                   # Downloaded files (CSV exports)
```
