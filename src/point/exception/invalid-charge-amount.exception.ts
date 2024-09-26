import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class InvalidChargeAmountException extends ApplicationException {
  constructor() {
    super(ErrorCodes.INVALID_CHARGE_AMOUNT);
  }
}
