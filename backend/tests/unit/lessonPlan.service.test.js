// ESM Jest: globals não são injetados automaticamente — importar explicitamente
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findVersions: jest.fn(),
  restoreVersion: jest.fn(),
  duplicate: jest.fn(),
}

const mockAuditCreate = jest.fn()

jest.unstable_mockModule('../../src/modules/lessonPlans/lessonPlan.repository.js', () => mockRepo)
jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: { auditLog: { create: mockAuditCreate } },
}))
jest.unstable_mockModule('../../src/config/logger.js', () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}))

const {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} = await import('../../src/modules/lessonPlans/lessonPlan.service.js')

const makePlan = (overrides = {}) => ({
  id: 'plan-1',
  title: 'Introdução ao OSPF',
  discipline: 'Redes',
  tags: ['ospf', 'roteamento'],
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── listPlans ───────────────────────────────────────────────────────────────

describe('listPlans', () => {
  it('repassa a query para repo.findAll com tags parseadas', async () => {
    mockRepo.findAll.mockResolvedValue({ plans: [], total: 0, page: 1, pageSize: 20 })

    await listPlans({ tags: 'ospf, roteamento', page: 1, pageSize: 20 })

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['ospf', 'roteamento'] })
    )
  })

  it('passa tags como undefined quando não fornecidas', async () => {
    mockRepo.findAll.mockResolvedValue({ plans: [], total: 0, page: 1, pageSize: 20 })

    await listPlans({ page: 1, pageSize: 20 })

    expect(mockRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ tags: undefined })
    )
  })
})

// ─── getPlan ─────────────────────────────────────────────────────────────────

describe('getPlan', () => {
  it('retorna o plano quando encontrado', async () => {
    const plan = makePlan()
    mockRepo.findById.mockResolvedValue(plan)

    const result = await getPlan('plan-1')

    expect(result).toEqual(plan)
  })

  it('lança 404 quando plano não existe', async () => {
    mockRepo.findById.mockResolvedValue(null)

    await expect(getPlan('inexistente')).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ─── createPlan ──────────────────────────────────────────────────────────────

describe('createPlan', () => {
  it('cria o plano e registra audit log com action CREATE', async () => {
    const plan = makePlan()
    mockRepo.create.mockResolvedValue(plan)
    mockAuditCreate.mockResolvedValue({})

    const result = await createPlan({ title: plan.title, discipline: plan.discipline })

    expect(result).toEqual(plan)
    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'CREATE', lessonPlanId: plan.id }),
    })
  })
})

// ─── updatePlan ──────────────────────────────────────────────────────────────

describe('updatePlan', () => {
  it('atualiza o plano e registra audit log com action UPDATE', async () => {
    const updated = makePlan({ title: 'OSPF Avançado' })
    mockRepo.update.mockResolvedValue(updated)
    mockAuditCreate.mockResolvedValue({})

    const result = await updatePlan('plan-1', { title: 'OSPF Avançado' })

    expect(result).toEqual(updated)
    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'UPDATE' }),
    })
  })

  it('lança 404 quando repo.update retorna null', async () => {
    mockRepo.update.mockResolvedValue(null)

    await expect(updatePlan('inexistente', {})).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ─── deletePlan ──────────────────────────────────────────────────────────────

describe('deletePlan', () => {
  it('deleta o plano e registra audit log com action DELETE', async () => {
    mockRepo.remove.mockResolvedValue({})
    mockAuditCreate.mockResolvedValue({})

    await deletePlan('plan-1')

    expect(mockRepo.remove).toHaveBeenCalledWith('plan-1')
    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'DELETE', lessonPlanId: 'plan-1' }),
    })
  })

  it('lança 404 quando Prisma retorna erro P2025 (registro não existe)', async () => {
    mockRepo.remove.mockRejectedValue({ code: 'P2025' })

    await expect(deletePlan('inexistente')).rejects.toMatchObject({ statusCode: 404 })
  })

  it('repropaga erros desconhecidos sem converter em 404', async () => {
    const dbError = new Error('connection lost')
    mockRepo.remove.mockRejectedValue(dbError)

    await expect(deletePlan('plan-1')).rejects.toThrow('connection lost')
  })
})
