import * as repo from './lessonPlan.repository.js'
import { prisma } from '../../config/prisma.js'
import { logger } from '../../config/logger.js'

async function log(action, lessonPlanId, metadata) {
  try {
    await prisma.auditLog.create({ data: { action, lessonPlanId, metadata } })
  } catch (err) {
    logger.error({ err }, 'Failed to write audit log')
  }
}

export async function listPlans(query) {
  const tags = query.tags ? query.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined
  return repo.findAll({ ...query, tags })
}

export async function getPlan(id) {
  const plan = await repo.findById(id)
  if (!plan) throw { statusCode: 404, message: 'Plano de aula não encontrado' }
  return plan
}

export async function createPlan(data) {
  const plan = await repo.create(data)
  await log('CREATE', plan.id, { title: plan.title })
  logger.info({ id: plan.id, title: plan.title }, 'Lesson plan created')
  return plan
}

export async function updatePlan(id, data) {
  const plan = await repo.update(id, data)
  if (!plan) throw { statusCode: 404, message: 'Plano de aula não encontrado' }
  await log('UPDATE', plan.id, { title: plan.title })
  return plan
}

export async function deletePlan(id) {
  try {
    await repo.remove(id)
    await log('DELETE', id, {})
  } catch (err) {
    if (err.code === 'P2025') throw { statusCode: 404, message: 'Plano de aula não encontrado' }
    throw err
  }
}

export async function getVersions(id) {
  await getPlan(id) // 404 if not found
  return repo.findVersions(id)
}

export async function restorePlanVersion(id, versionId) {
  const plan = await repo.restoreVersion(id, versionId)
  if (!plan) throw { statusCode: 404, message: 'Versão não encontrada' }
  await log('RESTORE_VERSION', id, { versionId })
  return plan
}

export async function duplicatePlan(id) {
  const plan = await repo.duplicate(id)
  if (!plan) throw { statusCode: 404, message: 'Plano de aula não encontrado' }
  await log('DUPLICATE', plan.id, { sourceId: id })
  return plan
}
