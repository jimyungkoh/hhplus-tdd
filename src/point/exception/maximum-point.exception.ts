import { ApplicationException } from 'src/common/error/application.exception';
import { ErrorCodes } from 'src/common/error/error-codes';

export class MaximumPointException extends ApplicationException {
  constructor() {
    super(ErrorCodes.MAXIMUM_POINT);
  }
}
