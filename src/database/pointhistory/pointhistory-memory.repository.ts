import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType } from 'src/point/model/point.model';
import { PointHistoryRepository } from './pointhistory.repository';
import { PointHistoryTable } from './pointhistory.table';

@Injectable()
export class PointHistoryMemoryRepository implements PointHistoryRepository {
  constructor(private readonly pointHistoryDb: PointHistoryTable) {}

  insert(
    userId: number,
    amount: number,
    transactionType: TransactionType,
    updateMillis: number,
  ): Promise<PointHistory> {
    return this.pointHistoryDb.insert(
      userId,
      amount,
      transactionType,
      updateMillis,
    );
  }
  selectAllByUserId(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryDb.selectAllByUserId(userId);
  }
}
