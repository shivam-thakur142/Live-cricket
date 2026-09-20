import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/errors.js";
import { isProd } from "../config/env.js";

/** 404 handler for unmatched API routes. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
}

/** Centralized error handler — every thrown error funnels through here. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
    return;
  }

  // Prisma known-request errors → consistent API responses.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "A record with these unique values already exists" },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Record not found" },
      });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "Operation blocked by related records" },
      });
      return;
    }
  }

  // Malformed JSON bodies
  if (err instanceof SyntaxError && "body" in (err as object)) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Malformed JSON body" },
    });
    return;
  }

  if (!isProd) {
    console.error("[error]", err);
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
}
