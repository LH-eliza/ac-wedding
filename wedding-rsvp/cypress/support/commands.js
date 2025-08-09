// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login to dashboard
Cypress.Commands.add("loginToDashboard", (password = "hello123") => {
  cy.visit("/dashboard");
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.get("h2").should("not.contain", "Dashboard Login");
});

// Custom command to wait for table to load
Cypress.Commands.add("waitForTable", () => {
  cy.get('[data-testid="rsvp-table"]', { timeout: 10000 }).should("be.visible");
});

// Custom command to expand a group
Cypress.Commands.add("expandGroup", (index = 0) => {
  cy.get('[data-testid="group-toggle"]').eq(index).click();
  cy.get('[data-testid="member-row"]').should("be.visible");
});

// Custom command to add a new group
Cypress.Commands.add("addNewGroup", (groupName, members) => {
  cy.get('[data-testid="add-group-button"]').click();
  cy.get('[data-testid="add-group-modal"]').should("be.visible");

  // Fill in group name
  cy.get('input[placeholder="Group/Family Name"]').type(groupName);

  // Add members
  members.forEach((member, index) => {
    if (index > 0) {
      cy.get("button").contains("+ Add Another Member").click();
    }
    cy.get('input[placeholder="First Name"]').eq(index).type(member.firstName);
    cy.get('input[placeholder="Last Name"]').eq(index).type(member.lastName);
  });

  // Submit form
  cy.get('button[type="submit"]').contains("Add Group").click();
  cy.get('[data-testid="add-group-modal"]').should("not.be.visible");
});

// Custom command to search in table
Cypress.Commands.add("searchInTable", (searchTerm) => {
  cy.get('[data-testid="search-input"]').clear().type(searchTerm);
});

// Custom command to clear search
Cypress.Commands.add("clearSearch", () => {
  cy.get('[data-testid="search-input"]').clear();
});

// Custom command to export CSV
Cypress.Commands.add("exportCSV", () => {
  cy.get('[data-testid="export-button"]').click();
  cy.readFile("cypress/downloads/rsvp-data.csv").should("exist");
});

// Custom command to edit individual
Cypress.Commands.add("editIndividual", (index = 0, updates) => {
  cy.get('[data-testid="edit-button"]').eq(index).click();

  if (updates.firstName) {
    cy.get('input[placeholder="First"]').clear().type(updates.firstName);
  }
  if (updates.lastName) {
    cy.get('input[placeholder="Last"]').clear().type(updates.lastName);
  }
  if (updates.rsvpStatus) {
    cy.get('select[name="rsvpStatus"]').select(updates.rsvpStatus);
  }

  cy.get('[data-testid="save-button"]').click();
});

// Custom command to delete individual
Cypress.Commands.add("deleteIndividual", (index = 0) => {
  cy.get('[data-testid="delete-button"]').eq(index).click();
  cy.on("window:confirm", () => true);
});

// Custom command to add member to existing group
Cypress.Commands.add(
  "addMemberToGroup",
  (groupIndex = 0, firstName, lastName) => {
    cy.get('[data-testid="add-member-button"]').eq(groupIndex).click();
    cy.get('[data-testid="add-member-modal"]').should("be.visible");

    cy.get('input[placeholder="First Name *"]').type(firstName);
    cy.get('input[placeholder="Last Name *"]').type(lastName);

    cy.get('button[type="submit"]').contains("Add Member").click();
    cy.get('[data-testid="add-member-modal"]').should("not.be.visible");
  }
);
