export class ErrorCodes {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}

  // Point
  static readonly INVALID_USER_ID = new ErrorCodes(
    400,
    '유효하지 않은 사용자 ID 입니다',
  );

  static readonly INVALID_CHARGE_AMOUNT = new ErrorCodes(
    400,
    '포인트 충전 금액은 0보다 커야 합니다',
  );

  static readonly INVALID_USE_AMOUNT = new ErrorCodes(
    400,
    '포인트 사용 금액은 0보다 커야 합니다',
  );

  );
}
