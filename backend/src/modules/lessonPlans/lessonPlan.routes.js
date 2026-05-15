import * as controller from './lessonPlan.controller.js'

export async function lessonPlanRoutes(fastify) {
  fastify.get('/', controller.list)
  fastify.post('/', controller.create)
  fastify.get('/:id', controller.getOne)
  fastify.put('/:id', controller.update)
  fastify.delete('/:id', controller.remove)
  fastify.get('/:id/versions', controller.getVersions)
  fastify.post('/:id/restore/:vid', controller.restoreVersion)
  fastify.post('/:id/duplicate', controller.duplicate)
  fastify.get('/:id/export/pdf', controller.exportPdf)
  fastify.get('/:id/export/ical', controller.exportIcal)
}
