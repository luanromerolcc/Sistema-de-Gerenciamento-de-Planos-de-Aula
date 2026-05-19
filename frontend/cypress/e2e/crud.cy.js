describe('Planos de Aula - CRUD E2E', () => {
  const baseUrl = 'http://localhost:5173'
  const testPlan = {
    title: 'Introdução ao OSPF',
    objective: 'Compreender os conceitos básicos do protocolo OSPF',
    summary: 'Aula introdutória sobre roteamento de estado de enlace e o protocolo OSPF',
    discipline: 'Redes',
    contents: 'Conceitos básicos de OSPF, áreas, LSA e adjacências entre roteadores',
  }

  it('deve criar um novo plano de aula', () => {
    cy.visit(`${baseUrl}/`)
    cy.contains('Novo Plano').click()
    cy.url().should('include', '/create')

    cy.get('input[name="title"]').type(testPlan.title)
    cy.get('input[name="discipline"]').type(testPlan.discipline)
    cy.get('input[name="objective"]').type(testPlan.objective)
    cy.get('textarea[name="summary"]').type(testPlan.summary)
    cy.get('textarea[name="contents"]').type(testPlan.contents)
    cy.get('input[name="scheduledAt"]').type('2026-06-10')

    cy.contains('button', 'Criar Plano').click()

    cy.url().should('include', '/plans')
    cy.contains(testPlan.title).should('exist')
  })

  it('deve listar planos com filtro de disciplina', () => {
    cy.visit(`${baseUrl}/plans`)

    cy.get('[data-testid="discipline-select"]').select(testPlan.discipline)

    cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="lesson-plan-card"]').first().contains(testPlan.discipline)
  })

  it('deve editar um plano de aula', () => {
    cy.visit(`${baseUrl}/plans`)

    cy.contains(testPlan.title)
      .closest('[data-testid="lesson-plan-card"]')
      .contains('Editar')
      .click()

    cy.url().should('include', '/edit')

    cy.get('input[name="title"]').clear().type('Introdução Avançada ao OSPF')

    cy.contains('button', 'Salvar').click()

    cy.url().should('include', '/plans')
    cy.contains('Introdução Avançada ao OSPF').should('exist')
  })

  it('deve excluir um plano de aula', () => {
    cy.visit(`${baseUrl}/plans`)

    cy.contains('Introdução Avançada ao OSPF')
      .closest('[data-testid="lesson-plan-card"]')
      .find('[data-testid="btn-delete"]')
      .click()

    cy.contains('button', 'Confirmar').click()

    cy.contains('Introdução Avançada ao OSPF').should('not.exist')
  })
})
