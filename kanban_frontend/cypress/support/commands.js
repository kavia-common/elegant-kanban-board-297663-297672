// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to clear localStorage
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom command to check accessibility
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y()
})
