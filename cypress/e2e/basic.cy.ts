describe('Basic E2E Test', () => {
  it('should visit game main page and navigate to Main City', () => {
    cy.visit('/');
    cy.get('[aria-label="主界面入口"]').should('be.visible');
    cy.get('button[title="主城"]').click();
    cy.url().should('include', '/main-city');
  });
});
