describe('Verificar mi aplicacion', () => {
  it('verificar login con credenciales incorrectas', () => {
    cy.visit('http://localhost:8100/login');
    cy.get('#correo').type('correo-inexistente@duocuc.cl');
    cy.get('#password').type('1234');
    cy.contains('Ingresar').click();
    cy.url().should('include', '/login');
    cy.get('ion-toast')
      .shadow()
      .find('.toast-message')
      .should('contain.text', 'El correo o la contraseña son incorrectos')
      .then(() => {
        cy.wait(2000);
        cy.get('ion-toast').should('not.exist');
      });
  });

  it('verificar login con credenciales correctas', () => {
    cy.visit('http://localhost:8100/login');
    cy.get('#correo').type('atorres');
    cy.get('#password').type('1234');
    cy.contains('Ingresar').click();
    cy.intercept('/home').as('routeToHome');
    cy.url().should('include', '/home');
    cy.contains('Mis datos').click();
    cy.wait(10000);
  });
});

describe('Verificar recuperación de contraseña', () => {
  it('debería permitir recuperar la contraseña', () => {
    cy.visit('http://localhost:8100/correo');
    cy.get('#correo').type('atorres@duocuc.cl');
    cy.contains('Verificar').click();
    cy.intercept('/pregunta').as('routeToHome');
    cy.get('#Respuesta').type('gato');
    cy.contains('Enviar').click();
    cy.intercept('/correcto').as('routeToHome');
    cy.get('#correcto').should('contain.text', 'Es Correcto');
    cy.wait(5000);
  });

  it('no debería permitir recuperar la contraseña', () => {
    cy.visit('http://localhost:8100/correo');
    cy.get('#correo').type('correo-inexistente@duocuc.cl');
    cy.contains('Verificar').click();
    cy.intercept('/incorrecto').as('routeToHome');
    cy.wait(5000);
  });
});

describe('Verificar mi aplicacion', () => {
  it('verificar mis datos', () => {
    cy.visit('http://localhost:8100/home');
    cy.contains('Mis datos').click();
    cy.get('#Nombre')
      .find('input')
      .clear({ force: true })
      .type('juan', { force: true });
    cy.contains('Guardar usuario').click();
  });
});

describe('Verificar temas', () => {
  it('Verificar temas', () => {
    cy.visit('http://localhost:8100/login');
    cy.contains('Tema').click();
    cy.get('#tema').click();
    cy.wait(2000);
    cy.get('ion-alert .alert-radio-label', { timeout: 10000 })
      .contains(/instagram/i)
      .click();
    cy.wait(1000);
    cy.get('ion-alert .alert-button').contains('OK').click();
  });
});
