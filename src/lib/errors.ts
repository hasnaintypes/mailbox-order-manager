export interface ErrorDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details: ErrorDetail[] = [],
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  unauthenticated: () =>
    new AppError("UNAUTHENTICATED", 401, "Authentication is required."),
  forbidden: () =>
    new AppError("FORBIDDEN", 403, "You do not have permission to perform this action."),
  notFound: (resource: string) =>
    new AppError("NOT_FOUND", 404, `${resource} was not found.`),
  validation: (details: ErrorDetail[]) =>
    new AppError("VALIDATION_ERROR", 422, "The request is invalid.", details),
  invalidTransition: (from: string, to: string) =>
    new AppError(
      "INVALID_TRANSITION",
      409,
      `Cannot transition order from ${from} to ${to}.`,
    ),
  idempotencyConflict: () =>
    new AppError(
      "IDEMPOTENCY_KEY_REUSED",
      409,
      "This idempotency key was used with a different request payload.",
    ),
  conflict: (code: string, message: string) => new AppError(code, 409, message),
};
