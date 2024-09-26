import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from 'src/common/filter/global-exception.filter';
import { TransactionType } from 'src/point/model/point.model';
import InjectionToken from 'src/database/injection.token';
import { UserPointRepository } from 'src/database/userpoint/userpoint.repository';
import { PointHistoryRepository } from 'src/database/pointhistory/pointhistory.repository';

describe('PointController (e2e)', () => {
  let app: INestApplication;
  let userPointRepository: UserPointRepository;
  let pointHistoryRepository: PointHistoryRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        whitelist: true,
      }),
    );

    userPointRepository = moduleFixture.get(InjectionToken.UserPointRepository);
    pointHistoryRepository = moduleFixture.get(
      InjectionToken.PointHistoryRepository,
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('포인트 조회 API', () => {
    // 테스트 케이스: 유효한 사용자 ID로 포인트 조회
    // 작성 이유: 사용자의 포인트 정보를 정확히 반환하는지 확인
    test('유효한 사용자 ID로 포인트를 조회하면 200 상태코드와 함께 포인트 정보를 반환해야 한다', async () => {
      const userId = 1;
      const initialPoint = 1000;

      await userPointRepository.insertOrUpdate(userId, initialPoint);
      await pointHistoryRepository.insert(
        userId,
        initialPoint,
        TransactionType.CHARGE,
        Date.now(),
      );

      const response = await request(app.getHttpServer())
        .get(`/point/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('point', initialPoint);
      expect(response.body).toHaveProperty('updateMillis');
    });

    // 테스트 케이스: 유효하지 않은 사용자 ID로 포인트 조회
    // 작성 이유: 잘못된 사용자 ID에 대해 적절한 에러 처리를 하는지 확인
    test('유효하지 않은 사용자 ID로 포인트를 조회하면 400 에러를 반환해야 한다', async () => {
      const invalidUserId = -1;

      await request(app.getHttpServer())
        .get(`/point/${invalidUserId}`)
        .expect(400);
    });
  });
});
