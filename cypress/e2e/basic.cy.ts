describe('Basic E2E Test', () => {
  it('should visit game main page and navigate to City', () => {
    cy.visit('/');
    cy.contains('Game Main').should('be.visible');
    cy.contains('City').click();
    cy.url().should('include', '/city');
  });
});
