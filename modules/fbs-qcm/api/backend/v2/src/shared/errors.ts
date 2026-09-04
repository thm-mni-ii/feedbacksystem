/**
 * Fehlerklasse für erwartbare, fachliche Fehler (z.B. "not found", "invalid
 * input"). Controller können daran unterscheiden, ob eine Anfrage mit einem
 * passenden 4xx-Status beantwortet werden soll, statt pauschal 500 zu liefern.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Invalid input") {
    super(400, message);
    this.name = "ValidationError";
  }
}
