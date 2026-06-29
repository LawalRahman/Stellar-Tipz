import { Router } from "express";
import { optionalAuth } from "../auth/auth.middleware.js";
import {
  createTipController,
  getTipController,
  listTipsController,
} from "./tips.controller.js";
import { mergeOpenApiPaths } from "../../docs/openapi.js";
import { env } from "../../config/env.js";

export const tipsRouter = Router();

/**
 * Tips endpoints
 */
tipsRouter.post("/", optionalAuth, createTipController);
tipsRouter.get("/", listTipsController);
tipsRouter.get("/:id", getTipController);

// Register OpenAPI documentation for Tips module
mergeOpenApiPaths({
  [`${env.API_BASE_PATH}/tips`]: {
    post: {
      tags: ["Tips"],
      summary: "Record a tip",
      description: "Records a new on-chain tip off-chain, optionally anonymously.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                txHash: { type: "string", example: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" },
                ledger: { type: "integer", example: 100 },
                fromAddress: { type: "string", example: "GBRPYH6YCQ3Y7B7V76YZV6A6IS2T6AM27QJ2632CS67ME65OF55JBNX7" },
                toAddress: { type: "string", example: "GBRPYH6YCQ3Y7B7V76YZV6A6IS2T6AM27QJ2632CS67ME65OF55JBNX7" },
                amountStroops: { type: "string", example: "10000000" },
                networkFee: { type: "string", example: "100" },
                tokenCode: { type: "string", example: "XLM" },
                isAnonymous: { type: "boolean", example: false },
                message: { type: "string", example: "Great work!" },
              },
              required: ["txHash", "ledger", "fromAddress", "toAddress", "amountStroops"],
            },
          },
        },
      },
      responses: {
        "201": { description: "Tip recorded" },
        "400": { description: "Invalid input" },
      },
    },
    get: {
      tags: ["Tips"],
      summary: "List tips",
      description: "Retrieves a paginated list of tips, hiding sender info on anonymous tips.",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        { name: "recipientId", in: "query", schema: { type: "string" } },
        { name: "senderId", in: "query", schema: { type: "string" } },
      ],
      responses: {
        "200": { description: "Success" },
      },
    },
  },
  [`${env.API_BASE_PATH}/tips/{id}`]: {
    get: {
      tags: ["Tips"],
      summary: "Get tip by ID",
      description: "Retrieves a single tip by ID, hiding sender info on anonymous tips.",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": { description: "Success" },
        "404": { description: "Tip not found" },
      },
    },
  },
});
