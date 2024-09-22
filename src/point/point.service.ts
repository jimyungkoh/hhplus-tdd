import { Inject, Injectable } from '@nestjs/common';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { UserPoint } from './model/point.model';

@Injectable()
export class PointService {
  constructor(
    @Inject(InjectionToken.UserPointRepository)
    private readonly userPointRepository: UserPointRepository,

    @Inject(InjectionToken.PointHistoryRepository)
    private readonly pointHistoryRepository: PointHistoryRepository,
  ) {}

  // TODO: 포인트 조회 기능 구현
  getPointBy(userId: number): Promise<UserPoint> {
    return this.userPointRepository.selectById(userId);
  }

  // TODO: 포인트 내역 조회 기능 구현
  getHistoryBy(userId: number) {}

  // TODO: 포인트 충전 기능 구현
  charge() {}

  // TODO: 포인트 사용 기능 구현
  use() {}
}
