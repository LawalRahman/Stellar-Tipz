import { z } from 'zod';

/**
 * Zod validation schemas for tips endpoints.
 */

const stellarAddressRegex = /^G[A-Z2-7]{55}$/;

export const createTipSchema = z.object({
  txHash: z.string().min(64).max(64).regex(/^[a-fA-F0-9]+$/),
  ledger: z.number().int().positive(),
  fromAddress: z.string().regex(stellarAddressRegex, "Invalid Stellar address format"),
  toAddress: z.string().regex(stellarAddressRegex, "Invalid Stellar address format"),
  amountStroops: z.union([
    z.string().regex(/^\d+$/),
    z.number().int().positive()
  ]).transform(val => val.toString()),
  networkFee: z.union([
    z.string().regex(/^\d+$/),
    z.number().int().nonnegative()
  ]).transform(val => val.toString()).optional(),
  tokenCode: z.string().min(1).max(12).optional().default("XLM"),
  isAnonymous: z.boolean().optional().default(false),
  message: z.string().max(280).optional(),
});

export const tipIdSchema = z.object({
  id: z.string().min(1),
});

export type CreateTipInput = z.infer<typeof createTipSchema>;
