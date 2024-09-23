import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class InvalidUserIdException extends ApplicationException {
  constructor() {
    super(ErrorCodes.INVALID_USER_ID);
  }
}
