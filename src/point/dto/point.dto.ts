import { IsInt, Min } from 'class-validator';
import { ErrorCodes } from 'src/common/error/error-codes';

export class PointAmountDto {
  @IsInt({ message: ErrorCodes.INVALID_POINT_AMOUNT.message })
  @Min(1, { message: ErrorCodes.INVALID_POINT_AMOUNT.message })
  amount: number;
}
