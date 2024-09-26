import { MockFactory, Test, TestingModule } from '@nestjs/testing';
import InjectionToken from 'src/database/injection.token';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
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

  // TODO: 포인트 조회 기능 테스트 작성
  describe('[getPointBy] 포인트 조회 기능 테스트', () => {});

  // TODO: 포인트 내역 조회 기능 테스트 작성
  describe('[getHistoryBy] 포인트 내역 조회 기능 테스트', () => {});

  // TODO: 포인트 충전 기능 테스트 작성
  describe('[charge] 포인트 충전 기능 테스트', () => {});

  // TODO: 포인트 사용 기능 테스트 작성
  describe('[use] 포인트 사용 기능 테스트', () => {});
});
