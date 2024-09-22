export class ErrorCodes {
  constructor(
    readonly status: number,
    readonly message: string,
  ) {}

  // Point
  static readonly USER_NOT_FOUND = new ErrorCodes(
    404,
    '존재하지 않는 사용자입니다',
  );
}
