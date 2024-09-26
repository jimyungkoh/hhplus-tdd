import { MockFactory, Test, TestingModule } from '@nestjs/testing';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { NotEnoughPointException } from '../exception/not-enough-point.exception';
import {
  PointHistory,
  PointHistoryVo,
  TransactionType,
  UserPoint,
  UserPointVo,
} from '../model/point.model';
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

      const userPointStub: UserPoint = new UserPointVo(1, 1_000);
      userPointRepository.selectById.mockResolvedValue(userPointStub);

      // when
      const result = service.getPointBy(userId);
      const expected = userPointStub;

      // then
      expect(result).resolves.toEqual(expected);
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      expect(userPointRepository.selectById).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: 포인트 내역 조회 기능 테스트 작성
  describe('[findHistoryBy] 포인트 내역 조회 기능 테스트', () => {
    test(`사용자 id에 대응하는 포인트 내역이 있는 경우,
          모든 포인트 내역을 반환해야 한다.`, () => {
      // given
      const historyStub: PointHistory[] = [
        new PointHistoryVo(1, 1, TransactionType.CHARGE, 1_000),
        new PointHistoryVo(2, 1, TransactionType.USE, 500),
        new PointHistoryVo(3, 1, TransactionType.CHARGE, 300),
      ];
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
  });

  // TODO: 포인트 충전 기능 테스트 작성
  describe('[charge] 포인트 충전 기능 테스트', () => {
    test(`포인트 충전 액수가 양수인 경우
          1. 기존 포인트에 충전 포인트를 더한 값을 저장한다.
          2. 포인트 내역에 포인트 충전 기록을 저장한다.
          3. 기존 포인트에 충전 포인트를 더한 UserPoint 객체를 반환한다.`, async () => {
      // given
      const userId = 1;
      const initialPoint = 1_000;
      const chargeAmount = 1_000;
      const updatedPoint = initialPoint + chargeAmount;

      const initialUserPointStub = new UserPointVo(userId, initialPoint);
      const updatedUserPointStub = new UserPointVo(userId, updatedPoint);

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
  describe('[use] 포인트 사용 기능 테스트', () => {
    test(`포인트 사용 액수가 양수이고, 기존 포인트가 사용 포인트 이상인 경우
            1. 기존 포인트에 사용 포인트를 차감한 값을 저장한다.
            2. 포인트 내역에 포인트 사용 기록을 저장한다.
            3. 기존 포인트에 사용 포인트를 차감한 UserPoint 객체를 반환한다.
        `, async () => {
      // given
      const userId = 1;
      const initialPoint = 1_000;
      const useAmount = 500;
      const updatedPoint = initialPoint - useAmount;

      const initialUserPointStub = new UserPointVo(userId, initialPoint);
      const updatedUserPointStub = new UserPointVo(userId, updatedPoint);

      userPointRepository.selectById.mockResolvedValue(initialUserPointStub);
      userPointRepository.insertOrUpdate.mockResolvedValue(
        updatedUserPointStub,
      );

      // when
      const result = await service.use(userId, useAmount);
      const expected = updatedUserPointStub;

      // then
      // 검증 - 1: 기존 포인트 조회가 호출되었는가?
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      // 검증 - 2: 기존 포인트에 사용 포인트를 차감한 값이 저장되는가?
      expect(userPointRepository.insertOrUpdate).toHaveBeenCalledWith(
        userId,
        updatedPoint,
      );
      // 검증 - 3: 포인트 내역에 포인트 사용 기록을 저장하는가?
      expect(pointHistoryRepository.insert).toHaveBeenCalledWith(
        userId,
        useAmount,
        TransactionType.USE,
        expect.any(Number),
      );
      // 검증 - 4: 기존 포인트에 사용 포인트를 차감한 UserPoint 객체가 반환되었는가?
      expect(result).toEqual(expected);
    });

    test(`포인트 사용 액수가 양수인데, 기존 포인트가 사용 포인트 미만인 경우
        NotEnoughPoint 예외를 발생시켜야 한다.`, async () => {
      // given
      const userId = 1;
      const initialPoint = 1_000;
      const useAmount = 500_000;

      const initialUserPointStub = new UserPointVo(userId, initialPoint);

      userPointRepository.selectById.mockResolvedValue(initialUserPointStub);

      // when
      const result = service.use(userId, useAmount);

      // then
      // 검증 - 1: 기존 포인트 조회가 호출되었는가?
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      // 검증 - 2: NotEnoughPointException 예외가 발생했는가?
      expect(result).rejects.toThrow(NotEnoughPointException);
      // 검증 - 3: 포인트 저장 또는 업데이트, 포인트 내역 저장이 호출되지 않았는가?
      expect(userPointRepository.insertOrUpdate).not.toHaveBeenCalled();
      expect(pointHistoryRepository.insert).not.toHaveBeenCalled();
    });
  });
});
