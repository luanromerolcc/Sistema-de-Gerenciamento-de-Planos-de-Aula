import { z } from 'zod';

export const aiSchema = {
  recommend: {
    body: z.object({
      prompt: z.string().min(10),
    }),
  },
  recommendStream: {
    querystring: z.object({
      prompt: z.string().min(10),
    }),
  },
};