describe('Basic E2E Test', () => {
  it('should visit home page, check Hero List, and navigate to City Management', () => {
    cy.visit('/');
    cy.contains('Hero List').should('be.visible');
    cy.contains('City Management').click();
    cy.url().should('include', '/city');
  });
});
