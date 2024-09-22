import { ErrorCodes } from './error-codes';

export abstract class ApplicationException extends Error {
  constructor(readonly code: ErrorCodes) {
    super(code.message);
  }

  get message() {
    return this.code.message;
  }

  get status() {
    return this.code.status;
  }
}
