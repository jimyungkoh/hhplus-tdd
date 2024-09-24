import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class NotEnoughPointException extends ApplicationException {
  constructor() {
    super(ErrorCodes.NOT_ENOUGH_POINT);
  }
}
