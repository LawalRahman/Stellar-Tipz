import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BadRequestError } from "../../common/errors/AppError.js";
import { createTipSchema, tipIdSchema } from "./tips.schema.js";
import { createTip, getTipById, listTips } from "./tips.service.js";

/**
 * POST /tips
 * Records/creates a new tip.
 */
export async function createTipController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createTipSchema.parse(req.body);
    const tip = await createTip(data);
    res.status(201).json(tip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid tip data", error.issues));
    } else {
      next(error);
    }
  }
}

/**
 * GET /tips/:id
 * Retrieves a tip by ID.
 */
export async function getTipController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = tipIdSchema.parse(req.params);
    const tip = await getTipById(id);
    res.json(tip);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid tip ID", error.issues));
    } else {
      next(error);
    }
  }
}

/**
 * GET /tips
 * Lists all tips with pagination and filters.
 */
export async function listTipsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const recipientId = req.query.recipientId as string | undefined;
    const senderId = req.query.senderId as string | undefined;

    if (page < 1 || limit < 1 || limit > 100) {
      throw new BadRequestError("Invalid pagination parameters");
    }

    const result = await listTips(page, limit, recipientId, senderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
