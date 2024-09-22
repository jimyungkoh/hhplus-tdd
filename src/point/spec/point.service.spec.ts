import { MockFactory, Test, TestingModule } from '@nestjs/testing';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { UserNotFoundException } from '../exception/user-not-found.exception';
import { UserPoint } from '../model/point.model';
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

    test(`존재하지 않는 사용자 id에 대한 포인트 조회는
        UserNotFoundException 예외를 발생시킨다`, () => {
      // given
      const userId = 2;

      userPointRepository.selectById.mockRejectedValue(
        new Error('올바르지 않은 ID 값 입니다.'),
      );

      // when
      const result = service.getPointBy(userId);

      // then
      expect(result).rejects.toBeInstanceOf(UserNotFoundException);
      expect(userPointRepository.selectById).toHaveBeenCalledWith(userId);
      expect(userPointRepository.selectById).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: 포인트 내역 조회 기능 테스트 작성
  describe('[getHistoryBy] 포인트 내역 조회 기능 테스트', () => {});

  // TODO: 포인트 충전 기능 테스트 작성
  describe('[charge] 포인트 충전 기능 테스트', () => {});

  // TODO: 포인트 사용 기능 테스트 작성
  describe('[use] 포인트 사용 기능 테스트', () => {});
});
