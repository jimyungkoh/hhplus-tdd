import { Inject, Injectable } from '@nestjs/common';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { NotEnoughPointException } from './exception/not-enough-point.exception';
import { PointHistory, TransactionType, UserPoint } from './model/point.model';

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
    const userPoint = await this.userPointRepository.selectById(userId);

    return userPoint;
  }

  // TODO: 포인트 내역 조회 기능 구현
  async findHistoryBy(userId: number): Promise<PointHistory[]> {
    return await this.pointHistoryRepository.selectAllByUserId(userId);
  }

  // TODO: 포인트 충전 기능 구현
  async charge(userId: number, amount: number): Promise<UserPoint> {
    const { point } = await this.userPointRepository.selectById(userId);

    const chargeProcessPromises = Promise.all([
      this.userPointRepository.insertOrUpdate(userId, point + amount),
      this.pointHistoryRepository.insert(
        userId,
        amount,
        TransactionType.CHARGE,
        Date.now(),
      ),
    ]);

    const [chargedPoint, _] = await chargeProcessPromises;

    return chargedPoint;
  }

  // TODO: 포인트 사용 기능 구현
  async use(userId: number, amount: number): Promise<UserPoint> {
    const { point } = await this.userPointRepository.selectById(userId);

    if (point < amount) throw new NotEnoughPointException();

    const consumeProcessPromises = Promise.all([
      this.userPointRepository.insertOrUpdate(userId, point - amount),
      this.pointHistoryRepository.insert(
        userId,
        amount,
        TransactionType.USE,
        Date.now(),
      ),
    ]);

    const [consumedPoint, _] = await consumeProcessPromises;

    return consumedPoint;
  }
}
