export const aiSchema = {
  recommend: {
    body: {
      type: 'object',
      properties: {
        prompt: { type: 'string', minLength: 10 },
      },
      required: ['prompt'],
    },
  },
  recommendStream: {
    querystring: {
      type: 'object',
      properties: {
        prompt: { type: 'string', minLength: 10 },
      },
      required: ['prompt'],
    },
  },
};