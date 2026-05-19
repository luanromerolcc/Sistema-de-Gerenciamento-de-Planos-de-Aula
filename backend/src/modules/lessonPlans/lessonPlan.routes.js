import * as controller from './lessonPlan.controller.js';
import { lessonPlanSchema } from './lessonPlan.schema.js';

export async function lessonPlanRoutes(fastify) {
  fastify.get('/', { schema: lessonPlanSchema.list }, controller.list);
  fastify.post('/', { schema: lessonPlanSchema.create }, controller.create);
  fastify.get('/:id', { schema: lessonPlanSchema.get }, controller.getOne);
  fastify.put('/:id', { schema: lessonPlanSchema.update }, controller.update);
  fastify.delete('/:id', { schema: lessonPlanSchema.delete }, controller.remove);
  fastify.get('/:id/versions', controller.getVersions);
  fastify.post('/:id/versions/:versionId/restore', controller.restoreVersion);
  fastify.post('/:id/duplicate', controller.duplicate);
  fastify.get('/:id/export/pdf', controller.exportPdf);
  fastify.get('/:id/export/ical', controller.exportIcal);
}
