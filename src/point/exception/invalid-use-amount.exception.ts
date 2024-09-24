import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class InvalidUseAmountException extends ApplicationException {
  constructor() {
    super(ErrorCodes.INVALID_USE_AMOUNT);
  }
}
