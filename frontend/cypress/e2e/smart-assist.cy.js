describe('Smart Assist Streaming E2E', () => {
  const baseUrl = 'http://localhost:5173'

  beforeEach(() => {
    cy.visit(`${baseUrl}/create`)
  })

  it('should stream AI recommendations', () => {
    cy.get('input[name="title"]').type('Introdução ao OSPF')
    cy.get('input[name="discipline"]').type('Redes')
    cy.get('textarea[name="summary"]').type('Aula sobre roteamento')

    cy.contains('Smart Assist').click()
    cy.get('[data-testid="smart-assist-panel"]', { timeout: 5000 }).should('exist')

    // Verify that tokens are streaming
    cy.get('[data-testid="smart-assist-content"]', { timeout: 10000 }).should(($el) => {
      expect($el.text().length).toBeGreaterThan(0)
    })

    // Verify badge for cached response (if applicable)
    cy.get('[data-testid="cached-badge"]').should('not.exist') // First request should not be cached
  })

  it('should show cached response on second request', () => {
    const planData = {
      title: 'Introdução ao OSPF',
      discipline: 'Redes',
      summary: 'Aula sobre roteamento',
    }

    // First request
    cy.get('input[name="title"]').type(planData.title)
    cy.get('input[name="discipline"]').type(planData.discipline)
    cy.get('textarea[name="summary"]').type(planData.summary)
    cy.contains('Smart Assist').click()
    cy.get('[data-testid="smart-assist-content"]', { timeout: 10000 }).should('exist')

    // Wait a moment for cache to be set
    cy.wait(1000)

    // Second request with same data
    cy.reload()
    cy.get('input[name="title"]').type(planData.title)
    cy.get('input[name="discipline"]').type(planData.discipline)
    cy.get('textarea[name="summary"]').type(planData.summary)
    cy.contains('Smart Assist').click()

    // Should see cached badge
    cy.get('[data-testid="cached-badge"]', { timeout: 5000 }).should('exist')
    cy.contains('Resposta em Cache').should('be.visible')
  })
})