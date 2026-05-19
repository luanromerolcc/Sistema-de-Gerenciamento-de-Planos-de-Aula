describe('Filtros e Busca E2E', () => {
  const baseUrl = 'http://localhost:5173'

  beforeEach(() => {
    cy.visit(`${baseUrl}/plans`)
    // Aguarda os cards carregarem antes de interagir
    cy.get('[data-testid="lesson-plan-card"]', { timeout: 8000 }).should('have.length.greaterThan', 0)
  })

  it('deve filtrar planos por disciplina', () => {
    cy.get('[data-testid="discipline-select"]').select('Redes')

    // Filtro é reativo (sem botão) — resultados atualizam imediatamente
    cy.get('[data-testid="lesson-plan-card"]').each(($card) => {
      cy.wrap($card).contains('Redes').should('exist')
    })
  })

  it('deve buscar planos por título via campo de busca', () => {
    cy.get('[data-testid="search-input"]').type('introdução')

    // Aguarda a filtragem reativa
    cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="lesson-plan-card"]').first().contains(/introdução/i)
  })

  it('deve buscar planos por tag via campo de busca', () => {
    cy.get('[data-testid="search-input"]').type('ospf')

    cy.get('[data-testid="lesson-plan-card"]').each(($card) => {
      cy.wrap($card).contains(/ospf/i).should('exist')
    })
  })

  it('deve limpar busca e restaurar todos os planos', () => {
    cy.get('[data-testid="search-input"]').type('ospf')
    cy.get('[data-testid="lesson-plan-card"]').then((filtered) => {
      const filteredCount = filtered.length

      cy.get('[data-testid="search-input"]').clear()
      cy.get('[data-testid="lesson-plan-card"]').should('have.length.gte', filteredCount)
    })
  })

  it('deve ordenar planos por ordem alfabética', () => {
    cy.get('[data-testid="sort-select"]').select('Ordem Alfabética')

    cy.get('[data-testid="lesson-plan-card"]').then(($cards) => {
      if ($cards.length < 2) return // Não há o que ordenar

      const titles = [...$cards].map((card) =>
        card.querySelector('h3')?.textContent?.trim() ?? ''
      )
      const sorted = [...titles].sort((a, b) => a.localeCompare(b, 'pt-BR'))
      expect(titles).to.deep.equal(sorted)
    })
  })

  it('deve paginar para a próxima página e voltar', () => {
    // Só testa paginação se houver botão visível (> 6 planos)
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Próxima")').length === 0) {
        cy.log('Menos de 7 planos — paginação não exibida, teste ignorado')
        return
      }

      cy.contains('button', 'Próxima').click()
      cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)

      cy.contains('button', 'Anterior').click()
      cy.get('[data-testid="lesson-plan-card"]').should('have.length.greaterThan', 0)
    })
  })
})
