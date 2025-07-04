describe("Visual Regression Tests", () => {
  const correctPassword = "hello123";

  beforeEach(() => {
    cy.visit("/dashboard");
  });

  describe("Dashboard Visual Tests", () => {
    it("Verify login page visual appearance", () => {
      // Take screenshot of login page
      cy.get("h2").should("contain", "Dashboard Login");
      cy.screenshot("login-page");
    });

    it("Verify dashboard visual appearance after authentication", () => {
      // Login and take screenshot of dashboard
      cy.loginToDashboard(correctPassword);
      cy.waitForTable();

      // Take screenshot of full dashboard
      cy.screenshot("dashboard-full");

      // Take screenshot of table section
      cy.get('[data-testid="rsvp-table"]').screenshot("dashboard-table");
    });

    it("Verify add group modal visual appearance", () => {
      cy.loginToDashboard(correctPassword);
      cy.get('[data-testid="add-group-button"]').click();
      cy.get('[data-testid="add-group-modal"]').should("be.visible");

      // Take screenshot of modal
      cy.screenshot("add-group-modal");
    });

    it("Verify add member modal visual appearance", () => {
      cy.loginToDashboard(correctPassword);
      cy.get('[data-testid="add-member-button"]').first().click();
      cy.get('[data-testid="add-member-modal"]').should("be.visible");

      // Take screenshot of modal
      cy.screenshot("add-member-modal");
    });

    it("Verify expanded group visual appearance", () => {
      cy.loginToDashboard(correctPassword);
      cy.expandGroup(0);

      // Take screenshot of expanded group
      cy.screenshot("expanded-group");
    });

    it("Verify responsive design on mobile", () => {
      cy.viewport("iphone-x");
      cy.loginToDashboard(correctPassword);
      cy.waitForTable();

      // Take screenshot of mobile view
      cy.screenshot("dashboard-mobile");
    });

    it("Verify responsive design on tablet", () => {
      cy.viewport("ipad-2");
      cy.loginToDashboard(correctPassword);
      cy.waitForTable();

      // Take screenshot of tablet view
      cy.screenshot("dashboard-tablet");
    });

    it("Verify error state visual appearance", () => {
      cy.loginToDashboard(correctPassword);

      // Intercept API call and return error
      cy.intercept("GET", "/api/rsvp", {
        statusCode: 500,
        body: { error: "Server error" },
      });

      // Reload page to trigger error
      cy.reload();
      cy.get('[data-testid="error-message"]').should("be.visible");

      // Take screenshot of error state
      cy.screenshot("error-state");
    });

    it("Verify loading state visual appearance", () => {
      // This test captures the loading state
      // Note: Loading state might be too fast to capture in CI
      cy.visit("/dashboard");
      cy.loginToDashboard(correctPassword);

      // Try to capture loading state if visible
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="loading"]').length > 0) {
          cy.screenshot("loading-state");
        }
      });
    });

    it("Verify search functionality visual appearance", () => {
      cy.loginToDashboard(correctPassword);

      // Type in search box
      cy.get('[data-testid="search-input"]').type("test");

      // Take screenshot with search term
      cy.screenshot("search-active");

      // Clear search
      cy.get('[data-testid="search-input"]').clear();
      cy.screenshot("search-cleared");
    });
  });
});
