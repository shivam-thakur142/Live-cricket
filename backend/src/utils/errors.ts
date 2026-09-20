export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: ErrorCode,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new ApiError(400, "BAD_REQUEST", message, fields);
  }
  static validation(message = "Invalid request", fields?: Record<string, string>) {
    return new ApiError(422, "VALIDATION_ERROR", message, fields);
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }
  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, "FORBIDDEN", message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }
  static conflict(message: string) {
    return new ApiError(409, "CONFLICT", message);
  }
}
