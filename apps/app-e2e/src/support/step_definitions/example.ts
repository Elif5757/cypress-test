import { Given } from "cypress-cucumber-preprocessor/steps"


Given("the user is on the nx page", () => {
  cy.visit('http://localhost:4200');
})
