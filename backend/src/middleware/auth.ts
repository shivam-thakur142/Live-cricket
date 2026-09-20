import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/errors.js";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface TokenPayload {
  sub: string;
  role: UserRole;
}

export function signToken(user: { id: string; role: UserRole }): string {
  return jwt.sign({ sub: user.id, role: user.role } satisfies TokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

/** Requires a valid Bearer token; loads the fresh user row (role changes apply immediately). */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed Authorization header");
    }
    const token = header.slice(7);
    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired token");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw ApiError.unauthorized("User no longer exists");
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

/** Role-based authorization. Usage: requireRole("admin") or requireRole("admin", "editor"). */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${roles.join(" or ")}`));
    }
    next();
  };
}

/** Mutations on cricket content: admin + editor. */
export const requireEditor = requireRole("admin", "editor");
/** User management & settings: admin only. */
export const requireAdmin = requireRole("admin");
