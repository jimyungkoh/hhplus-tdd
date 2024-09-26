import { PointHistory, TransactionType } from 'src/point/model/point.model';

export interface PointHistoryRepository {
  /**
   * @description 사용자의 포인트 히스토리를 추가
   */
  insert(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    updateMillis: number,
  ): Promise<PointHistory>;

  /**
   * @description 사용자의 모든 포인트 히스토리를 조회
   */
  selectAllByUserId(userId: number): Promise<PointHistory[]>;
}
