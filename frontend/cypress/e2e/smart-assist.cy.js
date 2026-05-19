describe('Smart Assist - Recomendações de IA E2E', () => {
  const baseUrl = 'http://localhost:5173'
  const planData = {
    title: 'Introdução ao OSPF',
    discipline: 'Redes',
    summary: 'Aula introdutória sobre roteamento de estado de enlace e o protocolo OSPF',
  }

  beforeEach(() => {
    cy.visit(`${baseUrl}/create`)
  })

  it('deve gerar recomendações e preencher campos automaticamente', () => {
    cy.get('input[name="title"]').type(planData.title)
    cy.get('input[name="discipline"]').type(planData.discipline)
    cy.get('textarea[name="summary"]').type(planData.summary)

    // Painel já está visível na página
    cy.get('[data-testid="smart-assist-panel"]').should('exist')

    // Garante que o botão está habilitado com título e disciplina preenchidos
    cy.contains('button', 'Gerar Recomendações').should('not.be.disabled')

    cy.contains('button', 'Gerar Recomendações').click()

    // Aguarda o estado de carregamento
    cy.contains('Gerando...').should('exist')

    // Aguarda o preenchimento dos campos (IA retornou)
    cy.contains('Campos preenchidos', { timeout: 15000 }).should('exist')

    // Campo de conteúdo deve ter sido preenchido pela IA
    cy.get('textarea[name="contents"]').should('not.have.value', '')

    // Primeira requisição não deve mostrar badge de cache
    cy.get('[data-testid="cached-badge"]').should('not.exist')
  })

  it('deve exibir badge de cache na segunda requisição idêntica', () => {
    cy.get('input[name="title"]').type(planData.title)
    cy.get('input[name="discipline"]').type(planData.discipline)
    cy.get('textarea[name="summary"]').type(planData.summary)

    // Primeira requisição
    cy.contains('button', 'Gerar Recomendações').click()
    cy.contains('Campos preenchidos', { timeout: 15000 }).should('exist')

    // Segunda requisição com os mesmos dados (cache já populado)
    cy.contains('button', 'Gerar Recomendações').click()

    // Badge de cache deve aparecer
    cy.get('[data-testid="cached-badge"]', { timeout: 5000 }).should('exist')
    cy.contains('Resposta em cache').should('be.visible')
  })

  it('deve manter botão desabilitado sem título ou disciplina', () => {
    // Sem nenhum dado preenchido
    cy.contains('button', 'Gerar Recomendações').should('be.disabled')

    // Apenas título
    cy.get('input[name="title"]').type(planData.title)
    cy.contains('button', 'Gerar Recomendações').should('be.disabled')

    // Título + disciplina = habilitado
    cy.get('input[name="discipline"]').type(planData.discipline)
    cy.contains('button', 'Gerar Recomendações').should('not.be.disabled')
  })
})
