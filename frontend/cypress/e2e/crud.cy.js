describe('Lesson Plans CRUD E2E', () => {
  const baseUrl = 'http://localhost:5173'
  const testPlan = {
    title: 'Introdução ao OSPF',
    objective: 'Compreender os conceitos básicos',
    summary: 'Aula sobre roteamento',
    discipline: 'Redes',
    contents: 'Conteúdo completo da aula',
    resources: 'Livro e artigos',
  }

  beforeEach(() => {
    cy.visit(`${baseUrl}/`)
  })

  it('should create a new lesson plan', () => {
    cy.contains('Novo Plano').click()
    cy.url().should('include', '/create')

    cy.get('input[name="title"]').type(testPlan.title)
    cy.get('input[name="objective"]').type(testPlan.objective)
    cy.get('input[name="discipline"]').type(testPlan.discipline)
    cy.get('button').contains('Criar').click()

    cy.url().should('include', '/plans')
    cy.contains(testPlan.title).should('exist')
  })

  it('should list lesson plans with filters', () => {
    cy.get('input[placeholder="Filtrar por disciplina"]').type('Redes')
    cy.get('button').contains('Filtrar').click()

    cy.contains('Redes').should('exist')
  })

  it('should edit a lesson plan', () => {
    cy.contains(testPlan.title).parent().contains('Editar').click()
    cy.url().should('include', '/edit')

    cy.get('input[name="title"]').clear().type('Introdução Avançada ao OSPF')
    cy.get('button').contains('Salvar').click()

    cy.url().should('include', '/plans')
    cy.contains('Introdução Avançada ao OSPF').should('exist')
  })

  it('should delete a lesson plan', () => {
    cy.contains('Introdução Avançada ao OSPF').parent().contains('Deletar').click()
    cy.get('button').contains('Confirmar').click()

    cy.contains('Introdução Avançada ao OSPF').should('not.exist')
  })
})