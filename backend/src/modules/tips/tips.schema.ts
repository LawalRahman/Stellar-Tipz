import { z } from 'zod';

export const prepareTipSchema = z.object({
  from: z.string().regex(/^G[A-Z2-7]{55}$/, 'Invalid sender Stellar address'),
  to: z.string().regex(/^G[A-Z2-7]{55}$/, 'Invalid recipient Stellar address'),
  amount: z.string().regex(/^\d+$/, 'Amount must be a string of digits (stroops)'),
  message: z.string().max(280).optional(),
});

export type PrepareTipInput = z.infer<typeof prepareTipSchema>;

export const getTipsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  address: z.string().regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar address').optional(),
  direction: z.enum(['sent', 'received']).optional(),
});

export type GetTipsQueryInput = z.infer<typeof getTipsQuerySchema>;
