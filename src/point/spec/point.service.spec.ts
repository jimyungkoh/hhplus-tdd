import { MockFactory, Test, TestingModule } from '@nestjs/testing';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { InvalidChargeAmountException } from '../exception/invalid-charge-amount.exception';
import { InvalidUserIdException } from '../exception/invalid-user-id.exception';
import { PointHistory, TransactionType, UserPoint } from '../model/point.model';
import { PointService } from '../point.service';
import pointHistoryRepositoryMock from './pointhistory.repository.mock';
import userPointRepositoryMock from './userpoint.repository.mock';

const injectMocks: MockFactory = (token) => {
  switch (token) {
    case InjectionToken.UserPointRepository:
      return userPointRepositoryMock;
    case InjectionToken.PointHistoryRepository:
      return pointHistoryRepositoryMock;
  }
};

describe('PointService', () => {
  let service: PointService;
  let userPointRepository: jest.Mocked<UserPointRepository>;
  let pointHistoryRepository: jest.Mocked<PointHistoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService],
    })
      .useMocker(injectMocks)
      .compile();

    service = module.get<PointService>(PointService);
    userPointRepository = module.get(InjectionToken.UserPointRepository);
    pointHistoryRepository = module.get(InjectionToken.PointHistoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('[getPointBy] 포인트 조회 기능 테스트', () => {
    test('존재하는 사용자 id에 대한 포인트 조회는 성공한다', () => {
      // given
      const userId = 1;

      const userPointStub: UserPoint = {
        id: 1,
        point: 1000,
        updateMillis: Date.now(),
      };
      userPointRepository.selectById.mockResolvedValue(userPointStub);

      // when
      const result = service.getPointBy(userId);
      const expected = userPointStub;

      // then
      expect(result).resolves.toEqual(expected);
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      expect(userPointRepository.selectById).toHaveBeenCalledTimes(1);
    });

    test(`유효하지 않은 사용자 id에 대한 포인트 조회는
        InvalidUserIdException 예외를 발생시킨다`, () => {
      // given
      const userId = -1;

      // when
      const result = service.getPointBy(userId);

      // then
      expect(result).rejects.toBeInstanceOf(InvalidUserIdException);
      expect(userPointRepository.selectById).not.toHaveBeenCalled();
    });
  });

  // TODO: 포인트 내역 조회 기능 테스트 작성
  describe('[findHistoryBy] 포인트 내역 조회 기능 테스트', () => {
    const createHistoryStub = (
      partialData: Partial<PointHistory>,
    ): PointHistory => ({
      id: 1,
      userId: 1,
      amount: 1000,
      type: TransactionType.CHARGE,
      timeMillis: Date.now(),
      ...partialData,
    });

    test(`사용자 id에 대응하는 포인트 내역이 있는 경우,
          모든 포인트 내역을 반환해야 한다.`, () => {
      // given
      const historyStub: PointHistory[] = [
        { id: 1 },
        { id: 2, amount: 500, type: TransactionType.USE },
        { id: 3, amount: 300, type: TransactionType.CHARGE },
      ].map(createHistoryStub);
      const userId = 1;
      pointHistoryRepository.selectAllByUserId.mockResolvedValue(historyStub);

      //when
      const result = service.findHistoryBy(userId);
      const expected = historyStub;

      //then
      expect(result).resolves.toEqual(expected);
      expect(pointHistoryRepository.selectAllByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(pointHistoryRepository.selectAllByUserId).toHaveBeenCalledTimes(1);
    });

    test(`사용자 id에 대응하는 포인트 내역이 없는 경우,
          빈 배열을 반환해야 한다.`, () => {
      // given
      const historyStub: PointHistory[] = [];
      const userId = 2;
      pointHistoryRepository.selectAllByUserId.mockResolvedValue(historyStub);

      //when
      const result = service.findHistoryBy(userId);
      const expected = historyStub;

      //then
      expect(result).resolves.toEqual(expected);
      expect(pointHistoryRepository.selectAllByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(pointHistoryRepository.selectAllByUserId).toHaveBeenCalledTimes(1);
    });

    test(`유효하지 않은 사용자 id에 대한 포인트 내역 조회는
          InvalidUserIdException 예외를 발생시킨다`, () => {
      // given
      const userId = -1;

      // when
      const result = service.findHistoryBy(userId);

      // then
      expect(result).rejects.toBeInstanceOf(InvalidUserIdException);
      expect(pointHistoryRepository.selectAllByUserId).not.toHaveBeenCalled();
    });
  });

  // TODO: 포인트 충전 기능 테스트 작성
  describe('[charge] 포인트 충전 기능 테스트', () => {
    test(`포인트 충전 액수가 양수인 경우
          1. 기존 포인트에 충전 포인트를 더한 값을 저장한다.
          2. 포인트 내역에 포인트 충전 기록을 저장한다.
          3. 기존 포인트에 충전 포인트를 더한 UserPoint 객체를 반환한다.`, async () => {
      // given
      const userId = 1;
      const initialPoint = 1000;
      const chargeAmount = 1000;
      const updatedPoint = initialPoint + chargeAmount;
      const getDateNow = () => Date.now();

      const createUserPointStub = (point: number): UserPoint => ({
        id: userId,
        point,
        updateMillis: getDateNow(),
      });

      const initialUserPointStub = createUserPointStub(initialPoint);
      const updatedUserPointStub = createUserPointStub(updatedPoint);

      userPointRepository.selectById.mockResolvedValue(initialUserPointStub);
      userPointRepository.insertOrUpdate.mockResolvedValue(
        updatedUserPointStub,
      );

      // when
      const result = await service.charge(userId, chargeAmount);
      const expected = updatedUserPointStub;

      // then
      //  검증 - 1-1: 기존 포인트 조회가 호출되었는가?
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      //  검증 - 1-2: 기존 포인트에 충전 포인트를 더한 값이 저장되는가?
      expect(userPointRepository.insertOrUpdate).toHaveBeenCalledWith(
        userId,
        updatedPoint,
      );
      //  검증 - 2. 포인트 내역에 포인트 충전 기록을 저장하는가?
      expect(pointHistoryRepository.insert).toHaveBeenCalledWith(
        userId,
        chargeAmount,
        TransactionType.CHARGE,
        expect.any(Number),
      );
      //  검증 - 3: 기존 포인트에 충전 포인트를 더한 UserPoint 객체가 반환되었는가?
      expect(result).toEqual(expected);
    });

  });

  // TODO: 포인트 사용 기능 테스트 작성
  describe('[use] 포인트 사용 기능 테스트', () => {});
});
