import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from '../point.service';

describe('PointService', () => {
  let service: PointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  // TODO: 포인트 조회 기능 테스트 작성
  describe('포인트 충전 기능 테스트', () => {});

  // TODO: 포인트 사용 기능 테스트 작성
  describe('포인트 사용 기능 테스트', () => {});

  // TODO: 포인트 조회 기능 테스트 작성
  describe('포인트 조회 기능 테스트', () => {});

  // TODO: 포인트 내역 조회 기능 테스트 작성
  describe('포인트 내역 조회 기능 테스트', () => {});
});
