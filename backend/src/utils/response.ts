import type { Response } from "express";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 200 OK — { success: true, data } */
export function ok<T>(res: Response, data: T, pagination?: Pagination) {
  res.json({ success: true, data, ...(pagination ? { pagination } : {}) });
}

/** 201 Created — { success: true, data } */
export function created<T>(res: Response, data: T) {
  res.status(201).json({ success: true, data });
}

export function makePagination(page: number, limit: number, total: number): Pagination {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
