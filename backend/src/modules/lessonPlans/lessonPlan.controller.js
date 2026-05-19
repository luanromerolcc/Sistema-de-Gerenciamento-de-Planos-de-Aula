import * as service from './lessonPlan.service.js'
import {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  listQuerySchema,
  idParamSchema,
  restoreParamSchema,
} from './lessonPlan.schema.js'
import { generatePDF } from '../exports/pdf.service.js'
import { generateIcal } from '../exports/ical.service.js'

export async function list(request, reply) {
  const query = listQuerySchema.parse(request.query)
  const result = await service.listPlans(query)
  return reply.send(result)
}

export async function getOne(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const plan = await service.getPlan(id)
  return reply.send(plan)
}

export async function create(request, reply) {
  const data = createLessonPlanSchema.parse(request.body)
  const plan = await service.createPlan(data)
  return reply.code(201).send(plan)
}

export async function update(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const data = updateLessonPlanSchema.parse(request.body)
  const plan = await service.updatePlan(id, data)
  return reply.send(plan)
}

export async function remove(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  await service.deletePlan(id)
  return reply.code(204).send()
}

export async function getVersions(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const versions = await service.getVersions(id)
  return reply.send(versions)
}

export async function restoreVersion(request, reply) {
  const { id, versionId } = restoreParamSchema.parse(request.params)
  const plan = await service.restorePlanVersion(id, versionId)
  return reply.send(plan)
}

export async function duplicate(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const plan = await service.duplicatePlan(id)
  return reply.code(201).send(plan)
}

export async function exportPdf(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const plan = await service.getPlan(id)
  const pdf = await generatePDF(plan)
  return reply
    .header('Content-Type', 'application/pdf')
    .header('Content-Disposition', `attachment; filename="plano-${id}.pdf"`)
    .send(pdf)
}

export async function exportIcal(request, reply) {
  const { id } = idParamSchema.parse(request.params)
  const plan = await service.getPlan(id)
  const ical = generateIcal(plan)
  return reply
    .header('Content-Type', 'text/calendar')
    .header('Content-Disposition', `attachment; filename="aula-${id}.ics"`)
    .send(ical)
}
