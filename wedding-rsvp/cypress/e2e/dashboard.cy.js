describe("Dashboard Page", () => {
  const correctPassword = "hello123";
  const incorrectPassword = "wrongpassword";

  beforeEach(() => {
    // Visit the dashboard page before each test
    cy.visit("/dashboard");
  });

  describe("Authentication", () => {
    it("Verify login form displays when user is not authenticated", () => {
      cy.get("h2").should("contain", "Dashboard Login");
      cy.get('input[type="password"]').should("be.visible");
      cy.get('button[type="submit"]').should("contain", "Login");
    });

    it("Verify error alert displays with incorrect password", () => {
      cy.get('input[type="password"]').type(incorrectPassword);
      cy.get('button[type="submit"]').click();

      // Check for alert (Cypress automatically handles alerts)
      cy.on("window:alert", (text) => {
        expect(text).to.equal("Incorrect password");
      });
    });

    it("Verify user can authenticate with correct password", () => {
      cy.loginToDashboard(correctPassword);
      cy.url().should("include", "/dashboard");
    });

    it("Verify authentication state persists after page reload", () => {
      cy.loginToDashboard(correctPassword);
      cy.reload();
      cy.get("h2").should("not.contain", "Dashboard Login");
    });
  });

  describe("RSVP Table", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify RSVP table displays after successful authentication", () => {
      cy.waitForTable();
    });

    it("Verify loading state displays while fetching data", () => {
      cy.get('[data-testid="loading"]').should("be.visible");
    });

    it("Verify search functionality is available in the table", () => {
      cy.get('[data-testid="search-input"]').should("be.visible");
    });

    it("Verify search filters results based on entered terms", () => {
      const searchTerm = "test";
      cy.searchInTable(searchTerm);
      cy.get('[data-testid="rsvp-table"]').should("contain", searchTerm);
    });

    it("Verify group information displays in the table", () => {
      cy.get('[data-testid="group-row"]').should("exist");
    });

    it("Verify groups can be expanded and collapsed to show member details", () => {
      cy.expandGroup(0);
      cy.get('[data-testid="member-row"]').should("be.visible");

      // Click again to collapse
      cy.get('[data-testid="group-toggle"]').first().click();
      cy.get('[data-testid="member-row"]').should("not.be.visible");
    });

    it("Verify RSVP status displays with appropriate color coding", () => {
      cy.get('[data-testid="rsvp-status"]').each(($status) => {
        const status = $status.text();
        if (status === "Accepted") {
          cy.wrap($status).should("have.class", "bg-green-100");
        } else if (status === "Declined") {
          cy.wrap($status).should("have.class", "bg-red-100");
        } else if (status === "Pending") {
          cy.wrap($status).should("have.class", "bg-yellow-100");
        }
      });
    });

    it("Verify individual RSVP status can be edited and saved", () => {
      cy.expandGroup(0);
      cy.editIndividual(0, { rsvpStatus: "Accepted" });
      cy.get('[data-testid="rsvp-status"]')
        .first()
        .should("contain", "Accepted");
    });

    it("Verify individuals can be deleted from the table", () => {
      cy.expandGroup(0);
      cy.deleteIndividual(0);
      // Individual should be removed from table
      cy.get('[data-testid="member-row"]').should("have.length.lessThan", 1);
    });

    it("Verify dietary restrictions are displayed for each individual", () => {
      cy.get('[data-testid="dietary-restrictions"]').should("exist");
    });

    it("Verify data can be exported to CSV format", () => {
      cy.exportCSV();
    });
  });

  describe("Add New Group Modal", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify add new group modal opens when button is clicked", () => {
      cy.get('[data-testid="add-group-button"]').click();
      cy.get('[data-testid="add-group-modal"]').should("be.visible");
      cy.get("h2").should("contain", "Add New Group");
    });

    it("Verify new group can be created with single member", () => {
      const groupName = "Test Family";
      const members = [{ firstName: "John", lastName: "Doe" }];

      cy.addNewGroup(groupName, members);
      cy.get('[data-testid="rsvp-table"]').should("contain", groupName);
    });

    it("Verify new group can be created with multiple members", () => {
      const groupName = "Large Family";
      const members = [
        { firstName: "John", lastName: "Doe" },
        { firstName: "Jane", lastName: "Doe" },
      ];

      cy.addNewGroup(groupName, members);
      cy.get('[data-testid="rsvp-table"]').should("contain", groupName);
    });

    it("Verify members can be removed from group form before submission", () => {
      cy.get('[data-testid="add-group-button"]').click();
      cy.get("button").contains("+ Add Another Member").click();
      cy.get('button[aria-label="Remove member"]').last().click();
      cy.get('input[placeholder="First Name"]').should("have.length", 1);
    });

    it("Verify validation error displays for incomplete form submission", () => {
      cy.get('[data-testid="add-group-button"]').click();
      cy.get('button[type="submit"]').contains("Add Group").click();

      cy.on("window:alert", (text) => {
        expect(text).to.include(
          "Please make sure all members have both first and last names"
        );
      });
    });

    it("Verify modal closes when cancel button is clicked", () => {
      cy.get('[data-testid="add-group-button"]').click();
      cy.get("button").contains("Cancel").click();
      cy.get('[data-testid="add-group-modal"]').should("not.be.visible");
    });
  });

  describe("Add Member to Existing Group", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify add member modal opens for existing group", () => {
      cy.get('[data-testid="add-member-button"]').first().click();
      cy.get('[data-testid="add-member-modal"]').should("be.visible");
    });

    it("Verify new member can be added to existing group", () => {
      const firstName = "New";
      const lastName = "Member";

      cy.addMemberToGroup(0, firstName, lastName);
      cy.get('[data-testid="rsvp-table"]').should("contain", firstName);
    });
  });

  describe("Statistics and Summary", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify RSVP statistics are displayed in the dashboard", () => {
      cy.get('[data-testid="stats-widget"]').should("exist");
    });

    it("Verify dietary restriction statistics are displayed", () => {
      cy.get('[data-testid="dietary-stats"]').should("exist");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify API errors are handled gracefully and error message is displayed", () => {
      cy.intercept("GET", "/api/rsvp", {
        statusCode: 500,
        body: { error: "Server error" },
      });
      cy.reload();
      cy.get('[data-testid="error-message"]').should("be.visible");
    });

    it("Verify network errors are handled gracefully and error message is displayed", () => {
      cy.intercept("GET", "/api/rsvp", { forceNetworkError: true });
      cy.reload();
      cy.get('[data-testid="error-message"]').should("be.visible");
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      cy.loginToDashboard(correctPassword);
    });

    it("Verify dashboard is responsive and functional on mobile devices", () => {
      cy.viewport("iphone-x");
      cy.get('[data-testid="rsvp-table"]').should("be.visible");

      cy.get('[data-testid="add-group-button"]').click();
      cy.get('[data-testid="add-group-modal"]').should("be.visible");
    });

    it("Verify dashboard is responsive and functional on tablet devices", () => {
      cy.viewport("ipad-2");
      cy.get('[data-testid="rsvp-table"]').should("be.visible");
      cy.get('[data-testid="search-input"]').should("be.visible");
    });
  });
});
