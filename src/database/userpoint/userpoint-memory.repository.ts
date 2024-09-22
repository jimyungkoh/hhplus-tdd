import { Injectable } from '@nestjs/common';
import { UserPoint } from 'src/point/model/point.model';
import { UserPointRepository } from './userpoint.repository';
import { UserPointTable } from './userpoint.table';

@Injectable()
export class UserPointMemoryRepository implements UserPointRepository {
  constructor(private readonly userPointDb: UserPointTable) {}

  selectById(id: number): Promise<UserPoint> {
    return this.userPointDb.selectById(id);
  }

  insertOrUpdate(id: number, amount: number): Promise<UserPoint> {
    return this.userPointDb.insertOrUpdate(id, amount);
  }
}
