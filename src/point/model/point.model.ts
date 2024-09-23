export type UserPoint = {
  id: number;
  point: number;
  updateMillis: number;
};

export class UserPointVo implements UserPoint {
  readonly updateMillis: number;
  constructor(
    readonly id: number,
    readonly point: number,
    updateMillis?: number,
  ) {
    this.updateMillis = updateMillis ?? Date.now();
  }
}

/**
 * 포인트 트랜잭션 종류
 * - CHARGE : 충전
 * - USE : 사용
 */
export enum TransactionType {
  CHARGE,
  USE,
}

export type PointHistory = {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number;
  timeMillis: number;
};

export class PointHistoryVo implements PointHistory {
  readonly timeMillis: number;
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly type: TransactionType,
    readonly amount: number,
    timeMillis?: number,
  ) {
    this.timeMillis = timeMillis ?? Date.now();
  }
}
