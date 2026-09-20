import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Wraps async route handlers so rejections reach the centralized error handler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
