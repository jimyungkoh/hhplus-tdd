import { IsInt, Min } from 'class-validator';
import { ErrorCodes } from 'src/common/error/error-codes';

export class UserIdDto {
  @IsInt({ message: ErrorCodes.INVALID_USER_ID.message })
  @Min(1, { message: ErrorCodes.INVALID_USER_ID.message })
  id: number;
}
