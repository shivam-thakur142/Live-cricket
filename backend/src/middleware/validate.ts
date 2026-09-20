import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/errors.js";

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates request parts with Zod. On failure returns the contract's
 * 422 VALIDATION_ERROR shape with per-field messages.
 */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const fields: Record<string, string> = {};

    for (const key of ["body", "query", "params"] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const path = issue.path.join(".") || key;
          if (!fields[path]) fields[path] = issue.message;
        }
      } else {
        // Replace with parsed data (applies coercion/defaults).
        if (key === "body") req.body = result.data;
        else if (key === "query") Object.assign(req.query, result.data);
        else Object.assign(req.params, result.data);
      }
    }

    if (Object.keys(fields).length > 0) {
      return next(ApiError.validation("Invalid request", fields));
    }
    next();
  };
}
