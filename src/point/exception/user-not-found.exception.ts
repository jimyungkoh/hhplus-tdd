import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class UserNotFoundException extends ApplicationException {
  constructor() {
    super(ErrorCodes.USER_NOT_FOUND);
  }
}
