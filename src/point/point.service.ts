import { Inject, Injectable } from '@nestjs/common';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { UserNotFoundException } from './exception/user-not-found.exception';
import { PointHistory, UserPoint } from './model/point.model';

@Injectable()
export class PointService {
  constructor(
    @Inject(InjectionToken.UserPointRepository)
    private readonly userPointRepository: UserPointRepository,

    @Inject(InjectionToken.PointHistoryRepository)
    private readonly pointHistoryRepository: PointHistoryRepository,
  ) {}

  // TODO: 포인트 조회 기능 구현
  async getPointBy(userId: number): Promise<UserPoint> {
    try {
      const userPoint = await this.userPointRepository.selectById(userId);
      return userPoint;
    } catch (e) {
      if (e.message === '올바르지 않은 ID 값 입니다.')
        throw new InvalidUserIdException();
      throw e;
    }
  }

  // TODO: 포인트 내역 조회 기능 구현
  findHistoryBy(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryRepository.selectAllByUserId(userId);
  }

  // TODO: 포인트 충전 기능 구현
  charge() {}

  // TODO: 포인트 사용 기능 구현
  use() {}
}
