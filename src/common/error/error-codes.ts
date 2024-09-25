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

  static readonly INVALID_POINT_AMOUNT = new ErrorCodes(
    400,
    '포인트 금액은 0보다 커야 합니다',
  );

  static readonly NOT_ENOUGH_POINT = new ErrorCodes(
    400,
    '포인트 잔액이 부족합니다',
  );
}
