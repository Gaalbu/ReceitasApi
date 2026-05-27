describe('E2E - Submit feedback flow', () => {
  const API_URL = Cypress.env('API_URL') || 'http://localhost:8080';
  const username = `e2e_fb_${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'Senha123!';

  before(() => {
    cy.request('POST', `${API_URL}/auth/register`, { username, email, password });
  });

  it('logs in and submits feedback', () => {
    cy.request('POST', `${API_URL}/auth/login`, { username, password }).then((resp) => {
      const token = resp.body.token;
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', token);
        }
      });

      cy.contains('Feedback').click();
      cy.url().should('include', '/feedback');

      cy.get('textarea[formcontrolname="comment"]').type('Automated feedback from E2E test');
      cy.get('select[formcontrolname="rating"]').select('5');

      cy.intercept('POST', '**/api/system-reviews', (req) => {
        req.reply({ statusCode: 200, body: { id: 1, rating: 5 } });
      }).as('postFeedback');

      cy.contains('button', 'Enviar Feedback').click();
      cy.wait('@postFeedback');
      cy.contains('Obrigado pelo seu feedback');
    });
  });
});
