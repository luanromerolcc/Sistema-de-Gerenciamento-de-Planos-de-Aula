describe('Filters and Search E2E', () => {
  const baseUrl = 'http://localhost:5173'

  beforeEach(() => {
    cy.visit(`${baseUrl}/plans`)
  })

  it('should filter by discipline', () => {
    cy.get('select[name="discipline"]').select('Redes')
    cy.get('button').contains('Filtrar').click()

    cy.get('[data-testid="lesson-plan-card"]').each(($card) => {
      cy.wrap($card).contains('Redes').should('exist')
    })
  })

  it('should filter by date range', () => {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 7)

    cy.get('input[name="scheduledFrom"]').type(startDate.toISOString().split('T')[0])
    cy.get('input[name="scheduledTo"]').type(endDate.toISOString().split('T')[0])
    cy.get('button').contains('Filtrar').click()

    cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)
  })

  it('should filter by tags', () => {
    cy.get('input[placeholder="Buscar tags"]').type('ospf')
    cy.get('button').contains('Filtrar').click()

    cy.get('[data-testid="lesson-plan-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'ospf')
    })
  })

  it('should perform full-text search', () => {
    cy.get('input[placeholder="Buscar planos de aula"]').type('introdução')
    cy.get('button').contains('Buscar').click()

    cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)
  })

  it('should reset filters', () => {
    cy.get('select[name="discipline"]').select('Redes')
    cy.get('button').contains('Filtrar').click()

    cy.get('button').contains('Limpar Filtros').click()

    cy.get('input[name="discipline"]').should('have.value', '')
  })

  it('should paginate through results', () => {
    cy.get('button').contains('Próxima').click()
    cy.url().should('include', 'page=2')

    cy.get('button').contains('Anterior').click()
    cy.url().should('include', 'page=1')
  })
})