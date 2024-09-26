import { Inject, Injectable } from '@nestjs/common';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { InvalidChargeAmountException } from './exception/invalid-charge-amount.exception';
import { InvalidUserIdException } from './exception/invalid-user-id.exception';
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
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvalidUserIdException();
    }

    const userPoint = await this.userPointRepository.selectById(userId);

    return userPoint;
  }

  // TODO: 포인트 내역 조회 기능 구현
  async findHistoryBy(userId: number): Promise<PointHistory[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvalidUserIdException();
    }

    return await this.pointHistoryRepository.selectAllByUserId(userId);
  }

  // TODO: 포인트 충전 기능 구현
  async charge(userId: number, amount: number): Promise<UserPoint> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new InvalidUserIdException();
    } else if (amount <= 0) {
      throw new InvalidChargeAmountException();
    }

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
  use() {}
}
