export const aiSchema = {
  recommend: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 3 },
        discipline: { type: 'string', minLength: 2 },
        summary: { type: 'string', minLength: 10 },
        lessonPlanId: { type: 'string' },
      },
      required: ['title', 'discipline', 'summary'],
    },
  },
  recommendStream: {
    querystring: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 3 },
        discipline: { type: 'string', minLength: 2 },
        summary: { type: 'string', minLength: 10 },
        lessonPlanId: { type: 'string' },
      },
      required: ['title', 'discipline', 'summary'],
    },
  },
};