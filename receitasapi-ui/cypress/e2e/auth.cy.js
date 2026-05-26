describe('Fluxos de autenticacao via interface', () => {
  const suffix = Date.now();
  const username = `uiuser${suffix}`;
  const email = `${username}@example.com`;
  const password = 'Pass123!';

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('UC01 - cadastra um usuario pela tela de registro', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: { message: 'ok' }
    }).as('register');

    cy.visit('/register');
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.contains('button', 'Cadastrar').click();

    cy.wait('@register').its('request.body').should('include', {
      username,
      email,
      password
    });
    cy.url().should('include', '/login');
  });

  it('UC02 - faz login pela tela e grava o token', () => {
    cy.intercept('POST', '**/api/auth/login', {
      body: {
        token: 'ui-token',
        username,
        email
      }
    }).as('login');

    cy.visit('/login');
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.contains('button', 'Entrar').click();

    cy.wait('@login');
    cy.window().its('localStorage').invoke('getItem', 'token').should('eq', 'ui-token');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});