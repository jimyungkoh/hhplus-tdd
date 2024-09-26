export class ErrorCodes {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}

  // Point
  /**
   * 유효하지 않은 사용자 ID 오류
   * @type {ErrorCodes}
   */
  static readonly INVALID_USER_ID: ErrorCodes = new ErrorCodes(
    400,
    '유효하지 않은 사용자 ID 입니다',
  );

  /**
   * 유효하지 않은 포인트 금액 오류
   * @type {ErrorCodes}
   */
  static readonly INVALID_POINT_AMOUNT: ErrorCodes = new ErrorCodes(
    400,
    '포인트 금액은 0보다 커야 합니다',
  );

  /**
   * 포인트 잔액 부족 오류
   * @type {ErrorCodes}
   */
  static readonly NOT_ENOUGH_POINT: ErrorCodes = new ErrorCodes(
    400,
    '포인트 잔액이 부족합니다',
  );
  /**
   * 포인트 최대 잔액 오류
   */
  static readonly MAXIMUM_POINT: ErrorCodes = new ErrorCodes(
    400,
    '포인트 잔고 최대 잔액은 2,000,000 포인트 입니다',
  );
}
