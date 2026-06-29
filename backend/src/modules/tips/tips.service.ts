import { prisma } from "../../db/prisma.js";
import { logger } from "../../common/utils/logger.js";
import { BadRequestError, NotFoundError } from "../../common/errors/AppError.js";
import type { CreateTipRequest, TipResponse } from "./tips.types.js";
import { TipStatus } from "../../types/enums.js";
import { Tip as PrismaTip, User as PrismaUser } from "@prisma/client";

type PrismaTipWithRelations = PrismaTip & {
  sender: PrismaUser | null;
  recipient: PrismaUser | null;
};

/**
 * Redacts and formats a Tip database model into a TipResponse.
 * If the tip is anonymous, sender information (fromAddress, senderId, sender object) is set to null.
 */
function formatTipResponse(tip: PrismaTipWithRelations): TipResponse {
  const isAnonymous = tip.isAnonymous;
  return {
    id: tip.id,
    txHash: tip.txHash,
    ledger: tip.ledger,
    fromAddress: isAnonymous ? null : tip.fromAddress,
    toAddress: tip.toAddress,
    amountStroops: tip.amountStroops.toString(),
    networkFee: tip.networkFee.toString(),
    tokenCode: tip.tokenCode,
    isAnonymous: tip.isAnonymous,
    status: tip.status,
    message: tip.message,
    createdAt: tip.createdAt.toISOString(),
    senderId: isAnonymous ? null : tip.senderId,
    recipientId: tip.recipientId,
    sender: isAnonymous ? null : (tip.sender ? {
      id: tip.sender.id,
      stellarAddress: tip.sender.stellarAddress,
      username: tip.sender.username,
      displayName: tip.sender.displayName,
      imageUrl: tip.sender.imageUrl,
    } : null),
    recipient: tip.recipient ? {
      id: tip.recipient.id,
      stellarAddress: tip.recipient.stellarAddress,
      username: tip.recipient.username,
      displayName: tip.recipient.displayName,
      imageUrl: tip.recipient.imageUrl,
    } : null,
  };
}

/**
 * Creates/records a new tip in the database.
 * Resolves senderId and recipientId by finding Users matching fromAddress and toAddress.
 */
export async function createTip(data: CreateTipRequest): Promise<TipResponse> {
  // Find sender and recipient
  const [sender, recipient] = await Promise.all([
    prisma.user.findUnique({ where: { stellarAddress: data.fromAddress } }),
    prisma.user.findUnique({ where: { stellarAddress: data.toAddress } }),
  ]);

  try {
    const tip = await prisma.tip.create({
      data: {
        txHash: data.txHash,
        ledger: data.ledger,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amountStroops: BigInt(data.amountStroops),
        networkFee: data.networkFee ? BigInt(data.networkFee) : BigInt(0),
        tokenCode: data.tokenCode || "XLM",
        isAnonymous: data.isAnonymous || false,
        message: data.message || null,
        status: TipStatus.CONFIRMED, // Assume confirmed when recorded directly
        senderId: sender?.id || null,
        recipientId: recipient?.id || null,
      },
      include: {
        sender: true,
        recipient: true,
      },
    });

    logger.info({ tipId: tip.id }, "Tip recorded successfully");
    return formatTipResponse(tip);
  } catch (error) {
    logger.error({ error }, "Failed to record tip");
    throw new BadRequestError("Failed to record tip");
  }
}

/**
 * Retrieves a tip by ID.
 */
export async function getTipById(id: string): Promise<TipResponse> {
  const tip = await prisma.tip.findUnique({
    where: { id },
    include: {
      sender: true,
      recipient: true,
    },
  });

  if (!tip) {
    throw new NotFoundError("Tip not found");
  }

  return formatTipResponse(tip);
}

/**
 * Lists all tips with pagination and filtering by sender or recipient.
 */
export async function listTips(
  page = 1,
  limit = 20,
  recipientId?: string,
  senderId?: string,
): Promise<{
  tips: TipResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  // Build filters
  const where: { recipientId?: string; senderId?: string } = {};
  if (recipientId) {
    where.recipientId = recipientId;
  }
  if (senderId) {
    where.senderId = senderId;
  }

  const [tips, total] = await Promise.all([
    prisma.tip.findMany({
      where,
      skip,
      take: limit,
      include: {
        sender: true,
        recipient: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tip.count({ where }),
  ]);

  return {
    tips: tips.map(formatTipResponse),
    total,
    page,
    limit,
  };
}
